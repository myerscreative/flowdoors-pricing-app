#!/usr/bin/env tsx

/**
 * Script to manually fix user authentication issues
 * This script will:
 * 1. Check if user exists in Firestore
 * 2. Check if user exists in Firebase Auth
 * 3. Create/update Firebase Auth user if needed
 * 4. Set proper custom claims (role)
 * 5. Update Firestore document with correct status
 */

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface SalespersonData {
  name: string
  email: string
  role: string
  status?: string
  account_status?: string
  firebase_uid?: string
  email_verified?: boolean
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

async function fixUserAuth(email: string, newPassword?: string): Promise<void> {
  const db = admin.firestore()
  const auth = admin.auth()

  console.log(`\n🔍 Checking user: ${email}`)
  console.log('='.repeat(60))

  // Step 1: Check Firestore
  let firestoreDoc: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData> | null =
    null
  let firestoreData: SalespersonData | null = null

  try {
    const snapshot = await db
      .collection('salespeople')
      .where('email', '==', email.toLowerCase())
      .get()

    if (snapshot.empty) {
      console.error('❌ User not found in Firestore salespeople collection')
      console.log('\n💡 Create the user first using:')
      console.log('   POST /api/users/create')
      return
    }

    firestoreDoc = snapshot.docs[0]
    firestoreData = firestoreDoc.data() as SalespersonData
    console.log('✅ Found in Firestore:')
    console.log('   Document ID:', firestoreDoc.id)
    console.log('   Name:', firestoreData.name)
    console.log('   Role:', firestoreData.role)
    console.log(
      '   Status:',
      firestoreData.status || firestoreData.account_status
    )
    console.log('   Firebase UID:', firestoreData.firebase_uid || 'not set')
  } catch (error) {
    console.error('❌ Error checking Firestore:', error)
    return
  }

  // Step 2: Check Firebase Auth
  let authUser: admin.auth.UserRecord | null = null
  let userExists = false

  try {
    authUser = await auth.getUserByEmail(email)
    userExists = true
    console.log('\n✅ Found in Firebase Auth:')
    console.log('   UID:', authUser.uid)
    console.log('   Email Verified:', authUser.emailVerified)
    console.log('   Disabled:', authUser.disabled)
    console.log(
      '   Custom Claims:',
      JSON.stringify(authUser.customClaims || {})
    )
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'auth/user-not-found') {
      console.log('\n⚠️  Not found in Firebase Auth')
      userExists = false
    } else {
      console.error('❌ Error checking Firebase Auth:', error)
      return
    }
  }

  // Step 3: Create or update Firebase Auth user
  try {
    if (!userExists) {
      // Create new Firebase Auth user
      console.log('\n🔨 Creating Firebase Auth user...')

      const password = newPassword || generateRandomPassword()
      console.log('   Using password:', newPassword ? '(provided)' : password)

      authUser = await auth.createUser({
        email: email,
        password: password,
        emailVerified: true,
        disabled: false,
        displayName: firestoreData!.name,
      })

      console.log('✅ Created Firebase Auth user:', authUser.uid)

      if (!newPassword) {
        console.log('\n🔑 TEMPORARY PASSWORD:', password)
        console.log('   ⚠️  User should reset this immediately!')
      }
    } else {
      // Update existing user if needed
      const updates: admin.auth.UpdateRequest = {}
      let needsUpdate = false

      if (authUser!.disabled) {
        updates.disabled = false
        needsUpdate = true
      }

      if (!authUser!.emailVerified) {
        updates.emailVerified = true
        needsUpdate = true
      }

      if (newPassword) {
        updates.password = newPassword
        needsUpdate = true
        console.log('\n🔑 Setting new password')
      }

      if (needsUpdate) {
        console.log('\n🔨 Updating Firebase Auth user...')
        authUser = await auth.updateUser(authUser!.uid, updates)
        console.log('✅ Updated Firebase Auth user')
      } else {
        console.log('\n✅ Firebase Auth user is up to date')
      }
    }
  } catch (error) {
    console.error('❌ Error managing Firebase Auth user:', error)
    return
  }

  // Step 4: Set custom claims for role
  try {
    const role = firestoreData!.role
    await auth.setCustomUserClaims(authUser!.uid, { role })
    console.log(`✅ Set custom claim: role = ${role}`)
  } catch (error) {
    console.error('❌ Error setting custom claims:', error)
  }

  // Step 5: Update Firestore document
  try {
    console.log('\n🔨 Updating Firestore document...')
    await firestoreDoc!.ref.update({
      firebase_uid: authUser!.uid,
      status: 'active',
      account_status: 'active',
      email_verified: true,
      activation_token: admin.firestore.FieldValue.delete(),
      token_expires_at: admin.firestore.FieldValue.delete(),
      temp_password: admin.firestore.FieldValue.delete(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('✅ Updated Firestore document')
  } catch (error) {
    console.error('❌ Error updating Firestore:', error)
  }

  console.log('\n✅ User authentication fixed successfully!')
  console.log('\n📝 User can now log in with:')
  console.log('   Email:', email)
  if (newPassword) {
    console.log('   Password: (the one you provided)')
  } else {
    console.log('   Password: (see temporary password above)')
  }
  console.log('   Login URL: /admin/login')
}

function generateRandomPassword(): string {
  const length = 16
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  // Ensure at least one of each required character type
  password += 'A' // uppercase
  password += 'a' // lowercase
  password += '1' // number
  password += '!' // special

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

async function main(): Promise<void> {
  console.log('🔧 Fix User Authentication')
  console.log('='.repeat(60))

  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('\nUsage: pnpm tsx scripts/fixUserAuth.ts <email> [password]')
    console.log('\nExamples:')
    console.log('  pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com')
    console.log(
      '  pnpm tsx scripts/fixUserAuth.ts robert@scenicdoors.com MyNewPass123!'
    )
    console.log(
      '\nIf password is not provided, a random one will be generated.'
    )
    process.exit(1)
  }

  const email = args[0]
  const password = args[1]

  // Validate environment
  validateEnvVars()

  // Initialize Firebase Admin
  await initializeFirebaseAdmin()

  // Fix the user
  await fixUserAuth(email, password)
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
