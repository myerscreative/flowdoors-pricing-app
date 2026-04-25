import { cn } from '@/lib/utils'
import { Hash } from 'lucide-react'
import type { LineItem } from './types'

interface LineItemsTableProps {
  items: LineItem[]
  className?: string
}

export function LineItemsTable({ items, className }: LineItemsTableProps) {
  return (
    <section
      aria-label="Line Items"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Hash className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Line Items</h3>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          No line items yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5 text-left">Item</th>
                <th className="px-5 py-2.5 text-right">Qty</th>
                <th className="px-5 py-2.5 text-right">Price</th>
                <th className="px-5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((it) => (
                <tr
                  key={it.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium">{it.description}</div>
                    {it.subtitle ? (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {it.subtitle}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">
                    {it.qty}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                    {formatUSD(it.unitPrice)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums">
                    {formatUSD(it.qty * it.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
