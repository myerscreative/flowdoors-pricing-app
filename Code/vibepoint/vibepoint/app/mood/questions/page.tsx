'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MoodCoordinates } from '@/types'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coordinates) return

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Validate required fields
      if (!formData.focus.trim() || !formData.selfTalk.trim() || !formData.physicalSensations.trim()) {
        setError('Please fill in all required fields (focus, self-talk, and physical sensations)')
        setLoading(false)
        return
      }

      // Validate coordinates are valid numbers between 0 and 1
      if (typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number' ||
          coordinates.x < 0 || coordinates.x > 1 || coordinates.y < 0 || coordinates.y > 1) {
        setError('Invalid mood coordinates. Please select your mood again.')
        setLoading(false)
        return
      }

      // Build entry data
      // Note: Temporarily excluding emotion_name if schema cache hasn't refreshed
      const emotionName = getEmotionName()
      const entryData: any = {
        user_id: user.id,
        happiness_level: Math.max(0, Math.min(1, coordinates.y)), // Ensure between 0 and 1
        motivation_level: Math.max(0, Math.min(1, coordinates.x)), // Ensure between 0 and 1
        focus: formData.focus.trim(),
        self_talk: formData.selfTalk.trim(),
        physical_sensations: formData.physicalSensations.trim(),
      }

      // Only include emotion_name if schema cache has refreshed
      // You can remove this check once Supabase schema cache updates (usually 1-5 minutes)
      // For now, try including it - if it fails, the error handler will catch it
      if (emotionName) {
        entryData.emotion_name = emotionName
      }

      // Only include notes if it exists
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
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        })
        
        // If error is about emotion_name column, try again without it
        if (error.message?.includes('emotion_name') && entryData.emotion_name) {
          console.log('Schema cache not updated yet. Retrying without emotion_name...')
          const entryDataWithoutEmotion = { ...entryData }
          delete entryDataWithoutEmotion.emotion_name
          
          const { data: retryData, error: retryError } = await supabase
            .from('mood_entries')
            .insert(entryDataWithoutEmotion)
            .select()
          
          if (retryError) {
            const errorMessage = retryError.message || retryError.details || retryError.hint || 'Failed to save entry. Please check your connection and try again.'
            setError(`Failed to save entry: ${errorMessage}`)
          } else if (retryData && retryData.length > 0) {
            // Success - entry saved without emotion_name
            // The emotion_name will be null for now until schema cache refreshes
            localStorage.removeItem('moodCoordinates')
            router.push('/success')
            return
          }
        }
        
        const errorMessage = error.message || error.details || error.hint || 'Failed to save entry. Please check your connection and try again.'
        setError(`Failed to save entry: ${errorMessage}`)
      } else if (data && data.length > 0) {
        // Success - clear stored coordinates and redirect
        localStorage.removeItem('moodCoordinates')
        router.push('/success')
      } else {
        // No error but also no data returned
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

  if (!coordinates) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
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
    </div>
  )
}
