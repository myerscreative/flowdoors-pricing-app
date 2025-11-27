'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface MoodCoordinates {
  x: number // motivation (0-1)
  y: number // happiness (0-1)
}

interface GradientSelectorProps {
  onMoodSelect: (coordinates: MoodCoordinates) => void
  selectedMood?: MoodCoordinates
  showStats?: boolean
  showHeader?: boolean
  className?: string
  gradientClassName?: string
}

// Four corner colors - EXACT from app
const corners = {
  topLeft: { r: 180, g: 220, b: 255 },     // Soft, airy sky blue - Happy + Unmotivated
  topRight: { r: 255, g: 240, b: 50 },     // Bright golden yellow - Happy + Motivated
  bottomLeft: { r: 40, g: 35, b: 45 },     // Dark grey-purple - Unhappy + Unmotivated
  bottomRight: { r: 255, g: 20, b: 0 },    // Intense red - Unhappy + Motivated
}

// Bilinear interpolation between four corners
const bilinearInterpolate = (
  x: number,
  y: number,
  c00: { r: number; g: number; b: number },
  c10: { r: number; g: number; b: number },
  c01: { r: number; g: number; b: number },
  c11: { r: number; g: number; b: number }
) => {
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

export default function GradientSelector({
  onMoodSelect,
  selectedMood,
  showStats = true,
  showHeader = true,
  className = '',
  gradientClassName = '',
}: GradientSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalMood, setInternalMood] = useState<MoodCoordinates | null>(null)
  const isDraggingRef = useRef(false)
  
  // Use controlled state if provided, otherwise internal state
  const currentMood = selectedMood !== undefined ? selectedMood : internalMood

  const drawGradient = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) return

    // Get actual display size
    const displayWidth = container.clientWidth
    const displayHeight = container.clientHeight

    // Set canvas size to match display size (1:1 pixels)
    canvas.width = displayWidth
    canvas.height = displayHeight

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
  }, [])

  useEffect(() => {
    // Small delay to ensure container is sized
    const timer = setTimeout(() => {
      drawGradient()
    }, 0)

    const handleResize = () => {
      drawGradient()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [drawGradient])

  useEffect(() => {
    const stopDragging = () => {
      isDraggingRef.current = false
    }

    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)

    return () => {
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('touchend', stopDragging)
    }
  }, [])

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    let clientX: number
    let clientY: number

    if ('touches' in e) {
      if (e.touches.length === 0) return
      if (typeof e.preventDefault === 'function') {
        e.preventDefault()
      }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const clickX = clientX - rect.left
    const clickY = clientY - rect.top

    const x = Math.max(0, Math.min(1, clickX / rect.width))
    const y = Math.max(0, Math.min(1, 1 - (clickY / rect.height))) // Invert so top = happy

    const mood = { x, y }
    if (selectedMood === undefined) {
      setInternalMood(mood)
    }
    onMoodSelect(mood)
  }

  const handlePointerDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isDraggingRef.current = true
    handleInteraction(event)
  }

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    handleInteraction(event)
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  const getMoodLabel = (coords: MoodCoordinates) => {
    const { x, y } = coords

    if (y > 0.5 && x < 0.5) return 'Happy • Unmotivated'
    if (y > 0.5 && x >= 0.5) return 'Happy • Motivated'
    if (y <= 0.5 && x < 0.5) return 'Unhappy • Unmotivated'
    return 'Unhappy • Motivated'
  }

  return (
    <div className={`w-full ${showHeader ? 'max-w-2xl mx-auto px-4 py-8' : ''} ${className}`}>
      {showHeader && (
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold">How are you feeling?</h1>
          <p className="text-lg text-gray-600">Tap anywhere on the gradient to show your current mood</p>
        </div>
      )}

      {/* Gradient Container */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-square cursor-crosshair overflow-hidden rounded-3xl border border-white/20 bg-black/10 shadow-2xl ${gradientClassName}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Axis labels positioned inside the gradient */}
        <span
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.25em] text-white"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        >
          Happy
        </span>
        <span
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.25em] text-white"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        >
          Unhappy
        </span>
        <span
          className="pointer-events-none absolute top-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.25em] text-white"
          style={{
            left: '16px',
            transformOrigin: 'left center',
            transform: 'translateY(-50%) rotate(90deg) translateX(-50%)',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          Unmotivated
        </span>
        <span
          className="pointer-events-none absolute top-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.25em] text-white"
          style={{
            right: '16px',
            transformOrigin: 'right center',
            transform: 'translateY(-50%) rotate(-90deg) translateX(50%)',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          Motivated
        </span>

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: 'block' }} />

        {/* Selection Indicator */}
        {currentMood && (
          <div
            className="pointer-events-none absolute h-7 w-7 transition-all duration-75 ease-out"
            style={{
              left: `${currentMood.x * 100}%`,
              top: `${(1 - currentMood.y) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="h-full w-full rounded-full border-[3px] border-white shadow-lg"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.3)' }}
            />
            <div className="absolute inset-0 scale-150 rounded-full border-2 border-white/50" />
          </div>
        )}
      </div>

      {/* Current Mood Display */}
      {showStats && currentMood && (
        <div className="mt-8 p-6 bg-linear-to-r from-purple-50 to-indigo-50 rounded-2xl text-center">
          <p className="text-lg font-semibold text-gray-800">{getMoodLabel(currentMood)}</p>
          <p className="text-sm text-gray-600 mt-2">
            Happiness: {Math.round(currentMood.y * 100)}% • Motivation: {Math.round(currentMood.x * 100)}%
          </p>
        </div>
      )}
    </div>
  )
}
