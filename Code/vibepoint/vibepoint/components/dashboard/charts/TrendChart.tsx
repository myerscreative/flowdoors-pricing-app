'use client'

import React, { useMemo } from 'react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { MoodEntry } from '@/types'
import { getLastSeven, formatDate } from '../utils/dashboardUtils'

interface TrendChartProps {
  entries: MoodEntry[]
}

const TrendChart: React.FC<TrendChartProps> = React.memo(({ entries }) => {
  const data = useMemo(() => {
    const recent = getLastSeven(entries)
    return recent.map(entry => ({
      date: formatDate(entry.timestamp),
      happiness: Math.round(entry.happiness_level * 100),
      motivation: Math.round(entry.motivation_level * 100),
    }))
  }, [entries])

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-500">
        Not enough data to show trends yet.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        7-Day Mood Trend
      </h3>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={val => `${val}%`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={value => `${value}%`}
            />
            <Line
              type="monotone"
              dataKey="happiness"
              stroke="#f59e0b"   // amber-500
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="motivation"
              stroke="#6366f1"   // indigo-500
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Shows the trend of your happiness and motivation levels over your last 7 mood entries.
      </p>
    </div>
  )
})

TrendChart.displayName = 'TrendChart'

export default TrendChart

