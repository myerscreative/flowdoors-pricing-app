'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from 'recharts'

type SourceKey = 'google' | 'facebook' | 'direct' | 'other'

export function TrendsCard({
  range: _range,
  bySource: _bySource,
  filter = 'all',
}: {
  range: { from: string; to: string }
  bySource: Record<SourceKey, { leads: number; quotes: number; amount: number }>
  filter?: 'all' | SourceKey
}) {
  // Suppress unused parameter warnings
  void _range
  void _bySource
  // For now we mock a 7-day timeseries, respecting the source filter
  const sources: SourceKey[] = ['google', 'facebook', 'direct', 'other']
  const active = sources.filter((s) => (filter === 'all' ? true : s === filter))

  const mockData = Array.from({ length: 7 }).map((_, i) => {
    const day = `Day ${i + 1}`
    const point: Record<string, number | string> = { date: day }
    active.forEach((s) => {
      // seed-ish numbers so it’s not completely random on every render
      const seed = (i + 1) * (s.charCodeAt(0) % 7)
      point[s] = Math.max(0, (seed % 6) + (s === 'google' ? 2 : 0))
    })
    return point
  })

  const colors: Record<SourceKey, string> = {
    google: '#4285F4',
    facebook: '#1877F2',
    direct: '#34A853',
    other: '#999999',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads & Quotes Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {active.map((s) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={colors[s]}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default TrendsCard
