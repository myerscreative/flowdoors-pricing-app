'use client'

import type { ElementType } from 'react'

interface KpiCardProps {
  title: string
  value: string
  icon: ElementType
  colorClass: string
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:border-flowdoors-blue-200">
      <div className="flex items-center space-x-2 mb-3">
        <div className={`p-2 rounded-lg ${colorClass.includes('purple') ? 'bg-purple-50' : colorClass.includes('green') ? 'bg-flowdoors-green-50' : colorClass.includes('blue') ? 'bg-flowdoors-blue-50' : 'bg-orange-50'}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}
