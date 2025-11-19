'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GradientSelector from '@/components/GradientSelector'
import { MoodCoordinates } from '@/types'

export default function MoodPage() {
  const [coordinates, setCoordinates] = useState<MoodCoordinates | null>(null)
  const router = useRouter()

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <GradientSelector onMoodSelect={handleMoodSelect} />

        <div className="mt-8">
          <button
            onClick={handleContinue}
            disabled={!coordinates}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
