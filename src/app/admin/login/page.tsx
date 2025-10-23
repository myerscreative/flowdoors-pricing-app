// src/app/admin/login/page.tsx
'use client'

import { sendReset } from '@/lib/auth/reset'
import { auth } from '@/lib/firebaseClient'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useRef, useState } from 'react'

type Mode = 'login' | 'reset'

type UiState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; code: string; message: string }
  | { kind: 'reset-sending' }
  | { kind: 'reset-sent' }
  | { kind: 'reset-error'; message: string }

function looksLikeEmail(v: string) {
  const s = v.trim()
  return s.length > 3 && s.includes('@') && s.includes('.')
}

export default function AdminLoginPage() {
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('login')
  const [ui, setUi] = useState<UiState>({ kind: 'idle' })

  const getEmail = () => (emailRef.current?.value ?? email).trim()
  const isBusy = ui.kind === 'submitting' || ui.kind === 'reset-sending'
  const router = useRouter()

  // --- LOGIN HANDLERS ---
  async function onSubmitLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const currEmail = getEmail()
    if (!looksLikeEmail(currEmail)) {
      setUi({
        kind: 'error',
        code: 'auth/invalid-email',
        message: 'Please enter a valid email address.',
      })
      return
    }
    if (!password) {
      setUi({
        kind: 'error',
        code: 'auth/missing-password',
        message: 'Please enter your password.',
      })
      return
    }

    setUi({ kind: 'submitting' })
    try {
      console.warn('🔐 LOGIN ATTEMPT - DEBUG INFO:')
      console.warn('  Email:', currEmail)
      console.warn('  Password length:', password.length)
      console.warn(
        '  Password first 3 chars:',
        password.substring(0, 3) + '***'
      )

      console.warn('🔍 Firebase Auth config:')
      console.warn('  Project ID:', auth.app.options.projectId)
      console.warn(
        '  API Key:',
        auth.app.options.apiKey?.substring(0, 8) + '...'
      )
      console.warn('  Auth Domain:', auth.app.options.authDomain)
      const cred = await signInWithEmailAndPassword(auth, currEmail, password)

      console.warn('✅ LOGIN SUCCESS - Firebase Auth response:')
      console.warn('  User UID:', cred.user.uid)
      console.warn('  Email verified:', cred.user.emailVerified)

      // Force refresh the token to get updated claims
      await cred.user.getIdToken(true)
      const token = await cred.user.getIdTokenResult()
      const role = token.claims.role as string | undefined

      console.warn('[login] Role claim:', role)

      // If the JWT has no role claim yet (e.g., Admin SDK not configured),
      // fall back to Firestore lookup and persist id for later role checks
      let nextRole = role
      if (!nextRole) {
        try {
          const { getSalespersonByEmail } = await import(
            '@/services/salesService'
          )
          const person = await getSalespersonByEmail(currEmail)
          if (person) {
            nextRole = person.role as string | undefined
            if (typeof window !== 'undefined' && person.id) {
              localStorage.setItem('salesRepId', person.id)
              localStorage.setItem('salesRepName', String(person.name || ''))
            }
          }
        } catch {
          // ignore; we will default to login page below
        }
      }

      // CRITICAL: Persist role in localStorage so useCurrentUserRole can detect it immediately after redirect
      if (nextRole && typeof window !== 'undefined') {
        localStorage.setItem('userRole', nextRole)
        console.warn('[login] Persisted role to localStorage:', nextRole)
      }

      if (
        nextRole === 'manager' ||
        nextRole === 'administrator' ||
        nextRole === 'admin'
      ) {
        router.push('/admin')
      } else if (nextRole === 'marketing') {
        router.push('/marketing')
      } else if (nextRole === 'salesperson') {
        router.push('/admin/sales')
      } else {
        setUi({
          kind: 'error',
          code: 'auth/missing-claims',
          message:
            'Your account is active but role claims are not set yet. Please contact an admin.',
        })
        return
      }

      setUi({ kind: 'idle' })
    } catch (err: unknown) {
      let code = 'auth/unknown-error'
      let message = 'Sign-in failed. Please check your email and password.'
      if (err && typeof err === 'object') {
        const fb = err as FirebaseError & { message?: string }
        if (fb.code) code = String(fb.code)
        if (fb.message) message = fb.message
      }

      console.warn('❌ LOGIN FAILED - DEBUG INFO:')
      console.warn('  Error code:', code)
      console.warn('  Error message:', message)
      console.warn('  Email used:', currEmail)
      console.warn('  Password length:', password.length)
      console.warn('  Full error object:', err)

      setUi({ kind: 'error', code, message })
    }
  }

  // --- RESET HANDLERS ---
  async function onSendReset(e?: FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault()
    const currEmail = getEmail()
    if (!looksLikeEmail(currEmail)) {
      setUi({
        kind: 'reset-error',
        message: 'Enter a valid email address to receive the reset link.',
      })
      console.warn(
        '[login] Reset send attempted with invalid email:',
        currEmail
      )
      return
    }
    setUi({ kind: 'reset-sending' })
    try {
      await sendReset(currEmail)
      setUi({ kind: 'reset-sent' })
      console.warn('[login] Reset email sent.')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not send reset email.'
      setUi({ kind: 'reset-error', message: msg })
      console.warn('[login] Reset email failed:', msg)
    }
  }

  // Switch to reset panel from “Forgot password?”
  function goToReset() {
    setMode('reset')
    setUi({ kind: 'idle' })
  }

  // Back to login
  function backToLogin() {
    setMode('login')
    setUi({ kind: 'idle' })
  }

  return (
    <main className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          FlowDoors — Admin {mode === 'login' ? 'Login' : 'Password Reset'}
        </h1>
        {mode === 'login' ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to continue. If you forgot your password, we can email you
              a reset link.
            </p>

            <form
              onSubmit={onSubmitLogin}
              className="mt-6 space-y-4"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={(e) => setEmail(e.currentTarget.value)} // capture autofill
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="flex items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={goToReset}
                    className="text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-white transition-opacity disabled:opacity-60"
              >
                {isBusy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {ui.kind === 'error' && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <div className="font-medium">Sign-in error</div>
                <div className="mt-1">{ui.message}</div>
                <div className="mt-1 text-xs text-red-700/80">
                  <code>{ui.code}</code>
                </div>
              </div>
            )}

            <p className="mt-6 text-xs text-gray-500">
              Having trouble? Ask your manager to resend your activation email.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Enter your email and we’ll send you a link to reset your password.
              The link returns you to
              <span className="font-semibold"> /activate-account</span>.
            </p>

            <form onSubmit={onSendReset} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition-opacity disabled:opacity-60"
                >
                  {ui.kind === 'reset-sending' ? 'Sending…' : 'Send reset link'}
                </button>
                <button
                  type="button"
                  onClick={backToLogin}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 hover:bg-gray-50"
                >
                  Back to sign in
                </button>
              </div>
            </form>

            {ui.kind === 'reset-sent' && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                Check your email for a link to reset your password.
              </div>
            )}
            {ui.kind === 'reset-error' && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {ui.message}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
// Trigger rebuild Fri Sep 12 11:58:58 PDT 2025
