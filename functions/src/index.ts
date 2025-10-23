import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

// Valid roles for user creation
const VALID_ROLES = ['manager', 'admin', 'salesperson', 'marketing'] as const
type ValidRole = (typeof VALID_ROLES)[number]

// Request data interface
interface CreateUserRequest {
  email: string
  role: string
  name?: string
  phone?: string
  homeZip?: string
  startDate?: string
  location_code?: string
  referralCodes?: string[]
  prefix?: string
  zipcodes?: string[]
}

// Response interface
interface CreateUserResponse {
  success: boolean
  uid: string
  resetLink: string
  message: string
}

/**
 * Creates a user with a specific role and generates a password reset link
 * Only managers and administrators can call this function
 */
export const createUserWithRole = functions.https.onCall(
  async (request): Promise<CreateUserResponse> => {
    try {
      const { data } = request
      const { auth } = request

      // Validate authentication
      if (!auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        )
      }

      // Validate caller's role
      const callerRole = auth.token.role as string
      if (!callerRole || (callerRole !== 'manager' && callerRole !== 'admin')) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only managers and admins can create users'
        )
      }

      // Validate input data
      if (!data.email || !data.role) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Email and role are required'
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid email format'
        )
      }

      // Validate role
      if (!VALID_ROLES.includes(data.role as ValidRole)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Invalid role. Must be manager, admin, salesperson, or marketing'
        )
      }

      console.log(`Creating user with email: ${data.email}, role: ${data.role}`)

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: data.email,
        emailVerified: false,
        disabled: false,
      })

      console.log(`User created with UID: ${userRecord.uid}`)

      // Set custom claims for the role
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: data.role,
      })

      console.log(`✅ Custom claim set for admin: ${data.email}`)

      // Create salesperson record in Firestore if additional data is provided
      if (data.name) {
        try {
          const salesperson_id = `SP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
          const userDoc = {
            salesperson_id,
            firebase_uid: userRecord.uid,
            name: String(data.name).trim(),
            email: String(data.email).trim().toLowerCase(),
            phone: String(data.phone || '').trim(),
            location_code: String(data.location_code || 'SD').trim(),
            role: data.role as
              | 'salesperson'
              | 'manager'
              | 'admin'
              | 'marketing',
            status: 'pending_activation' as
              | 'pending_activation'
              | 'active'
              | 'inactive',
            referralCodes: Array.isArray(data.referralCodes)
              ? data.referralCodes
              : [],
            prefix: String(data.prefix || '').trim(),
            zipcodes: Array.isArray(data.zipcodes) ? data.zipcodes : [],
            homeZip: String(data.homeZip || '').trim(),
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            email_verified: false,
            account_status: 'pending_activation',
            created_at: new Date(),
            updated_at: new Date(),
          }

          await admin.firestore().collection('salespeople').add(userDoc)
          console.log(`Salesperson record created for user: ${data.email}`)
        } catch (firestoreError) {
          console.error('Error creating salesperson record:', firestoreError)
          // Don't fail the entire operation if Firestore fails
        }
      }

      // Generate password reset link
      const resetRedirectUrl =
        process.env.RESET_REDIRECT_URL ||
        'https://scenicdoors.co/activate-account'

      const resetLink = await admin
        .auth()
        .generatePasswordResetLink(data.email, {
          url: resetRedirectUrl,
          handleCodeInApp: true,
        })

      console.log(`Password reset link generated for user: ${data.email}`)

      return {
        success: true,
        uid: userRecord.uid,
        resetLink,
        message: 'User created successfully. Password reset link generated.',
      }
    } catch (error) {
      console.error('Error in createUserWithRole:', error)

      // Re-throw HttpsError instances
      if (error instanceof functions.https.HttpsError) {
        throw error
      }

      // Handle Firebase Auth errors
      if (error instanceof Error) {
        if (error.message.includes('email-already-exists')) {
          throw new functions.https.HttpsError(
            'already-exists',
            'User with this email already exists'
          )
        }
        if (error.message.includes('invalid-email')) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Invalid email address'
          )
        }
      }

      // Generic error fallback
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while creating the user'
      )
    }
  }
)

/**
 * Maintenance function to seed custom claims for existing admin users
 * This function should be called manually to fix existing admin users who are missing custom claims
 */
export const seedAdminClaims = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    console.log('▶️ seedAdminClaims started')

    try {
      let updatedCount = 0

      const listUsersResult = await admin.auth().listUsers()
      const users = listUsersResult.users

      console.log(`Found ${users.length} users to check`)

      // First pass: migrate any "administrator" claims to "admin"
      let migrated = 0
      for (const user of users) {
        if (!user.email) continue

        try {
          const userRecord = await admin.auth().getUser(user.uid)
          const currentClaims = userRecord.customClaims || {}
          const currentRole = currentClaims.role

          if (currentRole === 'administrator') {
            await admin.auth().setCustomUserClaims(user.uid, {
              ...currentClaims,
              role: 'admin',
            })
            migrated++
            updatedCount++
            console.log(
              `🔄 Updated role from "administrator" to "admin" for: ${user.email}`
            )
          }
        } catch (userError) {
          console.error(
            `❌ Error migrating claims for user ${user.email}:`,
            userError
          )
        }
      }

      console.log(
        `✅ Migrated ${migrated} users from "administrator" to "admin" claims`
      )

      // Second pass: ensure admins in Firestore have correct claims
      const adminUsersSnapshot = await admin
        .firestore()
        .collection('salespeople')
        .where('role', '==', 'admin')
        .get()

      const adminEmails = new Set<string>()
      adminUsersSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.email) {
          adminEmails.add(data.email.toLowerCase())
        }
      })

      console.log(`Found ${adminEmails.size} admin users in Firestore`)

      for (const user of users) {
        if (!user.email) continue

        const email = user.email.toLowerCase()
        if (!adminEmails.has(email)) continue

        try {
          const userRecord = await admin.auth().getUser(user.uid)
          const currentClaims = userRecord.customClaims || {}
          const currentRole = currentClaims.role

          if (currentRole !== 'admin') {
            await admin.auth().setCustomUserClaims(user.uid, {
              ...currentClaims,
              role: 'admin',
            })
            updatedCount++
            console.log(`🔄 Updated custom claims for admin: ${email}`)
          } else {
            console.log(`✅ Admin ${email} already has correct claims`)
          }
        } catch (userError) {
          console.error(
            `❌ Error updating claims for user ${email}:`,
            userError
          )
        }
      }

      const message = `Admin claims seeding completed. Updated ${updatedCount} users.`
      console.log(message)
    } catch (error) {
      console.error('Error in seedAdminClaims:', error)
      throw error
    }
  }
)

// Export other functions if they exist
// Add any other Firebase functions here as needed
