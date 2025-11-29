'use client'

import { useState, useEffect } from 'react'
import { Recipe } from '@/types'

interface RecipeFeedbackModalProps {
  isOpen: boolean
  recipe: Recipe | null
  attemptId: string | null
  onClose: () => void
  onSubmit: (feedback: {
    rating: number
    mostHelpfulIngredient: 'focus' | 'self_talk' | 'physiology' | 'combination'
    notes?: string
  }) => void
}

export function RecipeFeedbackModal({
  isOpen,
  recipe,
  attemptId,
  onClose,
  onSubmit,
}: RecipeFeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [mostHelpful, setMostHelpful] = useState<'focus' | 'self_talk' | 'physiology' | 'combination' | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setRating(0)
      setMostHelpful('')
      setNotes('')
      setIsSubmitting(false)
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async () => {
    if (rating === 0 || !mostHelpful) {
      return
    }

    setIsSubmitting(true)
    try {
      onSubmit({
        rating,
        mostHelpfulIngredient: mostHelpful as 'focus' | 'self_talk' | 'physiology' | 'combination',
        notes: notes.trim() || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !recipe) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3),0_10px_30px_rgba(199,21,133,0.15)] animate-fade-in-up"
        onClick={event => event.stopPropagation()}
      >
        <div className="px-7 pb-8 pt-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-block text-4xl">⭐</div>
            <h2 className="mb-2 font-display text-2xl font-semibold text-text-primary">
              How did it work?
            </h2>
            <p className="text-sm text-text-secondary">
              Help us improve this recipe by sharing your experience
            </p>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-text-primary">
              Effectiveness Rating *
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-center text-xs text-text-secondary">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Great!'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Okay'}
                {rating === 1 && 'Not helpful'}
              </p>
            )}
          </div>

          {/* Most Helpful Ingredient */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-text-primary">
              What helped most? *
            </label>
            <div className="space-y-2">
              {[
                { value: 'focus', label: 'Focus Shift', desc: 'Changing what you focused on' },
                { value: 'self_talk', label: 'Self-Talk', desc: 'The words you told yourself' },
                { value: 'physiology', label: 'Physical Actions', desc: 'Movement, breathing, etc.' },
                { value: 'combination', label: 'The Combination', desc: 'All working together' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMostHelpful(option.value as typeof mostHelpful)}
                  className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                    mostHelpful === option.value
                      ? 'border-pro-primary bg-gradient-to-b from-[#fff5f8] to-white'
                      : 'border-black/10 bg-white hover:border-black/20'
                  }`}
                >
                  <div className="font-semibold text-text-primary">{option.label}</div>
                  <div className="text-xs text-text-secondary">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else you'd like to share?"
              rows={3}
              className="w-full rounded-xl border-2 border-black/10 px-4 py-3 text-sm text-text-primary focus:border-pro-primary focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || !mostHelpful || isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-pro-primary to-pro-secondary px-6 py-3 text-base font-semibold text-white shadow-[0_4px_20px_rgba(199,21,133,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-black/20 bg-transparent px-6 py-3 text-base font-semibold text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

