import React, { useMemo } from 'react'

import { MoodEntry } from '@/types'

import { generateInsight } from '../utils/dashboardUtils'

interface InsightCardProps {
  entries: MoodEntry[]
}

const InsightCard: React.FC<InsightCardProps> = React.memo(({ entries }) => {
  const insight = useMemo(() => generateInsight(entries), [entries])

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Quick Insight
      </h3>
      <div className="flex items-start gap-3">
        {/* Lightbulb icon */}
        <div className="text-yellow-500 mt-1">
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
              d="M12 2a7 7 0 00-4 12.746V17a1 1 0 001 1h1v2a1 1 0 001 1h2a1 1 0 001-1v-2h1a1 1 0 001-1v-2.254A7 7 0 0012 2z"
            />
          </svg>
        </div>
        <p className="text-gray-700 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
})

InsightCard.displayName = 'InsightCard'

export default InsightCard
