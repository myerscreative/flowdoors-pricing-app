'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LearnPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to deep-dive page
    router.replace('/deep-dive')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

