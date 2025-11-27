'use client'

import { useEffect } from 'react'

interface ThrottleWarningModalProps {
  isOpen: boolean
  minutesSince: number
  overridesLeft: number
  onWait: () => void
  onOverride: () => void
}

export function ThrottleWarningModal({
  isOpen,
  minutesSince,
  overridesLeft,
  onWait,
  onOverride,
}: ThrottleWarningModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onWait()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onWait])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onWait}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3),0_10px_30px_rgba(199,21,133,0.15)] animate-fade-in-up"
        onClick={event => event.stopPropagation()}
      >
        <div className="px-7 pb-8 pt-10 text-center">
          <h3 className="mb-3 font-display text-2xl font-semibold text-text-primary">
            You logged a mood {minutesSince} minutes ago
          </h3>
          <p className="mb-7 text-sm text-text-secondary leading-relaxed">
            For clearer patterns, we recommend waiting at least 30 minutes between entries.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onWait}
              className="px-6 py-3 rounded-2xl border border-black/20 bg-transparent font-semibold text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
            >
              Wait
            </button>
            <button
              type="button"
              onClick={onOverride}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pro-primary to-pro-secondary text-white font-semibold shadow-[0_4px_20px_rgba(199,21,133,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Log Anyway ({overridesLeft} {overridesLeft === 1 ? 'override' : 'overrides'} left today)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

