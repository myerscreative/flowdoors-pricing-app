'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startOfWeek, isWithinInterval } from 'date-fns'

import { supabase, handleAuthError } from '@/lib/supabase'
import { MoodEntry, MoodStats } from '@/types'
import Logo from '@/components/Logo'
import { GradientBackground } from '@/components/GradientBackground'
import TrendChart from '@/components/dashboard/charts/TrendChart'
import { computeStreak } from '@/components/dashboard/utils/dashboardUtils'
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
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [showWelcomeCard, setShowWelcomeCard] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    // Check if welcome card should be shown (client-side only)
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('welcomeCardDismissed')
      if (stats && stats.total_entries === 0 && !dismissed) {
        setShowWelcomeCard(true)
      } else {
        setShowWelcomeCard(false)
      }
    }
  }, [stats])

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
      
      // Check if onboarding is complete (client-side only)
      if (typeof window !== 'undefined') {
        const onboardingCompleted = localStorage.getItem('onboardingCompleted')
        if (!onboardingCompleted) {
          router.push('/onboarding')
          return
        }
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

  // Show loading or redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
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

          {/* Welcome Learn Card - Only show if user has 0 entries and hasn't dismissed */}
          {showWelcomeCard && (
            <div id="welcomeLearnCard" className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div
                className="rounded-3xl border p-6 md:p-7 lg:p-8 text-center shadow-lg backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(192, 38, 211, 0.1) 100%)',
                  borderColor: 'rgba(56, 189, 248, 0.3)'
                }}
              >
                <div className="mb-3 text-5xl">🧠</div>
                <h3 className="mb-2 font-display text-xl md:text-2xl font-semibold text-text-primary">
                  Welcome to Vibepoint!
                </h3>
                <p className="mb-5 text-sm md:text-base text-text-secondary">
                  Want to understand how tracking your emotional patterns works?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => router.push('/learn')}
                    className="px-6 py-3 rounded-2xl font-semibold text-base text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(45deg, #7c3aed, #c026d3)'
                    }}
                  >
                    Read the Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('welcomeCardDismissed', 'true')
                        setShowWelcomeCard(false)
                      }
                    }}
                    className="px-6 py-3 rounded-2xl font-medium text-base text-text-secondary bg-white/50 border border-black/10 backdrop-blur-md transition-all hover:bg-white/70"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => router.push('/mood/new')}
            className="mb-6 w-full rounded-3xl px-8 py-5 lg:py-6 text-lg lg:text-xl font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up"
            style={{ 
              background: 'linear-gradient(45deg, #7c3aed 0%, #c026d3 50%, #f97316 100%)',
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
          <div className="mb-7 flex justify-center gap-3 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
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

            <button
              type="button"
              onClick={() => router.push('/learn')}
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
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                  fill="currentColor"
                />
              </svg>
              <span>How It Works</span>
            </button>
          </div>

          {/* Stats Grid - 4 Column Layout */}
          {stats && (
            <div className="stats-grid-four mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* Card 1: Current Streak */}
              <div className="stat-card rounded-[20px] border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl">
                <div className="stat-icon text-2xl md:text-3xl mb-2">🔥</div>
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-1" style={{
                  background: 'linear-gradient(45deg, #c026d3, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {computeStreak(entries)}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-primary mb-0.5">
                  {computeStreak(entries) === 1 ? 'day' : 'days'}
                </div>
                <div className="text-[0.65rem] md:text-[0.7rem] font-medium text-text-secondary">
                  Current Streak
                </div>
              </div>

              {/* Card 2: This Week */}
              <button
                type="button"
                onClick={() => router.push('/history?filter=week')}
                className="stat-card stat-card-clickable rounded-[20px] border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#c026d3]/30 focus:outline-none focus:ring-2 focus:ring-[#c026d3]/20 focus:ring-offset-2 relative overflow-hidden"
                aria-label="View entries from this week - Navigate to history"
              >
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-2 relative z-10" style={{
                  background: 'linear-gradient(45deg, #c026d3, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {stats.entries_this_week}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary relative z-10">
                  This Week
                </div>
                <div className="stat-card-hint absolute bottom-3 right-3 text-[#c026d3] opacity-0 transition-all duration-300 transform translate-x-[-5px] z-10">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              </button>

              {/* Card 3: Total */}
              <button
                type="button"
                onClick={() => router.push('/history')}
                className="stat-card stat-card-clickable rounded-[20px] border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#c026d3]/30 focus:outline-none focus:ring-2 focus:ring-[#c026d3]/20 focus:ring-offset-2 relative overflow-hidden"
                aria-label="View all entries - Navigate to history"
              >
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-2 relative z-10" style={{
                  background: 'linear-gradient(45deg, #c026d3, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {stats.total_entries}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary relative z-10">
                  Total
                </div>
                <div className="stat-card-hint absolute bottom-3 right-3 text-[#c026d3] opacity-0 transition-all duration-300 transform translate-x-[-5px] z-10">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              </button>

              {/* Card 4: Avg Happy */}
              <button
                type="button"
                onClick={() => router.push('/patterns')}
                className="stat-card stat-card-clickable rounded-[20px] border border-white/30 bg-white/85 p-4 md:p-5 lg:p-6 text-center shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#c026d3]/30 focus:outline-none focus:ring-2 focus:ring-[#c026d3]/20 focus:ring-offset-2 relative overflow-hidden"
                aria-label="View happiness patterns - Navigate to patterns page"
              >
                <div className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold mb-2 relative z-10" style={{
                  background: 'linear-gradient(45deg, #c026d3, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {Math.round(stats.average_happiness * 100)}%
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary relative z-10">
                  Avg Happy
                </div>
                <div className="stat-card-hint absolute bottom-3 right-3 text-[#c026d3] opacity-0 transition-all duration-300 transform translate-x-[-5px] z-10">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              </button>
            </div>
          )}

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
