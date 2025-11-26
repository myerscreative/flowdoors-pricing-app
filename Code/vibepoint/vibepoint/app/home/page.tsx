'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, handleAuthError } from '@/lib/supabase'
import { MoodEntry, MoodStats } from '@/types'
import { startOfWeek, isWithinInterval } from 'date-fns'
import Logo from '@/components/Logo'

// === NEW COMPONENT IMPORTS ===
import StreakCard from '@/components/dashboard/streak/StreakCard'
import TrendChart from '@/components/dashboard/charts/TrendChart'
import EmotionPatternCard from '@/components/dashboard/emotions/EmotionPatternCard'
import MoodSnapshot from '@/components/dashboard/snapshot/MoodSnapshot'
import InsightCard from '@/components/dashboard/insights/InsightCard'
import RecentEntries from '@/components/dashboard/entries/RecentEntries'
import Encouragement from '@/components/dashboard/encouragement/Encouragement'
import UnlockMessage from '@/components/dashboard/unlock/UnlockMessage'

export default function HomePage() {
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b pt-2.5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex-shrink-0">
            <Logo variant="full" href="/home" size="md" />
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Track your mood and discover what creates your emotional patterns.
          </p>
        </div>

        {/* =======================
            EXISTING STATS CARDS
        ======================== */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm font-medium text-gray-600">
                Entries This Week
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.entries_this_week}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_entries}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm font-medium text-gray-600">Avg Happiness</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(stats.average_happiness * 100)}%
              </p>
            </div>
          </div>
        )}

        {/* =======================
            NEW COMPONENTS SECTION
        ======================== */}
        <div className="space-y-10">
          <StreakCard entries={entries} />

          <TrendChart entries={entries} />

          <EmotionPatternCard entries={entries} />

          <MoodSnapshot entries={entries} />

          <InsightCard entries={entries} />

          <RecentEntries entries={entries} />

          {/* Encouragement optionally always on */}
          <Encouragement enabled={true} />

          <UnlockMessage totalEntries={stats?.total_entries || 0} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/mood"
            className="bg-indigo-600 text-white rounded-lg p-6 hover:bg-indigo-700"
          >
            Log New Mood
          </Link>

          <Link
            href="/history"
            className="bg-white text-gray-900 rounded-lg p-6 border border-gray-200 hover:border-gray-300"
          >
            View History
          </Link>

          <Link
            href="/recipes"
            className="bg-linear-to-r from-pink-600 to-orange-600 text-white rounded-lg p-6 hover:from-pink-700 hover:to-orange-700 flex items-center justify-center space-x-2"
          >
            <span>My Recipes</span>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">PRO</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
