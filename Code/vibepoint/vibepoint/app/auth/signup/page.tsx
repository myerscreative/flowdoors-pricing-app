'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, handleAuthError } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError(handleAuthError(authError))
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setError('Please check your email to confirm your account before signing in.')
        setLoading(false)
        return
      }

      // User is signed in (no email confirmation required or already confirmed)
      if (data.session) {
        await supabase.auth.getSession()
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/onboarding')
      } else {
        setError('Account created, but unable to sign in. Please check your email for confirmation.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(handleAuthError(err))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a8edea] via-[#fed6e3] via-[#fff9e6] to-[#ffd8cc] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Get Started
          </h1>
          <p className="text-gray-700">
            Create your account to begin understanding your moods
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/25 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl
                         bg-white/50 backdrop-blur-sm
                         border border-white/60
                         text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent
                         transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl
                         bg-white/50 backdrop-blur-sm
                         border border-white/60
                         text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent
                         transition-all duration-200"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-600 mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl
                         bg-white/50 backdrop-blur-sm
                         border border-white/60
                         text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent
                         transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100/80 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-semibold text-gray-800 text-lg
                       bg-white/40 backdrop-blur-md
                       border border-white/50
                       shadow-lg hover:shadow-xl
                       hover:bg-white/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300
                       transform hover:scale-[1.02]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/30 backdrop-blur-sm text-gray-700 rounded-full">
                or
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-700">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="w-full mt-6 py-3 text-gray-700 hover:text-gray-800 font-medium transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  )
}
