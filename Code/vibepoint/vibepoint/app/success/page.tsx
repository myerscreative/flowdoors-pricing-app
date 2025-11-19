'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/home')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mood logged successfully!
          </h1>
          <p className="text-gray-600">
            Your entry has been saved. Keep tracking to discover your patterns.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/home"
            className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </Link>

          <Link
            href="/mood"
            className="block w-full bg-white text-indigo-600 py-3 px-4 rounded-lg font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Log Another Mood
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Redirecting to home in a few seconds...
        </p>
      </div>
    </div>
  )
}
