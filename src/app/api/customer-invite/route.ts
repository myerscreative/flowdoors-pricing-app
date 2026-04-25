import { adminAuth, adminDb } from '@/lib/firebaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type InvitePayload = {
  orderId: string
  email: string
  name?: string
}

function isInvitePayload(x: unknown): x is InvitePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.orderId !== 'string' || o.orderId.length === 0) return false
  if (typeof o.email !== 'string' || !o.email.includes('@')) return false
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    if (!isInvitePayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()

    // Find or create the Firebase Auth user
    let userRecord
    try {
      userRecord = await adminAuth.getUserByEmail(email)
    } catch {
      userRecord = await adminAuth.createUser({
        email,
        displayName: body.name ?? undefined,
        emailVerified: false,
      })
    }

    // Tag the account as a customer
    const existingClaims = (userRecord.customClaims ?? {}) as Record<
      string,
      unknown
    >
    if (existingClaims.role !== 'customer') {
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        ...existingClaims,
        role: 'customer',
      })
    }

    // Link the customer UID onto the order document so we can scope access
    await adminDb
      .collection('orders')
      .doc(body.orderId)
      .set(
        {
          customerUid: userRecord.uid,
          customerEmail: email,
          customerInvitedAt: new Date(),
        },
        { merge: true }
      )

    // Generate a password-reset/sign-in link (acts as the invite)
    const origin = req.nextUrl.origin
    const link = await adminAuth.generatePasswordResetLink(email, {
      url: `${origin}/portal`,
      handleCodeInApp: false,
    })

    return NextResponse.json({
      ok: true,
      uid: userRecord.uid,
      email,
      link,
    })
  } catch (err) {
    console.error('customer-invite error', err)
    const message =
      err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
