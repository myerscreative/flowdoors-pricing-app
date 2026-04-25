import { cn } from '@/lib/utils'
import { DollarSign, Plus } from 'lucide-react'
import type { PricingRow } from './types'

interface PricingBreakdownProps {
  subtotal: number
  rows?: PricingRow[]
  total: number
  installQuoteUrl?: string
  className?: string
}

export function PricingBreakdown({
  subtotal,
  rows = [],
  total,
  installQuoteUrl,
  className,
}: PricingBreakdownProps) {
  return (
    <section
      aria-label="Pricing"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Pricing</h3>
        </div>
        <div className="text-base font-semibold tabular-nums">
          {formatUSD(total)}
        </div>
      </div>

      <dl className="space-y-2 p-5">
        <Row label="Subtotal" amount={subtotal} muted />
        {installQuoteUrl ? (
          <div>
            <a
              href={installQuoteUrl}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3 w-3" />
              Create Installation Quote
            </a>
          </div>
        ) : null}
        {rows.map((r) => (
          <Row key={r.label} label={r.label} amount={r.amount} muted />
        ))}
        <div className="mt-3 border-t pt-3">
          <Row label="Total" amount={total} bold />
        </div>
      </dl>
    </section>
  )
}

function Row({
  label,
  amount,
  muted = false,
  bold = false,
}: {
  label: string
  amount: number
  muted?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt
        className={cn(
          muted && 'text-muted-foreground',
          bold && 'font-semibold text-foreground'
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'tabular-nums',
          bold ? 'text-base font-semibold' : 'font-medium',
          muted && !bold && 'text-foreground/90'
        )}
      >
        {formatUSD(amount)}
      </dd>
    </div>
  )
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
