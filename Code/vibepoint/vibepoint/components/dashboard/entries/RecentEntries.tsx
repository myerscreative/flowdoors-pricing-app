import React, { useMemo } from 'react'

import { MoodEntry } from '@/types'

import { lastN, formatDate, getMoodColor } from '../utils/dashboardUtils'

interface RecentEntriesProps {
  entries: MoodEntry[]
}

const RecentEntries: React.FC<RecentEntriesProps> = React.memo(({ entries }) => {
  const recent = useMemo(() => lastN(entries, 3), [entries])

  if (recent.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-gray-500">
        No recent entries yet.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Entries
      </h3>
      <div className="space-y-4">
        {recent.map((entry) => {
          const happiness = Math.round(entry.happiness_level * 100)
          const motivation = Math.round(entry.motivation_level * 100)

          // Create a gradient swatch showing the selected color at the tap position, fading to white
          // Get the color for this mood position
          const selectedColor = getMoodColor(entry.happiness_level, entry.motivation_level)
          
          // Map values 0–100% into gradient coordinates (motivation = x, inverted happiness = y)
          const x = motivation
          const y = 100 - happiness // invert for UI

          const gradientStyle = {
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

          return (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              {/* Gradient swatch */}
              <div
                className="h-16 w-16 rounded-lg border border-gray-300 shadow-inner bg-white flex-shrink-0"
                style={gradientStyle}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  {formatDate(entry.timestamp)}
                </p>
                <p className="text-gray-900 font-medium">
                  Happiness: <span className="font-semibold">{happiness}%</span>
                </p>
                <p className="text-gray-900 font-medium">
                  Motivation: <span className="font-semibold">{motivation}%</span>
                </p>
                {entry.emotion_name && (
                  <p className="text-indigo-600 text-sm font-medium mt-1 capitalize">
                    Emotion: {entry.emotion_name}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

RecentEntries.displayName = 'RecentEntries'

export default RecentEntries
