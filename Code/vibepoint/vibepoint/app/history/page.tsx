'use client'

import { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodEntry } from '@/types'
import { format, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns'
import { GradientBackground } from '@/components/GradientBackground'
import { MiniMoodDisplay } from '@/components/MiniMoodDisplay'
import EditEntryModal from '@/components/EditEntryModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import { getMoodColor } from '@/components/dashboard/utils/dashboardUtils'

type FilterType = 'all' | 'week' | 'month'

function HistoryPageContent() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const router = useRouter()

  // Read filter from URL query parameter on mount
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'week' || filterParam === 'month' || filterParam === 'all') {
      setFilter(filterParam as FilterType)
    }
  }, [searchParams])

  useEffect(() => {
    checkAuthAndLoadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilter()
  }, [entries, filter])

  const checkAuthAndLoadEntries = async () => {
    try {
      // AUTH DISABLED FOR DEVELOPMENT - Try to get user but don't require it
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.warn('No user found - showing empty history for development')
        setUserId(null)
        setEntries([])
        setLoading(false)
        return
      }

      setUserId(user.id)
      await loadEntries(user.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Continue without user in development
      setUserId(null)
      setEntries([])
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

  // Toggle actions menu
  const toggleMenu = (entryId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setActiveMenu(activeMenu === entryId ? null : entryId)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu) {
        const menuElement = menuRefs.current[activeMenu]
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setActiveMenu(null)
        }
      }
    }

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeMenu])

  // Handle edit
  const handleEdit = (entry: MoodEntry, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setEditingEntry(entry)
    setActiveMenu(null)
  }

  // Save edited entry
  const handleSaveEdit = async (updatedData: Partial<MoodEntry>) => {
    if (!editingEntry || !userId) return

    const { error } = await supabase
      .from('mood_entries')
      .update(updatedData)
      .eq('id', editingEntry.id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message || 'Failed to update entry')
    }

    // Refresh entries
    await loadEntries(userId)
    setEditingEntry(null)
  }

  // Handle delete
  const handleDelete = (entryId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setDeletingEntryId(entryId)
    setActiveMenu(null)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingEntryId || !userId) return

    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', deletingEntryId)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry. Please try again.')
      return
    }

    // Refresh entries
    await loadEntries(userId)
    setDeletingEntryId(null)
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] md:max-w-[600px] lg:max-w-[720px] xl:max-w-[800px] flex-col px-5 py-6 md:px-6 lg:px-8 pb-24">
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
                  ? 'bg-gradient-to-r from-[#7c3aed] via-[#c026d3] to-[#f97316] text-white shadow-lg shadow-[#c026d3]/30'
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
                background: 'linear-gradient(45deg, #7c3aed 0%, #c026d3 50%, #f97316 100%)',
                boxShadow: '0 4px 20px rgba(192, 38, 211, 0.3)',
              }}
            >
              Log Your First Mood
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in-up overflow-visible" style={{ animationDelay: '0.4s' }}>
            {filteredEntries.map((entry, index) => {
              const isExpanded = expandedEntry === entry.id
              const happiness = Math.round(entry.happiness_level * 100)
              const motivation = Math.round(entry.motivation_level * 100)
              const moodColor = getMoodColor(entry.happiness_level, entry.motivation_level)

              return (
                <div
                  key={entry.id}
                  className={`rounded-[20px] lg:rounded-3xl bg-white/85 overflow-visible shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    isExpanded ? 'shadow-lg' : ''
                  }`}
                  style={{ 
                    animationDelay: `${0.4 + index * 0.05}s`,
                    border: `0.25px solid ${moodColor}`
                  }}
                >
                  <div
                    className="flex items-center gap-4 p-4 md:p-5 lg:p-6"
                  >
                    {/* Mini Mood Display - responsive sizing: 56px mobile, 64px tablet, 72px desktop */}
                    <div 
                      className="w-[56px] h-[56px] md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] flex-shrink-0 cursor-pointer"
                      onClick={() => toggleExpanded(entry.id)}
                    >
                      <MiniMoodDisplay
                        happiness={entry.happiness_level}
                        motivation={entry.motivation_level}
                      />
                    </div>

                    {/* Entry Info */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleExpanded(entry.id)}
                    >
                      <div className="mb-1 text-base md:text-lg font-semibold text-text-primary">
                        {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                      </div>
                      <div className="text-sm md:text-base text-text-secondary">
                        Happiness: <span className="font-semibold text-text-primary">{happiness}%</span> • Motivation:{' '}
                        <span className="font-semibold text-text-primary">{motivation}%</span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div 
                      className="entry-actions relative flex-shrink-0"
                      ref={(el) => {
                        menuRefs.current[entry.id] = el
                      }}
                    >
                      <button
                        className="actions-menu-btn flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-text-secondary transition-all hover:bg-black/5 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#c026d3]/20"
                        onClick={(e) => toggleMenu(entry.id, e)}
                        aria-label="Entry actions"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>

                      {/* Dropdown menu */}
                      {activeMenu === entry.id && (
                        <div 
                          className="actions-dropdown absolute right-0 min-w-[160px] rounded-xl border border-black/8 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] animate-dropdown-slide-in"
                          style={{ 
                            position: 'absolute',
                            top: '50%',
                            right: 0,
                            transform: 'translateY(-50%)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            marginRight: '0',
                            marginTop: '0'
                          }}
                        >
                          <button
                            className="action-item action-edit flex w-full items-center gap-2.5 bg-transparent border-none px-4 py-3 text-left text-sm text-[#7c3aed] transition-colors hover:bg-black/5"
                            onClick={(e) => handleEdit(entry, e)}
                            style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 flex-shrink-0"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <div className="border-t border-black/5" style={{ display: 'block', visibility: 'visible' }}></div>
                          <button
                            className="action-item action-delete flex w-full items-center gap-2.5 bg-transparent border-none px-4 py-3 text-left text-sm text-[#dc2626] transition-colors hover:bg-[rgba(220,38,38,0.08)]"
                            onClick={(e) => handleDelete(entry.id, e)}
                            style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 flex-shrink-0"
                            >
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Toggle Button */}
                    <button
                      className="flex items-center gap-1.5 rounded-lg bg-transparent p-2 text-sm text-text-secondary transition-all hover:bg-black/5 hover:text-text-primary flex-shrink-0"
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

        {/* Edit Modal */}
        {editingEntry && (
          <EditEntryModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSave={handleSaveEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingEntryId && (
          <DeleteConfirmModal
            entryDate={entries.find(e => e.id === deletingEntryId)?.timestamp || new Date().toISOString()}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingEntryId(null)}
          />
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center text-text-primary">
          <GradientBackground />
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c026d3] mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your history...</p>
          </div>
        </div>
      }
    >
      <HistoryPageContent />
    </Suspense>
  )
}
