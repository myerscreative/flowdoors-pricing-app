'use client'

import Link from 'next/link'
import { useState } from 'react'
import GradientSelector from '@/components/GradientSelector'
import { supabase } from '@/lib/supabase'

const primaryEmotions = [
  'Calm',
  'Happy',
  'Content',
  'Motivated',
  'Grateful',
  'Anxious',
  'Stressed',
  'Overwhelmed',
  'Tired',
  'Excited',
]

const emotionGroups = [
  {
    label: 'Expansive & Confident',
    emotions: ['Empowered', 'Proud', 'Courageous', 'Inspired', 'Optimistic', 'Curious'],
  },
  {
    label: 'Connected & Warm',
    emotions: ['Playful', 'Affectionate', 'Loved', 'Supported', 'Compassionate', 'Appreciative'],
  },
  {
    label: 'Centered & Steady',
    emotions: ['Peaceful', 'Grounded', 'Balanced', 'Relaxed', 'Present', 'Open'],
  },
  {
    label: 'Pressure & Stress',
    emotions: ['Worried', 'Pressured', 'Rushed', 'Tense', 'Nervous', 'Uneasy'],
  },
  {
    label: 'Low & Drained',
    emotions: ['Sad', 'Lonely', 'Disappointed', 'Guilty', 'Ashamed', 'Exhausted'],
  },
  {
    label: 'Reactive & Protective',
    emotions: ['Frustrated', 'Irritated', 'Annoyed', 'Defensive', 'Skeptical', 'Cautious'],
  },
]

