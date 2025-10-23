export const runtime = 'nodejs' // ensure Node runtime (Admin SDK not supported on edge)
export const dynamic = 'force-dynamic' // avoid caching in dev/preview

import { NextResponse } from 'next/server'
import admin from 'firebase-admin'

/** Safe idempotent Admin init */
if (!admin.apps.length) {
  try {
    admin.initializeApp()
  } catch (e) {
    // If another route initialized, ignore
    console.warn('firebase-admin initializeApp re-entry:', e)
  }
}

// Type definitions for better type safety
interface RequestBody {
  email?: unknown
  displayName?: unknown
}

/** Simple email validation */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * POST /api/users/resend-activation
 * Body: { email: string, displayName?: string }
 * Returns: { link: string } on success, or { error: string } with status code.
 */
export async function POST(req: Request) {
  try {
    // Parse body safely
    const body: RequestBody = await req.json().catch(() => ({}))
    const email = body.email
    const displayName = body.displayName

    // Validate email
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: "Valid 'email' is required." },
        { status: 400 }
      )
    }

    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Use environment variable for consistent URL across environments
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const actionCodeSettings = {
      url: `${baseUrl}/activate-account`,
      handleCodeInApp: true,
    }

    // Ensure user exists (create if not)
    try {
      await admin.auth().getUserByEmail(email.trim())
    } catch (_error) {
      // User doesn't exist, create them
      if (
        _error instanceof Error &&
        _error.message.includes('auth/user-not-found')
      ) {
        await admin.auth().createUser({
          email: email.trim(),
          displayName:
            typeof displayName === 'string' ? displayName.trim() : undefined,
          emailVerified: false,
          disabled: false,
        })
      } else {
        // Re-throw other Firebase errors
        throw _error
      }
    }

    // Generate email verification link (not password reset)
    const link = await admin
      .auth()
      .generateEmailVerificationLink(email.trim(), actionCodeSettings)

    return NextResponse.json({ link })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('resend-activation error:', msg)
    // Always return JSON (dev errors won't become HTML)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** Optional: simple GET to prove the route returns JSON */
export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST { email, displayName? }',
  })
}
