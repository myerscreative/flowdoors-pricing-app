#!/usr/bin/env tsx

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Valid roles that can be assigned
const VALID_ROLES = [
  'marketing',
  'manager',
  'administrator',
  'salesperson',
] as const
type ValidRole = (typeof VALID_ROLES)[number]

interface ScriptArgs {
  email: string
  role: ValidRole
}

function parseArgs(): ScriptArgs {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('❌ Error: Email is required')
    console.log('\nUsage: pnpm tsx scripts/setUserRole.ts <email> [role]')
    console.log('\nExamples:')
    console.log('  pnpm tsx scripts/setUserRole.ts user@example.com marketing')
    console.log(
      '  pnpm tsx scripts/setUserRole.ts admin@example.com administrator'
    )
    console.log('\nValid roles:', VALID_ROLES.join(', '))
    process.exit(1)
  }

  const email = args[0]
  const role = (args[1] || 'marketing') as ValidRole

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.error('❌ Error: Invalid email format')
    process.exit(1)
  }

  // Validate role
  if (!VALID_ROLES.includes(role)) {
    console.error(`❌ Error: Invalid role "${role}"`)
    console.log('Valid roles:', VALID_ROLES.join(', '))
    process.exit(1)
  }

  return { email, role }
}

function validateEnvVars(): void {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('❌ Error: Missing required environment variable:')
    console.error('  - FIREBASE_SERVICE_ACCOUNT_KEY')
    console.log('\nPlease add this to your .env.local file:')
    console.log(
      'FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
    )
    process.exit(1)
  }
}

async function initializeFirebaseAdmin(): Promise<void> {
  try {
    // Initialize Firebase Admin if not already initialized
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

async function setUserRole(email: string, role: ValidRole): Promise<void> {
  try {
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email)
    const uid = userRecord.uid

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role })

    console.log(`✅ Role "${role}" assigned to user: ${email} (uid: ${uid})`)

    // Optional: Log current user info
    console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`)
    console.log(`   Email Verified: ${userRecord.emailVerified}`)
    console.log(`   Created: ${userRecord.metadata.creationTime}`)
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: User with email "${email}" not found`)
      console.log(
        '   Make sure the user has signed up at least once through the app'
      )
    } else if (error.code === 'auth/invalid-email') {
      console.error(`❌ Error: Invalid email format "${email}"`)
    } else {
      console.error('❌ Error setting user role:', error.message || error)
    }
    process.exit(1)
  }
}

async function main(): Promise<void> {
  console.log('🔧 Firebase User Role Assignment Script')
  console.log('=====================================\n')

  // Parse command line arguments
  const { email, role } = parseArgs()

  // Validate environment variables
  validateEnvVars()

  // Initialize Firebase Admin
  await initializeFirebaseAdmin()

  // Set user role
  await setUserRole(email, role)

  console.log('\n🎉 Script completed successfully!')
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
