'use client'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

type Row = { code: string; quotes: number }

export default function ReferralBar({ data }: { data: Row[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="code" hide />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="quotes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
