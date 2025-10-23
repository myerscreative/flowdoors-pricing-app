// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Debug logging for Firebase configuration
console.warn('🔍 Firebase Client SDK Configuration:')
console.warn('  Project ID:', firebaseConfig.projectId)
console.warn('  Auth Domain:', firebaseConfig.authDomain)
console.warn('  API Key:', firebaseConfig.apiKey?.substring(0, 8) + '...')

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, db, storage, auth, googleProvider, signInWithPopup }
