'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { startOfWeek, isWithinInterval } from 'date-fns'

import { supabase, handleAuthError } from '@/lib/supabase'
import { MoodEntry, MoodStats } from '@/types'
import Logo from '@/components/Logo'
import { GradientBackground } from '@/components/GradientBackground'
import StreakCard from '@/components/dashboard/streak/StreakCard'
import TrendChart from '@/components/dashboard/charts/TrendChart'
import MoodSnapshot from '@/components/dashboard/snapshot/MoodSnapshot'
import InsightCard from '@/components/dashboard/insights/InsightCard'
import UnlockMessage from '@/components/dashboard/unlock/UnlockMessage'
import { UpgradeModal } from '@/components/UpgradeModal'
import { ProUpgradeCard } from '@/components/dashboard/pro/ProUpgradeCard'

export default function HomePage() {
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [])

  const checkAuthAndLoadStats = async () => {
    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser()
      if (error || !currentUser) {
        setUser(null)
        return
      }
      setUser(currentUser)
      await loadStats(currentUser.id)
    } catch (error) {
      console.error('Auth check failed:', handleAuthError(error))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setLoginError(handleAuthError(error))
      } else {
        // Refresh the session to ensure it's properly set
        await supabase.auth.getSession()
        await new Promise(resolve => setTimeout(resolve, 100))
        // Reload the page data
        await checkAuthAndLoadStats()
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login exception:', err)
      setLoginError(handleAuthError(err))
    } finally {
      setLoginLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setLoginLoading(true)
    setLoginError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'dev@vibepoint.local',
        password: 'dev123456',
      })

      if (error) {
        console.error('Dev login error:', error)
        setLoginError(handleAuthError(error))
      } else {
        await supabase.auth.getSession()
        await new Promise(resolve => setTimeout(resolve, 100))
        await checkAuthAndLoadStats()
        router.refresh()
      }
    } catch (err: any) {
      console.error('Dev login exception:', err)
      setLoginError(handleAuthError(err))
    } finally {
      setLoginLoading(false)
    }
  }

  const loadStats = async (userId: string) => {
    try {
      const { data: entriesData, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      setEntries(entriesData || [])

      const totalEntries = entriesData?.length || 0
      const weekStart = startOfWeek(new Date())
      const entriesThisWeek =
        entriesData?.filter(entry =>
          isWithinInterval(new Date(entry.timestamp), {
            start: weekStart,
            end: new Date(),
          })
        ).length || 0

      const avgHappiness = entriesData?.length
        ? entriesData.reduce((s, e) => s + e.happiness_level, 0) /
          entriesData.length
        : 0

      const avgMotivation = entriesData?.length
        ? entriesData.reduce((s, e) => s + e.motivation_level, 0) /
          entriesData.length
        : 0

      // Most common focus
      const focusCounts: Record<string, number> = {}
      entriesData?.forEach(entry => {
        const f = entry.focus.toLowerCase().trim()
        focusCounts[f] = (focusCounts[f] || 0) + 1
      })

      const mostCommonFocus =
        Object.entries(focusCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        'No entries yet'

      setStats({
        total_entries: totalEntries,
        entries_this_week: entriesThisWeek,
        average_happiness: avgHappiness,
        average_motivation: avgMotivation,
        most_common_focus: mostCommonFocus,
        patterns_unlocked: totalEntries >= 10,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b pt-2.5">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <div className="flex-shrink-0">
              <Logo variant="full" href="/home" size="md" />
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Sign in to VibePoint
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Track your mood and discover your patterns
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {loginError && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-medium"
              >
                {loginLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center">
                <Link
                  href="/auth/signup"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Don&apos;t have an account? Sign up
                </Link>
              </div>
            </form>

            {/* Dev Sign-In Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDevLogin}
                  disabled={loginLoading}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 text-sm font-medium"
                >
                  {loginLoading ? 'Signing in...' : '🚀 Dev Sign-In (dev@vibepoint.local)'}
                </button>
                <p className="mt-2 text-xs text-center text-gray-500">
                  Development only
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // TODO: integrate real Pro status from server when available
  const isProUser = false

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '')

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  const greeting = name
    ? `Good ${timeOfDay}, ${name}`
    : `Good ${timeOfDay}`

  return (
    <div className="relative min-h-screen text-text-primary">
      <GradientBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] md:max-w-[600px] lg:max-w-[720px] xl:max-w-[800px] flex-col px-5 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between pt-1">
          <Logo variant="full" href="/home" size="md" />
          <button
            onClick={handleLogout}
            className="rounded-full border border-black/8 bg-white/70 px-4 py-1.5 text-sm font-medium text-text-secondary shadow-sm backdrop-blur-lg transition hover:bg-white/90 hover:text-text-primary"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 pb-10">
          {/* Welcome Section */}
          <section className="mb-8 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-display text-2xl md:text-[2.2rem] lg:text-[2.5rem] font-semibold text-text-primary mb-2">
              {greeting}{' '}
              <span className="inline-block align-middle animate-wave">👋</span>
            </h1>
            <p className="text-base text-text-secondary">
              Your emotions are messengers. Let&apos;s listen.
            </p>
          </section>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => router.push('/mood/new')}
            className="mb-6 w-full rounded-3xl px-8 py-5 lg:py-6 text-lg lg:text-xl font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up"
            style={{ 
              background: 'linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%)',
              boxShadow: '0 8px 30px rgba(192, 38, 211, 0.3)',
              animationDelay: '0.2s'
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  aria-hidden="true"
                  fill="white"
                >
                  <path
                    d="M12 4v16M4 12h16"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Log Your Mood
            </span>
          </button>

          {/* Quick Nav Row */}
          <div className="mb-7 flex justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <button
              type="button"
              onClick={() =>
                isProUser ? router.push('/recipes') : setIsUpgradeOpen(true)
              }
              className={`flex items-center gap-2 rounded-full border px-5 py-3 lg:px-6 lg:py-3.5 text-sm lg:text-base font-medium text-text-primary shadow-md backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg ${
                !isProUser 
                  ? 'bg-gradient-to-b from-white to-[#fff5f8] border-pro-primary/20' 
                  : 'bg-white/90 border-white/50'
              }`}
            >
              {!isProUser && (
                <svg
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  className="text-pro-primary"
                  aria-hidden="true"
                >
                  <path
                    d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3-9H9V6a3 3 0 0 1 6 0z"
                    fill="currentColor"
                  />
                </svg>
              )}
              <span className={!isProUser ? 'bg-gradient-to-r from-pro-primary to-pro-secondary bg-clip-text text-transparent font-semibold' : ''}>
                My Recipes
              </span>
              {!isProUser && (
                <span className="rounded-full bg-gradient-to-r from-pro-primary to-pro-secondary px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-md">
                  Pro
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/history')}
              className="flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-3 lg:px-6 lg:py-3.5 text-sm lg:text-base font-medium text-text-primary shadow-md backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg
                viewBox="0 0 24 24"
                width={18}
                height={18}
                aria-hidden="true"
                className="text-text-secondary"
              >
                <path
                  d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3z"
                  fill="currentColor"
                />
              </svg>
              <span>View History</span>
            </button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="mb-6 grid grid-cols-3 gap-3 md:gap-4 lg:gap-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="rounded-3xl border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-2" style={{
                  background: 'linear-gradient(135deg, #f97316, #c026d3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {stats.entries_this_week}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  This Week
                </div>
              </div>
              <div className="rounded-3xl border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-2" style={{
                  background: 'linear-gradient(135deg, #f97316, #c026d3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {stats.total_entries}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Total
                </div>
              </div>
              <div className="rounded-3xl border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-2" style={{
                  background: 'linear-gradient(135deg, #f97316, #c026d3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {Math.round(stats.average_happiness * 100)}%
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Avg Happy
                </div>
              </div>
            </div>
          )}

          {/* Streak Card */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <StreakCard entries={entries} />
          </div>

          {/* 7-Day Trend */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <TrendChart entries={entries} />
          </div>

          {/* Latest Mood Snapshot */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <MoodSnapshot entries={entries} />
          </div>

          {/* Quick Insight */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <InsightCard entries={entries} />
          </div>

          {/* PRO Upgrade Card (for free users) */}
          {!isProUser && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.75s' }}>
              <ProUpgradeCard onUpgrade={() => setIsUpgradeOpen(true)} />
            </div>
          )}

          {/* Unlock Patterns / Pro messaging */}
          {stats && stats.total_entries < 10 && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <UnlockMessage totalEntries={stats.total_entries} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-10 grid grid-cols-2 gap-3 md:gap-4 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <button
              type="button"
              onClick={() => router.push('/patterns')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/85 px-4 py-3.5 md:py-4 text-sm md:text-base font-medium text-text-primary shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[#c026d3]/30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 md:h-5 md:w-5"
                aria-hidden="true"
                style={{ fill: '#c026d3' }}
              >
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                  fill="currentColor"
                />
              </svg>
              <span>Patterns</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/entries')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/85 px-4 py-3.5 md:py-4 text-sm md:text-base font-medium text-text-primary shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[#c026d3]/30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 md:h-5 md:w-5"
                aria-hidden="true"
                style={{ fill: '#c026d3' }}
              >
                <path
                  d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"
                  fill="currentColor"
                />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </main>
      </div>

      {/* Upgrade modal for free users */}
      <UpgradeModal
        isOpen={!isProUser && isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </div>
  )
}
