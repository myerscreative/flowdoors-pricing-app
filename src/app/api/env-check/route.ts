import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Check all environment variables that start with NEXT_PUBLIC
  const allEnvVars = Object.keys(process.env).filter((key) =>
    key.startsWith('NEXT_PUBLIC_')
  )

  const firebaseVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ? 'SET'
      : 'MISSING',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env
      .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      ? 'SET'
      : 'MISSING',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? 'SET'
      : 'MISSING',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env
      .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      ? 'SET'
      : 'MISSING',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env
      .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ? 'SET'
      : 'MISSING',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      ? 'SET'
      : 'MISSING',
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allNextPublicVars: allEnvVars,
    firebaseVars,
    totalEnvVars: Object.keys(process.env).length,
  })
}