export default function MoodInputPage() {
  const [happiness, setHappiness] = useState(0.5)
  const [motivation, setMotivation] = useState(0.5)

  const [focus, setFocus] = useState('')
  const [selfTalk, setSelfTalk] = useState('')
  const [body, setBody] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [emotionCustom, setEmotionCustom] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showEmotionList, setShowEmotionList] = useState(false)

  const backgroundStyle = {
    background: 'linear-gradient(135deg, #d4f1f9 0%, #f8e8f0 35%, #fdf6e9 65%, #f5e6e0 100%)',
    backgroundAttachment: 'fixed',
  } as const

  const displayFont = { fontFamily: 'var(--font-display)' } as const
  const bodyFont = { fontFamily: 'var(--font-body)' } as const
  const containerClasses =
    'w-full max-w-[480px] md:max-w-[600px] lg:max-w-[720px] xl:max-w-[800px] mx-auto px-5 md:px-6 lg:px-8'
  const glassCardClasses = 'bg-white/85 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]'
  const inputClasses =
    'w-full px-5 py-4 bg-white/60 border border-black/10 rounded-2xl text-[#1a1a2e] placeholder:text-[#4a4a6a]/70 focus:outline-none focus:border-[#c026d3] focus:bg-white/90 focus:ring-4 focus:ring-[#c026d3]/10 transition-all'

  const getEmotionName = () => {
    const custom = emotionCustom.trim()
    if (custom) return custom.slice(0, 80)
    return selectedEmotion || null
  }

  const handleChipClick = (emotion: string) => {
    setSelectedEmotion(current => (current === emotion ? '' : emotion))
  }

  const renderEmotionChip = (emotion: string) => {
    const isSelected = selectedEmotion === emotion
    return (
      <button
        key={emotion}
        type="button"
        onClick={() => handleChipClick(emotion)}
        className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-[#f97316] via-[#c026d3] to-[#7c3aed] text-white shadow-lg shadow-[#c026d3]/30'
            : 'bg-white/30 border border-white/50 text-[#4a4a6a]/70 opacity-70 hover:opacity-100 hover:bg-white hover:text-[#1a1a2e]'
        }`}
        style={!isSelected ? bodyFont : undefined}
      >
        {emotion}
      </button>
    )
  }

  const handleSave = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Authentication required:', authError)
        alert('Please log in to save your mood entry.')
        return
      }

      if (!focus.trim() || !selfTalk.trim() || !body.trim()) {
        alert('Please fill in all required fields (focus, self-talk, and physical sensations)')
        return
      }

      const emotionName = getEmotionName()
      const entry: any = {
        user_id: user.id,
        happiness_level: happiness,
        motivation_level: motivation,
        focus: focus.trim(),
        self_talk: selfTalk.trim(),
        physical_sensations: body.trim(),
        notes: notes?.trim() || null,
        timestamp: new Date().toISOString(),
      }

      // Add emotion_name if provided
      if (emotionName) {
        entry.emotion_name = emotionName
      }

      console.log('Attempting to insert entry:', entry)

      const { data, error } = await supabase.from('mood_entries').insert(entry).select()

      if (error) {
        // Log the raw error first to see its actual structure
        console.error('Raw error object:', error)
        console.error('Error type:', typeof error)
        console.error('Error constructor:', error?.constructor?.name)
        
        // Try to extract error message in multiple ways
        const errorMessage = 
          (typeof error === 'string' ? error : null) ||
          (error && typeof error === 'object' && 'message' in error ? error.message : null) ||
          (error && typeof error === 'object' && 'details' in error ? error.details : null) ||
          (error && typeof error === 'object' && 'hint' in error ? error.hint : null) ||
          (error && typeof error === 'object' && String(error) !== '[object Object]' ? String(error) : null) ||
          'Failed to save entry. Please check your connection and try again.'
        
        // Check if error is about emotion_name column
        const errorString = typeof error === 'string' 
          ? error 
          : (error && typeof error === 'object' ? JSON.stringify(error) : String(error))
        
        const isEmotionNameError = errorString?.includes('emotion_name') ||
                                   (error && typeof error === 'object' && 'message' in error && error.message?.includes('emotion_name'))
        
        // If error is about emotion_name column, try again without it
        if (isEmotionNameError && entry.emotion_name) {
          console.log('Schema cache not updated yet. Retrying without emotion_name...')
          const entryWithoutEmotion = { ...entry }
          delete entryWithoutEmotion.emotion_name
          
          const { data: retryData, error: retryError } = await supabase
            .from('mood_entries')
            .insert(entryWithoutEmotion)
            .select()
          
          if (retryError) {
            const retryErrorMessage = 
              (typeof retryError === 'string' ? retryError : null) ||
              (retryError && typeof retryError === 'object' && 'message' in retryError ? retryError.message : null) ||
              (retryError && typeof retryError === 'object' && 'details' in retryError ? retryError.details : null) ||
              (retryError && typeof retryError === 'object' && 'hint' in retryError ? retryError.hint : null) ||
              'Failed to save entry. Please check your connection and try again.'
            alert(`Failed to save entry: ${retryErrorMessage}`)
            return
          } else if (retryData && retryData.length > 0) {
            alert('Mood entry saved successfully! (Note: emotion name was not saved - please run the migration to add the emotion_name column)')
            setFocus('')
            setSelfTalk('')
            setBody('')
            setSelectedEmotion('')
            setEmotionCustom('')
            setNotes('')
            return
          }
        }
        
        alert(`Failed to save entry: ${errorMessage}`)
        return
      }

      if (data && data.length > 0) {
        alert('Mood entry saved successfully!')
        setFocus('')
        setSelfTalk('')
        setBody('')
        setSelectedEmotion('')
        setEmotionCustom('')
        setNotes('')
      } else {
        console.warn('Insert succeeded but no data returned')
        alert('Entry saved but no confirmation received. Please refresh and check your entries.')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`An unexpected error occurred: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-[#1a1a2e]" style={backgroundStyle}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-[#a8e0eb] opacity-25 blur-[110px] animate-float" />
        <div
          className="absolute right-[-140px] top-1/2 h-[420px] w-[420px] rounded-full bg-[#f0c6d8] opacity-20 blur-[110px] animate-float"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="absolute bottom-[-140px] left-1/5 h-[360px] w-[360px] rounded-full bg-[#e8d4c8] opacity-25 blur-[110px] animate-float"
          style={{ animationDelay: '-10s' }}
        />
      </div>

      <div className={`relative z-10 flex flex-col gap-8 py-10 md:py-14 ${containerClasses}`}>
        <header className="flex items-center gap-4 rounded-[28px] bg-white/75 px-4 py-3 backdrop-blur-2xl md:px-6 md:py-4">
          <Link
            href="/home"
            className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-medium text-[#1a1a2e] transition hover:-translate-x-0.5 hover:bg-white"
            style={bodyFont}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex flex-col">
            <span className="text-[0.7rem] uppercase tracking-[0.35em] text-[#4a4a6a]" style={bodyFont}>
              Daily check-in
            </span>
            <h1 className="text-[1.8rem] font-semibold text-[#1a1a2e]" style={displayFont}>
              Mood Check-In
            </h1>
          </div>
        </header>

        <section className={glassCardClasses}>
          <p className="text-center text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-[#4a4a6a]" style={bodyFont}>
            Intuitive Mood Mapping
          </p>

          <div className="relative mt-6 rounded-[28px] border border-white/50 bg-white/40 p-4 shadow-[0_12px_50px_rgba(15,23,42,0.08)]">
            <div className="relative mb-5 px-4">
              <div className="relative w-full overflow-hidden rounded-3xl" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 8px 40px rgba(0,0,0,0.05)' }}>
                <GradientSelector
                  onMoodSelect={({ x, y }) => {
                    setMotivation(x)
                    setHappiness(y)
                  }}
                  showHeader={false}
                  showStats={false}
                  selectedMood={{ x: motivation, y: happiness }}
                  gradientClassName="aspect-square"
                />
              </div>
            </div>

            <p className="text-center text-base font-medium text-[#4a4a6a]" style={bodyFont}>
              Tap anywhere to capture your current state
            </p>

            <div className="mt-6 grid gap-6 border-t border-white/60 pt-6 text-center sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 px-6 py-4">
                <p className="text-sm uppercase tracking-[0.25em] text-[#4a4a6a]" style={bodyFont}>
                  Happiness
                </p>
                <p className="text-4xl font-semibold text-[#1a1a2e]" style={displayFont}>
                  {Math.round(happiness * 100)}%
                </p>
              </div>
              <div className="rounded-2xl bg-white/60 px-6 py-4">
                <p className="text-sm uppercase tracking-[0.25em] text-[#4a4a6a]" style={bodyFont}>
                  Motivation
                </p>
                <p className="text-4xl font-semibold text-[#1a1a2e]" style={displayFont}>
                  {Math.round(motivation * 100)}%
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${glassCardClasses} space-y-8`}>
          <div className="space-y-6">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#4a4a6a]" style={bodyFont}>
                Reflection prompts
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#1a1a2e]" style={displayFont}>
                Tune into your narrative
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-base font-semibold text-[#1a1a2e]" style={bodyFont}>
                  What are you focusing on?
                </label>
                <input
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  className={inputClasses}
                  placeholder="deadlines... a win... the drive ahead..."
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-semibold text-[#1a1a2e]" style={bodyFont}>
                  What are you telling yourself?
                </label>
                <input
                  value={selfTalk}
                  onChange={(event) => setSelfTalk(event.target.value)}
                  className={inputClasses}
                  placeholder="I can handle this... I'm behind... this will be good..."
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-semibold text-[#1a1a2e]" style={bodyFont}>
                  What&apos;s happening in your body?
                </label>
                <input
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className={inputClasses}
                  placeholder="tight shoulders... calm... buzzing energy..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block text-base font-semibold text-[#1a1a2e]" style={bodyFont}>
              Name the emotion you&apos;re feeling right now
            </label>
            <input
              type="text"
              value={emotionCustom}
              onChange={(event) => setEmotionCustom(event.target.value)}
              maxLength={80}
              className={inputClasses}
              placeholder="Or type your own emotion..."
            />
            <button
              type="button"
              onClick={() => setShowEmotionList((prev) => !prev)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c026d3]/30 bg-white/70 px-5 py-3 text-sm font-semibold text-[#c026d3] transition hover:bg-white"
              style={bodyFont}
            >
              {showEmotionList ? 'Hide common emotions' : 'Select from a common list of emotions'}
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition-transform ${showEmotionList ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showEmotionList && (
              <div className="space-y-5 rounded-3xl border border-white/60 bg-white/55 p-5">
                <p className="text-sm text-[#4a4a6a]" style={bodyFont}>
                  Before choosing from the list, try naming the emotion in your own words. This helps our AI learn your
                  vocabulary and personalize feedback for you.
                </p>
                <div className="group space-y-2 rounded-2xl border border-white/50 bg-white/40 p-4 transition duration-200 hover:bg-white/85 hover:border-white">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#4a4a6a]" style={bodyFont}>
                    Top 10 frequent emotions
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {primaryEmotions.map(emotion => renderEmotionChip(emotion))}
                  </div>
                </div>

                {emotionGroups.map((group) => (
                  <div
                    key={group.label}
                    className="group space-y-2 rounded-2xl border border-white/50 bg-white/35 p-4 transition duration-200 hover:bg-white/85 hover:border-white"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#4a4a6a]" style={bodyFont}>
                      {group.label}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {group.emotions.map(emotion => renderEmotionChip(emotion))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-[#1a1a2e]" style={bodyFont}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClasses} min-h-[120px] resize-y`}
              placeholder="Any additional thoughts or context..."
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-3xl py-5 text-lg font-semibold text-white shadow-lg shadow-[#c026d3]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c026d3]/40 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: 'linear-gradient(90deg, #f97316 0%, #c026d3 50%, #7c3aed 100%)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </section>

        <div className="mb-12 flex justify-center">
          <div
            className="flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-5 py-3 text-sm font-medium text-[#10b981]"
            style={bodyFont}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Private • Encrypted • Local-first design
          </div>
        </div>
      </div>
    </div>
  )
}

