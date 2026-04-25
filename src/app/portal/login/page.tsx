'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/firebaseClient'
import { FirebaseError } from 'firebase/app'
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

type Mode = 'login' | 'reset'

export default function PortalLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmitLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    setBusy(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await cred.user.getIdToken(true)
      router.push('/portal')
    } catch (err) {
      const msg =
        err instanceof FirebaseError
          ? err.message
          : 'Sign-in failed. Check your email and password.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const onSendReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email.includes('@')) {
      setError('Enter your email to receive a reset link.')
      return
    }
    setBusy(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess('Check your email for a reset link.')
    } catch (err) {
      const msg =
        err instanceof FirebaseError ? err.message : 'Could not send reset.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">
          FlowDoors
          <span className="ml-2 text-sm font-normal uppercase tracking-wider text-muted-foreground">
            Customer Portal
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'login'
            ? 'Sign in to view your order.'
            : 'We\u2019ll email you a link to reset your password.'}
        </p>

        {mode === 'login' ? (
          <form onSubmit={onSubmitLogin} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="portal-email">Email</Label>
              <Input
                id="portal-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="portal-password">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset')
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="portal-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form onSubmit={onSendReset} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={busy}>
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccess(null)
                }}
              >
                Back
              </Button>
            </div>
          </form>
        )}

        {error ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        ) : null}

        <p className="mt-6 text-xs text-muted-foreground">
          Trouble signing in? Ask your FlowDoors sales rep to resend your
          invitation.
        </p>
      </div>
    </main>
  )
}
