import React, { useMemo } from 'react'

import { MoodEntry } from '@/types'

import { mode, formatDate } from '../utils/dashboardUtils'

import { startOfWeek, isWithinInterval, subWeeks } from 'date-fns'

interface EmotionPatternCardProps {
  entries: MoodEntry[]
}

const EmotionPatternCard: React.FC<EmotionPatternCardProps> = React.memo(
  ({ entries }) => {
    const { thisWeekEmotion, lastWeekEmotion } = useMemo(() => {
      if (entries.length === 0)
        return { thisWeekEmotion: null, lastWeekEmotion: null }

      const now = new Date()
      const weekStart = startOfWeek(now)
      const lastWeekStart = subWeeks(weekStart, 1)
      const lastWeekEnd = subWeeks(weekStart, 0)

      const thisWeekEntries = entries.filter(e =>
        isWithinInterval(new Date(e.timestamp), {
          start: weekStart,
          end: now,
        })
      )

      const lastWeekEntries = entries.filter(e =>
        isWithinInterval(new Date(e.timestamp), {
          start: lastWeekStart,
          end: lastWeekEnd,
        })
      )

      return {
        thisWeekEmotion: mode(thisWeekEntries.map(e => e.emotion_name ?? undefined)),
        lastWeekEmotion: mode(lastWeekEntries.map(e => e.emotion_name ?? undefined)),
      }
    }, [entries])

    const compare = useMemo(() => {
      if (!thisWeekEmotion) return 'Not enough data'
      if (!lastWeekEmotion) return 'New pattern forming'
      if (thisWeekEmotion === lastWeekEmotion) return 'Same as last week'
      return `Shifted from "${lastWeekEmotion}" to "${thisWeekEmotion}"`
    }, [thisWeekEmotion, lastWeekEmotion])

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Emotion Pattern (Weekly)
        </h3>
        {!thisWeekEmotion ? (
          <p className="text-gray-500">Not enough entries this week yet.</p>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Most Common Emotion This Week:</p>
              <p className="text-xl font-semibold text-indigo-600 capitalize">
                {thisWeekEmotion}
              </p>
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Most Common Emotion Last Week:</p>
              <p className="text-lg font-medium text-gray-800 capitalize">
                {lastWeekEmotion ?? '—'}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-3">{compare}</p>
          </>
        )}
      </div>
    )
  }
)

EmotionPatternCard.displayName = 'EmotionPatternCard'

export default EmotionPatternCard
