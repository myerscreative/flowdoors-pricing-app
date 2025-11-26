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

      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          happiness_level: coordinates.y,
          motivation_level: coordinates.x,
          focus: formData.focus,
          self_talk: formData.selfTalk,
          physical_sensations: formData.physicalSensations,
          emotion_name: getEmotionName(),
          notes: formData.notes || null
        })

      if (error) {
        setError(error.message)
      } else {
        // Clear stored coordinates
        localStorage.removeItem('moodCoordinates')
        router.push('/success')
      }
    } catch {
      setError('An unexpected error occurred')
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
