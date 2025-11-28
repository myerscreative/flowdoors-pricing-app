'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const router = useRouter()

  const goNext = useCallback(() => {
    if (currentSlide === 2) {
      // Last slide - mark onboarding as complete and go to home
      localStorage.setItem('onboardingCompleted', 'true')
      router.push('/home')
    } else {
      setCurrentSlide(prev => prev + 1)
    }
  }, [currentSlide, router])

  const goBack = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  const skipTutorial = useCallback(() => {
    localStorage.setItem('onboardingCompleted', 'true')
    router.push('/home')
  }, [router])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        goNext()
      } else if (e.key === 'ArrowLeft') {
        goBack()
      } else if (e.key === 'Escape') {
        skipTutorial()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [goNext, goBack, skipTutorial])

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goNext()
    }
    if (isRightSwipe) {
      goBack()
    }
  }

  return (
    <div className="onboarding-page">
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main container */}
      <div className="onboarding-container">
        {/* Progress indicators */}
        <div className="progress-dots">
          <span className={`dot ${currentSlide === 0 ? 'active' : ''}`}></span>
          <span className={`dot ${currentSlide === 1 ? 'active' : ''}`}></span>
          <span className={`dot ${currentSlide === 2 ? 'active' : ''}`}></span>
        </div>

        {/* Content card */}
        <div 
          className="onboarding-card"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide 1: Welcome */}
          {currentSlide === 0 && (
            <div className="slide" key="slide-1">
              <div className="slide-icon">🎨</div>
              <h1 className="slide-title">Welcome to Vibepoint</h1>
              <p className="slide-subtitle">Understand and control your emotional states</p>
              <p className="slide-body">
                Vibepoint helps you discover the patterns between what you focus on, 
                what you tell yourself, and how you feel physically. By tracking these 
                connections, you'll learn to create the moods you want.
              </p>
            </div>
          )}

          {/* Slide 2: How It Works */}
          {currentSlide === 1 && (
            <div className="slide" key="slide-2">
              <div className="slide-icon">🔄</div>
              <h1 className="slide-title">How It Works</h1>
              <p className="slide-subtitle">Simple, powerful mood tracking</p>
              <div className="slide-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p>Tap anywhere on the mood gradient to capture how you feel</p>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <p>Answer 3 reflective questions about your current experience</p>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <p>Over time, discover what creates your emotional patterns</p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: Privacy */}
          {currentSlide === 2 && (
            <div className="slide" key="slide-3">
              <div className="slide-icon">🔒</div>
              <h1 className="slide-title">Your Privacy Matters</h1>
              <p className="slide-subtitle">Safe space for honest self-reflection</p>
              <p className="slide-body">
                Your mood data stays yours. We use end-to-end encryption and never 
                share your personal insights with anyone. This is your private journey 
                of self-discovery.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="slide-navigation">
            {currentSlide > 0 && (
              <button className="nav-btn nav-btn-back" onClick={goBack}>
                Back
              </button>
            )}
            <button className="nav-btn nav-btn-next" onClick={goNext}>
              {currentSlide === 2 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        {/* Skip link */}
        <button className="skip-tutorial" onClick={skipTutorial}>
          Skip tutorial
        </button>
      </div>
    </div>
  )
}
