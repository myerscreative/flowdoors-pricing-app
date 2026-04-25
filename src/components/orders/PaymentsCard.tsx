import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'
import type { PaymentRecord, PaymentStatus } from './types'

interface PaymentsCardProps {
  payments: PaymentRecord[]
  total: number
  className?: string
}

export function PaymentsCard({ payments, total, className }: PaymentsCardProps) {
  const paid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

  return (
    <section
      aria-label="Payments"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Payments</h3>
        </div>
        <div className="text-right text-sm tabular-nums">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatUSD(paid)}
          </span>
          <span className="mx-1.5 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatUSD(total)}</span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <Progress
            value={pct}
            aria-label={`${pct}% paid`}
            className="h-2 [&>*]:bg-emerald-500"
          />
          <div className="text-xs text-muted-foreground">{pct}% paid</div>
        </div>

        <ul className="space-y-3">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-4 rounded-xl border bg-background/40 p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full',
                    dotClass(p.status)
                  )}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.label}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.date ? p.date : ''}
                    {p.date && p.method ? ' · ' : ''}
                    {p.method ? `via ${p.method}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">
                  {formatUSD(p.amount)}
                </span>
                <StatusPill status={p.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function dotClass(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500'
    case 'due':
      return 'bg-amber-500'
    case 'overdue':
      return 'bg-destructive'
    default:
      return 'bg-muted-foreground/50'
  }
}

function StatusPill({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    paid: {
      label: 'PAID',
      cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
    },
    due: {
      label: 'DUE',
      cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/20',
    },
    overdue: {
      label: 'OVERDUE',
      cls: 'bg-destructive/15 text-destructive ring-destructive/20',
    },
    pending: {
      label: 'PENDING',
      cls: 'bg-muted text-muted-foreground ring-border',
    },
  }
  const { label, cls } = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
        cls
      )}
    >
      {label}
    </span>
  )
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
