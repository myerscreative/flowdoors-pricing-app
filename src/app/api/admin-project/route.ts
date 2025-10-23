import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Attempt multiple ways to read the Admin SDK project id
  const fromEnv =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    null

  // Never expose secrets; just basic diag
  const diag = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    adminProjectId: fromEnv,
    // helpful context: where we found it
    source: fromEnv ? 'env' : 'unknown',
  }

  console.warn('[admin-project]', diag)
  return NextResponse.json(diag)
}
