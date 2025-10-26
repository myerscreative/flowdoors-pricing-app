/* src/app/admin/quotes/page.tsx */
'use client'

import CustomizeViewDialog from '@/components/admin/CustomizeViewDialog'
import {
  STATUS_FILTERS,
  type Status,
} from '@/components/admin/quotes-constants'
import QuotesGrid, { getStatusClasses } from '@/components/admin/QuotesGrid'
import { QuotesTable } from '@/components/admin/QuotesTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useQuotesGridPrefs } from '@/hooks/useQuotesGridPrefs'
import { cn } from '@/lib/utils'
import {
  addNoteToQuote,
  addTaskToQuote,
  deleteQuote,
  getQuotes,
  moveQuotePipeline,
  toggleTaskCompletion,
  updateQuoteFollowUpDate,
  updateQuoteSalesRep,
  updateQuoteStatus,
  updateQuoteTags,
} from '@/services/quoteService'
import { getSalespeople, Salesperson } from '@/services/salesService'
import type { Quote, QuoteNote, QuoteTask } from '@/types/quote'
import { isPast, isToday } from 'date-fns'
import {
  AlertCircle,
  Columns,
  File,
  LayoutGrid,
  List,
  Minimize as MinimizeIcon,
  PlusCircle,
  Search,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

/* ===================== Minimal helper types used here ===================== */

type NoteLite = Pick<QuoteNote, 'id' | 'content'> & {
  timestamp?: string
  author?: string
}

type TaskLite = Pick<QuoteTask, 'id' | 'content' | 'completed'> & {
  dueDate?: Date | string
}

type LooseQuote = Quote & {
  // Optional fields that may exist in various quote shapes:
  quoteNumber?: string
  quoteAmount?: number
  salesRep?: string
  salesperson_id?: string
  last_modified_by?: string
  company?: string
  phone?: string
  zip?: string | number
  zipCode?: string | number
  lastContact?: Date | string
  numberOfItems?: number
  pipelineStage?: string
  tags?: string[]
  notes?: NoteLite[]
  tasks?: TaskLite[]
  createdAt?: Date | string | number | { toDate?: () => Date }
  followUpDate?: Date | string | number | { toDate?: () => Date }
  stageDates?: Record<string, Date | string | number | { toDate?: () => Date }>
}

/* ============================== Utilities ================================= */

const toDateSafe = (
  v: Date | string | number | { toDate?: () => Date } | undefined | null
): Date | null => {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'number') return new Date(v)
  if (typeof v === 'string') {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof v === 'object' && typeof v.toDate === 'function') {
    try {
      return v.toDate()
    } catch {
      return null
    }
  }
  return null
}

// Helper: read optional numeric subtotal if present on data
const getQuoteAmount = (q: Quote): number | undefined => {
  const lq = q as LooseQuote
  const val = lq.quoteAmount
  return typeof val === 'number' && Number.isFinite(val) ? val : undefined
}

const getString = (v: unknown): string =>
  typeof v === 'string' ? v : v == null ? '' : String(v)

