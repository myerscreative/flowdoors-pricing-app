'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodEntry, Pattern, PatternInsight } from '@/types'
import { analyzePatterns, generateInsights } from '@/lib/pattern-analysis'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function PatternsPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'map' | 'insights' | 'focus' | 'self-talk' | 'physical'>('map')
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      await loadData(user.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (userId: string) => {
    try {
      // Load entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (entriesError) throw entriesError
      const moodEntries = entriesData || []
      setEntries(moodEntries)

      if (moodEntries.length >= 10) {
        // Analyze patterns
        const analyzedPatterns = analyzePatterns(moodEntries)
        setPatterns(analyzedPatterns)

        // Generate algorithmic insights first
        const algorithmicInsights = generateInsights(moodEntries, analyzedPatterns)
        
        // Try to enhance with AI insights (will fall back to algorithmic if AI unavailable)
        try {
          const { getCombinedInsights } = await import('@/lib/ai-insights')
          const combinedInsights = await getCombinedInsights(
            moodEntries,
            analyzedPatterns,
            algorithmicInsights
          )
          setInsights(combinedInsights)
        } catch (error) {
          console.error('Failed to load AI insights, using algorithmic:', error)
          setInsights(algorithmicInsights)
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const getMoodData = () => {
    return entries.map(entry => ({
      x: entry.motivation_level * 100,
      y: entry.happiness_level * 100,
      timestamp: entry.timestamp,
      focus: entry.focus.substring(0, 50) + (entry.focus.length > 50 ? '...' : '')
    }))
  }

  const getTopPatterns = (type: 'focus' | 'self_talk' | 'physical') => {
    return patterns
      .filter(p => p.pattern_type === type)
      .sort((a, b) => b.occurrence_count - a.occurrence_count)
      .slice(0, 5)
  }

  const getMoodColor = (happiness: number, motivation: number) => {
    const hue = motivation * 2.4 // 0-240 degrees
    const saturation = 70
    const lightness = 30 + (happiness * 40)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your patterns...</p>
        </div>
      </div>
    )
  }

  if (entries.length < 10) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b pt-2.5">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-gray-600 hover:text-gray-900">
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Your Patterns</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Patterns Unlock at 10 Entries
          </h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve logged {entries.length} mood entries. Keep tracking to discover your patterns!
          </p>
          <Link
            href="/mood"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Log Another Mood
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b pt-2.5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/home" className="text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Your Patterns</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {[
              { key: 'map', label: 'Mood Map' },
              { key: 'insights', label: 'AI Insights' },
              { key: 'focus', label: 'Focus Areas' },
              { key: 'self-talk', label: 'Self-Talk' },
              { key: 'physical', label: 'Physical State' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mood Map Tab */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Mood Map</h2>
            <p className="text-gray-600 mb-6">
              Each dot represents a mood entry. The color shows the intensity of your emotional state.
            </p>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  data={getMoodData()}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Motivation"
                    domain={[0, 100]}
                    label={{ value: 'Motivation →', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Happiness"
                    domain={[0, 100]}
                    label={{ value: 'Happiness →', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${Math.round(value)}%`,
                      name === 'x' ? 'Motivation' : 'Happiness'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload as { focus: string }
                        return `Focus: ${data.focus}`
                      }
                      return label
                    }}
                  />
                  <Scatter dataKey="y">
                    {getMoodData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getMoodColor(entry.y / 100, entry.x / 100)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>📊 {entries.length} total entries</div>
              <div>🎯 Average happiness: {Math.round(entries.reduce((sum, e) => sum + e.happiness_level, 0) / entries.length * 100)}%</div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Generated Insights</h2>
              <p className="text-gray-600 mb-6">
                Based on your {entries.length} mood entries, here are the patterns we&apos;ve discovered:
              </p>
            </div>

            {insights.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600">Analyzing your data... Insights will appear here soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {insight.type === 'correlation' && '🔗'}
                        {insight.type === 'trend' && '📈'}
                        {insight.type === 'suggestion' && '💡'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                        <p className="text-gray-700 mb-3">{insight.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Focus Areas Tab */}
        {activeTab === 'focus' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Focus Areas</h2>
            <p className="text-gray-600 mb-6">
              What you focus on most frequently and how it affects your mood:
            </p>

            <div className="space-y-4">
              {getTopPatterns('focus').map((pattern, index) => (
                <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">#{index + 1} Most Common Focus</h3>
                    <span className="text-sm text-gray-500">{pattern.occurrence_count} times</span>
                  </div>
                  <p className="text-gray-700 mb-3">&ldquo;{pattern.trigger_text}&rdquo;</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Happiness:</span>
                      <span className="ml-2 font-medium">{Math.round(pattern.avg_happiness * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Motivation:</span>
                      <span className="ml-2 font-medium">{Math.round(pattern.avg_motivation * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}

              {getTopPatterns('focus').length === 0 && (
                <p className="text-gray-600 text-center py-8">
                  Not enough data yet. Keep logging to see focus patterns!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Self-Talk Tab */}
        {activeTab === 'self-talk' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Self-Talk Patterns</h2>
            <p className="text-gray-600 mb-6">
              The internal dialogue that shapes your emotional experience:
            </p>

            <div className="space-y-4">
              {getTopPatterns('self_talk').map((pattern, index) => (
                <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">#{index + 1} Common Self-Talk</h3>
                    <span className="text-sm text-gray-500">{pattern.occurrence_count} times</span>
                  </div>
                  <p className="text-gray-700 mb-3">&ldquo;{pattern.trigger_text}&rdquo;</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Happiness:</span>
                      <span className="ml-2 font-medium">{Math.round(pattern.avg_happiness * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Motivation:</span>
                      <span className="ml-2 font-medium">{Math.round(pattern.avg_motivation * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}

              {getTopPatterns('self_talk').length === 0 && (
                <p className="text-gray-600 text-center py-8">
                  Not enough data yet. Keep logging to see self-talk patterns!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Physical State Tab */}
        {activeTab === 'physical' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Physical State Patterns</h2>
            <p className="text-gray-600 mb-6">
              How your body sensations correlate with your emotional state:
            </p>

            <div className="space-y-4">
              {getTopPatterns('physical').map((pattern, index) => (
                <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">#{index + 1} Common Sensation</h3>
                    <span className="text-sm text-gray-500">{pattern.occurrence_count} times</span>
                  </div>
                  <p className="text-gray-700 mb-3">&ldquo;{pattern.trigger_text}&rdquo;</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Happiness:</span>
                      <span className="ml-2 font-medium">{Math.round(pattern.avg_happiness * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Motivation:</span>
                      <span className="ml-2 font-medium">{Math.round(pattern.avg_motivation * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}

              {getTopPatterns('physical').length === 0 && (
                <p className="text-gray-600 text-center py-8">
                  Not enough data yet. Keep logging to see physical state patterns!
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
