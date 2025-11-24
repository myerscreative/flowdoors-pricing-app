'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, handleAuthError } from '@/lib/supabase'
import { MoodStats } from '@/types'
import { startOfWeek, isWithinInterval } from 'date-fns'

export default function HomePage() {
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [])

  const checkAuthAndLoadStats = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('Auth check failed:', handleAuthError(error))
        router.push('/auth/login')
        return
      }

      await loadStats(user.id)
    } catch (error) {
      console.error('Auth check failed:', handleAuthError(error))
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (userId: string) => {
    try {
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) throw error

      const totalEntries = entries?.length || 0
      const weekStart = startOfWeek(new Date())

      const entriesThisWeek = entries?.filter(entry =>
        isWithinInterval(new Date(entry.timestamp), {
          start: weekStart,
          end: new Date()
        })
      ).length || 0

      const avgHappiness = entries?.length
        ? entries.reduce((sum, entry) => sum + entry.happiness_level, 0) / entries.length
        : 0

      const avgMotivation = entries?.length
        ? entries.reduce((sum, entry) => sum + entry.motivation_level, 0) / entries.length
        : 0

      // Find most common focus area
      const focusCounts: Record<string, number> = {}
      entries?.forEach(entry => {
        const focus = entry.focus.toLowerCase().trim()
        focusCounts[focus] = (focusCounts[focus] || 0) + 1
      })

      const mostCommonFocus = Object.entries(focusCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No entries yet'

      // Placeholder: future labeled feelings will go here once schema updated
      // const mostCommonFeelingLabel = ...

      setStats({
        total_entries: totalEntries,
        entries_this_week: entriesThisWeek,
        average_happiness: avgHappiness,
        average_motivation: avgMotivation,
        most_common_focus: mostCommonFocus,
        patterns_unlocked: totalEntries >= 10
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vibepoint</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Track your mood and discover what creates your emotional patterns.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entries This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.entries_this_week}</p>
                </div>
                <div className="text-indigo-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_entries}</p>
                </div>
                <div className="text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Happiness</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.average_happiness ? Math.round(stats.average_happiness * 100) : 0}%
                  </p>
                </div>
                <div className="text-yellow-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/mood"
            className="bg-indigo-600 text-white rounded-lg p-6 hover:bg-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Log New Mood</h3>
                <p className="text-indigo-100 text-sm">
                  Tap the gradient, answer 3 questions, and (optionally) name your feeling
                </p>
              </div>
              <div className="text-2xl">🎨</div>
            </div>
          </Link>

          <Link
            href="/history"
            className="bg-white text-gray-900 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">View History</h3>
                <p className="text-gray-600 text-sm">
                  See all your mood entries
                </p>
              </div>
              <div className="text-2xl">📚</div>
            </div>
          </Link>
        </div>

        {/* Patterns Section */}
        {stats && stats.patterns_unlocked && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Patterns Unlocked! 🎉</h3>
                <p className="text-purple-100 text-sm mb-4">
                  With {stats.total_entries} entries, you now have enough data to see your patterns.
                </p>
                <Link
                  href="/patterns"
                  className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  View Patterns
                </Link>
              </div>
              <div className="text-4xl">🧠</div>
            </div>
          </div>
        )}

        {/* Most Common Focus */}
        {stats && stats.total_entries > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Most Common Focus
            </h3>
            <p className="text-gray-600">&ldquo;{stats.most_common_focus}&rdquo;</p>
            <p className="text-sm text-gray-500 mt-2">
              This appears most frequently in your mood entries.
            </p>

            {/* Placeholder for future feeling label */}
            {/* <p className="text-sm text-gray-500 mt-2">
              Your most common named feeling: "{stats.most_common_feeling_label}"
            </p> */}
          </div>
        )}
      </main>
    </div>
  )
}
