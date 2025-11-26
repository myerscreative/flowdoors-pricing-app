'use client'

import { useState } from 'react'
import { MoodEntry } from '@/types'
import { format } from 'date-fns'

export default function EntryCard({ entry }: { entry: MoodEntry }) {
  const [open, setOpen] = useState(false)

  const moodType = () => {
    const h = entry.happiness_level
    const m = entry.motivation_level
    if (h > 0.5 && m > 0.5) return 'Bright'
    if (h > 0.5 && m <= 0.5) return 'Calm'
    if (h <= 0.5 && m > 0.5) return 'Driven'
    return 'Low'
  }

  const moodColor = {
    Bright: 'bg-yellow-300',
    Calm: 'bg-teal-300',
    Driven: 'bg-red-300',
    Low: 'bg-purple-300'
  }[moodType()]

  return (
    <div
      className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-medium">
            {format(new Date(entry.timestamp), 'PPP')}
          </p>
          <p className="text-neutral-500 text-sm">
            Happiness: {entry.happiness_level.toFixed(2)} • Motivation:{' '}
            {entry.motivation_level.toFixed(2)}
          </p>
        </div>
        <div className={`w-4 h-4 rounded-full ${moodColor}`} />
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


