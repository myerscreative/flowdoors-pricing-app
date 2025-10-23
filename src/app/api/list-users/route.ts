import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if adminAuth is available and has the listUsers method
    if (!adminAuth || typeof adminAuth.listUsers !== 'function') {
      console.error('[list-users] Firebase Admin Auth not available')
      return NextResponse.json(
        { error: 'Firebase Admin Auth not available' },
        { status: 503 }
      )
    }

    const users = await adminAuth.listUsers(10) // list first 10 for safety
    const result = users.users.map((u: any) => ({
      uid: u.uid,
      email: u.email,
      emailVerified: u.emailVerified,
    }))
    return NextResponse.json({ count: result.length, users: result })
  } catch (err: any) {
    console.error('[list-users] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
