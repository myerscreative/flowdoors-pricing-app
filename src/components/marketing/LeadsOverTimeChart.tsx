'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export default function LeadsOverTimeChart({
  data,
}: {
  data: Array<{
    date: string
    google: number
    facebook: number
    direct: number
    other: number
  }>
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Leads Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="google"
            stroke="#F4B400"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="facebook"
            stroke="#1877F2"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="direct"
            stroke="#10B981"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="other"
            stroke="#6B7280"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
