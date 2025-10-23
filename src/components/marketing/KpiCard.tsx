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
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}
