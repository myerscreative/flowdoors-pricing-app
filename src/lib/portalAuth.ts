import { adminAuth } from '@/lib/firebaseAdmin'
import { cookies } from 'next/headers'

/**
 * Verify an ID token from the portal session cookie.
 * The portal client sets a `portal_token` cookie after sign-in.
 * Returns { uid, email } on success, null if not signed in.
 */
export async function getPortalUser(): Promise<{
  uid: string
  email: string
  role?: string
} | null> {
  try {
    const store = await cookies()
    const token = store.get('portal_token')?.value
    if (!token) return null
    const decoded = await adminAuth.verifyIdToken(token, true)
    if (!decoded.email) return null
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: (decoded.role as string | undefined) ?? undefined,
    }
  } catch (err) {
    console.warn('Portal token verify failed:', err)
    return null
  }
}
