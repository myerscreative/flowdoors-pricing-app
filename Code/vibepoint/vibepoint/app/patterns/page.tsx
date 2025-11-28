'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodEntry, Pattern, PatternInsight } from '@/types'
import { analyzePatterns, generateInsights } from '@/lib/pattern-analysis'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GradientBackground } from '@/components/GradientBackground'
import { getMoodColor } from '@/components/dashboard/utils/dashboardUtils'

type TabType = 'map' | 'insights' | 'focus' | 'self-talk' | 'physical'

const tabs = [
  { id: 'map' as TabType, label: 'Mood Map', icon: '🗺️' },
  { id: 'insights' as TabType, label: 'AI Insights', icon: '🤖' },
  { id: 'focus' as TabType, label: 'Focus', icon: '🎯' },
  { id: 'self-talk' as TabType, label: 'Self-Talk', icon: '💭' },
  { id: 'physical' as TabType, label: 'Physical', icon: '💪' }
]

export default function PatternsPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('map')
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

  const getPatternColor = (happiness: number, motivation: number) => {
    return getMoodColor(happiness, motivation)
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center text-text-primary">
        <GradientBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c026d3] mx-auto mb-4"></div>
          <p className="text-text-secondary">Analyzing your patterns...</p>
        </div>
      </div>
    )
  }

  const entryCount = entries.length
  const entriesNeeded = 10 - entryCount

  if (entries.length < 10) {
    return (
      <div className="relative min-h-screen text-text-primary">
        <GradientBackground />
        
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] md:max-w-[600px] lg:max-w-[720px] xl:max-w-[800px] flex-col px-5 py-6 md:px-6 lg:px-8">
          {/* Header */}
          <header className="patterns-header mb-8">
            <button 
              className="back-button"
              onClick={() => router.push('/home')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <span>Back to Home</span>
            </button>
            <h1 className="patterns-title">Your Patterns</h1>
            <p className="patterns-subtitle">Discover what creates your moods</p>
          </header>

          {/* Unlock Card */}
          <div className="unlock-patterns-card">
            <div className="unlock-icon">🔒</div>
            <h3>Unlock Pattern Insights</h3>
            <p className="unlock-message">
              Log <strong>{entriesNeeded} more {entriesNeeded === 1 ? 'entry' : 'entries'}</strong> to unlock pattern analysis
            </p>
            <div className="unlock-progress-bar">
              <div 
                className="unlock-progress-fill" 
                style={{ width: `${(entryCount / 10) * 100}%` }}
              />
            </div>
            <p className="unlock-count">{entryCount} of 10 entries</p>
            <button 
              className="unlock-cta" 
              onClick={() => router.push('/mood/new')}
            >
              Log Your Mood
            </button>
          </div>
        </div>
      </div>
    )
  }

  const avgHappiness = entries.length > 0 
    ? Math.round(entries.reduce((sum, e) => sum + e.happiness_level, 0) / entries.length * 100)
    : 0

  return (
    <div className="relative min-h-screen text-text-primary">
      <GradientBackground />
      
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] md:max-w-[600px] lg:max-w-[720px] xl:max-w-[1200px] flex-col px-5 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <header className="patterns-header mb-8">
          <button 
            className="back-button"
            onClick={() => router.push('/home')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>Back to Home</span>
          </button>
          <h1 className="patterns-title">Your Patterns</h1>
          <p className="patterns-subtitle">Discover what creates your moods</p>
        </header>

        {/* Tab Navigation */}
        <div className="tabs-container mb-8">
          <div className="tabs-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Mood Map Tab */}
          {activeTab === 'map' && (
            <div className="content-card">
              <h3 className="content-card-title">Mood Map</h3>
              <p className="content-card-subtitle">
                {entries.length} entries · {avgHappiness}% avg happiness
              </p>

              <div className="mood-chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    data={getMoodData()}
                    margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Motivation"
                      domain={[0, 100]}
                      stroke="var(--text-secondary)"
                      style={{ fontSize: '0.85rem' }}
                      label={{ 
                        value: 'Motivation →', 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { fill: 'var(--text-secondary)', fontSize: '0.85rem' }
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Happiness"
                      domain={[0, 100]}
                      stroke="var(--text-secondary)"
                      style={{ fontSize: '0.85rem' }}
                      label={{ 
                        value: 'Happiness →', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'var(--text-secondary)', fontSize: '0.85rem' }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.9rem'
                      }}
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
                    <Scatter dataKey="y" name="Moods">
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

              <div className="mood-map-legend">
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: 'rgb(180, 220, 255)' }}></div>
                  <span>Happy + Unmotivated</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: 'rgb(255, 240, 50)' }}></div>
                  <span>Happy + Motivated</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: 'rgb(40, 35, 45)' }}></div>
                  <span>Unhappy + Unmotivated</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: 'rgb(255, 20, 0)' }}></div>
                  <span>Unhappy + Motivated</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="content-card">
              <h3 className="content-card-title">AI Insights</h3>
              <p className="content-card-subtitle">
                Patterns discovered from your mood data
              </p>

              {insights.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🤖</span>
                  <p>Analyzing your data... Insights will appear here soon!</p>
                </div>
              ) : (
                <div className="insights-grid">
                  {insights.map((insight, index) => {
                    const icon = insight.type === 'correlation' ? '🔗' : insight.type === 'trend' ? '📈' : '💡'
                    const confidencePercent = Math.round(insight.confidence * 100)
                    return (
                      <div key={index} className="insight-card">
                        <div className="insight-header">
                          <span className="insight-icon">{icon}</span>
                          <span className="insight-type">{insight.type}</span>
                        </div>
                        <h4 className="insight-title">{insight.title}</h4>
                        <p className="insight-description">{insight.description}</p>
                        <div className="insight-confidence">
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill" 
                              style={{ width: `${confidencePercent}%` }}
                            />
                          </div>
                          <span className="confidence-text">{confidencePercent}% confidence</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Focus Areas Tab */}
          {activeTab === 'focus' && (
            <div className="content-card">
              <h3 className="content-card-title">Top Focus Areas</h3>
              <p className="content-card-subtitle">
                What you focus on most often
              </p>

              {getTopPatterns('focus').length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📊</span>
                  <p>No patterns detected yet. Keep logging to discover trends!</p>
                </div>
              ) : (
                <div className="patterns-list">
                  {getTopPatterns('focus').map((pattern, index) => (
                    <div key={pattern.id} className="pattern-item">
                      <div className="pattern-rank">{index + 1}</div>
                      <div className="pattern-content">
                        <h4 className="pattern-text">&ldquo;{pattern.trigger_text}&rdquo;</h4>
                        <div className="pattern-stats">
                          <span className="pattern-count">
                            {pattern.occurrence_count} {pattern.occurrence_count === 1 ? 'time' : 'times'}
                          </span>
                          <span className="pattern-separator">•</span>
                          <span className="pattern-mood">
                            {Math.round(pattern.avg_happiness * 100)}% happy
                          </span>
                          <span className="pattern-separator">•</span>
                          <span className="pattern-motivation">
                            {Math.round(pattern.avg_motivation * 100)}% motivated
                          </span>
                        </div>
                      </div>
                      <div 
                        className="pattern-indicator" 
                        style={{ 
                          background: getPatternColor(pattern.avg_happiness, pattern.avg_motivation) 
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Self-Talk Tab */}
          {activeTab === 'self-talk' && (
            <div className="content-card">
              <h3 className="content-card-title">Self-Talk Patterns</h3>
              <p className="content-card-subtitle">
                The internal dialogue that shapes your emotional experience
              </p>

              {getTopPatterns('self_talk').length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📊</span>
                  <p>No patterns detected yet. Keep logging to discover trends!</p>
                </div>
              ) : (
                <div className="patterns-list">
                  {getTopPatterns('self_talk').map((pattern, index) => (
                    <div key={pattern.id} className="pattern-item">
                      <div className="pattern-rank">{index + 1}</div>
                      <div className="pattern-content">
                        <h4 className="pattern-text">&ldquo;{pattern.trigger_text}&rdquo;</h4>
                        <div className="pattern-stats">
                          <span className="pattern-count">
                            {pattern.occurrence_count} {pattern.occurrence_count === 1 ? 'time' : 'times'}
                          </span>
                          <span className="pattern-separator">•</span>
                          <span className="pattern-mood">
                            {Math.round(pattern.avg_happiness * 100)}% happy
                          </span>
                          <span className="pattern-separator">•</span>
                          <span className="pattern-motivation">
                            {Math.round(pattern.avg_motivation * 100)}% motivated
                          </span>
                        </div>
                      </div>
                      <div 
                        className="pattern-indicator" 
                        style={{ 
                          background: getPatternColor(pattern.avg_happiness, pattern.avg_motivation) 
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Physical State Tab */}
          {activeTab === 'physical' && (
            <div className="content-card">
              <h3 className="content-card-title">Physical State Patterns</h3>
              <p className="content-card-subtitle">
                How your body sensations correlate with your emotional state
              </p>

              {getTopPatterns('physical').length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📊</span>
                  <p>No patterns detected yet. Keep logging to discover trends!</p>
                </div>
              ) : (
                <div className="patterns-list">
                  {getTopPatterns('physical').map((pattern, index) => (
                    <div key={pattern.id} className="pattern-item">
                      <div className="pattern-rank">{index + 1}</div>
                      <div className="pattern-content">
                        <h4 className="pattern-text">&ldquo;{pattern.trigger_text}&rdquo;</h4>
                        <div className="pattern-stats">
                          <span className="pattern-count">
                            {pattern.occurrence_count} {pattern.occurrence_count === 1 ? 'time' : 'times'}
                          </span>
                          <span className="pattern-separator">•</span>
                          <span className="pattern-mood">
                            {Math.round(pattern.avg_happiness * 100)}% happy
                          </span>
                          <span className="pattern-separator">•</span>
                          <span className="pattern-motivation">
                            {Math.round(pattern.avg_motivation * 100)}% motivated
                          </span>
                        </div>
                      </div>
                      <div 
                        className="pattern-indicator" 
                        style={{ 
                          background: getPatternColor(pattern.avg_happiness, pattern.avg_motivation) 
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
