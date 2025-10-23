import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebaseClient'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { validatePasswordStrength, isTokenExpired } from '@/lib/authUtils'
import { adminAuth } from '@/lib/firebase-admin' // Firebase Admin for user creation

type ActivatePayload = {
  token: string
  email: string
  password: string
}

function isActivatePayload(value: unknown): value is ActivatePayload {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.token === 'string' &&
    typeof v.email === 'string' &&
    typeof v.password === 'string'
  )
}

export async function POST(request: NextRequest) {
  try {
    const bodyUnknown: unknown = await request.json()

    if (!isActivatePayload(bodyUnknown)) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: token, email, and password are required',
        },
        { status: 400 }
      )
    }

    const { token, email, password } = bodyUnknown

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error:
            passwordValidation.error ||
            'Password does not meet strength requirements',
        },
        { status: 400 }
      )
    }

    // Find user by email and activation token using Firebase client SDK
    let userDoc
    try {
      const usersQuery = query(
        collection(db, 'salespeople'),
        where('email', '==', email.toLowerCase()),
        where('activation_token', '==', token)
      )

      const userSnapshot = await getDocs(usersQuery)

      if (userSnapshot.empty) {
        return NextResponse.json(
          { error: 'Invalid activation token or email' },
          { status: 400 }
        )
      }

      userDoc = userSnapshot.docs[0]
    } catch (dbError) {
      console.error('Firestore query error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please contact support.' },
        { status: 500 }
      )
    }

    const userData = userDoc.data()

    // Check if token is expired
    if (isTokenExpired(userData.token_expires_at)) {
      return NextResponse.json(
        {
          error:
            'Activation token has expired. Please contact support for a new activation link.',
        },
        { status: 400 }
      )
    }

    // Check if account is already activated
    if (userData.account_status === 'active') {
      return NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      )
    }

    // Update user document in Firestore
    try {
      const userRef = doc(db, 'salespeople', userDoc.id)
      await updateDoc(userRef, {
        account_status: 'active',
        status: 'active',
        email_verified: true,
        activation_token: null, // Clear the token
        token_expires_at: null, // Clear expiration
        temp_password: null, // Clear temp password
        updated_at: new Date(),
      })
    } catch (updateError) {
      console.error('Firestore update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user account. Please contact support.' },
        { status: 500 }
      )
    }

    // Create or update Firebase Auth user
    let firebaseUser
    try {
      console.warn('🔐 Firebase Auth user management for:', email)
      console.warn('🔍 Firebase Admin available:', !!adminAuth)
      console.warn(
        '🔍 Firebase Admin project:',
        adminAuth?.app?.options?.projectId
      )
      console.warn(
        '🔑 Password received (first 3 chars):',
        password.substring(0, 3) + '***'
      )
      console.warn('🔑 Password length:', password.length)

      try {
        // Try to get the user by email first
        const existingUser = await adminAuth.getUserByEmail(email)
        console.warn('👤 Existing Firebase user found:', existingUser.uid)

        // Update the existing user's password
        firebaseUser = await adminAuth.updateUser(existingUser.uid, {
          password: password,
          emailVerified: true,
          disabled: false,
        })

        console.warn(
          '✅ Updated existing Firebase user password:',
          firebaseUser.uid
        )
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          // User doesn't exist, create new one
          console.warn(
            '👤 No existing Firebase user found, creating new one...'
          )

          firebaseUser = await adminAuth.createUser({
            email: email,
            password: password,
            emailVerified: true,
            disabled: false,
          })

          console.warn('✅ Created new Firebase user:', firebaseUser.uid)
        } else {
          console.error('❌ Firebase user lookup failed:', err)
          throw err
        }
      }

      // Set custom claims for role-based access
      await adminAuth.setCustomUserClaims(firebaseUser.uid, {
        role: userData.role || 'salesperson',
      })

      console.warn(
        '✅ Set custom claims for user:',
        firebaseUser.uid,
        'role:',
        userData.role || 'salesperson'
      )

      // Persist firebase uid onto the salesperson doc
      try {
        await updateDoc(doc(db, 'salespeople', userDoc.id), {
          firebase_uid: firebaseUser.uid,
        })
        console.warn(
          '✅ Saved firebase_uid to Firestore document:',
          firebaseUser.uid
        )
      } catch (updateError) {
        console.error(
          '❌ Could not save firebase_uid after Auth creation:',
          updateError
        )
      }

      console.warn(
        '✅ Firebase Auth user management completed successfully:',
        firebaseUser.uid
      )
    } catch (authError) {
      console.error('❌ Firebase Auth user management failed:', authError)
      console.error('❌ Auth error details:', {
        message:
          authError instanceof Error ? authError.message : 'Unknown error',
        code: (authError as any)?.code,
        stack: authError instanceof Error ? authError.stack : undefined,
      })

      // Don't fail the entire activation if Firebase Auth fails
      console.warn('⚠️ Continuing activation despite Firebase Auth failure')
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message:
        'Account activated successfully! You can now log in with your email and the password you just set.',
      userId: userDoc.id,
      email: userData.email,
    })
  } catch (err) {
    console.error('Account activation error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
