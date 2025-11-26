'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodEntry } from '@/types'
import { format, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns'
import MiniGradientPreview from '@/components/MiniGradientPreview'

type FilterType = 'all' | 'week' | 'month'

export default function HistoryPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadEntries()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [entries, filter])

  const checkAuthAndLoadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      await loadEntries(user.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Failed to load entries:', error)
    }
  }

  const applyFilter = () => {
    const now = new Date()
    let filtered: MoodEntry[] = []

    switch (filter) {
      case 'week':
        const weekStart = startOfWeek(now)
        filtered = entries.filter(entry =>
          isWithinInterval(new Date(entry.timestamp), { start: weekStart, end: now })
        )
        break
      case 'month':
        const monthStart = startOfMonth(now)
        filtered = entries.filter(entry =>
          isWithinInterval(new Date(entry.timestamp), { start: monthStart, end: now })
        )
        break
      default:
        filtered = entries
    }

    setFilteredEntries(filtered)
  }

  const toggleExpanded = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId)
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b pt-2.5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/home" className="text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Mood History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all' as FilterType, label: 'All Entries' },
              { key: 'week' as FilterType, label: 'This Week' },
              { key: 'month' as FilterType, label: 'This Month' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No mood entries yet' : `No entries ${filter === 'week' ? 'this week' : 'this month'}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start tracking your moods to see your history here.'
                : 'Try changing the filter to see more entries.'
              }
            </p>
            <Link
              href="/mood"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Log Your First Mood
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(entry.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Mini gradient preview square with dot showing mood position */}
                      <MiniGradientPreview
                        happiness={entry.happiness_level}
                        motivation={entry.motivation_level}
                        size={48}
                      />

                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Happiness: {Math.round(entry.happiness_level * 100)}% •
                          Motivation: {Math.round(entry.motivation_level * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {expandedEntry === entry.id ? 'Hide' : 'Show'} details
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          expandedEntry === entry.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedEntry === entry.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">What I was focusing on:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{entry.focus}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">What I was telling myself:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{entry.self_talk}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Physical sensations:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{entry.physical_sensations}</p>
                      </div>

                      {entry.emotion_name && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Emotion/Mood Name:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{entry.emotion_name}</p>
                        </div>
                      )}

                      {entry.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
