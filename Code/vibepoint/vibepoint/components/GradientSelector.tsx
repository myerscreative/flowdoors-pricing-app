'use client'

import { useEffect, useRef, useState } from 'react'

interface MoodCoordinates {
  x: number // motivation (0-1)
  y: number // happiness (0-1)
}

interface GradientSelectorProps {
  onMoodSelect: (coordinates: MoodCoordinates) => void
  selectedMood?: MoodCoordinates
}

export default function GradientSelector({ onMoodSelect, selectedMood }: GradientSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentMood, setCurrentMood] = useState<MoodCoordinates | null>(selectedMood || null)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)

  // Four corner colors - EXACT from reference image
  const corners = {
    topLeft: { r: 107, g: 182, b: 214 },      // #6BB6D6 - Light cyan/blue (Happy + Unmotivated)
    topRight: { r: 255, g: 180, b: 70 },      // Brighter orange/yellow (Happy + Motivated)
    bottomLeft: { r: 26, g: 42, b: 74 },      // #1A2A4A - Dark navy (Unhappy + Unmotivated)
    bottomRight: { r: 168, g: 54, b: 83 },    // #A83653 - Dark burgundy (Unhappy + Motivated)
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

  const drawGradient = () => {
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
  }

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
  }, [])

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    let clientX: number
    let clientY: number

    if ('touches' in e) {
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
    setCurrentMood(mood)
    setCursorPosition({ x: clickX, y: clickY })
    onMoodSelect(mood)
  }

  const getMoodLabel = (coords: MoodCoordinates) => {
    const { x, y } = coords

    if (y > 0.5 && x < 0.5) return 'Happy • Unmotivated'
    if (y > 0.5 && x >= 0.5) return 'Happy • Motivated'
    if (y <= 0.5 && x < 0.5) return 'Unhappy • Unmotivated'
    return 'Unhappy • Motivated'
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">How are you feeling?</h1>
        <p className="text-gray-600 text-lg">Tap anywhere on the gradient to show your current mood</p>
      </div>

      {/* Axis Labels */}
      <div className="flex justify-between mb-2 px-2">
        <span className="text-sm text-gray-500 font-medium">Unmotivated</span>
        <span className="text-sm text-gray-500 font-medium">Motivated</span>
      </div>

      {/* Gradient Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square rounded-3xl overflow-hidden cursor-crosshair shadow-2xl"
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Selection Indicator */}
        {currentMood && cursorPosition && (
          <div
            className="absolute w-12 h-12 -ml-6 -mt-6 pointer-events-none"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
            }}
          >
            <div className="w-full h-full rounded-full border-4 border-white shadow-lg animate-pulse" />
            <div className="absolute inset-0 w-full h-full rounded-full border-4 border-white/50 scale-150" />
          </div>
        )}
      </div>

      {/* Quadrant Labels */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-center text-sm text-gray-600">
        <div className="text-left pl-2">
          <div className="font-medium">Happy</div>
          <div>Unmotivated</div>
        </div>
        <div className="text-right pr-2">
          <div className="font-medium">Happy</div>
          <div>Motivated</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-600">
        <div className="text-left pl-2">
          <div className="font-medium">Unhappy</div>
          <div>Unmotivated</div>
        </div>
        <div className="text-right pr-2">
          <div className="font-medium">Unhappy</div>
          <div>Motivated</div>
        </div>
      </div>

      {/* Current Mood Display */}
      {currentMood && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl text-center">
          <p className="text-lg font-semibold text-gray-800">{getMoodLabel(currentMood)}</p>
          <p className="text-sm text-gray-600 mt-2">
            Happiness: {Math.round(currentMood.y * 100)}% • Motivation: {Math.round(currentMood.x * 100)}%
          </p>
        </div>
      )}
    </div>
  )
}
