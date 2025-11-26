'use client'

import { useState } from 'react'
import { MoodEntry } from '@/types'
import { format } from 'date-fns'
import MiniGradientPreview from '@/components/MiniGradientPreview'

export default function EntryCard({ entry }: { entry: MoodEntry }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-4">
        {/* Mini gradient preview square with dot showing mood position */}
        <MiniGradientPreview
          happiness={entry.happiness_level}
          motivation={entry.motivation_level}
        />
        <div className="flex-1">
          <p className="text-lg font-medium">
            {format(new Date(entry.timestamp), 'PPP')}
          </p>
          <p className="text-neutral-500 text-sm">
            Happiness: {Math.round(entry.happiness_level * 100)}% • Motivation:{' '}
            {Math.round(entry.motivation_level * 100)}%
          </p>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <div>
            <p className="font-semibold text-sm">Focus</p>
            <p className="text-neutral-600">{entry.focus}</p>
          </div>

          <div>
            <p className="font-semibold text-sm">Self-Talk</p>
            <p className="text-neutral-600">{entry.self_talk}</p>
          </div>

          <div>
            <p className="font-semibold text-sm">Physical Sensations</p>
            <p className="text-neutral-600">{entry.physical_sensations}</p>
          </div>

          {entry.emotion_name && (
            <div>
              <p className="font-semibold text-sm">Emotion/Mood Name</p>
              <p className="text-neutral-600">{entry.emotion_name}</p>
            </div>
          )}

          {entry.notes && (
            <div>
              <p className="font-semibold text-sm">Notes</p>
              <p className="text-neutral-600">{entry.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


