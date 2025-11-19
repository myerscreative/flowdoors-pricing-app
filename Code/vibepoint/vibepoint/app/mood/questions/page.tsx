'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MoodCoordinates } from '@/types'

interface QuestionData {
  focus: string
  selfTalk: string
  physicalSensations: string
  notes: string
}

export default function QuestionsPage() {
  const [coordinates, setCoordinates] = useState<MoodCoordinates | null>(null)
  const [formData, setFormData] = useState<QuestionData>({
    focus: '',
    selfTalk: '',
    physicalSensations: '',
    notes: ''
  })
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Tell us more about your mood
          </h1>
          <p className="text-gray-600 text-center text-sm">
            Understanding what creates your moods helps you control them
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you focusing on?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              What thoughts, situations, or concerns have your attention?
            </p>
            <textarea
              value={formData.focus}
              onChange={(e) => handleInputChange('focus', e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., my upcoming deadline, argument with partner, vacation plans..."
            />
          </div>

          {/* Question 2: Self-talk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you telling yourself?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              What internal dialogue or self-talk is running through your mind?
            </p>
            <textarea
              value={formData.selfTalk}
              onChange={(e) => handleInputChange('selfTalk', e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., I can't handle this, Everything will work out, I'm not good enough..."
            />
          </div>

          {/* Question 3: Physical sensations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What physical sensations are you experiencing?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              What do you notice in your body right now?
            </p>
            <textarea
              value={formData.physicalSensations}
              onChange={(e) => handleInputChange('physicalSensations', e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., tight chest, relaxed shoulders, butterflies in stomach, energized..."
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional thoughts or context..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.focus || !formData.selfTalk || !formData.physicalSensations}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </div>
    </div>
  )
}
