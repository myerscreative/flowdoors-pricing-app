'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GradientSelector from '@/components/GradientSelector'

interface MoodCoordinates {
  x: number // motivation (0-1)
  y: number // happiness (0-1)
}

export default function LandingPage() {
  const [currentMood, setCurrentMood] = useState<MoodCoordinates | null>(null)
  const [showHighlight, setShowHighlight] = useState(false)

  const handleMoodSelect = (coordinates: MoodCoordinates) => {
    setCurrentMood(coordinates)
  }

  const getMoodDescription = (coordinates: MoodCoordinates) => {
    const { x: motivation, y: happiness } = coordinates

    // More granular and accurate mood descriptions (16 states)
    if (happiness > 0.75) {
      if (motivation < 0.25) return 'Peaceful & Serene'
      if (motivation < 0.5) return 'Content & Relaxed'
      if (motivation < 0.75) return 'Upbeat & Engaged'
      return 'Energized & Joyful'
    } else if (happiness > 0.5) {
      if (motivation < 0.25) return 'Calm & At Ease'
      if (motivation < 0.5) return 'Balanced & Steady'
      if (motivation < 0.75) return 'Alert & Focused'
      return 'Motivated & Optimistic'
    } else if (happiness > 0.25) {
      if (motivation < 0.25) return 'Withdrawn & Low Energy'
      if (motivation < 0.5) return 'Tired & Subdued'
      if (motivation < 0.75) return 'Tense & Restless'
      return 'Frustrated & Agitated'
    } else {
      if (motivation < 0.25) return 'Drained & Depleted'
      if (motivation < 0.5) return 'Sad & Heavy'
      if (motivation < 0.75) return 'Anxious & On Edge'
      return 'Angry & Driven'
    }
  }

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo')
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setShowHighlight(true)
      setTimeout(() => setShowHighlight(false), 1000)
    }
  }

  // Initialize gradient canvas and smooth scroll
  useEffect(() => {
    // Four corner colors - EXACT from app
    const corners = {
      topLeft: { r: 180, g: 220, b: 255 },     // Soft, airy sky blue - Happy + Unmotivated
      topRight: { r: 255, g: 240, b: 50 },     // Bright golden yellow - Happy + Motivated
      bottomLeft: { r: 40, g: 35, b: 45 },     // Dark grey-purple - Unhappy + Unmotivated
      bottomRight: { r: 255, g: 20, b: 0 },    // Intense red - Unhappy + Motivated
    }

    // Bilinear interpolation between four corners
    function bilinearInterpolate(x: number, y: number, c00: any, c10: any, c01: any, c11: any) {
      const r = Math.round(
        c00.r * (1 - x) * (1 - y) +
        c10.r * x * (1 - y) +
        c01.r * (1 - x) * y +
        c11.r * x * y
      )
      const g = Math.round(
        c00.g * (1 - x) * (1 - y) +
        c10.g * x * (1 - y) +
        c01.g * (1 - x) * y +
        c11.g * x * y
      )
      const b = Math.round(
        c00.b * (1 - x) * (1 - y) +
        c10.b * x * (1 - y) +
        c01.b * (1 - x) * y +
        c11.b * x * y
      )
      return { r, g, b }
    }

    function drawGradient() {
      const gradientDemo = document.getElementById('gradientDemo') as HTMLDivElement
      const gradientCanvas = document.getElementById('gradientCanvas') as HTMLCanvasElement
      
      if (!gradientCanvas || !gradientDemo) {
        // Retry if elements aren't ready
        requestAnimationFrame(drawGradient)
        return
      }

      const ctx = gradientCanvas.getContext('2d', { willReadFrequently: false })
      if (!ctx) return

      // Get actual display size
      const displayWidth = gradientDemo.clientWidth
      const displayHeight = gradientDemo.clientHeight

      // Don't draw if container has no dimensions
      if (displayWidth === 0 || displayHeight === 0) {
        requestAnimationFrame(drawGradient)
        return
      }

      // Set canvas size to match display size (1:1 pixels)
      gradientCanvas.width = displayWidth
      gradientCanvas.height = displayHeight

      const width = displayWidth
      const height = displayHeight

      // Create image data
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      // Fill every pixel with bilinearly interpolated color
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const x = px / (width - 1)
          const y = py / (height - 1)

          const color = bilinearInterpolate(
            x,
            y,
            corners.topLeft,
            corners.topRight,
            corners.bottomLeft,
            corners.bottomRight
          )

          const index = (py * width + px) * 4
          data[index] = color.r
          data[index + 1] = color.g
          data[index + 2] = color.b
          data[index + 3] = 255
        }
      }

      // Put the image data directly on the canvas
      ctx.putImageData(imageData, 0, 0)
    }

    // Initial draw - use multiple attempts to ensure it renders
    const attemptDraw = () => {
      const gradientDemo = document.getElementById('gradientDemo')
      const gradientCanvas = document.getElementById('gradientCanvas')
      
      if (gradientDemo && gradientCanvas && gradientDemo.clientWidth > 0) {
        drawGradient()
      } else {
        // Retry if elements aren't ready
        setTimeout(attemptDraw, 50)
      }
    }

    // Start attempting to draw
    setTimeout(attemptDraw, 100)
    
    // Also try on next frame
    requestAnimationFrame(() => {
      attemptDraw()
    })

    // Redraw on window resize with debouncing
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        drawGradient()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    function handleGradientClick(e: MouseEvent) {
      const gradientDemo = document.getElementById('gradientDemo') as HTMLDivElement
      const moodMarker = document.getElementById('moodMarker') as HTMLDivElement
      
      if (!gradientDemo) return
      
      const rect = gradientDemo.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      const x = Math.max(0, Math.min(1, clickX / rect.width))
      const y = Math.max(0, Math.min(1, 1 - (clickY / rect.height))) // Invert so top = happy

      const percentX = x * 100
      const percentY = clickY / rect.height * 100

      if (moodMarker) {
        moodMarker.style.left = `${percentX}%`
        moodMarker.style.top = `${percentY}%`
      }

      handleMoodSelect({ x, y })
    }

    function handleTouchStart(e: TouchEvent) {
      e.preventDefault()
      const gradientDemo = document.getElementById('gradientDemo') as HTMLDivElement
      const moodMarker = document.getElementById('moodMarker') as HTMLDivElement
      
      if (!gradientDemo) return
      
      const touch = e.touches[0]
      const rect = gradientDemo.getBoundingClientRect()
      const clickX = touch.clientX - rect.left
      const clickY = touch.clientY - rect.top

      const x = Math.max(0, Math.min(1, clickX / rect.width))
      const y = Math.max(0, Math.min(1, 1 - (clickY / rect.height)))

      const percentX = x * 100
      const percentY = clickY / rect.height * 100

      if (moodMarker) {
        moodMarker.style.left = `${percentX}%`
        moodMarker.style.top = `${percentY}%`
      }

      handleMoodSelect({ x, y })
    }

    // Wait for elements to be available before adding event listeners
    const setupEventListeners = () => {
      const gradientDemo = document.getElementById('gradientDemo')
      if (gradientDemo) {
        gradientDemo.addEventListener('click', handleGradientClick)
        gradientDemo.addEventListener('touchstart', handleTouchStart)
        return true
      }
      return false
    }

    // Try to set up event listeners, retry if needed
    if (!setupEventListeners()) {
      setTimeout(() => {
        setupEventListeners()
      }, 200)
    }

    // Smooth scroll for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A') {
        const href = target.getAttribute('href')
        if (href && href.startsWith('#') && href !== '#') {
          e.preventDefault()
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
            // Trigger the highlight animation
            if (href === '#demo') {
              setShowHighlight(true)
              setTimeout(() => setShowHighlight(false), 1000)
            }
          }
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
      document.removeEventListener('click', handleAnchorClick)
      const gradientDemo = document.getElementById('gradientDemo')
      if (gradientDemo) {
        gradientDemo.removeEventListener('click', handleGradientClick)
        gradientDemo.removeEventListener('touchstart', handleTouchStart)
      }
    }
  }, [handleMoodSelect])

  const moodLabel = currentMood ? `${getMoodDescription(currentMood)} • Happiness: ${Math.round(currentMood.y * 100)}% • Motivation: ${Math.round(currentMood.x * 100)}%` : 'Tap anywhere on the gradient to map your mood'

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="hero-bg" />

      <div className="relative z-1">
        {/* Header */}
        <header className="container">
          <div className="font-playfair font-bold text-2xl bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] bg-clip-text text-transparent">
            VibePoint
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-black/6 rounded-3xl text-[var(--color-trust)] font-medium text-sm shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Privacy First
          </div>
        </header>

        {/* Hero Section */}
        <section className="container hero">
          <h1 className="font-playfair font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 animate-fadeInUp">
            Navigate Your Emotions.<br/>
            <span className="bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] bg-clip-text text-transparent">
              Discover Your Patterns.
            </span>
          </h1>
          <p className="text-[var(--color-text-soft)] text-lg sm:text-xl max-w-2xl mx-auto mb-12 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Track your focus, self-talk, and physical sensations—the three ingredients that create your emotional states—and discover the patterns behind what you feel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white px-8 py-4 rounded-3xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
            >
              Start Free Trial
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-sm font-semibold ml-2 border border-white/30">
                No card required
              </span>
            </Link>
            <button
              onClick={scrollToDemo}
              className="bg-[var(--color-surface)] text-[var(--color-text)] px-8 py-4 rounded-3xl font-semibold text-lg border border-black/10 shadow-sm hover:bg-black/5 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
            >
              🎨 Try Interactive Demo
            </button>
          </div>

          {/* Gradient Preview */}
          <div
            id="demo"
            className={`max-w-4xl mx-auto p-6 sm:p-8 bg-[var(--color-surface)] rounded-3xl shadow-lg border border-black/4 transition-all duration-1000 scroll-mt-8 ${showHighlight ? 'animate-highlightPulse' : ''} animate-fadeInUp`}
            style={{ animationDelay: '0.6s' }}
          >
            <div className="text-center text-[var(--color-text-soft)] font-medium text-sm uppercase tracking-wider mb-6">
              Intuitive Mood Mapping
            </div>
            <div className="relative w-full max-w-[600px] mx-auto mt-8">
              <div className="gradient-demo relative" id="gradientDemo" style={{ margin: '0 auto' }}>
                {/* Axis labels positioned inside the gradient */}
                <div className="axis-label absolute top-1/2 whitespace-nowrap" style={{ left: '16px', transformOrigin: 'left center', transform: 'translateY(-50%) rotate(90deg) translateX(-50%)' }}>
                  Unmotivated
                </div>
                <div className="axis-label absolute top-1/2 whitespace-nowrap" style={{ right: '16px', transformOrigin: 'right center', transform: 'translateY(-50%) rotate(-90deg) translateX(50%)' }}>
                  Motivated
                </div>
                <div className="axis-label absolute left-1/2 -translate-x-1/2" style={{ bottom: '16px' }}>
                  Unhappy
                </div>
                <div className="axis-label absolute left-1/2 -translate-x-1/2" style={{ top: '16px' }}>
                  Happy
                </div>
                <canvas
                  className="gradient-canvas"
                  id="gradientCanvas"
                  width={600}
                  height={600}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                ></canvas>
                <div className="mood-marker" id="moodMarker" style={{left: '50%', top: '50%'}}></div>
              </div>
            </div>

            <div className="text-center text-lg font-semibold text-[var(--color-text)] mt-12" id="moodLabel">
              Tap anywhere to capture your current state
            </div>
            <p className="text-[var(--color-text-soft)] text-sm opacity-80 max-w-md mx-auto mt-4 leading-relaxed">
              VibePoint doesn&apos;t tell you what emotion you&apos;re feeling—you define your own experience. The gradient helps you capture your coordinates; the insights come from your own patterns.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[var(--color-surface)] p-8 rounded-3xl shadow-sm border border-black/4 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg">
                <div className="text-5xl mb-6">🎨</div>
                <h3 className="font-playfair font-bold text-xl mb-4">Intuitive Interface</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  Tap anywhere on a gradient to capture your exact emotional state. No confusing scales, no forced labels—just pure, intuitive expression across two dimensions: how you feel and your energy level. Use your own words to describe how you feel—VibePoint learns your emotional vocabulary for personalized insights.
                </p>
              </div>

              <div className="bg-[var(--color-surface)] p-8 rounded-3xl shadow-sm border border-black/4 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg">
                <div className="text-5xl mb-6">🧠</div>
                <h3 className="font-playfair font-bold text-xl mb-4">Pattern Recognition</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  Your personal insights engine reveals how your thoughts, focus, and physical states create your moods. All analysis happens locally on your device.
                </p>
              </div>

              <div className="bg-[var(--color-surface)] p-8 rounded-3xl shadow-sm border border-black/4 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg">
                <div className="text-5xl mb-6">🔒</div>
                <h3 className="font-playfair font-bold text-xl mb-4">Private & Secure</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  Your mood data stays yours. End-to-end encryption and privacy-first design mean your emotional journey is completely confidential.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <div className="container text-center">
            <h2 className="font-playfair font-bold text-4xl sm:text-5xl mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-lg">
                  1
                </div>
                <h3 className="font-playfair font-bold text-xl mb-4">Plot Your Mood</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  Tap the gradient to capture your emotional coordinates
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-lg">
                  2
                </div>
                <h3 className="font-playfair font-bold text-xl mb-4">Reflect on 3 Questions</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  What you&apos;re focusing on, saying to yourself, and feeling physically
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-lg">
                  3
                </div>
                <h3 className="font-playfair font-bold text-xl mb-4">Name Your Feeling (Optional)</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  Add your own word to describe your state so insights use your personal emotional vocabulary
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-lg">
                  4
                </div>
                <h3 className="font-playfair font-bold text-xl mb-4">See Your Patterns</h3>
                <p className="text-[var(--color-text-soft)] leading-relaxed">
                  VibePoint connects your focus, self-talk, body sensations, and labels into clear patterns
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="privacy-section">
          <div className="container text-center">
            <div className="bg-[var(--color-surface)] p-8 sm:p-12 rounded-3xl shadow-lg border-2 border-[var(--color-trust)]/20">
              <div className="text-6xl mb-6">🔐</div>
              <h3 className="font-playfair font-bold text-2xl sm:text-3xl mb-6">Your Data, Your Privacy</h3>
              <p className="text-[var(--color-text-soft)] text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
                VibePoint is built with privacy at its core. Your mood data is encrypted end-to-end, stored only on your device, and never shared with third parties. Pattern analysis happens locally using on-device intelligence—no cloud processing required.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center flex-wrap">
                <div className="flex items-center gap-3 text-[var(--color-trust)] font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  End-to-end encryption
                </div>
                <div className="flex items-center gap-3 text-[var(--color-trust)] font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Local data storage
                </div>
                <div className="flex items-center gap-3 text-[var(--color-trust)] font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  On-device processing
                </div>
                <div className="flex items-center gap-3 text-[var(--color-trust)] font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Zero third-party sharing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="footer-cta">
          <h2 className="font-playfair font-bold text-4xl sm:text-5xl mb-6">Ready to understand your emotional patterns?</h2>
          <p className="text-[var(--color-text-soft)] text-xl mb-12 max-w-2xl mx-auto">
            Start tracking today—free for 14 days, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white px-8 py-4 rounded-3xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              Start Your Free Trial
            </Link>
            <button
              onClick={scrollToDemo}
              className="bg-[var(--color-surface)] text-[var(--color-text)] px-8 py-4 rounded-3xl font-semibold text-lg border border-black/10 shadow-sm hover:bg-black/5 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
            >
              🎨 Try the Demo First
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}