export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Type definitions for better type safety
interface RequestBody {
  email?: unknown
}

/** Simple email validation */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * POST /api/users/password-reset
 * Body: { email: string }
 * Returns: { link: string } on success, or { error: string } with status code.
 */
export async function POST(req: Request) {
  try {
    // Parse body safely
    const body: RequestBody = await req.json().catch(() => ({}))
    const email = body.email

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

    // Use REST API to send password reset email
    const apiKey =
      process.env.FIREBASE_WEB_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Firebase API key not configured',
        },
        { status: 500 }
      )
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: email.trim(),
            continueUrl: `${baseUrl}/admin/login`,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        console.warn(`Password reset email sent to: ${email.trim()}`)
        return NextResponse.json({
          message: 'Password reset email sent successfully. Check your inbox.',
        })
      } else {
        // For security, don't reveal if email doesn't exist
        // Return success anyway to prevent email enumeration attacks
        console.warn(`Password reset failed for ${email.trim()}:`, result)
        return NextResponse.json({
          message:
            'If an account with this email exists, a password reset email has been sent.',
        })
      }
    } catch (error) {
      console.error('Password reset API error:', error)
      // For security, don't reveal errors
      return NextResponse.json({
        message:
          'If an account with this email exists, a password reset email has been sent.',
      })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('password-reset error:', msg)
    // Always return JSON (dev errors won't become HTML)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** Optional: simple GET to prove the route returns JSON */
export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST { email }',
  })
}
