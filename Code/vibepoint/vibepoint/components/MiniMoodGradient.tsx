'use client'

import { useEffect, useRef } from 'react'

interface MiniMoodGradientProps {
  happiness: number // 0-1
  motivation: number // 0-1
  size?: number
}

export function MiniMoodGradient({
  happiness,
  motivation,
  size = 70,
}: MiniMoodGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = size
    const height = size

    // Ensure canvas matches logical size
    canvas.width = width
    canvas.height = height

    // Corner colors from DESIGN_SYSTEM (core mood gradient)
    const topLeft = { r: 124, g: 198, b: 214 } // #7CC6D6
    const topRight = { r: 245, g: 166, b: 35 } // #F5A623
    const bottomLeft = { r: 45, g: 58, b: 92 } // #2D3A5C
    const bottomRight = { r: 139, g: 41, b: 66 } // #8B2942

    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const xRatio = x / (width - 1)
        const yRatio = y / (height - 1)

        const r = Math.round(
          topLeft.r * (1 - xRatio) * (1 - yRatio) +
            topRight.r * xRatio * (1 - yRatio) +
            bottomLeft.r * (1 - xRatio) * yRatio +
            bottomRight.r * xRatio * yRatio
        )
        const g = Math.round(
          topLeft.g * (1 - xRatio) * (1 - yRatio) +
            topRight.g * xRatio * (1 - yRatio) +
            bottomLeft.g * (1 - xRatio) * yRatio +
            bottomRight.g * xRatio * yRatio
        )
        const b = Math.round(
          topLeft.b * (1 - xRatio) * (1 - yRatio) +
            topRight.b * xRatio * (1 - yRatio) +
            bottomLeft.b * (1 - xRatio) * yRatio +
            bottomRight.b * xRatio * yRatio
        )

        const idx = (y * width + x) * 4
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
        data[idx + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [size])

  // Convert mood values to position (motivation = X, inverted happiness = Y)
  const markerX = Math.max(0, Math.min(1, motivation)) * 100
  const markerY = (1 - Math.max(0, Math.min(1, happiness))) * 100

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-md"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} width={size} height={size} className="h-full w-full" />
      <div
        className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black/20 bg-white shadow-lg"
        style={{ left: `${markerX}%`, top: `${markerY}%` }}
      />
    </div>
  )
}


