import React from 'react'

import { MoodEntry } from '@/types'

import { computeStreak } from '../utils/dashboardUtils'

interface StreakCardProps {
  entries: MoodEntry[]
}

const StreakCard: React.FC<StreakCardProps> = React.memo(({ entries }) => {
  const streak = computeStreak(entries)

  return (
    <div 
      className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
      style={{ background: 'linear-gradient(45deg, #7c3aed 0%, #c026d3 50%, #f97316 100%)' }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-white/90">
            Current Streak
          </p>
          <p className="mt-1 font-display text-3xl font-semibold leading-tight">
            {streak}
            <span className="ml-1 align-baseline text-base font-normal">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </p>
        </div>
      </div>
      <p className="relative mt-2 text-sm text-white/85">
        Check in daily to build your streak!
      </p>
    </div>
  )
})

StreakCard.displayName = 'StreakCard'

export default StreakCard
