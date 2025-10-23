import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/authUtils'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, action } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const result: any = {
      email,
      passwordLength: password.length,
      passwordFirst3: password.substring(0, 3) + '***',
      action,
      timestamp: new Date().toISOString(),
    }

    if (action === 'hash') {
      // Test our custom hashing
      result.hashedPassword = hashPassword(password)
      result.hashLength = result.hashedPassword.length
    } else if (action === 'check-user') {
      // Check if user exists in Firebase Auth
      try {
        const userRecord = await adminAuth.getUserByEmail(email)
        result.userExists = true
        result.uid = userRecord.uid
        result.emailVerified = userRecord.emailVerified
        result.disabled = userRecord.disabled
        result.createdAt = userRecord.metadata.creationTime
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          result.userExists = false
        } else {
          result.error = error.message
        }
      }
    } else if (action === 'create-test') {
      // Create a test user (be careful with this!)
      try {
        const userRecord = await adminAuth.createUser({
          email: email,
          password: password,
          emailVerified: true,
          disabled: false,
        })
        result.created = true
        result.uid = userRecord.uid
      } catch (error: any) {
        result.error = error.message
        result.errorCode = error.code
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test password route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Password testing endpoint',
    actions: ['hash', 'check-user', 'create-test'],
    usage: 'POST with { email, password, action }',
  })
}
