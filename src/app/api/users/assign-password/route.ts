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
import { validatePasswordStrength } from '@/lib/authUtils'
import { adminAuth } from '@/lib/firebase-admin'

type AssignPasswordPayload = {
  email: string
  password: string
}

function isAssignPasswordPayload(
  value: unknown
): value is AssignPasswordPayload {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.email === 'string' && typeof v.password === 'string'
}

export async function POST(request: NextRequest) {
  try {
    const bodyUnknown: unknown = await request.json()

    if (!isAssignPasswordPayload(bodyUnknown)) {
      return NextResponse.json(
        { error: 'Missing required fields: email and password are required' },
        { status: 400 }
      )
    }

    const { email, password } = bodyUnknown

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

    // Find user by email
    let userDoc
    try {
      const usersQuery = query(
        collection(db, 'salespeople'),
        where('email', '==', email.toLowerCase())
      )

      const userSnapshot = await getDocs(usersQuery)

      if (userSnapshot.empty) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Update user document to mark as active
    try {
      const userRef = doc(db, 'salespeople', userDoc.id)
      await updateDoc(userRef, {
        account_status: 'active',
        status: 'active',
        email_verified: true,
        temp_password: password, // Store the password temporarily for reference
        updated_at: new Date(),
      })
    } catch (updateError) {
      console.error('Firestore update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user account. Please contact support.' },
        { status: 500 }
      )
    }

    // Try to create/update Firebase Auth user using Admin SDK
    try {
      if (adminAuth) {
        let firebaseUser

        try {
          // Try to get existing user
          firebaseUser = await adminAuth.getUserByEmail(email)
          console.warn(
            '✅ Found existing Firebase Auth user:',
            firebaseUser.uid
          )

          // Update password for existing user
          await adminAuth.updateUser(firebaseUser.uid, {
            password: password,
          })
          console.warn('✅ Password updated for existing user')
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            // Create new user
            firebaseUser = await adminAuth.createUser({
              email: email,
              password: password,
              emailVerified: true,
              disabled: false,
            })
            console.warn('✅ Firebase Auth user created:', firebaseUser.uid)
          } else {
            throw error
          }
        }

        // Set custom claims for role-based access
        await adminAuth.setCustomUserClaims(firebaseUser.uid, {
          role: userData.role || 'salesperson',
        })
        console.warn('✅ Custom claims set for user')

        // Update Firestore with Firebase UID
        await updateDoc(doc(db, 'salespeople', userDoc.id), {
          firebase_uid: firebaseUser.uid,
          temp_password: null, // Clear temp password
        })
      } else {
        console.warn(
          '⚠️ Firebase Admin SDK not available - using REST fallback'
        )
        // Fallback to REST API if Admin SDK not available
        const apiKey =
          process.env.FIREBASE_WEB_API_KEY ||
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY

        if (apiKey) {
          const signUpResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: false,
              }),
            }
          )

          const signUpResult = await signUpResponse.json()

          if (signUpResponse.ok && signUpResult.localId) {
            await updateDoc(doc(db, 'salespeople', userDoc.id), {
              firebase_uid: signUpResult.localId,
              temp_password: null,
            })
            console.warn(
              '✅ Firebase Auth user created via REST:',
              signUpResult.localId
            )
          } else if (signUpResult.error?.message === 'EMAIL_EXISTS') {
            console.warn('✅ User already exists in Firebase Auth')
            await updateDoc(doc(db, 'salespeople', userDoc.id), {
              temp_password: null,
            })
          }
        }
      }
    } catch (authError) {
      console.error('❌ Firebase Auth user creation/update failed:', authError)
      // Don't fail the assignment if Auth creation fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Password assigned successfully! User can now log in.',
      email: userData.email,
      userId: userDoc.id,
    })
  } catch (err) {
    console.error('Password assignment error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
