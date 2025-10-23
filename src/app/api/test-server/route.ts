import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Server is responding',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      postmarkConfigured:
        !!process.env.POSTMARK_API_TOKEN_DEV ||
        !!process.env.POSTMARK_API_TOKEN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'Not set',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
