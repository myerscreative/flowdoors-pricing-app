// src/lib/auth/reset.ts
'use client'

import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'

/**
 * Sends a Firebase password reset email and deep-links back to /admin/login.
 * Uses NEXT_PUBLIC_APP_URL when available; falls back to window.location.origin in the browser.
 */
export async function sendReset(email: string): Promise<void> {
  const value = email?.trim()
  if (!value || !value.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }

  // Uses the configured Firebase auth instance

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const url = `${baseUrl.replace(/\/+$/, '')}/admin/login`

  await sendPasswordResetEmail(auth, value, {
    url,
    handleCodeInApp: true,
  })
}
