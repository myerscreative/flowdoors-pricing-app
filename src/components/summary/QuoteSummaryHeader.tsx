// src/components/summary/QuoteSummaryHeader.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'

export function QuoteSummaryHeader() {
  const { state } = useQuote()
  const itemCount = state.items.length

  return (
    <div className="mb-12 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-flowdoors-green/10 to-flowdoors-blue/10 rounded-full mb-6">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-flowdoors-green to-flowdoors-green-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-flowdoors-charcoal">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Configured
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-flowdoors-charcoal mb-4">
        Almost there! 🎉
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        Review your selections below. You can easily edit, duplicate, or remove items before finalizing your quote.
      </p>
    </div>
  )
}
