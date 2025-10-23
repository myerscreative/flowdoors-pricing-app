'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
    <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-xl font-bold text-flowdoors-charcoal-800 mb-6">
        Leads Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 500 }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 500 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line
            type="monotone"
            dataKey="google"
            stroke="#F4B400"
            strokeWidth={3}
            dot={{ fill: '#F4B400', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="facebook"
            stroke="#1877F2"
            strokeWidth={3}
            dot={{ fill: '#1877F2', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="direct"
            stroke="#8dc63f"
            strokeWidth={3}
            dot={{ fill: '#8dc63f', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="other"
            stroke="#6B7280"
            strokeWidth={3}
            dot={{ fill: '#6B7280', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
