'use client'

import { useState, useEffect } from 'react'
import { MoodEntry } from '@/types'
import GradientSelector from '@/components/GradientSelector'

interface EditEntryModalProps {
  entry: MoodEntry
  onClose: () => void
  onSave: (updatedEntry: Partial<MoodEntry>) => Promise<void>
}

export default function EditEntryModal({ entry, onClose, onSave }: EditEntryModalProps) {
  const [moodX, setMoodX] = useState(entry.motivation_level)
  const [moodY, setMoodY] = useState(entry.happiness_level)
  const [focus, setFocus] = useState(entry.focus)
  const [selfTalk, setSelfTalk] = useState(entry.self_talk)
  const [physicalSensations, setPhysicalSensations] = useState(entry.physical_sensations)
  const [emotionName, setEmotionName] = useState(entry.emotion_name || '')
  const [notes, setNotes] = useState(entry.notes || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSave = async () => {
    if (!focus.trim() || !selfTalk.trim() || !physicalSensations.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const updatedEntry: Partial<MoodEntry> = {
        motivation_level: moodX,
        happiness_level: moodY,
        focus: focus.trim(),
        self_talk: selfTalk.trim(),
        physical_sensations: physicalSensations.trim(),
        notes: notes.trim() || null,
        emotion_name: emotionName.trim() || null,
      }

      await onSave(updatedEntry)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div 
      className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="modal-container relative z-10 w-full max-w-[650px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between border-b border-black/5 p-6 md:p-7">
          <h2 className="font-display text-2xl md:text-[1.75rem] font-semibold text-text-primary">
            Edit Mood Entry
          </h2>
          <button
            className="modal-close flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-2xl text-text-secondary transition-all hover:bg-black/5 hover:text-text-primary"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body p-6 md:p-7 space-y-6">
          {/* Error message */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Mood Gradient Selector */}
          <div className="edit-section space-y-3">
            <label className="block text-sm font-semibold text-text-primary">
              Mood
            </label>
            <div className="relative rounded-3xl border border-white/50 bg-white/40 p-4 shadow-sm">
              <GradientSelector
                onMoodSelect={({ x, y }) => {
                  setMoodX(x)
                  setMoodY(y)
                }}
                selectedMood={{ x: moodX, y: moodY }}
                showStats={true}
                showHeader={false}
                gradientClassName="aspect-square"
              />
            </div>
          </div>

          {/* Focus */}
          <div className="edit-section space-y-2">
            <label htmlFor="edit-focus" className="block text-sm font-semibold text-text-primary">
              What are you focusing on?
            </label>
            <textarea
              id="edit-focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              rows={3}
              className="edit-textarea w-full rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-[#c026d3] focus:bg-white/90 focus:ring-4 focus:ring-[#c026d3]/10 transition-all resize-y"
              placeholder="What thoughts or concerns have your attention?"
            />
          </div>

          {/* Self-talk */}
          <div className="edit-section space-y-2">
            <label htmlFor="edit-selftalk" className="block text-sm font-semibold text-text-primary">
              What are you telling yourself?
            </label>
            <textarea
              id="edit-selftalk"
              value={selfTalk}
              onChange={(e) => setSelfTalk(e.target.value)}
              rows={3}
              className="edit-textarea w-full rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-[#c026d3] focus:bg-white/90 focus:ring-4 focus:ring-[#c026d3]/10 transition-all resize-y"
              placeholder="What internal dialogue is running?"
            />
          </div>

          {/* Physical Sensations */}
          <div className="edit-section space-y-2">
            <label htmlFor="edit-physical" className="block text-sm font-semibold text-text-primary">
              What physical sensations are you experiencing?
            </label>
            <textarea
              id="edit-physical"
              value={physicalSensations}
              onChange={(e) => setPhysicalSensations(e.target.value)}
              rows={3}
              className="edit-textarea w-full rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-[#c026d3] focus:bg-white/90 focus:ring-4 focus:ring-[#c026d3]/10 transition-all resize-y"
              placeholder="Tight chest, relaxed shoulders, butterflies..."
            />
          </div>

          {/* Emotion Name */}
          <div className="edit-section space-y-2">
            <label htmlFor="edit-emotion" className="block text-sm font-semibold text-text-primary">
              Emotion (optional)
            </label>
            <input
              id="edit-emotion"
              type="text"
              value={emotionName}
              onChange={(e) => setEmotionName(e.target.value)}
              maxLength={80}
              className="edit-textarea w-full rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-[#c026d3] focus:bg-white/90 focus:ring-4 focus:ring-[#c026d3]/10 transition-all"
              placeholder="Name the emotion you're feeling..."
            />
          </div>

          {/* Notes */}
          <div className="edit-section space-y-2">
            <label htmlFor="edit-notes" className="block text-sm font-semibold text-text-primary">
              Notes (optional)
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="edit-textarea w-full rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-[#c026d3] focus:bg-white/90 focus:ring-4 focus:ring-[#c026d3]/10 transition-all resize-y"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions flex gap-3 justify-end border-t border-black/5 p-6 md:p-7">
          <button
            className="btn-secondary rounded-2xl border border-black/10 bg-white/70 px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-white/90 hover:-translate-y-0.5"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="btn-primary rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%)',
              boxShadow: '0 4px 20px rgba(192, 38, 211, 0.3)',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

