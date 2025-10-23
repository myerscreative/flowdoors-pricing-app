// src/components/summary/QuoteTotals.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function QuoteTotals() {
  const { state } = useQuote()
  const { totals } = state

  if (!totals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Total Quote Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pricing data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Total Quote Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <div className="flex justify-between py-1">
            <dt className="text-muted-foreground">All Items Subtotal</dt>
            <dd className="font-medium">${totals.subtotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-muted-foreground">Installation</dt>
            <dd className="font-medium">
              ${totals.installationCost.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="font-medium">
              ${totals.deliveryCost.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-muted-foreground">Estimated Tax (8%)</dt>
            <dd className="font-medium">${totals.tax.toLocaleString()}</dd>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between py-2 text-xl">
            <dt className="font-bold">Grand Total</dt>
            <dd className="font-bold text-blue-600">
              ${totals.grandTotal.toLocaleString()}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
