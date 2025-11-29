'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MoodCoordinates } from '@/types'
import { checkThrottle, getLastMoodEntry, calculateMinutesSince } from '@/lib/moodUtils'
import { ThrottleWarningModal } from '@/components/ThrottleWarningModal'
import { HardLimitModal } from '@/components/HardLimitModal'
import { RapidShiftContextPrompt } from '@/components/RapidShiftContextPrompt'
import { UpYourVibeModal } from '@/components/UpYourVibeModal'
import { Recipe } from '@/types'
import { checkProStatusClient } from '@/lib/pro-tier'

interface QuestionData {
  focus: string
  selfTalk: string
  physicalSensations: string
  emotionDropdown: string
  emotionCustom: string
  notes: string
}

const emotionOptions = [
  'Calm', 'Hopeful', 'Stressed', 'Anxious', 'Motivated', 'Discouraged',
  'Grateful', 'Overwhelmed', 'Frustrated', 'Confident', 'Tired', 'Peaceful'
]

export default function QuestionsPage() {
  const [coordinates, setCoordinates] = useState<MoodCoordinates | null>(null)
  const [formData, setFormData] = useState<QuestionData>({
    focus: '',
    selfTalk: '',
    physicalSensations: '',
    emotionDropdown: '',
    emotionCustom: '',
    notes: ''
  })

  // Get the final emotion name: custom input overrides dropdown
  const getEmotionName = () => {
    const custom = formData.emotionCustom.trim()
    if (custom) return custom.slice(0, 80) // Max 80 characters
    return formData.emotionDropdown || null
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  // Throttle modal states
  const [showThrottleWarning, setShowThrottleWarning] = useState(false)
  const [showHardLimit, setShowHardLimit] = useState(false)
  const [showContextPrompt, setShowContextPrompt] = useState(false)
  const [throttleInfo, setThrottleInfo] = useState<{
    minutesSince: number
    overridesLeft: number
    minutesUntilNext: number | null
  } | null>(null)

  // Up Your Vibe modal states
  const [showUpYourVibe, setShowUpYourVibe] = useState(false)
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null)
  const [lastSavedEntryId, setLastSavedEntryId] = useState<string | null>(null)

  useEffect(() => {
    // Get coordinates from localStorage
    const storedCoords = localStorage.getItem('moodCoordinates')
    if (storedCoords) {
      setCoordinates(JSON.parse(storedCoords))
    } else {
      // If no coordinates, redirect back to mood selection
      router.push('/mood')
    }
  }, [router])

  const handleInputChange = (field: keyof QuestionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Save entry with throttle data
  const saveEntry = async (isRapidShift: boolean = false, rapidShiftContext: string | null = null) => {
    if (!coordinates) return

    setLoading(true)
    setError('')

    try {
      // AUTH DISABLED FOR DEVELOPMENT - Allow viewing but warn on save
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication required to save entries. Please log in first.')
        setLoading(false)
        return
      }

      // Get last entry to calculate minutes since
      const lastEntry = await getLastMoodEntry(user.id)
      // Use created_at for throttle checking (when entry was actually created)
      const minutesSince = lastEntry 
        ? calculateMinutesSince(lastEntry.created_at || lastEntry.timestamp) 
        : null

      // Build entry data
      const emotionName = getEmotionName()
      const entryData: any = {
        user_id: user.id,
        happiness_level: Math.max(0, Math.min(1, coordinates.y)),
        motivation_level: Math.max(0, Math.min(1, coordinates.x)),
        focus: formData.focus.trim(),
        self_talk: formData.selfTalk.trim(),
        physical_sensations: formData.physicalSensations.trim(),
        is_rapid_shift: isRapidShift,
        minutes_since_last_entry: minutesSince,
      }

      if (emotionName) {
        entryData.emotion_name = emotionName
      }

      if (rapidShiftContext) {
        entryData.rapid_shift_context = rapidShiftContext
      }

      const notes = formData.notes?.trim()
      if (notes) {
        entryData.notes = notes
      }

      console.log('Attempting to insert entry:', entryData)

      const { data, error } = await supabase
        .from('mood_entries')
        .insert(entryData)
        .select()

      if (error) {
        console.error('Database error:', error)
        const errorMessage = error.message || error.details || error.hint || 'Failed to save entry. Please check your connection and try again.'
        setError(`Failed to save entry: ${errorMessage}`)
      } else if (data && data.length > 0) {
        const savedEntry = data[0]
        localStorage.removeItem('moodCoordinates')
        
        // Check if this is a low mood entry and user is Pro
        const isLowMood = coordinates.y < 0.5
        if (isLowMood) {
          try {
            const proStatus = await checkProStatusClient()
            if (proStatus.isPro) {
              // Fetch suggested recipe
              const suggestResponse = await fetch(
                `/api/recipes/suggest?entryId=${savedEntry.id}&happinessLevel=${coordinates.y}&motivationLevel=${coordinates.x}`
              )
              
              if (suggestResponse.ok) {
                const suggestData = await suggestResponse.json()
                if (suggestData.recipe) {
                  setSuggestedRecipe(suggestData.recipe)
                  setLastSavedEntryId(savedEntry.id)
                  setShowUpYourVibe(true)
                  setLoading(false)
                  return // Don't redirect yet - show modal first
                }
              }
            }
          } catch (err) {
            console.error('Error checking for recipe suggestion:', err)
            // Continue to success page even if suggestion fails
          }
        }
        
        // Not low mood or suggestion failed - proceed normally
        router.push('/success')
      } else {
        console.warn('Insert succeeded but no data returned')
        setError('Entry saved but no confirmation received. Please refresh and check your entries.')
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(`An unexpected error occurred: ${err?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coordinates) return

    setLoading(true)
    setError('')

    try {
      // AUTH DISABLED FOR DEVELOPMENT - Allow viewing but warn on save
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication required to save entries. Please log in first.')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.focus.trim() || !formData.selfTalk.trim() || !formData.physicalSensations.trim()) {
        setError('Please fill in all required fields (focus, self-talk, and physical sensations)')
        setLoading(false)
        return
      }

      // Validate coordinates
      if (typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number' ||
          coordinates.x < 0 || coordinates.x > 1 || coordinates.y < 0 || coordinates.y > 1) {
        setError('Invalid mood coordinates. Please select your mood again.')
        setLoading(false)
        return
      }

      // Check throttle
      const throttle = await checkThrottle(user.id)

      if (throttle.shouldThrottle) {
        setLoading(false)
        
        if (throttle.minutesUntilNext !== null) {
          // Hard limit reached
          setThrottleInfo({
            minutesSince: throttle.minutesSince || 0,
            overridesLeft: 0,
            minutesUntilNext: throttle.minutesUntilNext,
          })
          setShowHardLimit(true)
          return
        } else {
          // Can override - show warning
          const overridesLeft = 3 - throttle.overridesToday
          setThrottleInfo({
            minutesSince: throttle.minutesSince || 0,
            overridesLeft,
            minutesUntilNext: null,
          })
          setShowThrottleWarning(true)
          return
        }
      }

      // No throttle - save directly
      await saveEntry(false, null)
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(`An unexpected error occurred: ${err?.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  // Handle throttle warning modal actions
  const handleThrottleWait = () => {
    setShowThrottleWarning(false)
    setThrottleInfo(null)
  }

  const handleThrottleOverride = () => {
    setShowThrottleWarning(false)
    setShowContextPrompt(true)
  }

  // Handle rapid shift context submission
  const handleContextSubmit = async (context: string) => {
    setShowContextPrompt(false)
    await saveEntry(true, context || null)
  }

  const handleContextCancel = () => {
    setShowContextPrompt(false)
    setThrottleInfo(null)
  }

  if (!coordinates) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Navigation */}
        <div className="mb-6 w-full">
          <Link
            href="/mood"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-soft)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back to Mood Selection
          </Link>
        </div>
        
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-3">
            Tell us more about your mood
          </h1>
          <p className="text-[var(--color-text-soft)] text-lg">
            Understanding what creates your moods helps you control them
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[var(--color-surface)] p-8 rounded-3xl shadow-lg border border-black/5">
          {/* Question 1: Focus */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              What are you focusing on?
            </label>
            <p className="text-sm text-[var(--color-text-soft)] mb-3">
              What thoughts, situations, or concerns have your attention?
            </p>
            <textarea
              value={formData.focus}
              onChange={(e) => handleInputChange('focus', e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-2)] focus:border-transparent bg-transparent"
              placeholder="e.g., my upcoming deadline, argument with partner, vacation plans..."
            />
          </div>

          {/* Question 2: Self-talk */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              What are you telling yourself?
            </label>
            <p className="text-sm text-[var(--color-text-soft)] mb-3">
              What internal dialogue or self-talk is running through your mind?
            </p>
            <textarea
              value={formData.selfTalk}
              onChange={(e) => handleInputChange('selfTalk', e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-2)] focus:border-transparent bg-transparent"
              placeholder="e.g., I can't handle this, Everything will work out, I'm not good enough..."
            />
          </div>

          {/* Question 3: Physical sensations */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              What physical sensations are you experiencing?
            </label>
            <p className="text-sm text-[var(--color-text-soft)] mb-3">
              What do you notice in your body right now?
            </p>
            <textarea
              value={formData.physicalSensations}
              onChange={(e) => handleInputChange('physicalSensations', e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-2)] focus:border-transparent bg-transparent"
              placeholder="e.g., tight chest, relaxed shoulders, butterflies in stomach, energized..."
            />
          </div>

          {/* Emotion Name - After the three questions */}
          <div className="mt-6">
            <label className="block text-lg font-semibold mb-2">
              Name the emotion you&apos;re feeling right now
            </label>
            <p className="text-sm text-neutral-500 mb-3">
              Choose one or type your own.
            </p>
            <div className="space-y-3">
              <select
                value={formData.emotionDropdown}
                onChange={(e) => handleInputChange('emotionDropdown', e.target.value)}
                className="w-full px-3 py-3 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-2)] focus:border-transparent bg-transparent shadow-sm"
              >
                <option value="">Select an emotion...</option>
                {emotionOptions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.emotionCustom}
                onChange={(e) => handleInputChange('emotionCustom', e.target.value)}
                maxLength={80}
                className="w-full px-3 py-3 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-2)] focus:border-transparent bg-transparent shadow-sm"
                placeholder="Or type your own emotion..."
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-2)] focus:border-transparent bg-transparent"
              placeholder="Any additional thoughts or context..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.focus || !formData.selfTalk || !formData.physicalSensations}
            className="w-full bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white py-4 px-6 rounded-3xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </div>

      {/* Throttle Modals */}
      {throttleInfo && (
        <>
          <ThrottleWarningModal
            isOpen={showThrottleWarning}
            minutesSince={throttleInfo.minutesSince}
            overridesLeft={throttleInfo.overridesLeft}
            onWait={handleThrottleWait}
            onOverride={handleThrottleOverride}
          />
          <HardLimitModal
            isOpen={showHardLimit}
            minutesUntilNext={throttleInfo.minutesUntilNext || 0}
            onDismiss={() => {
              setShowHardLimit(false)
              setThrottleInfo(null)
            }}
          />
        </>
      )}
      <RapidShiftContextPrompt
        isOpen={showContextPrompt}
        onCancel={handleContextCancel}
        onSubmit={handleContextSubmit}
      />
      <UpYourVibeModal
        isOpen={showUpYourVibe}
        recipe={suggestedRecipe}
        onClose={() => {
          setShowUpYourVibe(false)
          router.push('/success')
        }}
        onStartRecipe={(recipeId) => {
          setShowUpYourVibe(false)
          const params = new URLSearchParams({ id: recipeId })
          if (lastSavedEntryId) {
            params.append('triggeredEntryId', lastSavedEntryId)
          }
          router.push(`/recipe-player?${params.toString()}`)
        }}
      />
    </div>
  )
}
