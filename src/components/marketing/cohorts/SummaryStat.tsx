import { ReactNode } from 'react'

export default function SummaryStat({
  icon,
  label,
  value,
  caption,
}: {
  icon?: ReactNode
  label: string
  value: string
  caption?: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        {icon ? <div className="text-blue-600">{icon}</div> : null}
        <div className="text-sm text-gray-500">{label}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {caption ? (
        <div className="text-xs text-gray-500 mt-1">{caption}</div>
      ) : null}
    </div>
  )
}
