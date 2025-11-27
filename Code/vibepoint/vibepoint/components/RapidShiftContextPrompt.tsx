'use client'

import { useState, useEffect } from 'react'

interface RapidShiftContextPromptProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (context: string) => void
}

export function RapidShiftContextPrompt({
  isOpen,
  onCancel,
  onSubmit,
}: RapidShiftContextPromptProps) {
  const [context, setContext] = useState('')

  useEffect(() => {
    if (!isOpen) {
      // Reset context when modal closes
      setContext('')
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  const handleSubmit = () => {
    onSubmit(context.trim())
    setContext('')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onCancel}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3),0_10px_30px_rgba(199,21,133,0.15)] animate-fade-in-up"
        onClick={event => event.stopPropagation()}
      >
        <div className="px-7 pb-8 pt-10">
          <h3 className="mb-3 font-display text-2xl font-semibold text-text-primary text-center">
            Something significant just happened?
          </h3>
          <p className="mb-6 text-sm text-text-secondary text-center leading-relaxed">
            This will be marked as a rapid shift entry.
          </p>

          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="What happened? (optional)"
            rows={4}
            className="w-full px-4 py-3 mb-6 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pro-primary focus:border-transparent bg-transparent resize-y font-sans text-sm"
            autoFocus
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-2xl border border-black/20 bg-transparent font-semibold text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pro-primary to-pro-secondary text-white font-semibold shadow-[0_4px_20px_rgba(199,21,133,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

