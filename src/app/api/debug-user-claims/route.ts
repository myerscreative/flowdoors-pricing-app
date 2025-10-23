import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    )
  }

  try {
    // Check if adminAuth is available
    if (!adminAuth || typeof adminAuth.getUserByEmail !== 'function') {
      return NextResponse.json(
        { error: 'Firebase Admin Auth not available' },
        { status: 503 }
      )
    }

    const user = await adminAuth.getUserByEmail(email)
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims || {},
      disabled: user.disabled,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: 404 }
    )
  }
}
