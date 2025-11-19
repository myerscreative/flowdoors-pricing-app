'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const slides = [
  {
    title: "Welcome to Vibepoint",
    subtitle: "Understand and control your emotional states",
    content: "Vibepoint helps you discover the patterns between what you focus on, what you tell yourself, and how you feel physically. By tracking these connections, you'll learn to create the moods you want.",
    visual: "🎨"
  },
  {
    title: "How It Works",
    subtitle: "Simple, powerful mood tracking",
    content: "1. Tap anywhere on the mood gradient to capture how you feel\n2. Answer 3 reflective questions about your current experience\n3. Over time, discover what creates your emotional patterns",
    visual: "🔄"
  },
  {
    title: "Your Privacy Matters",
    subtitle: "Safe space for honest self-reflection",
    content: "Your mood data stays yours. We use end-to-end encryption and never share your personal insights with anyone. This is your private journey of self-discovery.",
    visual: "🔒"
  }
]

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // Complete onboarding
      completeOnboarding()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const completeOnboarding = async () => {
    try {
      // Mark onboarding as complete (you could store this in user profile)
      localStorage.setItem('onboardingCompleted', 'true')
      router.push('/home')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      router.push('/home')
    }
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                index === currentSlide ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">{currentSlideData.visual}</div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentSlideData.title}
          </h1>

          <h2 className="text-lg text-indigo-600 font-medium mb-4">
            {currentSlideData.subtitle}
          </h2>

          <p className="text-gray-600 leading-relaxed mb-8">
            {currentSlideData.content}
          </p>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-6 py-3 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 transition-colors"
            >
              Back
            </button>

            <button
              onClick={nextSlide}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Link
            href="/home"
            className="text-gray-500 hover:text-gray-700 text-sm"
            onClick={() => localStorage.setItem('onboardingCompleted', 'true')}
          >
            Skip tutorial
          </Link>
        </div>
      </div>
    </div>
  )
}
