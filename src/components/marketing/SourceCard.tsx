'use client'

import { Search, Facebook, Globe, Eye } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

interface SourceCardProps {
  source: string
  data: {
    leads: number
    quotes: number
    revenue?: number
    amount?: number
    color: string
  }
  totalRevenue: number
  onClick?: () => void
  sparklineData?: Array<{ date: string; leads: number }>
}

export default function SourceCard({
  source,
  data,
  totalRevenue,
  onClick,
  sparklineData,
}: SourceCardProps) {
  const revenue = data.revenue ?? data.amount ?? 0
  const conversionRate = data.leads
    ? ((data.quotes / data.leads) * 100).toFixed(1)
    : '0.0'
  const avgQuoteValue = data.quotes ? revenue / data.quotes : 0
  const percentage = totalRevenue
    ? ((revenue / totalRevenue) * 100).toFixed(1)
    : '0.0'

  const getSourceIcon = (src: string) => {
    switch (src) {
      case 'google':
        return <Search className="w-5 h-5" />
      case 'facebook':
        return <Facebook className="w-5 h-5" />
      case 'direct':
        return <Globe className="w-5 h-5" />
      default:
        return <Eye className="w-5 h-5" />
    }
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: data.color + '20' }}
          >
            <div style={{ color: data.color }}>{getSourceIcon(source)}</div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{source}</h3>
            <p className="text-sm text-gray-500">
              {percentage}% of total revenue
            </p>
          </div>
        </div>
        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke={data.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Leads</p>
          <p className="font-semibold">{data.leads}</p>
          <p className="text-sm text-gray-600">Quotes</p>
          <p className="font-semibold">{data.quotes}</p>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="font-semibold">${revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Conv. Rate</p>
          <p className="font-semibold text-blue-600">{conversionRate}%</p>
          <p className="text-sm text-gray-600">Avg Quote</p>
          <p className="font-semibold">${avgQuoteValue.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Cost/Lead</p>
          <p className="font-semibold text-green-600">--</p>
        </div>
      </div>
    </div>
  )
}
