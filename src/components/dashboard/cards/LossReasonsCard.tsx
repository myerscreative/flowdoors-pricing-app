'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* ------------------------------- Icons (SVG) ---------------------------- */
const TrendingUp = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

export default function LossReasonsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          Loss Reasons
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-8 text-center text-gray-500">
          No loss reason data available
        </div>
      </CardContent>
    </Card>
  )
}
