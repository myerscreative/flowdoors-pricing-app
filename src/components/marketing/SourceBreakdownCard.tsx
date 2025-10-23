'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SourceMetrics {
  leads: number
  quotes: number
  amount: number
}

const colorDot: Record<string, string> = {
  google: 'bg-[#4285F4]',
  facebook: 'bg-[#1877F2]',
  direct: 'bg-[#34A853]',
  other: 'bg-gray-500',
}

export function SourceBreakdownCard({
  source,
  data,
}: {
  source: 'google' | 'facebook' | 'direct' | 'other'
  data: SourceMetrics
}) {
  const conversion = data.leads > 0 ? (data.quotes / data.leads) * 100 : 0
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={`inline-block h-3 w-3 rounded-full ${colorDot[source]}`}
          />
          <span className="capitalize">{source}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Leads</span>
          <span className="font-semibold">{data.leads.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quotes</span>
          <span className="font-semibold">{data.quotes.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Revenue</span>
          <span className="font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(data.amount)}
          </span>
        </div>
        {data.leads > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion</span>
              <span className="font-semibold text-green-600">
                {conversion.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SourceBreakdownCard
