'use client'

import { useEffect, useRef } from 'react'
import { MoodEntry } from '@/types'

interface Props {
  entries: MoodEntry[]
}

export default function HeatMap({ entries }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const drawHeatMap = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#00B4FF') // happy + motivated zone
      gradient.addColorStop(1, '#A200FF') // unhappy + unmotivated zone
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw entries
      entries.forEach(entry => {
        const x = entry.motivation_level * canvas.width
        const y = canvas.height - entry.happiness_level * canvas.height
        const intensity = 0.25 + entry.motivation_level * 0.4
        const radius = 10 + entry.happiness_level * 12

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`
        ctx.fill()
      })
    }

    drawHeatMap()
  }, [entries])

  return (
    <div className="w-full h-auto p-4 rounded-xl shadow-md border border-neutral-200 bg-white">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full h-auto rounded-xl"
      />
    </div>
  )
}

