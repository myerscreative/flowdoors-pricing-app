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

export type WinRateCardProps = {
  winRatePct: number
  deals: number
  pipelineDeals: number
}

export default function WinRateCard({
  winRatePct,
  deals,
  pipelineDeals,
}: WinRateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          Win Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="mb-2 text-4xl font-bold text-slate-900">
            {winRatePct.toFixed(1)}%
          </p>
          <p className="text-gray-600">of opportunities</p>
          <div className="mt-4 text-sm text-gray-500">
            Deals: {deals} | Pipeline: {pipelineDeals}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
