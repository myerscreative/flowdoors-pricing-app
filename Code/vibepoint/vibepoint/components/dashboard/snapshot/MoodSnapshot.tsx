import React, { useMemo } from 'react'

import { MoodEntry } from '@/types'

import { formatDate, getMoodColor } from '../utils/dashboardUtils'

interface MoodSnapshotProps {
  entries: MoodEntry[]
}

const MoodSnapshot: React.FC<MoodSnapshotProps> = React.memo(({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-gray-500">
        No mood entries yet.
      </div>
    )
  }

  const latest = entries[0]
  const happiness = Math.round(latest.happiness_level * 100)
  const motivation = Math.round(latest.motivation_level * 100)

  // Create a gradient swatch showing the selected color at the tap position, fading to white
  const gradientStyle = useMemo(() => {
    // Get the color for this mood position
    const selectedColor = getMoodColor(latest.happiness_level, latest.motivation_level)
    
    // Map values 0–100% into gradient coordinates (motivation = x, inverted happiness = y)
    const x = motivation
    const y = 100 - happiness // invert for UI

    return {
      background: `
        radial-gradient(
          circle 8px at ${x}% ${y}%,
          ${selectedColor} 0%,
          ${selectedColor} 2px,
          rgba(255, 255, 255, 0.6) 4px,
          rgba(255, 255, 255, 1) 6px
        )
      `,
    }
  }, [latest.happiness_level, latest.motivation_level, happiness, motivation])

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Mood Snapshot</h3>
      <div className="flex items-center gap-4">
        {/* Gradient swatch */}
        <div
          className="h-16 w-16 rounded-lg border border-gray-300 shadow-inner bg-white"
          style={gradientStyle}
        />
        <div>
          <p className="text-sm text-gray-600 mb-1">
            {formatDate(latest.timestamp)}
          </p>
          <p className="text-gray-900 font-medium">
            Happiness: <span className="font-semibold">{happiness}%</span>
          </p>
          <p className="text-gray-900 font-medium">
            Motivation: <span className="font-semibold">{motivation}%</span>
          </p>
          {latest.emotion_name && (
            <p className="text-indigo-600 text-sm font-medium mt-1 capitalize">
              Emotion: {latest.emotion_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

MoodSnapshot.displayName = 'MoodSnapshot'

export default MoodSnapshot

