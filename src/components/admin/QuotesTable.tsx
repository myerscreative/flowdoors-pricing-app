'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { useMemo, useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, Trash2 } from 'lucide-react'
import type { Quote } from '@/types/quote'
import { cn } from '@/lib/utils'
import {
  getQuotesByReferral,
  type GetQuotesByReferralOpts,
} from '@/services/quoteService'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { STATUS_FILTERS } from '@/components/admin/quotes-constants'
import { getStatusClasses } from '@/components/admin/QuotesGrid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface QuotesTableProps {
  quotes: Quote[]
  isLoading: boolean
  onDeleteQuote: (_quoteId: string) => void
  onUpdateStatus?: (_quoteId: string, _newStatus: string) => void
}

/** Firestore Timestamp-like guard */
type TimestampLike = { toDate: () => Date }
const isTimestampLike = (v: unknown): v is TimestampLike =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { toDate?: unknown }).toDate === 'function'

/** Safe date formatter for Date | string | number | Timestamp-like | undefined */
function formatDate(value: unknown): string {
  if (!value) return '—'
  let d: Date | null = null

  if (isTimestampLike(value)) {
    d = value.toDate()
  } else if (value instanceof Date) {
    d = value
  } else if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) d = parsed
  }

  return d ? format(d, 'PP') : '—'
}

/** Safe currency formatter */
function formatCurrency(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }
  return '—'
}

/** Narrow Quote for optional fields that may not exist on the base type */
type QuoteWithOptional = Quote & {
  stageDates?: Record<string, unknown>
  quoteAmount?: number
}

const TableSkeleton = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-8 rounded-full" />
        </TableCell>
      </TableRow>
    ))}
  </>
)