const toComparable = (v: unknown): number | string => {
  if (v == null) return ''
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'string') {
    const maybeDate = new Date(v)
    return isNaN(maybeDate.getTime()) ? v : maybeDate.getTime()
  }
  if (typeof v === 'number') return v
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default function AdminQuotesPage() {
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [salespeople, setSalespeople] = useState<Salesperson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState<'status' | 'dueToday' | 'all'>(
    'all'
  )
  const [activeStatus, setActiveStatus] = useState<Status | null>(null)
  const [sortOption, setSortOption] = useState('createdAt-desc')
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'pipeline'>(
    'grid'
  )

  // persisted prefs
  const { prefs, setPrefs } = useQuotesGridPrefs()
  const isMinimized = prefs.view === 'cards' // map view mode to minimized state

  // Map new column structure to old visibleFields structure for compatibility
  const visibleFields = {
    company: prefs.columns.customer,
    phone: true, // always show phone
    zip: true, // always show zip
    lastContact: true, // always show last contact
    nextFollowUp: true, // always show next follow up
    notes: true, // always show notes
    tasks: true, // always show tasks
    numberOfItems: true, // always show number of items
  }

  // dialog open state
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const { toast } = useToast()
  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debugQuotes') === '1'

  // Helper function to resolve sales rep ID to name (stable ref for effects)
  const resolveSalesRepName = useCallback(
    (quote: LooseQuote): string => {
      // Check multiple possible fields for sales rep data
      const raw =
        quote.salesperson_id || quote.salesRep || quote.last_modified_by || ''

      if (!raw) return 'Unassigned'

      // If it's already a name (not an ID token), return it
      if (
        typeof raw === 'string' &&
        !raw.startsWith('SP-') &&
        !raw.startsWith('PS-') &&
        !raw.startsWith('QUOTE')
      ) {
        return raw
      }

      // Otherwise try to resolve ID → name (supports PS-→SP- normalization)
      const id = typeof raw === 'string' ? raw : String(raw)
      const normalized = id.replace(/^PS-/i, 'SP-')
      const hit =
        salespeople.find((sp) => sp.salesperson_id === normalized) ||
        salespeople.find((sp) => sp.id === normalized)
      return hit?.name ?? id
    },
    [salespeople]
  )

  // ✅ Proper fetch function (client-side) — initializes filteredQuotes
  const fetchData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      // Dev-only simulation: /admin/quotes?simulateError=1
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams()
      if (
        process.env.NODE_ENV !== 'production' &&
        params.get('simulateError') === '1'
      ) {
        throw new Error(
          'Simulated failure (remove ?simulateError=1 to load normally).'
        )
      }

      const [fetchedQuotes, fetchedSalespeople] = await Promise.all([
        getQuotes({ limit: 500, useCachedIfAvailable: true }),
        getSalespeople(),
      ])

      if (isDebug) {
        console.warn('Fetched quotes:', fetchedQuotes)
        console.warn('Fetched salespeople:', fetchedSalespeople)
        console.warn(
          'Sample quote salesRep resolution:',
          fetchedQuotes.slice(0, 3).map((q) => ({
            id: q.id,
            salesperson_id: (q as unknown as LooseQuote).salesperson_id,
            salesRep: (q as unknown as LooseQuote).salesRep,
            last_modified_by: (q as unknown as LooseQuote).last_modified_by,
            resolvedName: resolveSalesRepName(q as unknown as LooseQuote),
          }))
        )
      }

      setAllQuotes(fetchedQuotes as unknown as Quote[])
      // Default to "My Quotes" when a sales rep is signed in (localStorage)
      let initial = (fetchedQuotes as unknown as Quote[]) ?? []
      try {
        if (typeof window !== 'undefined') {
          const repName = (localStorage.getItem('salesRepName') || '')
            .trim()
            .toLowerCase()
          if (repName.length > 0) {
            initial = initial.filter((q) => {
              const quoteSalesRep = resolveSalesRepName(
                q as unknown as LooseQuote
              )
              return quoteSalesRep.toLowerCase() === repName
            })
          }
        }
      } catch (e) {
        if (isDebug) console.warn('LocalStorage access failed:', e)
      }
      setFilteredQuotes(initial)
      setSalespeople(fetchedSalespeople)

      if (isDebug) {
        console.warn('State after fetch - allQuotes:', fetchedQuotes)
        console.warn('State after fetch - filteredQuotes:', initial)
      }
    } catch (error) {
      console.error('Failed to fetch data', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to fetch quotes or salespeople.'
      )
      toast({
        title: 'Error',
        description: 'Failed to fetch quotes or salespeople.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdateFollowUp = async (quoteId: string, newDate: Date) => {
    try {
      await updateQuoteFollowUpDate(quoteId, newDate)
      setAllQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId ? ({ ...q, followUpDate: newDate } as Quote) : q
        )
      )
      toast({ title: 'Success', description: 'Follow-up date updated.' })
    } catch (error) {
      console.error('Failed to update follow-up date', error)
      toast({
        title: 'Error',
        description: 'Failed to update follow-up date.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateStatus = async (quoteId: string, newStatus: Status) => {
    try {
      await updateQuoteStatus(quoteId, newStatus)
      setAllQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId ? ({ ...q, status: newStatus } as Quote) : q
        )
      )
      toast({
        title: 'Success',
        description: `Quote status updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Failed to update status', error)
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateSalesRep = async (
    quoteId: string,
    salesRepId: string,
    salesRepName: string
  ) => {
    try {
      await updateQuoteSalesRep(quoteId, salesRepId)
    } catch (error) {
      console.error('Failed to update sales rep', error)
      toast({
        title: 'Error',
        description: 'Failed to update sales rep.',
        variant: 'destructive',
      })
      return
    }
    setAllQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId ? ({ ...q, salesRep: salesRepName } as Quote) : q
      )
    )
    toast({
      title: 'Success',
      description: `Quote assigned to ${salesRepName}.`,
    })
  }

  const handleAddNote = async (quoteId: string, noteContent: string) => {
    const newNote: NoteLite = {
      id: `note-${Date.now()}`,
      content: noteContent,
      timestamp: new Date().toISOString(),
      author: 'Admin User',
    }
    try {
      console.warn('💾 Saving note to Firestore...', { quoteId, noteContent })
      
      // Wait for Firestore write to complete before updating UI
      await addNoteToQuote(quoteId, newNote as QuoteNote)
      
      console.warn('✅ Note saved to Firestore successfully')
      
      // Only update local state after successful Firestore write
      setAllQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? ({
                ...q,
                notes: [...((q as LooseQuote).notes ?? []), newNote] as unknown,
              } as Quote)
            : q
        )
      )
      
      toast({ title: 'Success', description: 'Note added successfully.' })
    } catch (error) {
      console.error('❌ Failed to add note to Firestore:', error)
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error details:', errorMessage)
      
      toast({
        title: 'Error',
        description: `Failed to add note: ${errorMessage}`,
        variant: 'destructive',
      })
    }
  }

  const handleAddTask = async (
    quoteId: string,
    taskContent: string,
    dueDate: Date
  ) => {
    const newTask: TaskLite = {
      id: `task-${Date.now()}`,
      content: taskContent,
      dueDate,
      completed: false,
    }
    try {
      await addTaskToQuote(quoteId, newTask as QuoteTask)
      setAllQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? ({
                ...q,
                tasks: [...((q as LooseQuote).tasks ?? []), newTask] as unknown,
              } as Quote)
            : q
        )
      )
      toast({ title: 'Success', description: 'Task added successfully.' })
    } catch (error) {
      console.error('Failed to add task', error)
      toast({
        title: 'Error',
        description: 'Failed to add task.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleTask = async (
    quoteId: string,
    taskId: string,
    isCompleted: boolean
  ) => {
    try {
      await toggleTaskCompletion(quoteId, taskId, isCompleted)
      setAllQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? ({
                ...q,
                tasks: ((q as LooseQuote).tasks ?? []).map((t) =>
                  t.id === taskId ? { ...t, completed: isCompleted } : t
                ) as unknown,
              } as Quote)
            : q
        )
      )
      toast({ title: 'Success', description: 'Task status updated.' })
    } catch (error) {
      console.error('Error updating task', error)
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await deleteQuote(quoteId)
      setAllQuotes((prev) => prev.filter((q) => q.id !== quoteId))
      toast({ title: 'Success', description: 'Quote deleted successfully.' })
    } catch (error) {
      console.error('Failed to delete quote', error)
      toast({
        title: 'Error',
        description: 'Failed to delete quote.',
        variant: 'destructive',
      })
    }
  }

  const handleExportCSV = () => {
    const rows = filteredQuotes
    if (!rows || rows.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'No quotes match the current filters.',
        variant: 'destructive',
      })
      return
    }

    const headers = [
      'Quote #',
      'Status',
      'Subtotal (USD)',
      'First Name',
      'Last Name',
      'Company',
      'Phone',
      'ZIP',
      'Created At (ISO)',
      'Sales Rep',
      'Items',
      'Follow-up Date',
    ]

    const escapeCsv = (val: unknown) => {
      const s = val == null ? '' : String(val)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }

    const dataLines = rows
      .map((q) => {
        const lq = q as LooseQuote
        const createdISO = (() => {
          const d = toDateSafe(lq.createdAt ?? null)
          return d ? d.toISOString() : ''
        })()
        const followISO = (() => {
          const d = toDateSafe(lq.followUpDate ?? null)
          return d ? d.toISOString() : ''
        })()

        return [
          lq.quoteNumber ?? '',
          lq.status ?? '',
          (getQuoteAmount(lq) ?? 0).toFixed(2),
          (lq as Quote).firstName ?? '',
          (lq as Quote).lastName ?? '',
          lq.company ?? '',
          lq.phone ?? '',
          lq.zip ?? lq.zipCode ?? '',
          createdISO,
          lq.salesRep ?? '',
          lq.numberOfItems ??
            (Array.isArray((lq as unknown as { items?: unknown[] }).items)
              ? (lq as unknown as { items?: unknown[] }).items!.length
              : 0),
          followISO,
        ]
          .map(escapeCsv)
          .join(',')
      })
      .join('\n')

    const csv = ['\ufeff' + headers.join(','), dataLines].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `quotes-${today}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filtering & sorting (derived from allQuotes + UI controls)
  useEffect(() => {
    let quotes = [...allQuotes]

    if (isDebug) {
      console.warn('Filtering useEffect - allQuotes length:', allQuotes.length)
      console.warn('Filtering useEffect - searchTerm:', searchTerm)
      console.warn('Filtering useEffect - filterMode:', filterMode)
      console.warn('Filtering useEffect - activeStatus:', activeStatus)
    }

    // Search filter
    if (searchTerm) {
      const lowercased = searchTerm.toLowerCase()
      quotes = quotes.filter((quote) => {
        const lq = quote as LooseQuote

        const hasMatchInQuoteDetails =
          getString(lq.quoteNumber).toLowerCase().includes(lowercased) ||
          getString(lq.status).toLowerCase().includes(lowercased) ||
          getString(getQuoteAmount(lq)).includes(lowercased) ||
          getString((quote as Quote).lastName)
            .toLowerCase()
            .includes(lowercased) ||
          getString((quote as Quote).firstName)
            .toLowerCase()
            .includes(lowercased) ||
          getString(lq.company).toLowerCase().includes(lowercased) ||
          getString(lq.phone).includes(lowercased) ||
          getString(lq.zip ?? lq.zipCode).includes(lowercased) ||
          resolveSalesRepName(lq).toLowerCase().includes(lowercased)

        if (hasMatchInQuoteDetails) return true

        const hasMatchInNotes = (lq.notes ?? []).some((note) =>
          getString(note?.content).toLowerCase().includes(lowercased)
        )
        if (hasMatchInNotes) return true

        const hasMatchInTasks = (lq.tasks ?? []).some((task) =>
          getString(task?.content).toLowerCase().includes(lowercased)
        )
        if (hasMatchInTasks) return true

        return false
      })

      if (isDebug)
        console.warn('After search filter - quotes length:', quotes.length)
    }

    // Mode filter
    if (filterMode === 'status' && activeStatus) {
      quotes = quotes.filter(
        (quote) => (quote as LooseQuote).status === activeStatus
      )
    } else if (filterMode === 'dueToday') {
      quotes = quotes.filter((quote) => {
        const lq = quote as LooseQuote
        const follow = toDateSafe(lq.followUpDate)
        const followUpDue = !!follow && (isToday(follow) || isPast(follow))
        const taskDue = (lq.tasks ?? []).some((task) => {
          const d = toDateSafe(task.dueDate ?? null)
          return !task.completed && !!d && (isToday(d) || isPast(d))
        })
        return followUpDue || taskDue
      })

      if (isDebug)
        console.warn('After mode filter - quotes length:', quotes.length)
    }

    // Sort (null-safe; works with Date|string|number)
    const [field, direction] = sortOption.split('-') as [string, 'asc' | 'desc']

    quotes.sort((a, b) => {
      const lqa = a as LooseQuote
      const lqb = b as LooseQuote

      const aVal =
        field === 'quoteAmount'
          ? getQuoteAmount(lqa)
          : (lqa as unknown as Record<string, unknown>)[field]
      const bVal =
        field === 'quoteAmount'
          ? getQuoteAmount(lqb)
          : (lqb as unknown as Record<string, unknown>)[field]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      const A = toComparable(aVal)
      const B = toComparable(bVal)

      if (A < B) return direction === 'desc' ? 1 : -1
      if (A > B) return direction === 'desc' ? -1 : 1
      return 0
    })

    setFilteredQuotes(quotes)

    if (isDebug) {
      console.warn('Final filtered quotes length:', quotes.length)
      console.warn('Final filtered quotes:', quotes)
    }
  }, [
    searchTerm,
    filterMode,
    activeStatus,
    sortOption,
    allQuotes,
    isDebug,
    resolveSalesRepName,
  ])

  const handleStatusClick = (status: Status | null) => {
    if (status) {
      setFilterMode('status')
      setActiveStatus(status)
    } else {
      setFilterMode('all')
      setActiveStatus(null)
    }
  }

  const dueTodayCount = allQuotes.filter((quote) => {
    const lq = quote as LooseQuote
    const follow = toDateSafe(lq.followUpDate)
    const followUpDue = !!follow && (isToday(follow) || isPast(follow))
    const taskDue = (lq.tasks ?? []).some((task) => {
      const d = toDateSafe(task.dueDate ?? null)
      return !task.completed && !!d && (isToday(d) || isPast(d))
    })
    return followUpDue || taskDue
  }).length

  const retryFromError = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('simulateError')) {
        url.searchParams.delete('simulateError')
        window.history.replaceState({}, '', url.toString())
      }
    }
    fetchData()
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main className="flex-1 p-6 md:p-8 space-y-8">
        {isDebug && (
          <div className="mb-3 rounded-md border-2 border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
            <div className="font-semibold mb-1">Debug — Quotes Page</div>
            <div>
              isLoading: <b>{String(isLoading)}</b>
            </div>
            <div>
              errorMessage: <b>{errorMessage ?? 'null'}</b>
            </div>
            <div>
              allQuotes.length: <b>{allQuotes.length}</b>
            </div>
            <div>
              filteredQuotes.length: <b>{filteredQuotes.length}</b>
            </div>
            <div>
              searchTerm: <b>"{searchTerm}"</b>
            </div>
            <div>
              filterMode: <b>{filterMode}</b>
            </div>
            <div>
              activeStatus: <b>{(activeStatus as string) ?? 'null'}</b>
            </div>
            <div>
              viewMode: <b>{viewMode}</b>
            </div>
          </div>
        )}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <div className="font-semibold">Failed to load quotes</div>
                <div className="text-sm">{errorMessage}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-800"
                onClick={retryFromError}
              >
                Retry
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setErrorMessage(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-flowdoors-charcoal">
              Quotes
            </h1>
            <p className="text-gray-600">
              Manage and view all customer quotes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-lg border-gray-300"
              onClick={handleExportCSV}
            >
              <File className="h-4 w-4 mr-2" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export CSV
              </span>
            </Button>

            {/* My Quotes toggle (visible if rep is signed in) */}
            {typeof window !== 'undefined' &&
              localStorage.getItem('salesRepName') && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9 rounded-lg"
                  onClick={() => {
                    const rep = (localStorage.getItem('salesRepName') || '')
                      .trim()
                      .toLowerCase()
                    setFilteredQuotes(
                      rep
                        ? allQuotes.filter(
                            (q) =>
                              resolveSalesRepName(
                                q as LooseQuote
                              ).toLowerCase() === rep
                          )
                        : allQuotes
                    )
                    setFilterMode('all')
                    setActiveStatus(null)
                  }}
                >
                  My Quotes
                </Button>
              )}

            {/* Customize View */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg border-gray-300"
                  onClick={() => setCustomizeOpen(true)}
                  aria-label="Customize view"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Customize View
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Customize view</TooltipContent>
            </Tooltip>

            <div className="bg-gray-100 rounded-lg p-0.5 flex items-center">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode('pipeline')}
                aria-label="Pipeline view"
                title="Pipeline"
              >
                <Columns className="h-4 w-4" />
              </Button>
            </div>

            {/* Minimize/Maximize toggle persists via prefs */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isMinimized ? 'secondary' : 'outline'}
                  className="h-9 rounded-lg"
                  onClick={() =>
                    setPrefs({ view: isMinimized ? 'table' : 'cards' })
                  }
                  aria-label={isMinimized ? 'Maximize cards' : 'Minimize cards'}
                >
                  <MinimizeIcon className="h-4 w-4 mr-2" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {isMinimized ? 'Expand' : 'Minimize'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMinimized ? 'Maximize cards' : 'Minimize cards'}
              </TooltipContent>
            </Tooltip>

            <Button
              size="sm"
              asChild
              className="h-9 rounded-lg bg-flowdoors-blue hover:bg-flowdoors-blue-700 text-white"
            >
              <Link href="/quote/start">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Quote
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by name, quote #, status, notes, tasks..."
              className="pl-10 h-11 bg-white border-gray-200 rounded-lg shadow-sm focus:border-flowdoors-blue focus:ring-flowdoors-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search quotes"
            />
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full md:w-[180px] h-11 bg-white border-gray-200 shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Date: Newest</SelectItem>
                <SelectItem value="createdAt-asc">Date: Oldest</SelectItem>
                <SelectItem value="quoteAmount-desc">
                  Subtotal: High-Low
                </SelectItem>
                <SelectItem value="quoteAmount-asc">
                  Subtotal: Low-High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(STATUS_FILTERS ?? []).map((status: Status) => {
            const { buttonColorClass, textColor } = getStatusClasses(status)
            const isActive = filterMode === 'status' && activeStatus === status
            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200',
                  isActive 
                    ? `${buttonColorClass} text-white shadow-lg scale-105` 
                    : `bg-gray-100 ${textColor} hover:bg-gray-200`
                )}
              >
                {status}
              </button>
            )
          })}
          <Button
            size="sm"
            className={cn(
              'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200',
              filterMode === 'all' && !activeStatus
                ? 'bg-flowdoors-blue-500 hover:bg-flowdoors-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-flowdoors-blue-600 hover:bg-gray-200'
            )}
            onClick={() => handleStatusClick(null)}
          >
            View All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-9 px-4 gap-2 transition-all duration-200 relative font-medium',
              filterMode === 'dueToday'
                ? 'border-flowdoors-green bg-flowdoors-green-50 text-flowdoors-green-900 shadow-md scale-105'
                : 'hover:border-gray-300'
            )}
            onClick={() => {
              setFilterMode('dueToday')
              setActiveStatus(null)
            }}
          >
            <AlertCircle
              className={cn(
                'h-4 w-4',
                filterMode === 'dueToday'
                  ? 'text-flowdoors-green-700'
                  : 'text-flowdoors-green'
              )}
            />
            <span>Due Today</span>
            {dueTodayCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center"
              >
                {dueTodayCount}
              </Badge>
            )}
          </Button>
        </div>

        {viewMode === 'grid' ? (
          <QuotesGrid
            quotes={filteredQuotes}
            isLoading={isLoading}
            salespeople={salespeople}
            visibleFields={visibleFields}
            onUpdateFollowUp={handleUpdateFollowUp}
            onUpdateStatus={handleUpdateStatus}
            onUpdateSalesRep={handleUpdateSalesRep}
            onAddNote={handleAddNote}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            isMinimized={isMinimized}
            onDeleteQuote={handleDeleteQuote}
          />
        ) : viewMode === 'table' ? (
          <QuotesTable
            quotes={filteredQuotes}
            isLoading={isLoading}
            onDeleteQuote={handleDeleteQuote}
            onUpdateStatus={(id, s) => handleUpdateStatus(id, s as Status)}
          />
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Need full screen?{' '}
              <Link className="underline" href="/admin/quotes/kanban">
                Open Pipeline page
              </Link>
            </div>
            <InlinePipeline
              quotes={filteredQuotes}
              salespeople={salespeople}
              onMoved={async (id, _from, to) => {
                await moveQuotePipeline(id, to)
                setAllQuotes((prev) =>
                  prev.map((q) =>
                    q.id === id ? ({ ...q, pipelineStage: to } as Quote) : q
                  )
                )
              }}
              onChangePill={async (id, status) => {
                await updateQuoteStatus(id, status as Status)
                setAllQuotes((prev) =>
                  prev.map((q) =>
                    q.id === id ? ({ ...q, status } as Quote) : q
                  )
                )
              }}
              onEditTags={async (id, tags) => {
                await updateQuoteTags(id, tags)
                setAllQuotes((prev) =>
                  prev.map((q) => (q.id === id ? ({ ...q, tags } as Quote) : q))
                )
              }}
              onDelete={handleDeleteQuote}
              isMinimized={isMinimized}
            />
          </div>
        )}

        <CustomizeViewDialog
          open={customizeOpen}
          onOpenChange={setCustomizeOpen}
          initial={prefs.columns}
          onSave={(next) => {
            setPrefs({ columns: next })
            toast({
              title: 'View preferences saved',
              description: 'Your quotes grid layout has been updated.',
            })
          }}
        />
      </main>
    </TooltipProvider>
  )
}

