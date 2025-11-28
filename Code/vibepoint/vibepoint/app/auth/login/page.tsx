'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, handleAuthError } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()
  const passwordRef = useRef<HTMLInputElement>(null)

  // Force dark text on password field after render
  useEffect(() => {
    const forceDarkText = (input: HTMLInputElement | null) => {
      if (input) {
        input.style.color = '#111827'
        input.style.webkitTextFillColor = '#111827'
        input.style.caretColor = '#111827'
      }
    }
    
    forceDarkText(passwordRef.current)
    
    // Also set on any autofill
    const observer = new MutationObserver(() => {
      forceDarkText(passwordRef.current)
    })
    
    if (passwordRef.current) {
      observer.observe(passwordRef.current, { attributes: true, attributeFilter: ['style', 'class'] })
    }
    
    return () => observer.disconnect()
  }, [])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrors({} as { email?: string; password?: string })

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(handleAuthError(error))
        setLoading(false)
        return
      }

      if (!data.session) {
        console.error('No session returned after login')
        setError('Login failed: No session created. Please try again.')
        setLoading(false)
        return
      }

      // Refresh the session to ensure it's properly set
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        console.error('Session not found after getSession')
        setError('Login failed: Session not established. Please try again.')
        setLoading(false)
        return
      }

      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if onboarding is complete
      const onboardingCompleted = localStorage.getItem('onboardingCompleted')
      if (!onboardingCompleted) {
        router.push('/onboarding')
      } else {
        router.push('/home')
      }
      router.refresh() // Refresh the router to update auth state
    } catch (err: any) {
      console.error('Login exception:', err)
      setError(handleAuthError(err))
      setLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setLoading(true)
    setError('')
    setErrors({} as { email?: string; password?: string })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'dev@vibepoint.local',
        password: 'dev123456',
      })

      if (error) {
        console.error('Dev login error:', error)
        setError(handleAuthError(error))
      } else {
        // Refresh the session to ensure it's properly set
        await supabase.auth.getSession()
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if onboarding is complete
        const onboardingCompleted = localStorage.getItem('onboardingCompleted')
        if (!onboardingCompleted) {
          router.push('/onboarding')
        } else {
          router.push('/home')
        }
        router.refresh()
      }
    } catch (err: any) {
      console.error('Dev login exception:', err)
      setError(handleAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const forceDarkText = (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (e.target) {
      e.target.style.color = '#111827'
      e.target.style.webkitTextFillColor = '#111827'
      e.target.style.caretColor = '#111827'
    }
  }

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main container */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo-wrapper">
              <Logo variant="full" size="md" />
            </div>
            <h2 className="auth-title">Sign in to VibePoint</h2>
            <p className="auth-subtitle">Track your mood and discover your patterns</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-message auth-message-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleLogin}>
            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined })
                  }
                }}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                required
                className={`form-input password-input-dark ${errors.password ? 'form-input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  forceDarkText(e)
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined })
                  }
                }}
                onFocus={forceDarkText}
                onBlur={forceDarkText}
                style={{ color: '#111827', WebkitTextFillColor: '#111827', caretColor: '#111827' }}
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`auth-button ${loading ? 'auth-button-loading' : ''}`}
            >
              {loading ? '' : 'Sign in'}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="auth-link">Sign up</Link>
            </p>
          </div>

          {/* Dev Sign-In Section */}
          {process.env.NODE_ENV === 'development' && (
            <div className="dev-signin-section">
              <button
                onClick={handleDevLogin}
                disabled={loading}
                className="dev-signin-btn"
                type="button"
              >
                {loading ? '' : '🚀 Dev Sign-In (dev@vibepoint.local)'}
              </button>
              <p className="dev-only-label">Development only</p>
            </div>
          )}
        </div>

        {/* Back to home link */}
        <Link href="/" className="back-home-link">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
