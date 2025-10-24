import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  try {
    // Try to use service account key if available
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (serviceAccountKey) {
      // Parse the service account key from environment variable
      const serviceAccount = JSON.parse(serviceAccountKey)
      initializeApp({
        credential: cert(serviceAccount),
        projectId:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'flowdoors-pricing-app',
      })
      console.warn('✅ Firebase Admin initialized with service account key')
    } else {
      // For development, try default credentials
      initializeApp({
        projectId:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'flowdoors-pricing-app',
      })
      console.warn('✅ Firebase Admin initialized with default credentials')
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error)
    console.warn('⚠️ Firebase Admin not available - some features may not work')
  }
}

// Export with error handling
let adminAuth: any = null
let adminDb: any = null

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
  }
  adminDb = {
    collection: () => ({
      where: () => ({
        get: async () => ({ empty: true, docs: [] }),
      }),
      doc: () => ({
        update: async () => {},
      }),
    }),
  }
}

export { adminAuth, adminDb }
