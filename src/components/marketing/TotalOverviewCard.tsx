'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, DollarSign } from 'lucide-react'

export interface Totals {
  leads: number
  quotes: number
  amount: number
}

export function TotalOverviewCard({ totals }: { totals: Totals }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded border p-4 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Leads</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="mt-2 text-2xl font-bold">
              {totals.leads.toLocaleString()}
            </div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Quotes</span>
              <FileText className="h-4 w-4" />
            </div>
            <div className="mt-2 text-2xl font-bold">
              {totals.quotes.toLocaleString()}
            </div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Revenue</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="mt-2 text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(totals.amount)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TotalOverviewCard
