// src/app/api/users/confirm-password-reset/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

/**
 * POST /api/users/confirm-password-reset
 * Body: { oobCode: string, newPassword: string }
 * Returns: { ok: true } on success, or { error: string }.
 *
 * Uses Identity Toolkit REST: accounts:resetPassword
 * https://cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/resetPassword
 */
interface RequestBody {
  oobCode?: unknown
  newPassword?: unknown
}

type ITRestError = {
  error: {
    code: number
    message: string // e.g., "INVALID_OOB_CODE"
    errors?: Array<{ message: string; domain: string; reason: string }>
  }
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function isITRestError(x: unknown): x is ITRestError {
  if (!isObject(x)) return false
  const err = (x as Record<string, unknown>)['error']
  if (!isObject(err)) return false
  const msg = (err as Record<string, unknown>)['message']
  return typeof msg === 'string'
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json().catch(() => ({}))
    const oobCode = typeof body.oobCode === 'string' ? body.oobCode.trim() : ''
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : ''

    if (!oobCode) {
      return NextResponse.json(
        { error: "Valid 'oobCode' is required." },
        { status: 400 }
      )
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    const apiKey =
      process.env.FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FIREBASE_API_KEY not configured' },
        { status: 500 }
      )
    }

    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ oobCode, newPassword }),
      }
    )

    const data: unknown = await resp.json()

    if (!resp.ok || isITRestError(data)) {
      const code = isITRestError(data)
        ? data.error.message
        : `HTTP_${resp.status}`
      let message = 'Password reset failed.'
      switch (code) {
        case 'INVALID_OOB_CODE':
          message = 'Invalid or expired reset code.'
          break
        case 'EXPIRED_OOB_CODE':
          message = 'Reset code has expired. Please request a new reset email.'
          break
        case 'WEAK_PASSWORD':
          message = 'Password is too weak. Use at least 6 characters.'
          break
        default:
          message = code
      }
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Success (warn is allowed; log is not)
    console.warn(
      `[confirm-password-reset] success for code prefix: ${oobCode.slice(0, 8)}…`
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('confirm-password-reset error:', msg)
    return NextResponse.json(
      { error: 'Failed to reset password.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST { oobCode, newPassword }' })
}
