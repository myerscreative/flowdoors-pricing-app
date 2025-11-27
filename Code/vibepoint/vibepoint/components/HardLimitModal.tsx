'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HardLimitModalProps {
  isOpen: boolean
  minutesUntilNext: number
  onDismiss: () => void
}

export function HardLimitModal({
  isOpen,
  minutesUntilNext,
  onDismiss,
}: HardLimitModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onDismiss()
        router.push('/home')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onDismiss, router])

  const handleDismiss = () => {
    onDismiss()
    router.push('/home')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={handleDismiss}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3),0_10px_30px_rgba(199,21,133,0.15)] animate-fade-in-up"
        onClick={event => event.stopPropagation()}
      >
        <div className="px-7 pb-8 pt-10 text-center">
          <h3 className="mb-3 font-display text-2xl font-semibold text-text-primary">
            You&apos;ve logged 3 rapid entries today
          </h3>
          <p className="mb-7 text-sm text-text-secondary leading-relaxed">
            For the clearest insights, try spacing entries at least 30 minutes apart.{' '}
            You can log again in {minutesUntilNext} {minutesUntilNext === 1 ? 'minute' : 'minutes'}.
          </p>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-pro-primary to-pro-secondary text-white font-semibold shadow-[0_4px_20px_rgba(199,21,133,0.35)] transition-transform hover:-translate-y-0.5"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}

