'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodEntry } from '@/types'
import { format, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns'
import { GradientBackground } from '@/components/GradientBackground'
import { MiniMoodDisplay } from '@/components/MiniMoodDisplay'

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

  // Calculate stats from filtered entries
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        total: 0,
        avgHappiness: 0,
        avgMotivation: 0,
      }
    }

    const avgHappiness =
      filteredEntries.reduce((sum, e) => sum + e.happiness_level, 0) / filteredEntries.length
    const avgMotivation =
      filteredEntries.reduce((sum, e) => sum + e.motivation_level, 0) / filteredEntries.length

    return {
      total: filteredEntries.length,
      avgHappiness: Math.round(avgHappiness * 100),
      avgMotivation: Math.round(avgMotivation * 100),
    }
  }, [filteredEntries])

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center text-text-primary">
        <GradientBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c026d3] mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen text-text-primary">
      <GradientBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] md:max-w-[600px] lg:max-w-[720px] xl:max-w-[800px] flex-col px-5 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Link
            href="/home"
            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/85 px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm backdrop-blur-lg transition-all hover:bg-white/95 hover:-translate-x-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Home
          </Link>
          <h1 className="font-display text-2xl md:text-[2rem] lg:text-[2.2rem] font-semibold text-text-primary">
            Mood History
          </h1>
        </header>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { key: 'all' as FilterType, label: 'All Entries' },
            { key: 'week' as FilterType, label: 'This Week' },
            { key: 'month' as FilterType, label: 'This Month' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium transition-all ${
                filter === key
                  ? 'bg-gradient-to-r from-[#f97316] via-[#c026d3] to-[#7c3aed] text-white shadow-lg shadow-[#c026d3]/30'
                  : 'bg-white/85 border border-white/30 text-text-secondary backdrop-blur-md hover:bg-white/95 hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="rounded-2xl border border-white/30 bg-white/85 p-3.5 md:p-4 text-center shadow-sm backdrop-blur-xl">
            <div className="font-display text-xl md:text-2xl font-semibold text-text-primary">
              {stats.total}
            </div>
            <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-text-secondary">
              Entries
            </div>
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/85 p-3.5 md:p-4 text-center shadow-sm backdrop-blur-xl">
            <div className="font-display text-xl md:text-2xl font-semibold text-text-primary">
              {stats.avgHappiness}%
            </div>
            <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-text-secondary">
              Avg Happy
            </div>
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/85 p-3.5 md:p-4 text-center shadow-sm backdrop-blur-xl">
            <div className="font-display text-xl md:text-2xl font-semibold text-text-primary">
              {stats.avgMotivation}%
            </div>
            <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-text-secondary">
              Avg Motivated
            </div>
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-4 text-5xl">📝</div>
            <h2 className="mb-2 font-display text-xl md:text-2xl font-semibold text-text-primary">
              {filter === 'all' ? 'No mood entries yet' : `No entries ${filter === 'week' ? 'this week' : 'this month'}`}
            </h2>
            <p className="mb-6 text-sm md:text-base text-text-secondary">
              {filter === 'all'
                ? 'Start tracking your mood to see your history here.'
                : 'Try changing the filter to see more entries.'
              }
            </p>
            <Link
              href="/mood/new"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%)',
                boxShadow: '0 4px 20px rgba(192, 38, 211, 0.3)',
              }}
            >
              Log Your First Mood
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {filteredEntries.map((entry, index) => {
              const isExpanded = expandedEntry === entry.id
              const happiness = Math.round(entry.happiness_level * 100)
              const motivation = Math.round(entry.motivation_level * 100)

              return (
                <div
                  key={entry.id}
                  className={`rounded-[20px] lg:rounded-3xl border border-white/30 bg-white/85 overflow-hidden shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    isExpanded ? 'shadow-lg' : ''
                  }`}
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                >
                  <div
                    className="flex items-center gap-4 p-4 md:p-5 lg:p-6 cursor-pointer"
                    onClick={() => toggleExpanded(entry.id)}
                  >
                    {/* Mini Mood Display - responsive sizing: 56px mobile, 64px tablet, 72px desktop */}
                    <div className="w-[56px] h-[56px] md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] flex-shrink-0">
                      <MiniMoodDisplay
                        happiness={entry.happiness_level}
                        motivation={entry.motivation_level}
                      />
                    </div>

                    {/* Entry Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 text-base md:text-lg font-semibold text-text-primary">
                        {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                      </div>
                      <div className="text-sm md:text-base text-text-secondary">
                        Happiness: <span className="font-semibold text-text-primary">{happiness}%</span> • Motivation:{' '}
                        <span className="font-semibold text-text-primary">{motivation}%</span>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      className="flex items-center gap-1.5 rounded-lg bg-transparent p-2 text-sm text-text-secondary transition-all hover:bg-black/5 hover:text-text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpanded(entry.id)
                      }}
                    >
                      <span>Details</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4.5 w-4.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-[400px]' : 'max-h-0'
                    }`}
                  >
                    <div className="border-t border-black/5 bg-black/5 p-4 md:p-5 lg:p-6 space-y-3.5">
                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          What were you focusing on?
                        </div>
                        <div className="text-sm md:text-base leading-relaxed text-text-primary">
                          {entry.focus}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          What were you telling yourself?
                        </div>
                        <div className="text-sm md:text-base leading-relaxed text-text-primary">
                          {entry.self_talk}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          Physical sensations
                        </div>
                        <div className="text-sm md:text-base leading-relaxed text-text-primary">
                          {entry.physical_sensations}
                        </div>
                      </div>

                      {entry.emotion_name && (
                        <div>
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Emotion
                          </div>
                          <div className="text-sm md:text-base leading-relaxed text-text-primary capitalize">
                            {entry.emotion_name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
