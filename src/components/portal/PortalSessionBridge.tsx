'use client'

import { auth } from '@/lib/firebaseClient'
import { onIdTokenChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Keeps a `portal_token` cookie in sync with the Firebase Auth ID token so
 * server components can read the current customer session. Also redirects
 * unauthenticated visitors to /portal/login.
 */
export function PortalSessionBridge({ requireAuth = true }: { requireAuth?: boolean }) {
  const router = useRouter()

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        // 30-day cookie; Firebase tokens rotate hourly, we refresh on each change
        document.cookie = `portal_token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`
      } else {
        document.cookie = 'portal_token=; Path=/; Max-Age=0; SameSite=Lax'
        if (requireAuth) router.replace('/portal/login')
      }
    })
    return unsub
  }, [requireAuth, router])

  return null
}
