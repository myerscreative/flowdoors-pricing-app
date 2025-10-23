'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'

type Role =
  | 'marketing'
  | 'manager'
  | 'admin'
  | 'administrator'
  | 'salesperson'
  | undefined

export function useAuthRole() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) {
        setRole(undefined)
        setLoading(false)
        return
      }
      try {
        const token = await u.getIdTokenResult(true)
        const claimRole = token.claims?.role as Role
        setRole(claimRole)
      } catch (e) {
        console.warn('[useAuthRole] failed to read claims', e)
        setRole(undefined)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  return { user, role, loading }
}
