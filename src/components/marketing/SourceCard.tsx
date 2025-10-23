'use client'

import { Eye, Facebook, Globe, Search } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'

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
      className="bg-white rounded-xl border border-gray-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-flowdoors-blue-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div
            className="p-3 rounded-xl shadow-md"
            style={{ backgroundColor: data.color + '15' }}
          >
            <div style={{ color: data.color }}>{getSourceIcon(source)}</div>
          </div>
          <div>
            <h3 className="font-bold text-flowdoors-charcoal-800 capitalize text-lg">{source}</h3>
            <p className="text-sm text-gray-500 font-medium">
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
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Leads</p>
            <p className="font-bold text-flowdoors-charcoal-800 text-lg">{data.leads}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quotes</p>
            <p className="font-bold text-flowdoors-charcoal-800 text-lg">{data.quotes}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revenue</p>
            <p className="font-bold text-flowdoors-charcoal-800 text-lg">${revenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Conv. Rate</p>
            <p className="font-bold text-flowdoors-blue-600 text-lg">{conversionRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Quote</p>
            <p className="font-bold text-flowdoors-charcoal-800 text-lg">${avgQuoteValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cost/Lead</p>
            <p className="font-bold text-flowdoors-green-600 text-lg">--</p>
          </div>
        </div>
      </div>
    </div>
  )
}