function InlinePipeline({
  quotes,
  salespeople,
  onMoved,
  onChangePill,
  onEditTags,
  onDelete,
  isMinimized,
}: {
  quotes: Quote[]
  salespeople: Salesperson[]
  onMoved: (_id: string, _from: string, _to: string) => Promise<void> | void
  onChangePill: (_id: string, _status: string) => Promise<void> | void
  onEditTags: (_id: string, _tags: string[]) => Promise<void> | void
  onDelete: (_id: string) => Promise<void> | void
  isMinimized: boolean
}) {
  // Helper to resolve sales rep name
  const resolveSalesRepName = (quote: LooseQuote): string => {
    const raw =
      quote.salesperson_id || quote.salesRep || quote.last_modified_by || ''
    if (!raw) return 'Unassigned'
    if (
      typeof raw === 'string' &&
      !raw.startsWith('SP-') &&
      !raw.startsWith('PS-') &&
      !raw.startsWith('QUOTE')
    ) {
      return raw
    }
    const id = typeof raw === 'string' ? raw : String(raw)
    const normalized = id.replace(/^PS-/i, 'SP-')
    const hit =
      salespeople.find((sp) => sp.salesperson_id === normalized) ||
      salespeople.find((sp) => sp.id === normalized)
    return hit?.name ?? id
  }

  const stages = useMemo(() => [...(STATUS_FILTERS as unknown as string[])], [])

  const grouped = useMemo(() => {
    const by: Record<string, Quote[]> = {}
    stages.forEach((s) => (by[s] = []))
    for (const q of quotes) {
      const lq = q as LooseQuote
      const key = lq.pipelineStage || lq.status || stages[0]
      ;(by[key] ||= []).push(q)
    }
    return by
  }, [quotes, stages])

  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    quoteId: string,
    fromStage: string
  ) => {
    e.dataTransfer.setData('text/plain', quoteId)
    e.dataTransfer.setData('from', fromStage)
  }

  const onDropTo = async (
    e: React.DragEvent<HTMLDivElement>,
    toStage: string
  ) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const from = e.dataTransfer.getData('from')
    if (!id || !toStage || from === toStage) return
    await onMoved(id, from, toStage)
  }

  const StatusMenu = ({ q }: { q: Quote }) => {
    const cur = ((q as LooseQuote).status as string) || 'New'
    const { customClass } = getStatusClasses(cur as Status)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase',
              customClass
            )}
          >
            {cur}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(stages as string[]).map((opt) => (
            <DropdownMenuItem key={opt} onClick={() => onChangePill(q.id, opt)}>
              {opt}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              const ok = window.confirm(
                'Delete this quote? This moves it to Deleted Quotes.'
              )
              if (ok) onDelete(q.id)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Use global isMinimized (from toolbar) to show condensed or expanded details

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div
          key={stage}
          className="bg-gray-50 rounded-lg p-4 min-h-[520px] border"
          style={{ minWidth: 280 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropTo(e, stage)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">{stage}</h3>
            <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-1">
              {(grouped[stage] || []).length}
            </span>
          </div>

          <div>
            {(grouped[stage] || []).map((q) => {
              const lq = q as LooseQuote
              const isExpanded = !isMinimized
              const createdAt = (() => {
                const d = toDateSafe(lq.createdAt ?? null)
                return d ? d.toLocaleDateString() : null
              })()
              const enteredAt = (() => {
                const raw = lq.stageDates?.[stage]
                const d = toDateSafe(raw ?? null)
                return d ? d.toLocaleDateString() : null
              })()

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-lg border shadow-sm p-3 mb-3 cursor-grab hover:shadow-md"
                  draggable
                  onDragStart={(e) =>
                    onDragStart(
                      e,
                      q.id,
                      (lq.pipelineStage || lq.status || stages[0]) as string
                    )
                  }
                >
                  {/* Header: status pill + created date + expand */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {lq.quoteNumber ?? q.id}
                      </div>
                      <div className="text-xs text-gray-600">
                        {`${(q as Quote).firstName ?? ''} ${(q as Quote).lastName ?? ''}`.trim()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {createdAt && (
                        <div className="text-[11px] text-gray-400 whitespace-nowrap">
                          {createdAt}
                        </div>
                      )}
                      <StatusMenu q={q} />
                    </div>
                  </div>

                  {/* Amount */}
                  {typeof lq.quoteAmount === 'number' && (
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {lq.quoteAmount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </div>
                  )}

                  {/* Rep + Follow-up */}
                  <div className="text-xs text-flowdoors-charcoal-500 flex items-center gap-6 mb-2">
                    <div>
                      Rep:{' '}
                      <span className="font-medium">
                        <span className="font-medium">
                          {resolveSalesRepName(lq)}
                        </span>
                      </span>
                    </div>
                    <div>
                      Follow-up:{' '}
                      <span className="font-medium">
                        {(() => {
                          const d = toDateSafe(lq.followUpDate ?? null)
                          return d ? d.toLocaleDateString() : 'N/A'
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {!!lq.tags?.length && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lq.tags!.map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 rounded-full border"
                          data-tag={t}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="rounded-lg bg-gray-50/80 border border-gray-100 p-3 text-sm text-gray-800 space-y-2 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Company</span>
                        <span>{lq.company || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span>{lq.phone || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">ZIP Code</span>
                        <span>{lq.zip ?? lq.zipCode ?? '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Last Contact</span>
                        <span>
                          {(() => {
                            const d = toDateSafe(lq.lastContact ?? null)
                            return d ? d.toLocaleDateString() : '—'
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Notes</span>
                        <span>{lq.notes?.length ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tasks</span>
                        <span>
                          {`${(lq.tasks ?? []).filter((t) => !t.completed).length}/${(lq.tasks ?? []).length}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Items</span>
                        <span>
                          {lq.numberOfItems ??
                            (Array.isArray(
                              (lq as unknown as { items?: unknown[] }).items
                            )
                              ? (lq as unknown as { items?: unknown[] }).items!
                                  .length
                              : 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Entered date + Footer actions */}
                  {enteredAt && (
                    <div className="text-[10px] text-gray-500 mb-2">
                      Entered: {enteredAt}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      className="text-[11px] text-flowdoors-blue hover:underline"
                      onClick={async () => {
                        const cur = (lq.tags || []).join(', ')
                        const next = window.prompt(
                          'Edit tags (comma separated)',
                          cur
                        )
                        if (next == null) return
                        const tags = next
                          .split(',')
                          .map((s) => s.trim().toLowerCase())
                          .filter(Boolean)
                        await onEditTags(q.id, tags)
                      }}
                    >
                      Notes · Tasks{' '}
                      {`(${(lq.notes?.length ?? 0) + (lq.tasks?.length ?? 0)})`}
                    </button>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="text-xs bg-flowdoors-blue text-white px-3 py-2 rounded-lg hover:bg-flowdoors-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
