'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Trash2, 
  Send, 
  Notebook, 
  Calendar, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Package,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import type { Order } from '@/lib/types'

const statusStyles: Record<string, { bg: string; text: string; border: string; buttonColor: string }> = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    buttonColor: 'bg-amber-500'
  },
  confirmed: {
    bg: 'bg-flowdoors-blue-100',
    text: 'text-flowdoors-blue-800',
    border: 'border-flowdoors-blue-200',
    buttonColor: 'bg-flowdoors-blue'
  },
  in_progress: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    buttonColor: 'bg-indigo-500'
  },
  completed: {
    bg: 'bg-flowdoors-green-100',
    text: 'text-flowdoors-green-800',
    border: 'border-flowdoors-green-200',
    buttonColor: 'bg-flowdoors-green'
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    buttonColor: 'bg-gray-500'
  },
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    buttonColor: 'bg-gray-500'
  }
}

function StatusBadge({ status }: { status?: string }) {
  const key = (status || 'default').toLowerCase()
  const styles = statusStyles[key] ?? statusStyles.default
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-6 rounded-full border px-2 text-xs font-semibold uppercase tracking-wide',
            styles.bg,
            styles.text,
            styles.border,
            'hover:opacity-80'
          )}
        >
          {status || '—'}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Pending</DropdownMenuItem>
        <DropdownMenuItem>Confirmed</DropdownMenuItem>
        <DropdownMenuItem>In Progress</DropdownMenuItem>
        <DropdownMenuItem>Completed</DropdownMenuItem>
        <DropdownMenuItem>Cancelled</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  isLoading?: boolean
}

export function OrdersGrid({
  orders,
  onDeleteOrder,
  canDelete = false,
  isLoading = false,
}: OrdersGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:gap-6 xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="min-w-0 w-full">
            <Skeleton className="w-full rounded-xl h-96" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-32">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">No orders found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:gap-6 xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-max">
      {orders.map((order) => {
        const orderNumber =
          firstDefined<string>([
            getStr(order as unknown, 'orderNumber'),
            getStr(order as unknown, 'id'),
            getStr(order as unknown, 'orderId'),
          ]) ?? '—'

        const firstName = getStr(order as unknown, 'firstName')
        const lastName = getStr(order as unknown, 'lastName')
        const customerName =
          firstName || lastName
            ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
            : (getStr(order as unknown, 'customerName') ?? '—')

        const amount = getNum(order as unknown, 'orderAmount') ?? 0
        const itemCount = getNum(order as unknown, 'numberOfItems') ?? 0
        const status = getStr(order as unknown, 'status')
        const company = getStr(order as unknown, 'company') ?? '—'
        const phone = getStr(order as unknown, 'phone') ?? '—'
        const zip = getStr(order as unknown, 'zip') ?? '—'

        // Clean createdAt: Date | string | null
        const createdAtVal: string | Date | null =
          toDateOrUndefined(
            (order as unknown as Record<string, unknown>)['createdAt']
          ) ??
          getStr(order as unknown, 'createdAt') ??
          null

        const orderSlug: string | null = 
          firstDefined<string>([
            getStr(order as unknown, 'id'),
            getStr(order as unknown, 'orderId'),
            getStr(order as unknown, 'orderNumber'),
          ]) ?? null

        const cardKey =
          firstDefined<string>([
            getStr(order as unknown, 'id'),
            getStr(order as unknown, 'orderId'),
            getStr(order as unknown, 'orderNumber'),
            orderNumber,
          ]) ?? orderNumber

        return (
          <div key={cardKey} className="min-w-0 w-full overflow-hidden">
            <div className="w-full min-w-[320px] max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-2xl font-bold text-flowdoors-charcoal">
                        {customerName || '—'}
                      </h2>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Notebook className="h-4 w-4" />
                        <span>#{orderNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateUnsafe(createdAtVal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Amount Section */}
                <div className="bg-gradient-to-br from-flowdoors-blue-50 to-indigo-50 rounded-lg p-4 border border-flowdoors-blue-100">
                  <div className="text-sm text-gray-600 mb-1">Order Amount</div>
                  <div className="text-3xl font-bold text-flowdoors-charcoal">
                    {amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-6"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Customer</div>
                    <div className="text-sm font-medium text-flowdoors-charcoal">{customerName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Company</div>
                    <div className="text-sm font-medium text-flowdoors-charcoal">{company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm font-medium text-flowdoors-charcoal">{phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">ZIP</div>
                    <div className="text-sm font-medium text-flowdoors-charcoal">{zip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Items</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-flowdoors-charcoal">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="bg-flowdoors-blue-100 text-flowdoors-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {itemCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <Button variant="ghost" className="w-full justify-between p-3 h-auto text-left">
                  <div className="flex items-center gap-2">
                    <Notebook className="h-4 w-4" />
                    <span className="text-sm">Notes · Tasks (0)</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {orderSlug ? (
                  <Button asChild className="flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-700">
                    <Link href={`/admin/orders/${encodeURIComponent(orderSlug)}`}>
                      View Details
                    </Link>
                  </Button>
                ) : (
                  <Button className="flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-700" disabled>
                    View Details
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="p-2">
                  <Send className="h-4 w-4 text-flowdoors-blue hover:text-flowdoors-blue-700" />
                </Button>
                
                {canDelete && onDeleteOrder && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteOrder(orderSlug || cardKey)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
