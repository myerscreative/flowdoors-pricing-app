'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [user, setUser] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        router.push('/home')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to /home
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-gray-900">Vibepoint</h1>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Understand Your Moods.<br/>
            Control Your Emotions.
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track what you focus on, what you tell yourself, and what you feel physically.
            Discover the patterns that create your emotional states.
          </p>

          <div className="mb-16">
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors inline-block"
            >
              Start Your Journey
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Intuitive Interface
              </h3>
              <p className="text-gray-600">
                Tap anywhere on a beautiful gradient to capture your exact mood coordinates.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pattern Recognition
              </h3>
              <p className="text-gray-600">
                AI-powered insights reveal what thoughts and physical states create your moods.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Private & Secure
              </h3>
              <p className="text-gray-600">
                Your mood data stays yours. End-to-end encryption and privacy-first design.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Select Your Mood</h3>
                <p className="text-gray-600 text-sm">
                  Tap the gradient interface to plot your current emotional state
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Answer 3 Questions</h3>
                <p className="text-gray-600 text-sm">
                  Reflect on what you&apos;re focusing on, telling yourself, and feeling physically
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Discover Patterns</h3>
                <p className="text-gray-600 text-sm">
                  See correlations between your thoughts, focus, and emotional states
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}