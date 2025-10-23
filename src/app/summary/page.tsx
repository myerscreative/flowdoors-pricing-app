// src/app/summary/page.tsx
'use client'

import { useEffect } from 'react'
import { useQuote } from '@/context/QuoteContext'
import { QuoteSummaryHeader } from '@/components/summary/QuoteSummaryHeader'
import ItemsTable from '@/components/summary/ItemsTable'
import { QuoteItemsList } from '@/components/summary/QuoteItemsList'
import { QuoteServices } from '@/components/summary/QuoteServices'
import { QuoteTotals } from '@/components/summary/QuoteTotals'
import { QuoteActions } from '@/components/summary/QuoteActions'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SummaryPage() {
  const { state, dispatch } = useQuote()

  // Trigger price calculation when the summary page loads
  useEffect(() => {
    dispatch({ type: 'CALCULATE_PRICES' })
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <QuoteSummaryHeader />

        <div className="flex-grow space-y-8">
          {/* Items Selection Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Quote Items ({state.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsTable />
            </CardContent>
          </Card>

          {/* Selected Item Details */}
          {state.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Item {String.fromCharCode(65 + state.activeItemIndex)} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteItemsList />
              </CardContent>
            </Card>
          )}

          <Separator className="my-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <QuoteServices />
            <QuoteTotals />
          </div>

          <QuoteActions />
        </div>
      </div>
    </div>
  )
}
