'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { Order } from '@/lib/types'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
}

function StatusBadge({ status }: { status?: string }) {
  const key = (status || 'default').toLowerCase()
  const classes = statusStyles[key] ?? statusStyles.default
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        classes
      )}
    >
      {status || '—'}
    </span>
  )
}

/* ---------- Small, safe accessors (no `any`) ---------- */
function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object'
}
function getStr(o: unknown, k: string): string | undefined {
  return isObj(o) && typeof o[k] === 'string' ? (o[k] as string) : undefined
}
function getNum(o: unknown, k: string): number | undefined {
  return isObj(o) && typeof o[k] === 'number' ? (o[k] as number) : undefined
}
function firstDefined<T>(vals: Array<T | undefined | null>): T | undefined {
  for (const v of vals)
    if (v !== undefined && v !== null && v !== '') return v as T
  return undefined
}
function toDateOrUndefined(v: unknown): Date | undefined {
  if (v instanceof Date) return v
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return d
  }
  return undefined
}
/* ----------------------------------------------------- */

function formatDateUnsafe(value?: string | Date | null) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

interface OrdersGridProps {
  orders: Order[]
  onDeleteOrder?: (_orderId: string) => void
  canDelete?: boolean
}

export function OrdersGrid({
  orders,
  onDeleteOrder,
  canDelete = false,
}: OrdersGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((o) => {
        const orderNumber =
          firstDefined<string>([
            getStr(o as unknown, 'orderNumber'),
            getStr(o as unknown, 'id'),
            getStr(o as unknown, 'orderId'),
          ]) ?? '—'

        const firstName = getStr(o as unknown, 'firstName')
        const lastName = getStr(o as unknown, 'lastName')
        const customerName =
          firstName || lastName
            ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
            : (getStr(o as unknown, 'customerName') ?? '—')

        const amount = getNum(o as unknown, 'orderAmount') ?? 0
        const itemCount = getNum(o as unknown, 'numberOfItems') ?? 0

        // Robust slug resolution: prefer id → orderId → orderNumber
        const slugSource =
          firstDefined<string>([
            getStr(o as unknown, 'id'),
            getStr(o as unknown, 'orderId'),
            getStr(o as unknown, 'orderNumber'),
          ]) ?? null
        const orderSlug: string | null = slugSource ? String(slugSource) : null

        const cardKey =
          firstDefined<string>([
            getStr(o as unknown, 'id'),
            getStr(o as unknown, 'orderId'),
            getStr(o as unknown, 'orderNumber'),
            orderNumber,
          ]) ?? orderNumber

        const status = getStr(o as unknown, 'status')

        // Clean createdAt: Date | string | null
        const createdAtVal: string | Date | null =
          toDateOrUndefined(
            (o as unknown as Record<string, unknown>)['createdAt']
          ) ??
          getStr(o as unknown, 'createdAt') ??
          null

        return (
          <div
            key={cardKey}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            {/* Header: status + created date */}
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge status={status} />
              <span className="text-xs font-medium text-gray-400">
                {formatDateUnsafe(createdAtVal)}
              </span>
            </div>

            {/* Order number */}
            <div className="mb-1 text-xs font-mono text-gray-500">
              Order #{' '}
              <span className="font-semibold text-gray-700">{orderNumber}</span>
            </div>

            {/* Customer */}
            <div className="mb-1 text-lg font-semibold text-gray-900">
              {customerName}
            </div>

            {/* Amount */}
            <div className="mb-2 text-xl font-bold text-gray-900">
              {amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </div>

            {/* Items */}
            <div className="mb-4 text-sm text-gray-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </div>

            {/* CTA */}
            <div className="space-y-2">
              {orderSlug ? (
                <Button
                  asChild
                  className="h-auto w-full rounded-xl py-3 font-semibold"
                >
                  <Link
                    href={`/admin/orders/${encodeURIComponent(orderSlug)}`}
                    prefetch={false}
                  >
                    View Details
                  </Link>
                </Button>
              ) : (
                <Button
                  className="h-auto w-full rounded-xl py-3 font-semibold"
                  disabled
                  aria-disabled="true"
                  title="Missing order identifier"
                  onClick={() =>
                    console.warn(
                      'OrdersGrid: missing id/orderId/orderNumber for order',
                      o
                    )
                  }
                >
                  View Details
                </Button>
              )}

              {canDelete && onDeleteOrder && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteOrder(orderSlug || cardKey)}
                  className="h-8 w-full rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
