'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ElementType } from 'react'

interface MetricCardProps {
  title: string
  value: number
  previousValue: number
  icon: ElementType
  format?: 'number' | 'currency'
}

export default function MetricCard({
  title,
  value,
  previousValue,
  icon: Icon,
  format = 'number',
}: MetricCardProps) {
  const change = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0
  const isPositive = change >= 0

  const formatValue = (val: number) =>
    format === 'currency'
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val)
      : val.toLocaleString()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-flowdoors-blue-500 to-flowdoors-blue-600 rounded-xl shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-flowdoors-charcoal-800 mt-1">
              {formatValue(value)}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${isPositive ? 'bg-flowdoors-green-50 text-flowdoors-green-600' : 'bg-red-50 text-red-600'}`}
        >
          {isPositive ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
          <span className="text-sm font-bold">
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
