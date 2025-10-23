import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { validatePasswordStrength } from '@/lib/authUtils'

type ChangePasswordPayload = {
  email: string
  currentPassword: string
  newPassword: string
}

function isChangePasswordPayload(
  value: unknown
): value is ChangePasswordPayload {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.email === 'string' &&
    typeof v.currentPassword === 'string' &&
    typeof v.newPassword === 'string'
  )
}

export async function POST(request: NextRequest) {
  try {
    const bodyUnknown: unknown = await request.json()

    if (!isChangePasswordPayload(bodyUnknown)) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: email, currentPassword, and newPassword are required',
        },
        { status: 400 }
      )
    }

    const { email, currentPassword, newPassword } = bodyUnknown

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error:
            passwordValidation.error ||
            'New password does not meet strength requirements',
        },
        { status: 400 }
      )
    }

    // Verify current password by attempting to sign in
    try {
      const apiKey =
        process.env.FIREBASE_WEB_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY

      if (!apiKey) {
        return NextResponse.json(
          {
            error: 'Firebase API key not configured',
          },
          { status: 500 }
        )
      }

      // Verify current password
      const signInResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: currentPassword,
            returnSecureToken: true,
          }),
        }
      )

      if (!signInResponse.ok) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      const signInResult = await signInResponse.json()
      const uid = signInResult.localId

      // Update password using Admin SDK
      if (adminAuth) {
        await adminAuth.updateUser(uid, {
          password: newPassword,
        })

        console.warn('✅ Password updated for user:', email)

        return NextResponse.json({
          success: true,
          message: 'Password updated successfully!',
        })
      } else {
        return NextResponse.json(
          { error: 'Admin SDK not available' },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('Password change error:', error)
      return NextResponse.json(
        { error: 'Failed to change password. Please try again.' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
