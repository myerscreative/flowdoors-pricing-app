import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function GET(_request: NextRequest) {
  try {
    console.warn('🔍 Testing Firebase Admin SDK...')
    console.warn('🔍 Admin Auth available:', !!adminAuth)
    console.warn('🔍 Admin Auth type:', typeof adminAuth)
    console.warn(
      '🔍 Admin Auth methods:',
      Object.getOwnPropertyNames(adminAuth || {})
    )

    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin Auth not available',
        details: 'adminAuth is null or undefined',
      })
    }

    // Try to list users (this will fail if no credentials)
    try {
      const listUsersResult = await adminAuth.listUsers(1)
      console.warn('✅ Firebase Admin Auth working, can list users')
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin Auth is working',
        details: {
          canListUsers: true,
          userCount: listUsersResult.users.length,
        },
      })
    } catch (listError) {
      console.error('❌ Firebase Admin Auth list users failed:', listError)
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin Auth credentials issue',
        details: {
          error:
            listError instanceof Error ? listError.message : 'Unknown error',
          code: (listError as any)?.code,
        },
      })
    }
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Firebase Admin test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
