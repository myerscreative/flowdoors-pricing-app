import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

import { MoodEntry } from '@/types'
import { getMoodColor } from '../utils/dashboardUtils'

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
  
  // Get the color for this mood position
  const moodColor = getMoodColor(latest.happiness_level, latest.motivation_level)
  
  // Calculate position for the colored dot (motivation = X, inverted happiness = Y)
  const markerX = Math.max(0, Math.min(100, motivation * 100))
  const markerY = Math.max(0, Math.min(100, (1 - latest.happiness_level) * 100))

  return (
    <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-5 flex items-baseline gap-3">
        <h3 className="font-display text-xl font-semibold text-text-primary">
          Latest Check-in
        </h3>
        <span className="text-sm font-normal text-text-secondary/80">
          {format(new Date(latest.timestamp), 'EEE, MMM d, yyyy • h:mm a')}
        </span>
      </div>
      
      <div className="flex items-start gap-4">
        {/* Left column: White box and numbers */}
        <div className="flex items-start gap-4">
          {/* White box with colored dot */}
          <div 
            className="relative flex-shrink-0 rounded-2xl bg-white shadow-sm"
            style={{ 
              width: '70px', 
              height: '70px',
              border: `0.25px solid ${moodColor}`
            }}
          >
            <div
              className="absolute h-4 w-4 rounded-full border-2 border-white shadow-md"
              style={{ 
                right: '6px',
                top: '6px',
                backgroundColor: moodColor
              }}
            />
          </div>
          
          {/* Numbers column - stacked vertically */}
          <div className="flex flex-col gap-2">
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
        </div>
        
        {/* Right column: Question answers */}
        <div className="flex-1 min-w-0 space-y-1.5" style={{ paddingLeft: '40px' }}>
          <div className="text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Focus:</span> {latest.focus}
          </div>
          <div className="text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Self-talk:</span> {latest.self_talk}
          </div>
          <div className="text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Physical:</span> {latest.physical_sensations}
          </div>
        </div>
      </div>
      
      {latest.emotion_name && (
        <p className="mt-3 text-xs font-medium capitalize text-pro-primary">
          Emotion: {latest.emotion_name}
        </p>
      )}
      
      {/* See past entries at bottom right */}
      <div className="mt-4 flex justify-end">
        <Link 
          href="/history" 
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: '#c026d3' }}
        >
          See past entries →
        </Link>
      </div>
    </div>
  )
})

MoodSnapshot.displayName = 'MoodSnapshot'

export default MoodSnapshot


