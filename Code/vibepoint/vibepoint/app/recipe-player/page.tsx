'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Recipe, RecipeStep } from '@/types'
import { RecipeFeedbackModal } from '@/components/RecipeFeedbackModal'
import { supabase } from '@/lib/supabase'

type Screen = 'pre-start' | 'player' | 'completion'

function RecipePlayerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')
  
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>('pre-start')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [recipeAttemptId, setRecipeAttemptId] = useState<string | null>(null)
  const [startingMood, setStartingMood] = useState<{ x: number; y: number } | null>(null)

  const loadStep = useCallback((index: number) => {
    if (!recipe?.recipe_steps) return
    
    setCurrentStepIndex(index)
    setTimeRemaining(recipe.recipe_steps[index].duration)
    setIsPlaying(false)
  }, [recipe])

  const completeRecipe = useCallback(async () => {
    setIsPlaying(false)
    
    // Try to find or create recipe attempt record
    if (recipe && recipeAttemptId) {
      // Attempt already exists (from "Up Your Vibe" flow)
      setShowFeedback(true)
    } else if (recipe) {
      // Create new attempt record
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: attemptData, error: attemptError } = await supabase
            .from('recipe_attempts')
            .insert({
              user_id: user.id,
              recipe_id: recipe.id,
              completed: false,
            })
            .select()
            .single()

          if (!attemptError && attemptData) {
            setRecipeAttemptId(attemptData.id)
          }
        }
      } catch (err) {
        console.error('Error creating recipe attempt:', err)
      }
      
      setShowFeedback(true)
    } else {
      setScreen('completion')
    }
  }, [recipe, recipeAttemptId])

  const fetchRecipe = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`)
      const data = await res.json()
      
      if (res.ok && data.recipe) {
        setRecipe(data.recipe)
      } else {
        console.error('Failed to load recipe')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (recipeId) {
      fetchRecipe(recipeId)
    } else {
      setLoading(false)
    }
  }, [recipeId, fetchRecipe])

  useEffect(() => {
    if (!isPlaying || screen !== 'player') return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next step
          if (recipe && currentStepIndex < (recipe.recipe_steps?.length || 0) - 1) {
            loadStep(currentStepIndex + 1)
          } else {
            completeRecipe()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, currentStepIndex, recipe, screen, loadStep, completeRecipe])


  const startRecipe = useCallback(async () => {
    if (!recipe?.recipe_steps || recipe.recipe_steps.length === 0) return
    
    // Check if this recipe was triggered from a mood entry (Up Your Vibe)
    // The attempt ID would be in URL params or we'd create one
    const triggeredEntryId = searchParams.get('triggeredEntryId')
    
    if (triggeredEntryId && !recipeAttemptId) {
      // Find the attempt record created by the suggestion
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: attemptData } = await supabase
            .from('recipe_attempts')
            .select('id, starting_mood_x, starting_mood_y')
            .eq('user_id', user.id)
            .eq('recipe_id', recipe.id)
            .eq('triggered_after_entry_id', triggeredEntryId)
            .eq('completed', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (attemptData) {
            setRecipeAttemptId(attemptData.id)
            if (attemptData.starting_mood_x !== null && attemptData.starting_mood_y !== null) {
              setStartingMood({
                x: attemptData.starting_mood_x,
                y: attemptData.starting_mood_y,
              })
            }
          }
        }
      } catch (err) {
        console.error('Error loading recipe attempt:', err)
      }
    }
    
    setScreen('player')
    loadStep(0)
  }, [recipe, loadStep, searchParams, recipeAttemptId])

  const nextStep = useCallback(() => {
    if (!recipe?.recipe_steps) return
    
    setCurrentStepIndex(prev => {
      if (recipe.recipe_steps && prev < recipe.recipe_steps.length - 1) {
        const newIndex = prev + 1
        setTimeRemaining(recipe.recipe_steps[newIndex].duration)
        setIsPlaying(false)
        return newIndex
      } else {
        completeRecipe()
        return prev
      }
    })
  }, [recipe, completeRecipe])

  const handleExit = useCallback(() => {
    setIsPlaying(prev => {
      if (prev) {
        setShowExitConfirm(true)
      } else {
        router.push('/recipes')
      }
      return prev
    })
  }, [router])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const previousStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev > 0) {
        const newIndex = prev - 1
        if (recipe?.recipe_steps) {
          setTimeRemaining(recipe.recipe_steps[newIndex].duration)
          setIsPlaying(false)
        }
        return newIndex
      }
      return prev
    })
  }, [recipe])

  // Keyboard shortcuts
  useEffect(() => {
    if (screen !== 'player') return

    function handleKeyPress(e: KeyboardEvent) {
      switch(e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previousStep()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextStep()
          break
        case 'Escape':
          e.preventDefault()
          handleExit()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [screen, togglePlayPause, previousStep, nextStep, handleExit])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }
    return `${secs}s`
  }

  if (loading) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center"
        style={{ 
          background: 'linear-gradient(45deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center text-white"
        style={{ 
          background: 'linear-gradient(45deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-center">
          <h2 className="mb-4 font-serif text-2xl font-semibold">Recipe not found</h2>
          <Link
            href="/recipes"
            className="inline-block rounded-[24px] bg-white px-6 py-3 text-sm font-semibold text-[#1a1a2e]"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    )
  }

  const steps = recipe.recipe_steps || []
  const currentStep = steps[currentStepIndex]
  const radius = 130
  const circumference = 2 * Math.PI * radius // ~817
  const progress = currentStep ? (currentStep.duration - timeRemaining) / currentStep.duration : 0
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div 
      className="relative min-h-screen text-white"
      style={{ 
        background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Pre-Start Screen */}
      {screen === 'pre-start' && (
        <div className="relative z-10 mx-auto max-w-[600px] px-5 py-8">
          <Link
            href="/recipes"
            className="mb-8 inline-flex items-center gap-2 rounded-[24px] border-2 border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </Link>

          <div className="space-y-8 text-center">
            <h1 
              className="font-serif text-[36px] font-semibold text-white"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {recipe.title}
            </h1>

            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="mb-1 font-serif text-2xl font-semibold">{formatDuration(recipe.total_duration)}</div>
                <div className="text-sm text-white/80">Duration</div>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="mb-1 font-serif text-2xl font-semibold">{steps.length}</div>
                <div className="text-sm text-white/80">Steps</div>
              </div>
            </div>

            <p 
              className="mx-auto max-w-[480px] text-lg leading-relaxed text-white/90"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {recipe.description}
            </p>

            <div className="mx-auto max-w-[480px] space-y-3 rounded-[20px] bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-serif text-xl font-semibold">Steps</h3>
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-4 text-left">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 font-semibold">{step.title}</div>
                    <div className="text-sm text-white/80">{step.description}</div>
                    <div className="mt-1 text-xs text-white/60">{formatDuration(step.duration)}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startRecipe}
              className="mx-auto rounded-[24px] px-8 py-4 text-lg font-semibold text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
              }}
            >
              Start Recipe
            </button>
          </div>
        </div>
      )}

      {/* Player Screen */}
      {screen === 'player' && currentStep && (
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-6">
            <button
              onClick={handleExit}
              className="rounded-[24px] border-2 border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Exit
            </button>
            <div className="text-sm font-medium text-white/80">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            <div className="w-20"></div> {/* Spacer */}
          </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
            {/* Step Title */}
            <h2 
              className="mb-6 text-center font-serif text-[32px] font-semibold text-white"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {currentStep.title}
            </h2>

            {/* Step Description */}
            <p 
              className="mb-12 max-w-[480px] text-center text-lg leading-relaxed text-white/90"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {currentStep.description}
            </p>

            {/* Circular Timer */}
            <div className="relative mb-12 flex h-[280px] w-[280px] items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 280 280">
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#F97316" />
                  </linearGradient>
                </defs>
                
                {/* Background circle */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.1)"
                  strokeWidth="8"
                />
                
                {/* Progress circle */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ 
                    transition: 'stroke-dashoffset 1s linear',
                  }}
                />
              </svg>
              
              {/* Time Display */}
              <div className="absolute flex flex-col items-center justify-center">
                <div 
                  className="font-serif text-[56px] font-semibold leading-none"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mb-8 flex items-center justify-center gap-6">
              <button
                onClick={previousStep}
                disabled={currentStepIndex === 0}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={togglePlayPause}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                }}
              >
                {isPlaying ? (
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={nextStep}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Step Navigation Dots */}
            <div className="flex items-center justify-center gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'h-2 w-6 bg-purple-300'
                      : 'h-2 w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </main>
        </div>
      )}

      {/* Completion Screen */}
      {screen === 'completion' && (
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center px-5 py-8 text-center">
          <div className="mb-8 flex h-[120px] w-[120px] items-center justify-center rounded-full text-6xl shadow-[0_4px_16px_rgba(168,85,247,0.3)]" style={{
            background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
          }}>
            ✓
          </div>
          
          <h1 
            className="mb-4 font-serif text-[36px] font-semibold text-white"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Recipe Complete!
          </h1>
          
          <p 
            className="mb-8 max-w-[480px] text-lg text-white/90"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            Great job taking a moment to shift your state. How are you feeling now?
          </p>
          
          <div className="flex w-full max-w-[400px] flex-col gap-4">
            <Link
              href="/mood"
              className="rounded-[24px] px-6 py-4 text-base font-semibold text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
              }}
              onClick={() => {
                // Store attempt ID in localStorage so we can link the follow-up entry
                if (recipeAttemptId) {
                  localStorage.setItem('recipeFeedbackAttemptId', recipeAttemptId)
                  if (startingMood) {
                    localStorage.setItem('recipeFeedbackStartingMood', JSON.stringify(startingMood))
                  }
                }
              }}
            >
              Log Your Mood
            </Link>
            
            <button
              onClick={() => {
                setScreen('player')
                loadStep(0)
              }}
              className="rounded-[24px] border-2 border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Do It Again
            </button>
            
            <Link
              href="/recipes"
              className="rounded-[24px] border-2 border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Back to Recipes
            </Link>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div 
            className="relative z-10 w-full max-w-[400px] rounded-[28px] bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-serif text-xl font-semibold text-[#1a1a2e]">
              Exit Recipe?
            </h3>
            <p className="mb-6 text-sm text-[#4a4a6a]">
              Are you sure you want to exit? Your progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="rounded-[24px] border-2 border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-50"
                onClick={() => setShowExitConfirm(false)}
              >
                Continue
              </button>
              <button
                className="rounded-[24px] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)]"
                style={{
                  background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                }}
                onClick={() => router.push('/recipes')}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <RecipeFeedbackModal
        isOpen={showFeedback}
        recipe={recipe}
        attemptId={recipeAttemptId}
        onClose={() => {
          setShowFeedback(false)
          setScreen('completion')
        }}
        onSubmit={async (feedback) => {
          try {
            // Get follow-up entry if user just logged a mood
            const followUpAttemptId = localStorage.getItem('recipeFeedbackAttemptId')
            let followUpEntryId: string | null = null
            let endingMoodX: number | null = null
            let endingMoodY: number | null = null

            if (followUpAttemptId === recipeAttemptId) {
              // Try to get the most recent mood entry as follow-up
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                const { data: recentEntry } = await supabase
                  .from('mood_entries')
                  .select('id, happiness_level, motivation_level')
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single()

                if (recentEntry) {
                  followUpEntryId = recentEntry.id
                  endingMoodX = recentEntry.motivation_level
                  endingMoodY = recentEntry.happiness_level
                }
              }
              
              localStorage.removeItem('recipeFeedbackAttemptId')
              localStorage.removeItem('recipeFeedbackStartingMood')
            }

            const response = await fetch('/api/recipes/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attemptId: recipeAttemptId,
                rating: feedback.rating,
                mostHelpfulIngredient: feedback.mostHelpfulIngredient,
                notes: feedback.notes,
                followUpEntryId,
                endingMoodX,
                endingMoodY,
              }),
            })

            if (response.ok) {
              setShowFeedback(false)
              setScreen('completion')
            } else {
              console.error('Failed to submit feedback')
              // Still close modal and show completion
              setShowFeedback(false)
              setScreen('completion')
            }
          } catch (err) {
            console.error('Error submitting feedback:', err)
            // Still close modal and show completion
            setShowFeedback(false)
            setScreen('completion')
          }
        }}
      />
    </div>
  )
}

export default function RecipePlayerPageWrapper() {
  return (
    <Suspense fallback={
      <div 
        className="flex min-h-screen items-center justify-center"
        style={{ 
          background: 'linear-gradient(45deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
      </div>
    }>
      <RecipePlayerPage />
    </Suspense>
  )
}
