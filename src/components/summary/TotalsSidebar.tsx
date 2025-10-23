// src/components/summary/TotalsSidebar.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Mail, Calculator, Truck, Wrench } from 'lucide-react'

type Props = {
  onDownloadPdf: () => void
  onEmailQuote: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export default function TotalsSidebar({ onDownloadPdf, onEmailQuote }: Props) {
  const { state } = useQuote()
  const { totals, installOption, deliveryOption, items } = state

  // Calculate item count and total square footage
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalSqFt = items.reduce((sum, item) => {
    const sqFt = (item.product.widthIn * item.product.heightIn) / 144
    return sum + sqFt * item.quantity
  }, 0)

  // Check if any items have pricing data
  const hasPricingData = items.some(
    (item) =>
      item.product.widthIn > 0 &&
      item.product.heightIn > 0 &&
      item.priceBreakdown
  )

  return (
    <div className="space-y-4">
      {/* Quote Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Item Count & Square Footage */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Sq Ft:</span>
            <span className="font-medium">
              {formatNumber(Number(totalSqFt.toFixed(1)))}
            </span>
          </div>

          <div className="border-t pt-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {hasPricingData ? formatCurrency(totals.subtotal) : '—'}
              </span>
            </div>

            {/* Installation Cost */}
            {installOption === 'Professional Installation' && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  Installation:
                </span>
                <span className="font-medium">
                  {hasPricingData
                    ? formatCurrency(totals.installationCost)
                    : '—'}
                </span>
              </div>
            )}

            {/* Delivery Cost */}
            {deliveryOption && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Delivery:
                </span>
                <span className="font-medium">
                  {hasPricingData ? formatCurrency(totals.deliveryCost) : '—'}
                </span>
              </div>
            )}

            {/* Tax */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tax (8%):</span>
              <span className="font-medium">
                {hasPricingData ? formatCurrency(totals.tax) : '—'}
              </span>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-600">
                {hasPricingData ? formatCurrency(totals.grandTotal) : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Selected Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Installation:</span>
            <Badge variant="outline" className="text-xs">
              {installOption || 'None'}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery:</span>
            <Badge variant="outline" className="text-xs">
              {deliveryOption || 'None'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={onDownloadPdf}
          className="w-full"
          variant="outline"
          disabled={!hasPricingData}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button
          onClick={onEmailQuote}
          className="w-full"
          disabled={!hasPricingData}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Quote
        </Button>
      </div>

      {/* Pricing Notice */}
      {!hasPricingData && (
        <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
          Complete product configuration to see pricing
        </div>
      )}
    </div>
  )
}
