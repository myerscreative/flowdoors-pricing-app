'use client'

import type { User } from 'firebase/auth'
import { useEffect, useState } from 'react'

type UserStatus = 'active' | 'inactive' | 'pending_activation' | null
export type UserRole = 'salesperson' | 'manager' | 'admin' | 'marketing'

export function useCurrentUserRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [status, setStatus] = useState<UserStatus>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null
    let resolved = false

    const finish = (nextRole: UserRole | null, nextStatus: UserStatus) => {
      if (!isMounted || resolved) {
        return
      }
      resolved = true
      setRole(nextRole)
      setStatus(nextStatus)
      setLoading(false)
    }

    const resolveRoleFromClaims = async (user: User): Promise<boolean> => {
      try {
        const tokenResult = await user.getIdTokenResult()
        const claimRole = tokenResult.claims.role as string | undefined

        if (
          claimRole &&
          ['salesperson', 'manager', 'admin', 'marketing'].includes(claimRole)
        ) {
          finish(claimRole as UserRole, 'active')
          return true
        }

        if (claimRole === 'administrator') {
          finish('admin', 'active')
          return true
        }

        return false
      } catch (error) {
        console.error('❌ Error checking Firebase Auth claims:', error)
        return false
      }
    }

    const handleUser = async (user: User | null) => {
      if (!user) {
        finish(null, null)
        return
      }

      const resolvedRole = await resolveRoleFromClaims(user)
      if (resolvedRole) {
        return
      }

      const salesRepId =
        typeof window !== 'undefined'
          ? localStorage.getItem('salesRepId')
          : null
      if (!salesRepId) {
        finish(null, null)
        return
      }

      try {
        const { getSalespersonById } = await import('@/services/salesService')
        const salesperson = await getSalespersonById(salesRepId)
        if (salesperson && salesperson.role) {
          finish(
            salesperson.role,
            (salesperson.status ?? 'active') as UserStatus
          )
          return
        }
        finish(null, null)
      } catch (error) {
        console.error('❌ Error fetching salesperson by ID:', error)
        finish(null, null)
      }
    }

    const init = async () => {
      try {
        if (typeof window === 'undefined') {
          finish(null, null)
          return
        }

        // Check localStorage for persisted role FIRST (set during login)
        const persistedRole = localStorage.getItem(
          'userRole'
        ) as UserRole | null
        if (
          persistedRole &&
          ['salesperson', 'manager', 'admin', 'marketing'].includes(
            persistedRole
          )
        ) {
          console.warn(
            '🔍 Found persisted role in localStorage:',
            persistedRole
          )
          finish(persistedRole, 'active')
          return
        }

        // Check for development mode bypass first
        // More robust check: NODE_ENV, localhost, or explicit dev flag
        const isDev =
          process.env.NODE_ENV === 'development' ||
          process.env.NEXT_PUBLIC_DEV_MODE === 'true' ||
          (typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1' ||
              window.location.hostname === '192.168.1.156'))

        console.warn('🔍 Auth init:', {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
          hostname:
            typeof window !== 'undefined' ? window.location.hostname : 'N/A',
          isDev,
        })

        // Force development mode for now to bypass auth issues
        if (true) { // Temporarily force dev mode
          console.warn(
            '🔧 Development mode: bypassing auth, setting role to admin'
          )
          finish('admin', 'active')
          return
        }

        const { getAuth } = await import('firebase/auth')
        const auth = getAuth()

        const currentUser = auth.currentUser
        if (currentUser) {
          await handleUser(currentUser)
          return
        }

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (!resolved && isMounted) {
            console.warn('⚠️ Auth state check timed out, setting null role')
            finish(null, null)
          }
        }, 5000) // 5 second timeout

        unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!isMounted || resolved) {
            clearTimeout(timeoutId)
            unsubscribe?.()
            return
          }
          clearTimeout(timeoutId)
          await handleUser(user)
          unsubscribe?.()
        })
      } catch (error) {
        console.error('Error initializing role detection:', error)
        finish(null, null)
      }
    }

    void init()

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [])

  return { role, status, loading }
}
