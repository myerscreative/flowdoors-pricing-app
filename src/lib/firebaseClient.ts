// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

// Fallback config for production when env vars aren't injected
// TODO: Replace with actual FlowDoors Firebase project values
// NOTE: Currently using ScenicDoors values - MUST BE REPLACED!
const fallbackConfig = {
  apiKey: 'REPLACE_WITH_FLOWDOORS_API_KEY',
  authDomain: 'flowdoors-quoter.firebaseapp.com',
  projectId: 'flowdoors-quoter',
  storageBucket: 'flowdoors-quoter.firebasestorage.app',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId: 'REPLACE_WITH_APP_ID',
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
  const usingEnv = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  console.warn(
    '🔍 Firebase Client: Using',
    usingEnv ? 'environment vars' : 'fallback config',
    `- Project: ${firebaseConfig.projectId}`
  )
  if (!usingEnv) {
    console.warn('⚠️  WARNING: FlowDoors is currently using fallback ScenicDoors config!')
    console.warn('⚠️  Set up a separate Firebase project for FlowDoors and update .env.local')
  }
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