export function QuotesTable({
  quotes,
  isLoading,
  onDeleteQuote,
  onUpdateStatus,
}: QuotesTableProps) {
  const [referralFilter, setReferralFilter] = useState('')
  const [serverMode, setServerMode] = useState<'off' | 'exact' | 'prefix'>(
    'off'
  )
  const [serverRows, setServerRows] = useState<Record<string, unknown>[]>([])
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [loading, setLoading] = useState(false)

  // Client-side filter (as you already implemented)
  const filtered = useMemo(() => {
    const f = referralFilter.trim().toLowerCase()
    if (!f || serverMode !== 'off') return quotes // ignore if server mode is on
    return quotes.filter((q) => {
      const a = String(
        (q as unknown as { referralCodeCustomer?: string })
          .referralCodeCustomer || ''
      ).toLowerCase()
      const b = String(
        (q as unknown as { referralCodeSalesperson?: string })
          .referralCodeSalesperson || ''
      ).toLowerCase()
      return a.includes(f) || b.includes(f)
    })
  }, [quotes, referralFilter, serverMode])

  // Server search effect
  useEffect(() => {
    if (serverMode === 'off') {
      setServerRows([])
      setLastDoc(null)
      return
    }
    const run = async () => {
      setLoading(true)
      try {
        const { rows, lastDoc } = await getQuotesByReferral(referralFilter, {
          mode: serverMode as 'exact' | 'prefix',
          pageSize: 50,
        } as GetQuotesByReferralOpts)
        setServerRows(rows)
        setLastDoc(lastDoc)
      } finally {
        setLoading(false)
      }
    }
    // only trigger when user types something
    if (referralFilter.trim()) run()
    else {
      setServerRows([])
      setLastDoc(null)
    }
  }, [referralFilter, serverMode])

  const loadMore = async () => {
    if (!lastDoc || !referralFilter.trim()) return
    setLoading(true)
    try {
      const { rows, lastDoc: next } = await getQuotesByReferral(
        referralFilter,
        {
          mode: serverMode as 'exact' | 'prefix',
          pageSize: 50,
          after: lastDoc,
        }
      )
      setServerRows((prev) => [...prev, ...rows])
      setLastDoc(next)
    } finally {
      setLoading(false)
    }
  }

  // Decide which dataset to render
  const rows = serverMode === 'off' ? filtered : serverRows

  // Ensure rows is always an array
  const safeRows = rows || []

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeleton />
          </TableBody>
        </Table>
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-32">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">No Quotes Found</h3>
          <p className="text-sm text-muted-foreground">
            No quotes match your current search and filter criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Referral Code Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-3 p-4 border-b border-gray-100">
        <input
          value={referralFilter}
          onChange={(e) => setReferralFilter(e.target.value)}
          placeholder="Filter by referral code…"
          className="h-9 w-64 rounded-md border px-3 text-sm"
        />
        {referralFilter && (
          <button
            onClick={() => setReferralFilter('')}
            className="h-9 rounded-md border px-3 text-sm"
          >
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-600">Search mode:</span>
          <select
            value={serverMode}
            onChange={(e) =>
              setServerMode(e.target.value as 'off' | 'exact' | 'prefix')
            }
            className="h-9 rounded-md border px-2"
            title="Client filter is instant; server search scales to large datasets"
          >
            <option value="off">Client filter</option>
            <option value="exact">Server: exact</option>
            <option value="prefix">Server: starts with</option>
          </select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-50">
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600">
              Quote #
            </TableHead>
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600">
              Customer
            </TableHead>
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600">
              Status
            </TableHead>
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600">
              Date
            </TableHead>
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600">
              Entered Stage
            </TableHead>
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600">
              Amount
            </TableHead>
            <TableHead className="p-4 bg-gray-50 font-semibold text-gray-600 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeRows.map((quote) => {
            const q = quote as QuoteWithOptional
            const { customClass } = getStatusClasses(q.status)
            const customerName =
              `${q.firstName ?? ''} ${q.lastName ?? ''}`.trim()

            const created = formatDate(q.createdAt as unknown)

            const statusKey = String(q.status ?? '')
            const enteredStage = formatDate(q.stageDates?.[statusKey])

            const amount = formatCurrency(q.quoteAmount)

            return (
              <TableRow key={q.id} className="border-b-gray-100">
                <TableCell className="p-4 font-medium text-gray-800">
                  <Link
                    href={`/admin/quotes/${q.id}`}
                    className="hover:underline"
                  >
                    {q.quoteNumber ?? '—'}
                  </Link>
                </TableCell>
                <TableCell className="p-4">
                  <div className="font-medium text-gray-800">
                    {customerName || '—'}
                  </div>
                  <div className="text-sm text-gray-500">{q.company ?? ''}</div>
                  {q.referralCodeCustomer && (
                    <div className="mt-1">
                      <span className="text-[10px] px-2 py-1 rounded bg-slate-100 border text-slate-700">
                        Ref: {q.referralCodeCustomer}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="p-4">
                  {onUpdateStatus ? (
                    <StatusDropdown
                      status={q.status}
                      onChange={(_next) => onUpdateStatus(q.id, _next)}
                    />
                  ) : (
                    <div
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wide',
                        customClass
                      )}
                    >
                      {q.status}
                    </div>
                  )}
                </TableCell>
                <TableCell className="p-4 text-gray-600">{created}</TableCell>
                <TableCell className="p-4 text-gray-600">
                  {enteredStage}
                </TableCell>
                <TableCell className="p-4 font-medium text-gray-800">
                  {amount}
                </TableCell>
                <TableCell className="p-4 text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/quotes/${q.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this quote?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the quote ({q.quoteNumber}) for{' '}
                          {customerName || 'this customer'}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className={cn(
                            buttonVariants({ variant: 'destructive' })
                          )}
                          onClick={() => onDeleteQuote(q.id)}
                        >
                          Delete Quote
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {serverMode !== 'off' && !!safeRows.length && lastDoc && (
        <div className="pt-2 p-4 border-t border-gray-100">
          <button
            onClick={loadMore}
            disabled={loading}
            className="h-9 rounded-md border px-3 text-sm"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {serverMode !== 'off' &&
        !loading &&
        referralFilter.trim() &&
        safeRows.length === 0 && (
          <div className="p-4 text-sm text-slate-500 text-center">
            No results for "{referralFilter}".
          </div>
        )}
    </div>
  )
}

function StatusDropdown({
  status,
  onChange,
}: {
  status: string
  onChange: (_next: string) => void
}) {
  const { customClass } = getStatusClasses(status)
  const OPTIONS = STATUS_FILTERS as readonly string[]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wide',
            customClass
          )}
        >
          {status}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
        {/* Deletion is handled in Actions column; keeping status menu focused */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
