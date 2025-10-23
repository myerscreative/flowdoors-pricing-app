'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface ChartData {
  name: string
  value: number
  color: string
}

export default function RevenueBySourceChart({ data }: { data: ChartData[] }) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-xl font-bold text-flowdoors-charcoal-800 mb-6">
        Revenue by Source
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={6}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number) => formatCurrency(val)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center flex-wrap gap-4 mt-6">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-flowdoors-charcoal-700">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
