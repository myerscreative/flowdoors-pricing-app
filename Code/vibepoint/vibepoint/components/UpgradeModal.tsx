'use client'

import { useEffect, useState } from 'react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3),0_10px_30px_rgba(199,21,133,0.15)]"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-text-secondary transition-colors hover:bg-black/10 hover:text-text-primary"
          aria-label="Close upgrade modal"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="px-7 pb-8 pt-10 text-center">
          <div className="mb-4 inline-block text-4xl animate-float-icon">✨</div>
          <h2 className="mb-1 font-display text-2xl font-semibold text-text-primary">
            Upgrade to Pro
          </h2>
          <p className="mb-7 text-sm text-text-secondary">
            Unlock the full power of Vibepoint
          </p>

          {/* Feature list */}
          <div className="mb-7 space-y-3 text-left">
            <div className="flex items-start gap-3 border-b border-black/5 pb-3">
              <span className="mt-0.5 text-lg">🧪</span>
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-text-primary">
                  Mood Recipes
                </strong>
                <span className="block text-xs text-text-secondary">
                  Create custom routines that shift your emotional state.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-black/5 pb-3">
              <span className="mt-0.5 text-lg">📊</span>
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-text-primary">
                  Advanced Insights
                </strong>
                <span className="block text-xs text-text-secondary">
                  Deeper pattern analysis and predictions over time.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-black/5 pb-3">
              <span className="mt-0.5 text-lg">🎯</span>
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-text-primary">
                  Unlimited History
                </strong>
                <span className="block text-xs text-text-secondary">
                  Access your complete mood journey without limits.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-1">
              <span className="mt-0.5 text-lg">☁️</span>
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-text-primary">
                  Cloud Sync
                </strong>
                <span className="block text-xs text-text-secondary">
                  Your data stays in sync across all your devices.
                </span>
              </div>
            </div>
          </div>

          {/* Pricing options */}
          <div className="mb-5 grid grid-cols-2 gap-3 text-left text-sm">
            <button
              type="button"
              onClick={() => setSelectedPlan('yearly')}
              className={`relative rounded-2xl border-2 p-3 transition-colors ${
                selectedPlan === 'yearly'
                  ? 'border-pro-primary bg-gradient-to-b from-[#fff5f8] to-white'
                  : 'border-black/10 bg-white'
              }`}
            >
              <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-pro-primary to-pro-secondary px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-md">
                Most Popular
              </span>
              <div className="mt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-text-secondary">
                Yearly
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-text-primary">
                $39
                <span className="ml-1 align-middle text-xs font-normal text-text-secondary">
                  /year
                </span>
              </div>
              <div className="mt-0.5 text-[0.7rem] font-semibold text-emerald-600">
                Save 35%
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-2xl border-2 p-3 text-left transition-colors ${
                selectedPlan === 'monthly'
                  ? 'border-pro-primary bg-gradient-to-b from-[#fff5f8] to-white'
                  : 'border-black/10 bg-white'
              }`}
            >
              <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-secondary">
                Monthly
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-text-primary">
                $4.99
                <span className="ml-1 align-middle text-xs font-normal text-text-secondary">
                  /mo
                </span>
              </div>
              <div className="mt-0.5 text-[0.7rem] text-transparent">
                placeholder
              </div>
            </button>
          </div>

          <button
            type="button"
            className="w-full rounded-2xl bg-gradient-to-r from-pro-primary to-pro-secondary px-6 py-3 text-base font-semibold text-white shadow-[0_4px_20px_rgba(199,21,133,0.35)] transition-transform hover:-translate-y-0.5"
            onClick={onClose}
          >
            Start 7-Day Free Trial
          </button>
          <p className="mt-3 text-[0.75rem] text-text-secondary">
            Cancel anytime. No commitment.
          </p>
        </div>
      </div>
    </div>
  )
}


