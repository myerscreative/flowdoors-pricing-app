// src/app/summary/page.tsx
'use client'

import { useEffect } from 'react'
import { useQuote } from '@/context/QuoteContext'
import { ProgressBar } from '@/components/summary/ProgressBar'
import { QuoteSummaryHeader } from '@/components/summary/QuoteSummaryHeader'
import { EnhancedItemsTable } from '@/components/summary/EnhancedItemsTable'
import { EnhancedQuoteItemCard } from '@/components/summary/EnhancedQuoteItemCard'
import { EnhancedQuoteServices } from '@/components/summary/EnhancedQuoteServices'
import { EnhancedQuoteTotals } from '@/components/summary/EnhancedQuoteTotals'

export default function SummaryPage() {
  const { state, dispatch } = useQuote()

  // Trigger price calculation when the summary page loads
  useEffect(() => {
    dispatch({ type: 'CALCULATE_PRICES' })
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Progress Bar */}
        <ProgressBar />

        {/* Header */}
        <QuoteSummaryHeader />

        {/* Main Content - Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Items List & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items Table */}
            <EnhancedItemsTable />

            {/* Active Item Details */}
            {state.items.length > 0 && <EnhancedQuoteItemCard />}

            {/* Services Section */}
            <EnhancedQuoteServices />
          </div>

          {/* Right Column - Sticky Summary Sidebar */}
          <div className="lg:col-span-1">
            <EnhancedQuoteTotals />
          </div>
        </div>
      </div>
    </div>
  )
}
