#!/usr/bin/env tsx

/**
 * Script to create a test admin login with username and password
 * This script will:
 * 1. Create user in Firestore salespeople collection
 * 2. Create user in Firebase Auth
 * 3. Set admin role custom claims
 * 4. Activate the account
 *
 * Usage: pnpm tsx scripts/create-admin-login.ts
 */

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface AdminUser {
  email: string
  password: string
  name: string
  phone: string
}

// Default test admin credentials
const DEFAULT_ADMIN: AdminUser = {
  email: 'admin@test.com',
  password: 'Admin123!',
  name: 'Test Admin',
  phone: '555-000-0000'
}

function validateEnvVars(): void {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('❌ Error: Missing FIREBASE_SERVICE_ACCOUNT_KEY')
    console.log('\nPlease add this to your .env.local file:')
    console.log('FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}')
    process.exit(1)
  }
}

async function initializeFirebaseAdmin(): Promise<void> {
  try {
    if (!admin.apps.length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
      const serviceAccount = JSON.parse(serviceAccountKey)

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })

      console.log('✅ Firebase Admin SDK initialized')
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error)
    process.exit(1)
  }
}

function generateSalespersonId(): string {
  const prefix = 'SP'
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${random}`
}

async function createAdminUser(userData: AdminUser): Promise<void> {
  const db = admin.firestore()
  const auth = admin.auth()

  console.log(`\n🔨 Creating admin user: ${userData.email}`)
  console.log('='.repeat(60))

  // Step 1: Check if user already exists in Firestore
  try {
    const snapshot = await db
      .collection('salespeople')
      .where('email', '==', userData.email.toLowerCase())
      .get()

    if (!snapshot.empty) {
      console.log('⚠️  User already exists in Firestore')
      const existingDoc = snapshot.docs[0]
      const existingData = existingDoc.data()

      console.log('\n📋 Existing user details:')
      console.log('   Document ID:', existingDoc.id)
      console.log('   Name:', existingData.name)
      console.log('   Email:', existingData.email)
      console.log('   Role:', existingData.role)
      console.log('   Status:', existingData.status || existingData.account_status)

      // Check if Firebase Auth user exists
      let authUser: admin.auth.UserRecord | null = null
      try {
        authUser = await auth.getUserByEmail(userData.email)
        console.log('\n✅ Firebase Auth user exists')
        console.log('   UID:', authUser.uid)

        // Update password if different
        await auth.updateUser(authUser.uid, {
          password: userData.password,
          emailVerified: true,
          disabled: false,
        })

        // Set custom claims
        await auth.setCustomUserClaims(authUser.uid, { role: 'admin' })

        // Update Firestore
        await existingDoc.ref.update({
          firebase_uid: authUser.uid,
          status: 'active',
          account_status: 'active',
          email_verified: true,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        })

        console.log('\n✅ User updated successfully!')
        console.log('\n📝 Login Credentials:')
        console.log('   Email:', userData.email)
        console.log('   Password:', userData.password)
        console.log('   Login URL: http://localhost:3000/admin/login')
        return

      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log('\n⚠️  Firebase Auth user not found, creating...')
          // Continue to create Firebase Auth user below
        } else {
          throw error
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking existing user:', error)
    throw error
  }

  // Step 2: Generate salesperson ID
  const salespersonId = generateSalespersonId()
  console.log('📋 Generated Salesperson ID:', salespersonId)

  // Step 3: Create Firestore document
  let firestoreDocId: string
  try {
    console.log('\n🔨 Creating Firestore document...')

    const salespersonData = {
      salesperson_id: salespersonId,
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      role: 'admin',
      status: 'active',
      account_status: 'active',
      email_verified: true,
      location_code: 'ADMIN',
      prefix: 'ADM',
      referralCodes: [],
      zipcodes: [],
      homeZip: '',
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection('salespeople').add(salespersonData)
    firestoreDocId = docRef.id

    console.log('✅ Created Firestore document:', firestoreDocId)
  } catch (error) {
    console.error('❌ Error creating Firestore document:', error)
    throw error
  }

  // Step 4: Create Firebase Auth user
  let authUser: admin.auth.UserRecord
  try {
    console.log('\n🔨 Creating Firebase Auth user...')

    authUser = await auth.createUser({
      email: userData.email,
      password: userData.password,
      emailVerified: true,
      disabled: false,
      displayName: userData.name,
    })

    console.log('✅ Created Firebase Auth user:', authUser.uid)
  } catch (error) {
    console.error('❌ Error creating Firebase Auth user:', error)
    // Clean up Firestore document
    await db.collection('salespeople').doc(firestoreDocId).delete()
    throw error
  }

  // Step 5: Set custom claims for admin role
  try {
    console.log('\n🔨 Setting admin role...')
    await auth.setCustomUserClaims(authUser.uid, { role: 'admin' })
    console.log('✅ Set custom claim: role = admin')
  } catch (error) {
    console.error('❌ Error setting custom claims:', error)
    throw error
  }

  // Step 6: Update Firestore with Firebase UID
  try {
    console.log('\n🔨 Linking Firestore to Firebase Auth...')
    await db.collection('salespeople').doc(firestoreDocId).update({
      firebase_uid: authUser.uid,
    })
    console.log('✅ Updated Firestore with Firebase UID')
  } catch (error) {
    console.error('❌ Error updating Firestore:', error)
    throw error
  }

  console.log('\n✅ Admin user created successfully!')
  console.log('='.repeat(60))
  console.log('\n📝 Login Credentials:')
  console.log('   Email:', userData.email)
  console.log('   Password:', userData.password)
  console.log('   Role: admin')
  console.log('   Salesperson ID:', salespersonId)
  console.log('   Firebase UID:', authUser.uid)
  console.log('\n🌐 Login URL:')
  console.log('   http://localhost:3000/admin/login')
  console.log('\n💡 Note: You can use these credentials to log into the admin panel')
}

async function main(): Promise<void> {
  console.log('🚀 Create Test Admin Login')
  console.log('='.repeat(60))

  const args = process.argv.slice(2)

  let adminUser = DEFAULT_ADMIN

  // Allow custom credentials via command line
  if (args.length >= 2) {
    adminUser = {
      email: args[0],
      password: args[1],
      name: args[2] || DEFAULT_ADMIN.name,
      phone: args[3] || DEFAULT_ADMIN.phone,
    }
  } else if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log('\nUsage: pnpm tsx scripts/create-admin-login.ts [email] [password] [name] [phone]')
    console.log('\nExamples:')
    console.log('  pnpm tsx scripts/create-admin-login.ts')
    console.log('    Creates admin with default credentials:')
    console.log('      Email: admin@test.com')
    console.log('      Password: Admin123!')
    console.log('')
    console.log('  pnpm tsx scripts/create-admin-login.ts admin@company.com MyPass123! "John Doe" "555-1234"')
    console.log('    Creates admin with custom credentials')
    process.exit(0)
  }

  console.log('\n📋 Creating admin with credentials:')
  console.log('   Email:', adminUser.email)
  console.log('   Password:', adminUser.password)
  console.log('   Name:', adminUser.name)
  console.log('   Phone:', adminUser.phone)

  // Validate environment
  validateEnvVars()

  // Initialize Firebase Admin
  await initializeFirebaseAdmin()

  // Create the admin user
  await createAdminUser(adminUser)
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
