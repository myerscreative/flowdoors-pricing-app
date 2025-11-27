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
      <div className="rounded-3xl border border-white/30 bg-white/85 p-6 text-sm text-text-secondary shadow-sm backdrop-blur-xl">
        No recent entries yet.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
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
              className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/80 p-3 transition hover:bg-white"
            >
              {/* Gradient swatch */}
              <div
                className="flex-shrink-0 h-16 w-16 rounded-2xl border border-white/70 bg-white shadow-inner"
                style={gradientStyle}
              />
              <div className="flex-1">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {formatDate(entry.timestamp)}
                </p>
                <p className="text-sm font-medium text-text-primary">
                  <span className="text-text-secondary">Happiness</span>{' '}
                  <span className="font-semibold">{happiness}%</span>
                </p>
                <p className="text-sm font-medium text-text-primary">
                  <span className="text-text-secondary">Motivation</span>{' '}
                  <span className="font-semibold">{motivation}%</span>
                </p>
                {entry.emotion_name && (
                  <p className="mt-1 text-xs font-medium capitalize text-pro-primary">
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
