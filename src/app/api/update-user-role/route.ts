import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    console.warn('🔐 Updating role for user:', email, 'to role:', role)

    // Check if adminAuth is available
    if (!adminAuth || typeof adminAuth.getUserByEmail !== 'function') {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin Auth not available' },
        { status: 503 }
      )
    }

    // Get the user by email
    const user = await adminAuth.getUserByEmail(email)
    console.warn('👤 Found user:', user.uid)

    // Update the custom claims
    await adminAuth.setCustomUserClaims(user.uid, { role: role })
    console.warn('✅ Role updated successfully')

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role} for ${email}`,
      uid: user.uid,
    })
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user role',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
