import { NextResponse } from 'next/server'

// ensure no caching
export const dynamic = 'force-dynamic'

function mask(v?: string | null) {
  if (!v) return null
  if (v.length <= 8) return '***'
  return v.slice(0, 4) + '…' + v.slice(-4)
}
export async function GET() {
  const payload = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || null,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || null,
    apiKeyMasked: mask(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || null),
    appIdMasked: mask(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || null),
  }
  return NextResponse.json(payload)
}
