import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid } = await request.json()

    if (!firebaseUid) {
      return NextResponse.json(
        { success: false, error: 'Firebase UID is required' },
        { status: 400 }
      )
    }

    console.warn('🔐 Deleting Firebase Auth user:', firebaseUid)

    // Check if adminAuth is available
    if (!adminAuth || typeof adminAuth.deleteUser !== 'function') {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin Auth not available' },
        { status: 503 }
      )
    }

    // Delete the Firebase Auth user
    await adminAuth.deleteUser(firebaseUid)
    console.warn('✅ Firebase Auth user deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Firebase Auth user deleted successfully',
    })
  } catch (error) {
    console.error('❌ Error deleting Firebase Auth user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete Firebase Auth user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
