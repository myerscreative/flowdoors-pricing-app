'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthRole } from '@/hooks/useAuthRole'
import MarketingLayout from './MarketingLayout'

interface MarketingLayoutWrapperProps {
  children: React.ReactNode
}

export default function MarketingLayoutWrapper({
  children,
}: MarketingLayoutWrapperProps) {
  const { user, role, loading } = useAuthRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push('/admin/login')
        return
      }

      // If authenticated but not admin or marketing, redirect to appropriate page
      if (role && !['admin', 'administrator', 'marketing'].includes(role)) {
        if (role === 'salesperson') {
          router.push('/admin/sales')
        } else if (role === 'manager') {
          router.push('/admin')
        } else {
          // Unknown role, redirect to login
          router.push('/admin/login')
        }
        return
      }
    }
  }, [user, role, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not authorized
  if (user && role && !['admin', 'administrator', 'marketing'].includes(role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the marketing dashboard.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!user) {
    return null
  }

  // Render the marketing layout for authorized users
  return <MarketingLayout>{children}</MarketingLayout>
}
