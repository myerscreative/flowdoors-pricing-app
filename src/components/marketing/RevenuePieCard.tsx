'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts'

type SourceKey = 'google' | 'facebook' | 'direct' | 'other'

export function RevenuePieCard({
  bySource,
  filter = 'all',
}: {
  bySource: Record<SourceKey, { leads: number; quotes: number; amount: number }>
  filter?: 'all' | SourceKey
}) {
  const palette: Record<SourceKey, string> = {
    google: '#4285F4',
    facebook: '#1877F2',
    direct: '#34A853',
    other: '#999999',
  }

  const data = (Object.keys(bySource) as SourceKey[])
    .filter((k) => (filter === 'all' ? true : k === filter))
    .map((k) => ({ name: k, value: bySource[k].amount, color: palette[k] }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Source</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {data.map((entry, idx) => (
                <Cell key={`c-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(v)
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default RevenuePieCard
