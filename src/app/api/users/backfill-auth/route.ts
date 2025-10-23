import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { db } from '@/lib/firebaseClient'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'

type Payload = { email: string; password?: string; role?: string }

function isPayload(v: unknown): v is Payload {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.email === 'string' &&
    (!o.password || typeof o.password === 'string') &&
    (!o.role || typeof o.role === 'string')
  )
}

export async function POST(req: NextRequest) {
  // Safety: only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    )
  }

  try {
    const bodyUnknown = await req.json()
    if (!isPayload(bodyUnknown)) {
      return NextResponse.json(
        { error: 'Expected { email, password?, role? }' },
        { status: 400 }
      )
    }
    const email = bodyUnknown.email.trim().toLowerCase()
    const password = bodyUnknown.password?.trim() || 'ScenicTest123!'
    const desiredRole = (bodyUnknown.role || 'salesperson') as string

    // Find salesperson doc
    const q = query(collection(db, 'salespeople'), where('email', '==', email))
    const snap = await getDocs(q)
    if (snap.empty) {
      return NextResponse.json(
        { error: 'No salesperson found for email' },
        { status: 404 }
      )
    }
    const docSnap = snap.docs[0]
    const sp = docSnap.data() as Record<string, unknown>

    // Try Admin SDK first
    try {
      if (adminAuth) {
        let uid: string | undefined
        try {
          const existing = await adminAuth.getUserByEmail(email)
          uid = existing.uid
        } catch {
          const created = await adminAuth.createUser({
            email,
            password,
            emailVerified: true,
            disabled: false,
          })
          uid = created.uid
        }
        if (uid) {
          // Set claims
          await adminAuth.setCustomUserClaims(uid, {
            role: (sp.role as string) || desiredRole,
          })
          await updateDoc(doc(db, 'salespeople', docSnap.id), {
            firebase_uid: uid,
            status: 'active',
            account_status: 'active',
            email_verified: true,
          })
          return NextResponse.json({
            success: true,
            method: 'admin',
            uid,
            email,
            password,
          })
        }
      }
    } catch (e) {
      // fall through to REST
      console.warn(
        'Admin SDK backfill failed, falling back to REST:',
        e instanceof Error ? e.message : e
      )
    }

    // REST fallback using Identity Toolkit signUp
    const apiKey =
      process.env.FIREBASE_WEB_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing FIREBASE_WEB_API_KEY/NEXT_PUBLIC_FIREBASE_API_KEY' },
        { status: 500 }
      )
    }

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: false }),
      }
    )
    const json = (await res.json()) as { localId?: string; error?: unknown }
    if (!res.ok && (json as any)?.error?.message !== 'EMAIL_EXISTS') {
      return NextResponse.json(
        { error: 'REST signUp failed', details: json },
        { status: 500 }
      )
    }

    // If user existed, we don't know UID without Admin; proceed without it
    const uid = (json as any)?.localId as string | undefined
    try {
      await updateDoc(doc(db, 'salespeople', docSnap.id), {
        firebase_uid: uid ?? '',
        status: 'active',
        account_status: 'active',
        email_verified: true,
      })
    } catch {
      // intentionally empty - update failed, continue
    }

    return NextResponse.json({
      success: true,
      method: 'rest',
      uid,
      email,
      password,
      note: 'Custom claims may be missing; UI falls back to Firestore role.',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
