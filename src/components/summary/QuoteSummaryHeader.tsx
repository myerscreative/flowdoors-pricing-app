// src/components/summary/QuoteSummaryHeader.tsx
'use client'

export function QuoteSummaryHeader() {
  return (
    <div className="mb-8 relative">
      <h2 className="text-3xl font-bold text-center font-headline">
        Your Quote Summary
      </h2>
      <p className="text-muted-foreground text-center mt-2 max-w-xl mx-auto">
        Review your selections below. You can go back to make changes.
      </p>
    </div>
  )
}
