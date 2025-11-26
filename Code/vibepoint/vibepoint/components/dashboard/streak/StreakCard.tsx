import React from 'react'

import { MoodEntry } from '@/types'

import { computeStreak } from '../utils/dashboardUtils'

interface StreakCardProps {
  entries: MoodEntry[]
}

const StreakCard: React.FC<StreakCardProps> = React.memo(({ entries }) => {
  const streak = computeStreak(entries)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Current Streak</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {streak} <span className="text-lg text-gray-500">days</span>
          </p>
        </div>
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600">
          {/* Flame / streak icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2 3 3 5 3 7a3 3 0 01-6 0c0-2 1-4 3-7zm0 0a9 9 0 019 9c0 4.97-4.03 9-9 9s-9-4.03-9-9a9 9 0 019-9z"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Your streak grows when you check in every day.
      </p>
    </div>
  )
})

StreakCard.displayName = 'StreakCard'

export default StreakCard
