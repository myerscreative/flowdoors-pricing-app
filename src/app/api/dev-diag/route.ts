import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[dev-diag] Attempted access outside development')
    return new Response('Not Found', { status: 404 })
  }

  const envKeys = Object.keys(process.env || {})

  const diag = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? 'unknown',
    keysCount: envKeys.length,
    hasPostmarkName: envKeys.includes('POSTMARK_API_TOKEN'),
    hasPostmarkValue: Boolean(process.env.POSTMARK_API_TOKEN),
    hasTestDebug: Boolean(process.env.TEST_DEBUG),
  }

  return NextResponse.json(diag)
}
