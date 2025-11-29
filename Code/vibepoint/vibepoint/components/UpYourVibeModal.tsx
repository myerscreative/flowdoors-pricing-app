'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Recipe } from '@/types'

interface UpYourVibeModalProps {
  isOpen: boolean
  recipe: Recipe | null
  onClose: () => void
  onStartRecipe: (recipeId: string) => void
}

export function UpYourVibeModal({
  isOpen,
  recipe,
  onClose,
  onStartRecipe,
}: UpYourVibeModalProps) {
  const router = useRouter()

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

  if (!isOpen || !recipe) return null

  const handleStart = () => {
    onStartRecipe(recipe.id)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }
    return `${secs}s`
  }

  // Calculate success rate if available
  const successRate = recipe.times_used && recipe.success_count !== undefined
    ? Math.round((recipe.success_count / recipe.times_used) * 100)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3),0_10px_30px_rgba(199,21,133,0.15)] animate-fade-in-up"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-text-secondary transition-colors hover:bg-black/10 hover:text-text-primary"
          aria-label="Close modal"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="px-7 pb-8 pt-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-block text-4xl">✨</div>
            <h2 className="mb-2 font-display text-2xl font-semibold text-text-primary">
              Up Your Vibe?
            </h2>
            <p className="text-sm text-text-secondary">
              We noticed you&apos;re feeling low. Try this recipe to shift your state:
            </p>
          </div>

          {/* Recipe Card */}
          <div className="mb-6 rounded-2xl border-2 border-pro-primary/20 bg-white p-5 shadow-md">
            <h3 
              className="mb-2 font-serif text-xl font-semibold text-text-primary"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {recipe.title}
            </h3>
            
            <p className="mb-4 text-sm text-text-secondary leading-relaxed">
              {recipe.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(recipe.total_duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.recipe_steps?.length || 0} steps</span>
              </div>
              {successRate !== null && (
                <div className="ml-auto flex items-center gap-1 font-semibold text-pro-primary">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{successRate}% success</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleStart}
              className="w-full rounded-2xl bg-gradient-to-r from-pro-primary to-pro-secondary px-6 py-3 text-base font-semibold text-white shadow-[0_4px_20px_rgba(199,21,133,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Start Recipe Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-black/20 bg-transparent px-6 py-3 text-base font-semibold text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

