'use client'

import Sidebar from '@/components/admin/Sidebar'
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, loading } = useCurrentUserRole()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  console.warn('🔍 Admin Layout Debug:', { role, loading, pathname })

  // Skip auth guard for login page to prevent redirect loop
  const isLoginPage = pathname === '/admin/login'

  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !role && !isLoginPage) {
      console.warn('🔒 No role detected, redirecting to login')
      router.push('/admin/login')
    }
  }, [role, loading, router, isLoginPage])

  const handleLogout = async () => {
    try {
      // Import Firebase Auth dynamically
      const { getAuth, signOut } = await import('firebase/auth')
      const auth = getAuth()

      // Sign out from Firebase
      await signOut(auth)

      // Clear localStorage
      localStorage.removeItem('salesRepId')
      localStorage.removeItem('userRole')

      // Redirect to login page
      router.push('/admin/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Still redirect even if there's an error
      router.push('/admin/login')
    }
  }

  // Show login page without sidebar/navigation
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Don't render admin layout if user is not authenticated
  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-72">
        {/* Page content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
