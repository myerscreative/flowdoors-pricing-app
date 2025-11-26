'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GradientSelector from '@/components/GradientSelector'
import { MoodCoordinates } from '@/types'

export default function MoodPage() {
  const [coordinates, setCoordinates] = useState<MoodCoordinates | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('moodCoordinates')
    if (stored) {
      setCoordinates(JSON.parse(stored))
    }
  }, [])

  const handleMoodSelect = (coords: MoodCoordinates) => {
    setCoordinates(coords)
  }

  const handleContinue = () => {
    if (coordinates) {
      // Store coordinates in localStorage or context for the questions page
      localStorage.setItem('moodCoordinates', JSON.stringify(coordinates))
      router.push('/mood/questions')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <GradientSelector onMoodSelect={handleMoodSelect} selectedMood={coordinates || undefined} />

        <div className="mt-8 max-w-md mx-auto">
          <button
            onClick={handleContinue}
            disabled={!coordinates}
            className="w-full bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white py-4 px-6 rounded-3xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
          >
            Continue to Reflection
          </button>
        </div>
      </div>
    </div>
  )
}
