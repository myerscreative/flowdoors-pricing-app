'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

export type PipelineBar = { stage: string; value: number; deals: number }

export type PipelineByStageChartProps = {
  data: PipelineBar[]
  fmtMoney: (_value: number) => string
  fmtMoneyK: (_value: number) => string
}

export default function PipelineByStageChart({
  data,
  fmtMoney,
  fmtMoneyK,
}: PipelineByStageChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="stage" stroke="#64748b" />
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
            formatter={(_value: number) => [fmtMoney(_value), 'Value']}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
