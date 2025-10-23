import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

/**
 * TypeScript interface for Firebase service account credentials
 * Extends the base ServiceAccount type with additional fields
 */
interface ServiceAccountKey {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  try {
    // Try to use service account key if available
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (serviceAccountKey) {
      try {
        // Parse and validate the service account key from environment variable
        const serviceAccount: ServiceAccountKey = JSON.parse(serviceAccountKey)

        // Validate that essential fields are present
        if (
          !serviceAccount.project_id ||
          !serviceAccount.private_key ||
          !serviceAccount.client_email
        ) {
          throw new Error(
            'Invalid service account key: missing required fields'
          )
        }

        // Convert to the format expected by cert()
        const credential: ServiceAccount = {
          projectId: serviceAccount.project_id,
          privateKey: serviceAccount.private_key,
          clientEmail: serviceAccount.client_email,
        }

        initializeApp({
          credential: cert(credential),
          projectId: serviceAccount.project_id,
        })
        console.info(
          '[Firebase Admin] ✓ Initialized with service account:',
          serviceAccount.project_id
        )
      } catch (parseError) {
        console.error(
          '[Firebase Admin] Failed to parse service account key:',
          parseError
        )
        throw new Error(
          'Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Please check your .env.local file.'
        )
      }
    } else {
      // For development, try default credentials
      initializeApp({
        projectId:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'scenic-doors-quoter',
      })
      console.warn(
        '[Firebase Admin] No service account key found - using default credentials'
      )
      console.warn(
        '[Firebase Admin] Some features may not work without proper credentials'
      )
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error)
    console.warn('⚠️ Firebase Admin not available - some features may not work')
  }
}

// Export with error handling
let adminAuth: Auth
let adminDb: Firestore

try {
  adminAuth = getAuth()
  adminDb = getFirestore()
} catch (error) {
  console.error('❌ Failed to get Firebase Admin services:', error)
  // Create mock implementations for development
  adminAuth = {
    getUserByEmail: async () => {
      throw new Error('Firebase Admin not available')
    },
    updateUser: async () => {
      throw new Error('Firebase Admin not available')
    },
  } as unknown as Auth
  adminDb = {
    collection: () => ({
      get: async () => ({ empty: true, docs: [] }),
      where: () => ({
        get: async () => ({ empty: true, docs: [] }),
      }),
      doc: () => ({
        update: async () => {},
      }),
    }),
  } as unknown as Firestore
}

export { adminAuth, adminDb }
