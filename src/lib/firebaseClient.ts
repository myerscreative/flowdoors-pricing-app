// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

// Fallback config for production when env vars aren't injected
// These are the actual values from your Firebase project
const fallbackConfig = {
  apiKey: 'AIzaSyCOB4dOLeNJH3A5kAnv1gUP4_R4pv1gpIU',
  authDomain: 'flowdoors-pricing-app.firebaseapp.com',
  projectId: 'flowdoors-pricing-app',
  storageBucket: 'flowdoors-pricing-app.firebasestorage.app',
  messagingSenderId: '24155624451',
  appId: '1:24155624451:web:266437e9836aac3c07ea36',
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
}

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '🔍 Firebase Client: Using',
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? 'environment vars'
      : 'fallback config'
  )
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
  console.warn('⚠️ Firebase env vars not set, using fallback config')
  // This is OK - we have fallback config hardcoded below
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

// Enable offline persistence and cache for better performance
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn(
          'Firestore persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a time.'
        )
      } else if (err.code === 'unimplemented') {
        console.warn(
          'Firestore persistence not available: Current browser does not support persistence.'
        )
      }
    })
  })
}

const auth = getAuth(app)
const storage = getStorage(app)

// Initialize Functions with the correct region
const functions = getFunctions(app, 'us-central1')

// Connect to emulator in development if needed
if (
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === 'true'
) {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

export { app, db, auth, storage, functions }
