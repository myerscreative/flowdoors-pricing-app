import React from 'react'
import Link from 'next/link'

import { MoodEntry } from '@/types'
import { MiniMoodGradient } from '@/components/MiniMoodGradient'
import { formatDate } from '../utils/dashboardUtils'

interface MoodSnapshotProps {
  entries: MoodEntry[]
}

const MoodSnapshot: React.FC<MoodSnapshotProps> = React.memo(({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-white/30 bg-white/85 p-6 text-sm text-text-secondary shadow-sm backdrop-blur-xl">
        No mood entries yet.
      </div>
    )
  }

  const latest = entries[0]
  const happiness = Math.round(latest.happiness_level * 100)
  const motivation = Math.round(latest.motivation_level * 100)

  return (
    <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Latest Check-in
        </h3>
        <Link 
          href="/history" 
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: '#c026d3' }}
        >
          See past entries →
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <MiniMoodGradient
          happiness={latest.happiness_level}
          motivation={latest.motivation_level}
        />
        <div className="flex-1">
          <p className="mb-2 text-xs text-text-secondary">
            {formatDate(latest.timestamp)}
          </p>
          <div className="flex gap-4">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-semibold text-text-primary">
                {happiness}%
              </span>
              <span className="text-xs text-text-secondary">happy</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-semibold text-text-primary">
                {motivation}%
              </span>
              <span className="text-xs text-text-secondary">motivated</span>
            </div>
          </div>
          {latest.emotion_name && (
            <p className="mt-2 text-xs font-medium capitalize text-pro-primary">
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


