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
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [])

  const checkAuthAndLoadStats = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
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
      const { data: entriesData, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) throw error

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
      <header className="bg-white shadow-sm border-b pt-2.5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo variant="full" href="/home" size="md" />
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
        </div>
      </main>
    </div>
  )
}
