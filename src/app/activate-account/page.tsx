'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { validatePasswordStrength } from '@/lib/authUtils'
import { AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ActivateAccountPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [redirectCountdown, setRedirectCountdown] = useState(5)

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    // Extract token and email from URL parameters
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')

    if (tokenParam) setToken(tokenParam)
    if (emailParam) setEmail(decodeURIComponent(emailParam))
  }, [searchParams])

  useEffect(() => {
    // Validate password strength in real-time
    if (password) {
      setPasswordStrength({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      })
    }
  }, [password])

  // Countdown effect for redirect
  useEffect(() => {
    if (success && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (success && redirectCountdown === 0) {
      router.push('/admin/login')
    }
  }, [success, redirectCountdown, router])

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!token) errors.push('Activation token is required')
    if (!email) errors.push('Email is required')
    if (!password) errors.push('Password is required')
    if (!confirmPassword) errors.push('Please confirm your password')

    if (password && confirmPassword && password !== confirmPassword) {
      errors.push('Passwords do not match')
    }

    if (password) {
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) {
        errors.push(
          validation.error || 'Password does not meet strength requirements'
        )
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      console.warn('🚀 ACTIVATION REQUEST - DEBUG INFO:')
      console.warn('  Token:', token.substring(0, 8) + '...')
      console.warn('  Email:', email)
      console.warn('  Password length:', password.length)
      console.warn(
        '  Password first 3 chars:',
        password.substring(0, 3) + '***'
      )

      const response = await fetch('/api/users/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast({
          title: 'Account Activated!',
          description:
            'Your account has been successfully activated. You can now sign in.',
        })
      } else {
        const errorMessage = data.error || 'Failed to activate account'
        setError(errorMessage)
        toast({
          title: 'Activation Failed',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Account activation error:', err)
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      toast({
        title: 'Network Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Account Activated!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your account has been successfully activated! You can now log in
              with your email and password.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/admin/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              You will be automatically redirected to the sign-in page in{' '}
              {redirectCountdown} seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Activate Your Account</CardTitle>
          <p className="text-gray-600">
            Set your password to complete account activation
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Display */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600">
                    Password strength:
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {passwordStrength.length ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      At least 8 characters
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {passwordStrength.uppercase ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      One uppercase letter
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {passwordStrength.lowercase ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      One lowercase letter
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {passwordStrength.number ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      One number
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordStrength.special ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {passwordStrength.special ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Activating Account...'
                : 'Activate Account & Set Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Contact support at{' '}
              <a
                href="mailto:support@flowdoors.com"
                className="text-blue-600 hover:underline"
              >
                support@flowdoors.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
