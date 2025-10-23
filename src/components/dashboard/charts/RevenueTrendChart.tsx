'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { ChartGradients } from '@/components/ui/chart'

export type RevenueTrendPoint = { month: string; revenue: number }

export type RevenueTrendChartProps = {
  data: RevenueTrendPoint[]
  fmtMoney: (_value: number) => string
  fmtMoneyK: (_value: number) => string
}

export default function RevenueTrendChart({
  data,
  fmtMoney,
  fmtMoneyK,
}: RevenueTrendChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <ChartGradients />
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis
            stroke="#64748b"
            tickFormatter={(_value: number) => fmtMoneyK(_value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
            }}
            formatter={(_value: number) => [fmtMoney(_value), 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0284c7"
            strokeWidth={2.5}
            fill="url(#scenicAreaBlue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
