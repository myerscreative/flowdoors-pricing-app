import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role = 'salesperson' } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.warn('🔐 Creating Firebase Auth user manually:', email)

    // Check if adminAuth is available
    if (!adminAuth || typeof adminAuth.createUser !== 'function') {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin Auth not available' },
        { status: 503 }
      )
    }

    try {
      const firebaseUser = await adminAuth.createUser({
        email: email,
        password: password,
        emailVerified: true,
        disabled: false,
      })

      // Set custom claims for role-based access
      await adminAuth.setCustomUserClaims(firebaseUser.uid, {
        role: role,
      })

      console.warn(
        '✅ Firebase Auth user created successfully:',
        firebaseUser.uid
      )

      return NextResponse.json({
        success: true,
        message: 'Firebase Auth user created successfully',
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
      })
    } catch (authError) {
      console.error('❌ Firebase Auth user creation failed:', authError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create Firebase Auth user',
          details:
            authError instanceof Error ? authError.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Manual user creation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}
