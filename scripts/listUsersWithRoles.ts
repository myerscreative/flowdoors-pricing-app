#!/usr/bin/env tsx

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

interface UserWithRole {
  uid: string
  email: string
  displayName?: string
  role?: string
  emailVerified: boolean
  creationTime: string
  lastSignInTime?: string
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

async function listUsersWithRoles(): Promise<void> {
  try {
    console.log('📋 Fetching users with roles...\n')

    let nextPageToken: string | undefined
    const allUsers: UserWithRole[] = []

    // Fetch all users (paginated)
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken)

      for (const userRecord of listUsersResult.users) {
        const customClaims = userRecord.customClaims || {}
        const role = (customClaims.role as string) || 'no-role'

        allUsers.push({
          uid: userRecord.uid,
          email: userRecord.email || 'No email',
          displayName: userRecord.displayName,
          role,
          emailVerified: userRecord.emailVerified,
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
        })
      }

      nextPageToken = listUsersResult.pageToken
    } while (nextPageToken)

    // Group users by role
    const usersByRole = allUsers.reduce(
      (acc, user) => {
        const role = user.role || 'no-role'
        if (!acc[role]) acc[role] = []
        acc[role].push(user)
        return acc
      },
      {} as Record<string, UserWithRole[]>
    )

    // Display results
    console.log(`📊 Found ${allUsers.length} total users\n`)

    // Show role summary
    console.log('📈 Role Summary:')
    console.log('================')
    Object.entries(usersByRole)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([role, users]) => {
        console.log(`${role.padEnd(15)}: ${users.length} users`)
      })

    console.log('\n👥 Detailed User List:')
    console.log('======================')

    // Display users grouped by role
    Object.entries(usersByRole)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([role, users]) => {
        console.log(`\n🔹 ${role.toUpperCase()} (${users.length} users)`)
        console.log('─'.repeat(50))

        users
          .sort((a, b) => a.email.localeCompare(b.email))
          .forEach((user) => {
            const verified = user.emailVerified ? '✅' : '❌'
            const lastSignIn = user.lastSignInTime
              ? new Date(user.lastSignInTime).toLocaleDateString()
              : 'Never'

            console.log(`  ${user.email.padEnd(30)} ${verified} ${lastSignIn}`)
            if (user.displayName) {
              console.log(`    └─ ${user.displayName}`)
            }
          })
      })

    // Show users without roles
    const noRoleUsers = usersByRole['no-role'] || []
    if (noRoleUsers.length > 0) {
      console.log(`\n⚠️  ${noRoleUsers.length} users without roles:`)
      console.log('─'.repeat(50))
      noRoleUsers.forEach((user) => {
        console.log(`  ${user.email}`)
      })
      console.log('\n💡 Use the setUserRole script to assign roles:')
      console.log('   pnpm tsx scripts/setUserRole.ts <email> <role>')
    }
  } catch (error: any) {
    console.error('❌ Error listing users:', error.message || error)
    process.exit(1)
  }
}

async function main(): Promise<void> {
  console.log('👥 Firebase Users with Roles Audit')
  console.log('==================================\n')

  // Validate environment variables
  validateEnvVars()

  // Initialize Firebase Admin
  await initializeFirebaseAdmin()

  // List users with roles
  await listUsersWithRoles()

  console.log('\n🎉 Audit completed successfully!')
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
