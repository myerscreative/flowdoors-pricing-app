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
      <div className="rounded-3xl border border-white/30 bg-white/85 p-6 text-center text-sm text-text-secondary shadow-sm backdrop-blur-xl">
        Not enough data to show trends yet.
      </div>
    )
  }

  const startDate = data.length > 0 ? data[data.length - 1].date : ''
  const endDate = data.length > 0 ? data[0].date : ''

  return (
    <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          7-Day Trend
        </h3>
        {startDate && endDate && (
          <span 
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: '#7c3aed'
            }}
          >
            {startDate} - {endDate}
          </span>
        )}
      </div>
      <div className="h-32 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#4a4a6a' }}
              axisLine={false}
              tickLine={false}
              hide
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#4a4a6a' }}
              tickFormatter={val => `${val}%`}
              axisLine={false}
              tickLine={false}
              hide
            />
            <Tooltip
              contentStyle={{ 
                fontSize: 12,
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
              }}
              formatter={value => `${value}%`}
            />
            <Line
              type="monotone"
              dataKey="happiness"
              stroke="#FF7B54"
              strokeWidth={3}
              strokeLinecap="round"
              dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#FF7B54' }}
            />
            <Line
              type="monotone"
              dataKey="motivation"
              stroke="#8B5CF6"
              strokeWidth={3}
              strokeLinecap="round"
              dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#8B5CF6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-5">
        <div className="flex items-center gap-2">
          <span 
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: '#FF7B54' }}
          />
          <span className="text-xs text-text-secondary">Happiness</span>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: '#8B5CF6' }}
          />
          <span className="text-xs text-text-secondary">Motivation</span>
        </div>
      </div>
    </div>
  )
})

TrendChart.displayName = 'TrendChart'

export default TrendChart

