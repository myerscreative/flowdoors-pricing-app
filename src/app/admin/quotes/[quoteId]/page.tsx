/* src/app/admin/quotes/[quoteId]/page.tsx */
'use client'

// Force dynamic rendering to prevent SSR issues with Firebase
export const dynamic = 'force-dynamic'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CheckCircle, ChevronLeft, Edit, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

/* Print preview imports */
import FlowDoorsQuoteLayout from '@/components/pdf/FlowDoorsQuoteLayout'
import { mapStateToPdfProps } from '@/lib/pdf-adapters'
import { getEmailEvents, type EmailEvent } from '@/services/emailEventsService'

/* ===== Types (minimal shape used by this page) ===== */

type DiscountEntry = { type: 'amount' | 'percent'; value: number }

type QuoteTotals = {
  subtotal?: number
  installationCost?: number
  deliveryCost?: number
  screens?: number
  crating?: number
  tax?: number
  tradeDiscount?: number
  tradeDiscountType?: 'amount' | 'percent'
  tradeDiscountPercent?: number
  tradeDiscounts?: DiscountEntry[]
  grandTotal?: number
}

type TimestampLike = Date | number | string | { toDate?: () => Date }

type QuoteCustomer = {
  name?: string
  firstName?: string
  lastName?: string
  email?: string
}

type QuoteDetails = {
  id: string
  quote_number?: string
  quoteId?: string
  createdAt?: TimestampLike
  status?: string
  stageDates?: Record<string, TimestampLike>
  customer?: QuoteCustomer
  totals?: QuoteTotals
  // Other fields may exist but are not used here
}

/* ===== Dynamic service function types (replace former `any`) ===== */
type GetQuoteById = (_id: string) => Promise<QuoteDetails>
type SetQuoteDiscounts = (
  _id: string,
  _discounts: DiscountEntry[]
) => Promise<void>
type UpdateQuoteStatus = (_id: string, _newStatus: string) => Promise<void>
type GenerateQuotePdf = (
  _quote: QuoteDetails
) => Promise<{ pdfBase64: string; fileName?: string; quoteId?: string }>

// Dynamic imports to prevent SSR issues
let getQuoteById: GetQuoteById | undefined
let setQuoteDiscounts: SetQuoteDiscounts | undefined
let updateQuoteStatus: UpdateQuoteStatus | undefined
let generateQuotePdf: GenerateQuotePdf | undefined

// Initialize Firebase-dependent services dynamically
async function initServices() {
  if (
    !getQuoteById ||
    !generateQuotePdf ||
    !setQuoteDiscounts ||
    !updateQuoteStatus
  ) {
    const quoteService = await import('@/services/quoteService')
    const generatePdf = await import('@/lib/generate-pdf')
    getQuoteById = quoteService.getQuoteById as GetQuoteById
    setQuoteDiscounts = quoteService.setQuoteDiscounts as SetQuoteDiscounts
    updateQuoteStatus = quoteService.updateQuoteStatus as UpdateQuoteStatus
    generateQuotePdf = generatePdf.generateQuotePdf as GenerateQuotePdf
  }
}

/* ===== Helpers ===== */

function toDateSafe(value: TimestampLike | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'object' && value?.toDate) {
    try {
      return value.toDate()
    } catch {
      return null
    }
  }
  return null
}

