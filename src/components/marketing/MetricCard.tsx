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
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatValue(value)}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
