'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, handleAuthError } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})
  const router = useRouter()
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  // Force dark text on password fields after render
  useEffect(() => {
    const forceDarkText = (input: HTMLInputElement | null) => {
      if (input) {
        input.style.color = '#111827'
        input.style.webkitTextFillColor = '#111827'
        input.style.caretColor = '#111827'
      }
    }
    
    forceDarkText(passwordRef.current)
    forceDarkText(confirmPasswordRef.current)
    
    // Also set on any autofill
    const observer = new MutationObserver(() => {
      forceDarkText(passwordRef.current)
      forceDarkText(confirmPasswordRef.current)
    })
    
    if (passwordRef.current) {
      observer.observe(passwordRef.current, { attributes: true, attributeFilter: ['style', 'class'] })
    }
    if (confirmPasswordRef.current) {
      observer.observe(confirmPasswordRef.current, { attributes: true, attributeFilter: ['style', 'class'] })
    }
    
    return () => observer.disconnect()
  }, [])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Signup error:', error)
        setError(handleAuthError(error))
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setError('Please check your email to confirm your account before signing in.')
        setLoading(false)
        return
      }

      // User is signed in (no email confirmation required or already confirmed)
      if (data.session) {
        // Refresh the session to ensure it's properly set
        await supabase.auth.getSession()
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/onboarding')
      } else {
        setError('Account created, but unable to sign in. Please check your email for confirmation.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Signup exception:', err)
      setError(handleAuthError(err))
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
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start tracking your moods today</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-message auth-message-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSignup}>
            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
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

            {/* Confirm Password field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                ref={confirmPasswordRef}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`form-input password-input-dark ${errors.confirmPassword ? 'form-input-error' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  forceDarkText(e)
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined })
                  }
                }}
                onFocus={forceDarkText}
                onBlur={forceDarkText}
                style={{ color: '#111827', WebkitTextFillColor: '#111827', caretColor: '#111827' }}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`auth-button ${loading ? 'auth-button-loading' : ''}`}
            >
              {loading ? '' : 'Sign Up'}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className="auth-link">Log in</Link>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <Link href="/" className="back-home-link">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
