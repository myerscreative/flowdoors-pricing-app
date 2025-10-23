export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { db } from '@/lib/firebaseClient'
import { collection, query, where, getDocs } from 'firebase/firestore'

/**
 * GET /api/users/diagnose?email=user@example.com
 * Diagnoses user status across Firestore and Firebase Auth
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const diagnosis: {
      email: string
      firestoreStatus: string
      firestoreData?: Record<string, unknown>
      firebaseAuthStatus: string
      firebaseAuthData?: Record<string, unknown>
      recommendations: string[]
    } = {
      email,
      firestoreStatus: 'not_checked',
      firebaseAuthStatus: 'not_checked',
      recommendations: [],
    }

    // Check Firestore (salespeople collection)
    try {
      console.warn(`🔍 Checking Firestore for: ${email}`)
      const usersQuery = query(
        collection(db, 'salespeople'),
        where('email', '==', email.toLowerCase())
      )
      const userSnapshot = await getDocs(usersQuery)

      if (userSnapshot.empty) {
        diagnosis.firestoreStatus = 'not_found'
        diagnosis.recommendations.push(
          'User does not exist in Firestore salespeople collection'
        )
      } else {
        const userDoc = userSnapshot.docs[0]
        const userData = userDoc.data()
        diagnosis.firestoreStatus = 'found'
        diagnosis.firestoreData = {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          account_status: userData.account_status,
          email_verified: userData.email_verified,
          firebase_uid: userData.firebase_uid,
          activation_token: userData.activation_token
            ? 'exists (hidden)'
            : 'none',
          token_expires_at: userData.token_expires_at
            ? new Date(userData.token_expires_at.toDate()).toISOString()
            : 'none',
        }

        // Add recommendations based on Firestore data
        if (userData.account_status !== 'active') {
          diagnosis.recommendations.push(
            `Firestore account_status is "${userData.account_status}" - should be "active"`
          )
        }
        if (!userData.email_verified) {
          diagnosis.recommendations.push('Email is not verified in Firestore')
        }
        if (!userData.firebase_uid) {
          diagnosis.recommendations.push(
            'No firebase_uid set - user may not exist in Firebase Auth'
          )
        }
      }
    } catch (firestoreError) {
      console.error('Firestore check error:', firestoreError)
      diagnosis.firestoreStatus = 'error'
      diagnosis.recommendations.push(
        `Firestore check failed: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`
      )
    }

    // Check Firebase Auth
    try {
      console.warn(`🔍 Checking Firebase Auth for: ${email}`)
      const userRecord = await adminAuth.getUserByEmail(email)
      diagnosis.firebaseAuthStatus = 'found'
      diagnosis.firebaseAuthData = {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims || {},
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      }

      // Add recommendations based on Firebase Auth data
      if (userRecord.disabled) {
        diagnosis.recommendations.push(
          'Firebase Auth user is DISABLED - must be enabled to log in'
        )
      }
      if (!userRecord.emailVerified) {
        diagnosis.recommendations.push('Email is not verified in Firebase Auth')
      }
      if (!userRecord.customClaims?.role) {
        diagnosis.recommendations.push(
          'No role claim set in Firebase Auth - user may not be able to access protected routes'
        )
      }
    } catch (authError: unknown) {
      const err = authError as { code?: string; message?: string }
      if (err.code === 'auth/user-not-found') {
        diagnosis.firebaseAuthStatus = 'not_found'
        diagnosis.recommendations.push(
          'User does not exist in Firebase Auth - must be created to enable login'
        )
      } else {
        console.error('Firebase Auth check error:', authError)
        diagnosis.firebaseAuthStatus = 'error'
        diagnosis.recommendations.push(
          `Firebase Auth check failed: ${err.message || 'Unknown error'}`
        )
      }
    }

    // Summary recommendations
    if (
      diagnosis.firestoreStatus === 'found' &&
      diagnosis.firebaseAuthStatus === 'not_found'
    ) {
      diagnosis.recommendations.push(
        '💡 SOLUTION: Run the manual activation script to create Firebase Auth user'
      )
    } else if (
      diagnosis.firestoreStatus === 'not_found' &&
      diagnosis.firebaseAuthStatus === 'not_found'
    ) {
      diagnosis.recommendations.push(
        '💡 SOLUTION: Create new user via /api/users/create endpoint'
      )
    } else if (diagnosis.recommendations.length === 0) {
      diagnosis.recommendations.push(
        '✅ User appears to be properly configured'
      )
    }

    return NextResponse.json(diagnosis, { status: 200 })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to diagnose user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
