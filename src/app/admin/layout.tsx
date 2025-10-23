'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  ShoppingCart,
  BarChart3,
  Users,
  Bell,
  UserPlus,
} from 'lucide-react'
import React, { useState, useEffect } from 'react'

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

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Quotes', href: '/admin/quotes', icon: FileText },
    { name: 'Leads', href: '/admin/leads', icon: UserPlus },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Marketing', href: '/admin/marketing', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    ...(role === 'admin'
      ? [{ name: 'Notifications', href: '/admin/notifications', icon: Bell }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info and logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Role: {role || 'Unknown'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:pr-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