export default function QuoteDetailPage() {
  // --- HOOKS FIRST (no conditionals above this line) ---
  const params = useParams() as { quoteId?: string } | null
  const [isClient, setIsClient] = useState(false)
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)
  const [discountDraft, setDiscountDraft] = useState<string>('')
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>(
    'amount'
  )
  const [isSavingDiscount, setIsSavingDiscount] = useState<boolean>(false)
  const [discounts, setDiscounts] = useState<DiscountEntry[]>([])
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([])
  const [loadingEmailEvents, setLoadingEmailEvents] = useState(false)
  const { toast } = useToast()

  // 2) DERIVED VALUES (not Hooks)
  const quoteId = params?.quoteId ?? ''

  // 3) EFFECTS (still part of hook block—always run in same order)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchQuote = async () => {
      if (!quoteId) return
      setIsLoading(true)
      try {
        // Initialize services first
        await initServices()

        if (!getQuoteById) throw new Error('getQuoteById not available')
        const quote = await getQuoteById(quoteId)
        setQuoteDetails(quote)
        const t = quote?.totals
        if (t && Array.isArray(t.tradeDiscounts)) {
          setDiscounts(t.tradeDiscounts)
        }
      } catch (error) {
        console.error('Failed to fetch quote details:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuote()
  }, [quoteId])

  // Load email events function
  const loadEmailEvents = useCallback(async () => {
    if (!quoteId) return

    setLoadingEmailEvents(true)
    try {
      const events = await getEmailEvents(quoteId)
      setEmailEvents(events)
    } catch (error) {
      console.error('Error loading email events:', error)
    } finally {
      setLoadingEmailEvents(false)
    }
  }, [quoteId])

  // Load email events when quote is loaded
  useEffect(() => {
    if (quoteDetails && isClient) {
      loadEmailEvents()
    }
  }, [quoteDetails, isClient, loadEmailEvents])

  // 4) EARLY RETURNS AFTER ALL HOOKS
  if (!isClient) {
    return (
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 sm:p-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading quote details...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="grid flex-1 items-start gap-8 p-6">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="col-span-1 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </main>
    )
  }

  if (!quoteDetails) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Quote Not Found</CardTitle>
            <CardDescription>
              The quote you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/quotes">Back to Quotes</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // 5) RENDER - Helper functions and derived values
  const { status } = quoteDetails
  const quoteNumber = quoteDetails.quote_number || quoteDetails.quoteId
  const customerName =
    quoteDetails.customer?.name ||
    [quoteDetails.customer?.firstName, quoteDetails.customer?.lastName]
      .filter(Boolean)
      .join(' ')

  // Resend email function
  const handleResendEmail = async () => {
    if (!quoteId) return

    setSendingEmail(true)
    try {
      const response = await fetch('/api/quotes/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Quote Email Sent',
          description: `Quote has been sent to ${quoteDetails.customer?.email}`,
        })
        // Reload email events after successful send
        await loadEmailEvents()
      } else {
        toast({
          title: 'Email Failed',
          description: result.message || 'Failed to send quote email',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Resend email error:', error)
      toast({
        title: 'Email Failed',
        description: 'Failed to send quote email',
        variant: 'destructive',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  // Status options for the dropdown

  const statusClasses: Record<string, string> = {
    new: 'bg-blue-100/80 text-blue-700',
    hot: 'bg-red-100/80 text-red-700',
    warm: 'bg-yellow-100/80 text-yellow-700',
    cold: 'bg-green-100/80 text-green-700',
    hold: 'bg-gray-200 text-gray-800',
    archived: 'bg-gray-100 text-gray-500',
    default: 'bg-gray-100 text-gray-700',
  }

  const statusClass =
    statusClasses[status?.toLowerCase() as keyof typeof statusClasses] ||
    statusClasses.default

  const enteredStageDisplay = (() => {
    try {
      const key = String(status || '')
      const val = quoteDetails.stageDates?.[key]
      if (!val) return null
      const d = toDateSafe(val)
      return d ? format(d, 'PP') : null
    } catch {
      return null
    }
  })()

  // Function to handle status updates
  const handleStatusUpdate = async (newStatus: string) => {
    if (!quoteId || !quoteDetails) return

    try {
      await initServices()
      if (!updateQuoteStatus) throw new Error('updateQuoteStatus not available')
      await updateQuoteStatus(quoteId, newStatus)
      // Update local state
      setQuoteDetails((prev) => (prev ? { ...prev, status: newStatus } : null))
    } catch (error) {
      console.error('Error updating quote status:', error)
    }
  }

  const addDiscountEntry = () => {
    const v = Math.max(0, Number(discountDraft) || 0)
    if (!v) return
    setDiscounts((prev) => [...prev, { type: discountType, value: v }])
    setDiscountDraft('')
  }

  const deleteDiscountAt = async (idx: number) => {
    const next = discounts.filter((_, i) => i !== idx)
    setDiscounts(next)
    if (quoteDetails) {
      setIsSavingDiscount(true)
      try {
        await initServices()
        if (!setQuoteDiscounts)
          throw new Error('setQuoteDiscounts not available')
        await setQuoteDiscounts(quoteDetails.id, next)
        setQuoteDetails((prev) =>
          prev
            ? {
                ...prev,
                totals: { ...(prev.totals || {}), tradeDiscounts: next },
              }
            : prev
        )
      } finally {
        setIsSavingDiscount(false)
      }
    }
  }

  const persistDiscounts = async () => {
    if (!quoteDetails) return
    setIsSavingDiscount(true)
    try {
      await initServices()
      if (!setQuoteDiscounts) throw new Error('setQuoteDiscounts not available')
      await setQuoteDiscounts(quoteDetails.id, discounts)
      setQuoteDetails((prev) =>
        prev
          ? {
              ...prev,
              totals: { ...(prev.totals || {}), tradeDiscounts: discounts },
            }
          : prev
      )
    } finally {
      setIsSavingDiscount(false)
    }
  }

  const handleExportPdf = async () => {
    if (!quoteDetails) return
    setIsGeneratingPdf(true)
    try {
      await initServices()
      if (!generateQuotePdf) throw new Error('generateQuotePdf not available')
      const {
        pdfBase64,
        fileName,
        quoteId: generatedQuoteId,
      } = await generateQuotePdf(quoteDetails)

      // download from base64 (works in browser)
      const bstr = atob(pdfBase64)
      const bytes = new Uint8Array(bstr.length)
      for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || `Quote-${generatedQuoteId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6 sm:p-10">
        {/* Header */}
        <header className="flex items-center gap-4 mb-12 pb-6 border-b border-gray-200">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white shadow-sm hover:bg-slate-100 hover:-translate-y-0.5 transition-transform"
          >
            <Link href="/admin/quotes">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to Quotes</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quote {quoteNumber}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span>For: {customerName || 'N/A'}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border-none cursor-pointer hover:opacity-80 transition-opacity',
                      statusClass
                    )}
                  >
                    {status}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {['New', 'Hot', 'Warm', 'Cold', 'Hold', 'Archived'].map(
                    (statusOption) => (
                      <DropdownMenuItem
                        key={statusOption}
                        onClick={() => handleStatusUpdate(statusOption)}
                        className="cursor-pointer"
                      >
                        <CheckCircle
                          className={cn(
                            'mr-2 h-4 w-4',
                            status === statusOption
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {statusOption}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <span>
                Created:{' '}
                {(() => {
                  const d = toDateSafe(quoteDetails.createdAt)
                  return d ? format(d, 'PP') : 'N/A'
                })()}
              </span>
              {enteredStageDisplay && (
                <span>Entered: {enteredStageDisplay}</span>
              )}
            </div>
          </div>
        </header>

        {/* Toolbar + full-width Print Preview */}
        <section className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Print Preview
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              What you see below is exactly what will be exported to PDF (one
              item per page).
            </p>

            {/* Add Discount Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Discount
              </h3>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder={String(
                      quoteDetails?.totals?.tradeDiscount ?? 0
                    )}
                    value={discountDraft}
                    onChange={(e) => setDiscountDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addDiscountEntry()
                    }}
                    className="w-32 rounded border border-gray-300 px-3 py-2"
                  />
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(
                        e.target.value === 'percent' ? 'percent' : 'amount'
                      )
                    }
                    className="rounded border border-gray-300 px-2 py-2"
                  >
                    <option value="amount">$</option>
                    <option value="percent">%</option>
                  </select>
                  <Button onClick={addDiscountEntry} className="h-10">
                    Add
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="h-10"
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? 'Generating...' : 'Export PDF'}
                </Button>
              </div>

              {/* Discount List */}
              {discounts.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {discounts.map((d, i) => (
                      <span
                        key={`${d.type}-${d.value}-${i}`}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        <button
                          className="mr-2 text-blue-600 hover:underline"
                          onClick={() => {
                            setDiscountType(d.type)
                            setDiscountDraft(String(d.value))
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="mr-2 text-red-600 hover:underline"
                          onClick={() => deleteDiscountAt(i)}
                          disabled={isSavingDiscount}
                        >
                          Delete
                        </button>
                        {d.type === 'percent'
                          ? `${d.value}%`
                          : `$${d.value.toLocaleString()}`}
                      </span>
                    ))}
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={persistDiscounts}
                      disabled={isSavingDiscount}
                    >
                      {isSavingDiscount ? 'Saving...' : 'Save All'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {(() => {
            const props = mapStateToPdfProps(quoteDetails)
            return <FlowDoorsQuoteLayout {...props} />
          })()}
        </section>

        {/* Email History */}
        <section className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>
                Track all quote emails sent to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEmailEvents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading email history...</span>
                </div>
              ) : emailEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No emails have been sent for this quote yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{event.to}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {event.status === 'sent' ? 'Sent' : 'Failed'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {format(event.sentAt.toDate(), 'PPpp')}
                        </div>
                        {event.openedAt && (
                          <div className="text-sm text-blue-600 mt-1">
                            📧 Opened: {format(event.openedAt.toDate(), 'PPpp')}
                            {event.openCount &&
                              event.openCount > 1 &&
                              ` (${event.openCount} times)`}
                          </div>
                        )}
                        {event.clickedAt && (
                          <div className="text-sm text-green-600 mt-1">
                            🔗 Clicked:{' '}
                            {format(event.clickedAt.toDate(), 'PPpp')}
                            {event.clickCount &&
                              event.clickCount > 1 &&
                              ` (${event.clickCount} times)`}
                          </div>
                        )}
                        {event.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {event.error}
                          </div>
                        )}
                      </div>
                      <CheckCircle
                        className={`h-5 w-5 ${
                          event.status === 'sent'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Actions */}
        <div className="mt-10 flex justify-center flex-wrap gap-4">
          <Button className="rounded-lg h-12 px-6 shadow-sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Quote
          </Button>
          <Button
            className="rounded-lg h-12 px-6 shadow-sm"
            onClick={handleResendEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {sendingEmail ? 'Sending...' : 'Send to Customer'}
          </Button>
        </div>
      </div>
    </main>
  )
}
