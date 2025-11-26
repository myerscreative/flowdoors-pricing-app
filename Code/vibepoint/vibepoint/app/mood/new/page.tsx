'use client'

import { useState } from 'react'
import GradientSelector from '@/components/GradientSelector'
import { supabase } from '@/lib/supabase'

export default function MoodInputPage() {
  const [happiness, setHappiness] = useState(0.5)
  const [motivation, setMotivation] = useState(0.5)

  const [focus, setFocus] = useState('')
  const [selfTalk, setSelfTalk] = useState('')
  const [body, setBody] = useState('')
  const [emotionDropdown, setEmotionDropdown] = useState('')
  const [emotionCustom, setEmotionCustom] = useState('')
  const [notes, setNotes] = useState('')

  const emotionOptions = [
    'Calm', 'Hopeful', 'Stressed', 'Anxious', 'Motivated', 'Discouraged',
    'Grateful', 'Overwhelmed', 'Frustrated', 'Confident', 'Tired', 'Peaceful'
  ]

  // Get the final emotion name: custom input overrides dropdown
  const getEmotionName = () => {
    const custom = emotionCustom.trim()
    if (custom) return custom.slice(0, 80) // Max 80 characters
    return emotionDropdown || null
  }

  const handleSave = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication required:', authError)
        alert('Please log in to save your mood entry.')
        return
      }

      // Validate required fields
      if (!focus.trim() || !selfTalk.trim() || !body.trim()) {
        alert('Please fill in all required fields (focus, self-talk, and physical sensations)')
        return
      }

      const entry = {
        user_id: user.id,
        happiness_level: happiness,
        motivation_level: motivation,
        focus: focus.trim(),
        self_talk: selfTalk.trim(),
        physical_sensations: body.trim(),
        emotion_name: getEmotionName() || null,
        notes: notes?.trim() || null,
        timestamp: new Date().toISOString(),
      }

      // save to supabase
      const { data, error } = await supabase
        .from('mood_entries')
        .insert(entry)
        .select()
      
      if (error) {
        console.error('Save error:', error)
        alert(`Failed to save entry: ${error.message}`)
      } else {
        alert('Mood entry saved successfully!')
        // Optionally redirect or clear form
        setFocus('')
        setSelfTalk('')
        setBody('')
        setEmotionDropdown('')
        setEmotionCustom('')
        setNotes('')
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      alert(`An unexpected error occurred: ${error?.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="hero-bg" />

      <div className="relative z-1">
        {/* Header */}
        <header className="container pt-2.5 pb-4">
          <div className="font-playfair font-bold text-2xl bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] bg-clip-text text-transparent">
            VibePoint
          </div>
        </header>

        {/* Main Content */}
        <section className="container hero">
          <h1 className="font-playfair font-bold text-4xl sm:text-5xl leading-tight mb-6 text-center">
            Mood Check-In
          </h1>

          {/* Gradient Selector Card */}
          <div className="max-w-4xl mx-auto p-2 sm:p-6 md:p-8 bg-[var(--color-surface)] rounded-3xl shadow-lg border border-black/4 mb-8">
            <div className="text-center text-[var(--color-text-soft)] font-medium text-sm uppercase tracking-wider mb-4 sm:mb-6">
              Intuitive Mood Mapping
            </div>
            <div className="relative w-full max-w-[660px] mx-auto mt-4 sm:mt-8 px-0 sm:px-6 md:px-8">
              <div className="w-full aspect-square rounded-3xl overflow-hidden">
                <GradientSelector
                  onMoodSelect={(coords) => {
                    setHappiness(coords.y)
                    setMotivation(coords.x)
                  }}
                  showStats={false}
                  showHeader={false}
                  selectedMood={{ x: motivation, y: happiness }}
                />
              </div>
            </div>

            <div className="text-center text-lg font-semibold text-[var(--color-text)] mt-6 sm:mt-12">
              Tap anywhere to capture your current state
            </div>
            <p className="text-[var(--color-text-soft)] text-sm opacity-80 max-w-md mx-auto mt-4 leading-relaxed px-2 sm:px-0">
              VibePoint doesn&apos;t tell you what emotion you&apos;re feeling—you define your own experience. The gradient helps you capture your coordinates; the insights come from your own patterns.
            </p>
          </div>

          {/* Form Card */}
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-[var(--color-surface)] rounded-3xl shadow-lg border border-black/4 mb-8">
            <div className="space-y-6">
        {/* Focus */}
        <div>
          <label className="text-[var(--color-text)] font-medium mb-3 block">What are you focusing on?</label>
          <input
            value={focus}
            onChange={e => setFocus(e.target.value)}
            className="w-full bg-white text-[var(--color-text)] border border-black/10 px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-sm"
            placeholder="deadlines… a win… the drive ahead…"
          />
        </div>

        {/* Self Talk */}
        <div>
          <label className="text-[var(--color-text)] font-medium mb-3 block">What are you telling yourself?</label>
          <input
            value={selfTalk}
            onChange={e => setSelfTalk(e.target.value)}
            className="w-full bg-white text-[var(--color-text)] border border-black/10 px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-sm"
            placeholder="I can handle this… I'm behind… this will be good…"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-[var(--color-text)] font-medium mb-3 block">What&apos;s happening in your body?</label>
          <input
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full bg-white text-[var(--color-text)] border border-black/10 px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-sm"
            placeholder="tight shoulders… calm… buzzing energy…"
          />
        </div>

        {/* Emotion Name - After the three questions */}
        <div className="mt-6">
          <label className="text-[var(--color-text)] font-medium mb-2 block">
            Name the emotion you&apos;re feeling right now
          </label>
          <p className="text-neutral-500 text-sm mb-3">Choose one or type your own.</p>
          <div className="space-y-3">
            <select
              value={emotionDropdown}
              onChange={e => setEmotionDropdown(e.target.value)}
              className="w-full bg-white text-[var(--color-text)] border border-[#e5e5e5] px-3 py-3 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-sm"
            >
              <option value="">Select an emotion...</option>
              {emotionOptions.map(emotion => (
                <option key={emotion} value={emotion}>{emotion}</option>
              ))}
            </select>
            <input
              type="text"
              value={emotionCustom}
              onChange={e => setEmotionCustom(e.target.value)}
              maxLength={80}
              className="w-full bg-white text-[var(--color-text)] border border-[#e5e5e5] px-3 py-3 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-sm"
              placeholder="Or type your own emotion..."
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[var(--color-text)] font-medium mb-3 block">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-white text-[var(--color-text)] border border-black/10 px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-sm min-h-[100px] resize-y"
            placeholder="Any additional thoughts or context..."
          />
        </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-8 bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white px-8 py-4 rounded-3xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              Save Entry
            </button>
          </div>

          {/* Privacy Badge */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-black/6 rounded-3xl text-[var(--color-trust)] font-medium text-sm shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Private • Encrypted • Local-first design
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

