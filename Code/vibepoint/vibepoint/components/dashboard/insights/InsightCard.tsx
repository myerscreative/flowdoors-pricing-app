import React, { useMemo } from 'react'
import Link from 'next/link'

import { MoodEntry } from '@/types'

import { generateInsight } from '../utils/dashboardUtils'

interface InsightCardProps {
  entries: MoodEntry[]
}

const InsightCard: React.FC<InsightCardProps> = React.memo(({ entries }) => {
  const insight = useMemo(() => generateInsight(entries), [entries])

  return (
    <div 
      className="rounded-3xl border p-6 shadow-sm backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.2)'
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">💡</span>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Quick Insight
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-text-primary mb-3">{insight}</p>
      <Link
        href="/learn#ingredients"
        className="inline-block text-xs md:text-sm font-medium transition-opacity hover:opacity-80"
        style={{ color: '#7c3aed' }}
      >
        Learn how we detect patterns like this →
      </Link>
    </div>
  )
})

InsightCard.displayName = 'InsightCard'

export default InsightCard
