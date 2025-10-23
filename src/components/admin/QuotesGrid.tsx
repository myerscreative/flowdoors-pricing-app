// src/components/admin/QuotesGrid.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Calendar, Notebook, Search, CheckCircle, Send } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import type { Quote as QuoteType, QuoteTask } from '@/types/quote'
import { Salesperson } from '@/services/salesService'
import {
  STATUS_FILTERS,
  type Status,
} from '@/components/admin/quotes-constants'
import NotesPanel, {
  type Note as NotesPanelNote,
} from '@/components/notes/NotesPanel'
import { listNotes, type Note as NotesApiNote } from '@/lib/notesApi'

/* ---------- Small runtime-safe helpers (no `any`) ---------- */
function coerceDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in (value as Record<string, unknown>)
  ) {
    const fn = (value as { toDate?: () => Date }).toDate
    if (typeof fn === 'function') return fn()
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return undefined
}
function getNumberProp(obj: unknown, key: string): number | undefined {
  if (obj && typeof obj === 'object') {
    const v = (obj as Record<string, unknown>)[key]
    if (typeof v === 'number') return v
  }
  return undefined
}
function getFirstString(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const rec = obj as Record<string, unknown>
  for (const k of keys) {
    const v = rec[k]
    if (typeof v === 'string') return v
  }
  return undefined
}

/** Rep helpers: resolve name or ID consistently */
const normalizeId = (s: string) => s.replace(/^PS-/i, 'SP-')
function repNameFromQuote(
  quote: QuoteType,
  salespeople: Salesperson[]
): string {
  const raw = (quote as unknown as { salesRep?: string }).salesRep ?? ''
  const str = typeof raw === 'string' ? raw.trim() : ''
  if (!str) return 'Unassigned'
  // If it's already a human name, prefer it
  const byName = salespeople.find((sp) => sp.name === str)
  if (byName) return byName.name
  // Try ID matches (supports PS- → SP- normalization)
  const candidates = [str, normalizeId(str)]
  for (const cand of candidates) {
    const hit = salespeople.find(
      (sp) =>
        sp.salesperson_id === cand ||
        (sp as unknown as { id?: string }).id === cand
    )
    if (hit) return hit.name
  }
  return str // graceful fallback
}
function repIdFromQuote(
  quote: QuoteType,
  salespeople: Salesperson[]
): string | undefined {
  const raw = (quote as unknown as { salesRep?: string }).salesRep ?? ''
  const str = typeof raw === 'string' ? raw.trim() : ''
  if (!str) return undefined
  // If name is stored, map to its salesperson_id
  const byName = salespeople.find((sp) => sp.name === str)
  if (byName) return byName.salesperson_id
  // If ID is stored, normalize and return the canonical salesperson_id if found
  const candidates = [str, normalizeId(str)]
  for (const cand of candidates) {
    const byId = salespeople.find(
      (sp) =>
        sp.salesperson_id === cand ||
        (sp as unknown as { id?: string }).id === cand
    )
    if (byId) return byId.salesperson_id
  }
  return undefined
}
/* ----------------------------------------------------------- */

interface VisibleFields {
  company: boolean
  phone: boolean
  zip: boolean
  lastContact: boolean
  nextFollowUp: boolean
  notes: boolean
  tasks: boolean
  numberOfItems: boolean
}

interface QuotesGridProps {
  quotes: QuoteType[]
  isLoading: boolean
  salespeople: Salesperson[]
  visibleFields: VisibleFields
  isMinimized: boolean
  onUpdateFollowUp: (_quoteId: string, _newDate: Date) => void
  onUpdateStatus: (_quoteId: string, _newStatus: Status) => void
  onUpdateSalesRep: (
    _quoteId: string,
    _salesRepId: string,
    _salesRepName: string
  ) => void
  onAddNote: (_quoteId: string, _noteContent: string) => void
  onAddTask: (_quoteId: string, _taskContent: string, _dueDate: Date) => void
  onToggleTask: (
    _quoteId: string,
    _taskId: string,
    _isCompleted: boolean
  ) => void
  onDeleteQuote?: (_quoteId: string) => void
}

// Convert NotesApiNote → NotesPanelNote (shape expected by NotesPanel)
const convertToNotesPanelNote = (apiNote: NotesApiNote): NotesPanelNote => ({
  id: apiNote.id,
  content: apiNote.content,
  createdAt:
    getFirstString(apiNote, ['createdAt', 'timestamp', 'created_at']) ??
    new Date().toISOString(),
})

export const getStatusClasses = (status: string) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'new':
      return {
        customClass: 'bg-flowdoors-blue-100 text-flowdoors-blue-800 border-flowdoors-blue-200',
        buttonColorClass: 'bg-flowdoors-blue',
      }
    case 'hot':
      return {
        customClass: 'bg-red-100 text-red-800 border-red-200',
        buttonColorClass: 'bg-red-600',
      }
    case 'warm':
      return {
        customClass: 'bg-amber-100 text-amber-800 border-amber-200',
        buttonColorClass: 'bg-yellow-400',
      }
    case 'cold':
      return {
        customClass: 'bg-flowdoors-green-100 text-flowdoors-green-800 border-flowdoors-green-200',
        buttonColorClass: 'bg-flowdoors-green',
      }
    case 'hold':
      return {
        customClass: 'bg-gray-100 text-gray-800 border-gray-200',
        buttonColorClass: 'bg-gray-500',
      }
    case 'archived':
      return {
        customClass: 'bg-gray-100 text-gray-500 border-gray-200',
        buttonColorClass: 'bg-gray-800',
      }
    default:
      return {
        customClass: 'bg-gray-100 text-gray-700 border-gray-200',
        buttonColorClass: 'bg-gray-400',
      }
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const { customClass } = getStatusClasses(status)
  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wide',
        customClass
      )}
    >
      {status}
    </span>
  )
}

/** Unified "Activity" dialog: search + view + add Notes/Tasks */
const ActivityDialog = ({
  quote,
  onAddNote,
  onAddTask,
  onToggleTask,
}: {
  quote: QuoteType
  onAddNote: QuotesGridProps['onAddNote']
  onAddTask: QuotesGridProps['onAddTask']
  onToggleTask: QuotesGridProps['onToggleTask']
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [taskDraft, setTaskDraft] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(
    addDays(new Date(), 1)
  )

  const tasks: QuoteTask[] = quote.tasks || []
  const filteredTasks = tasks.filter((t: QuoteTask) =>
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const tasksCount = tasks.length

  // Robust NotesPanel initial data (global for now)
  const [initialNotes, setInitialNotes] = useState<NotesPanelNote[]>([])
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await listNotes()
        if (mounted && data) {
          const convertedNotes = data.map(convertToNotesPanelNote)
          setInitialNotes(convertedNotes)
        }
      } catch (err) {
        // Non-fatal; NotesPanel can start empty
        console.error('Failed to load notes:', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg gap-2">
          <Notebook className="h-4 w-4" />
          <span className="text-xs text-gray-600">
            Notes · Tasks ({tasksCount})
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Activity for Quote {quote.quoteNumber}</DialogTitle>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes and tasks…"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks ({filteredTasks.length}/{tasksCount})
            </TabsTrigger>
          </TabsList>

          {/* Notes tab: robust NotesPanel (Prisma/SQLite) */}
          <TabsContent value="notes" className="mt-4 space-y-4">
            <NotesPanel
              initialNotes={initialNotes}
              onCreate={(note) => onAddNote(quote.id, note.content)}
            />
          </TabsContent>

          {/* Tasks tab: add + list */}
          <TabsContent value="tasks" className="mt-4 space-y-4">
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="task-draft">Task Description</Label>
                <Input
                  id="task-draft"
                  value={taskDraft}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  placeholder="e.g. Follow up on quote"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!taskDraft.trim() || !dueDate) return
                    onAddTask(quote.id, taskDraft.trim(), dueDate)
                    setTaskDraft('')
                    setDueDate(addDays(new Date(), 1))
                  }}
                  disabled={!taskDraft.trim() || !dueDate}
                >
                  Save Task
                </Button>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {filteredTasks.length ? (
                <div className="space-y-4">
                  {filteredTasks
                    .sort(
                      (a: QuoteTask, b: QuoteTask) =>
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime()
                    )
                    .map((task: QuoteTask) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-4"
                      >
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            onToggleTask(quote.id, task.id, !!checked)
                          }
                        />
                        <div className="flex-grow">
                          <Label
                            htmlFor={`task-${task.id}`}
                            className={cn(
                              'font-medium',
                              task.completed &&
                                'line-through text-muted-foreground'
                            )}
                          >
                            {task.content}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Due:{' '}
                            {format(
                              coerceDate(task.dueDate) ?? new Date(),
                              'PPP'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  No tasks found.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

type QuoteCardProps = {
  quote: QuoteType
  salespeople: Salesperson[]
  visibleFields: VisibleFields
  isMinimized: boolean
  onUpdateStatus: QuotesGridProps['onUpdateStatus']
  _onUpdateFollowUp: QuotesGridProps['onUpdateFollowUp']
  onUpdateSalesRep: QuotesGridProps['onUpdateSalesRep']
  onAddNote: QuotesGridProps['onAddNote']
  onAddTask: QuotesGridProps['onAddTask']
  onToggleTask: QuotesGridProps['onToggleTask']
  onDeleteQuote?: QuotesGridProps['onDeleteQuote']
}

const QuoteCard = ({
  quote,
  salespeople,
  visibleFields,
  isMinimized,
  onUpdateStatus,
  _onUpdateFollowUp,
  onUpdateSalesRep,
  onAddNote,
  onAddTask,
  onToggleTask,
  onDeleteQuote,
}: QuoteCardProps) => {
  const { customClass } = getStatusClasses(quote.status)
  const customerName = `${quote.firstName ?? ''} ${quote.lastName ?? ''}`.trim()

  if (isMinimized) {
    // Compact, fixed set of fields (Customize View has no effect here)
    const amount = getNumberProp(quote, 'quoteAmount')
    const createdAt = coerceDate(quote.createdAt)

    return (
      <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
        {/* Header: Status badge (top-left) and Date (top-right) */}
        <div className="flex items-start justify-between mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <StatusBadge status={quote.status} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_FILTERS.map((statusOption: Status) => (
                <DropdownMenuItem
                  key={statusOption}
                  onClick={() => onUpdateStatus(quote.id, statusOption)}
                >
                  <CheckCircle
                    className={cn(
                      'mr-2 h-4 w-4',
                      quote.status === statusOption
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {statusOption}
                </DropdownMenuItem>
              ))}
              {onDeleteQuote && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      const ok = window.confirm(
                        'Delete this quote? This will move it to Deleted Quotes.'
                      )
                      if (ok) onDeleteQuote(quote.id)
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-right">
            <div className="text-xs text-gray-500 font-medium">
              {createdAt ? format(createdAt, 'MMM d, yyyy') : '—'}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              #{quote.quoteNumber ?? '—'}
            </div>
          </div>
        </div>

      {/* Customer Name */}
      <h3 className="text-lg font-bold text-flowdoors-charcoal mb-2 leading-tight">
        {customerName || '—'}
      </h3>

        {quote.referralCodeCustomer && (
          <div className="mb-2">
            <span className="text-[10px] px-2 py-1 rounded bg-slate-100 border text-slate-700">
              Ref: {quote.referralCodeCustomer}
            </span>
          </div>
        )}

      {/* Price */}
      <div className="text-2xl font-extrabold text-flowdoors-charcoal mb-4">
        {typeof amount === 'number'
          ? amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })
          : '—'}
      </div>

        {/* Rep and Company info */}
        <div className="text-sm text-gray-600 space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Rep:</span>
            <span className="font-medium text-flowdoors-charcoal">
              {repNameFromQuote(quote, salespeople)}
            </span>
          </div>
          {quote.company && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Company:</span>
              <span className="font-medium text-flowdoors-charcoal truncate max-w-[180px]">
                {quote.company}
              </span>
            </div>
          )}
        </div>

        {/* Footer: Notes/Tasks count and action buttons */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <ActivityDialog
              quote={quote}
              onAddNote={onAddNote}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
            />
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-700 text-white h-9 rounded-lg font-medium"
            >
              <Link href={`/admin/quotes/${quote.id}`}>View Details</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 h-9 rounded-lg"
              onClick={async () => {
                try {
                  const response = await fetch('/api/quotes/resend-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quoteId: quote.id }),
                  })
                  const result = await response.json()
                  if (result.success) {
                    alert('Quote email sent successfully!')
                  } else {
                    alert(`Failed to send email: ${result.message}`)
                  }
                } catch (error) {
                  console.error('Resend email error:', error)
                  alert('Failed to send email')
                }
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Expanded card with optional fields controlled by visibleFields
  const amount = getNumberProp(quote, 'quoteAmount')
  const createdAt = coerceDate(quote.createdAt)

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
      {/* Header: Status badge (top-left) and Date (top-right) */}
      <div className="flex justify-between items-start mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>
              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wide',
                  customClass
                )}
              >
                {quote.status}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUS_FILTERS.map((statusOption: Status) => (
              <DropdownMenuItem
                key={statusOption}
                onClick={() => onUpdateStatus(quote.id, statusOption)}
              >
                <CheckCircle
                  className={cn(
                    'mr-2 h-4 w-4',
                    quote.status === statusOption ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {statusOption}
              </DropdownMenuItem>
            ))}
            {onDeleteQuote && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    const ok = window.confirm(
                      'Delete this quote? This will move it to Deleted Quotes.'
                    )
                    if (ok) onDeleteQuote(quote.id)
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-medium">
            {createdAt ? format(createdAt, 'MMM d, yyyy') : '—'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            #{quote.quoteNumber ?? '—'}
          </div>
        </div>
      </div>

      {/* Customer Name */}
      <h3 className="text-xl font-bold text-flowdoors-charcoal mb-2 leading-tight">
        {customerName || '—'}
      </h3>
      {quote.referralCodeCustomer && (
        <div className="mb-3">
          <span className="text-[10px] px-2 py-1 rounded bg-slate-100 border text-slate-700">
            Ref: {quote.referralCodeCustomer}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="text-3xl font-extrabold text-flowdoors-charcoal mb-4">
        {typeof amount === 'number'
          ? amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })
          : '—'}
      </div>

      {/* Rep and Company info */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Rep:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium text-gray-900 hover:text-flowdoors-blue">
                {repNameFromQuote(quote, salespeople)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Assign Sales Rep</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={repIdFromQuote(quote, salespeople)}
                onValueChange={(spId) =>
                  onUpdateSalesRep(
                    quote.id,
                    spId,
                    salespeople.find((sp) => sp.salesperson_id === spId)
                      ?.name || 'Unassigned'
                  )
                }
              >
                {salespeople.map((sp) => (
                  <DropdownMenuRadioItem key={sp.id} value={sp.salesperson_id}>
                    {sp.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {visibleFields.company && quote.company && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Company:</span>
            <span className="font-medium text-flowdoors-charcoal truncate max-w-[200px]">
              {quote.company}
            </span>
          </div>
        )}

        {visibleFields.phone && quote.phone && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium text-flowdoors-charcoal">{quote.phone}</span>
          </div>
        )}

        {visibleFields.zip && quote.zip && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">ZIP:</span>
            <span className="font-medium text-flowdoors-charcoal">{quote.zip}</span>
          </div>
        )}

        {visibleFields.numberOfItems && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Items:</span>
            <span className="font-medium text-flowdoors-charcoal">
              {quote.numberOfItems ?? 0}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Notes/Tasks count and action buttons */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <ActivityDialog
            quote={quote}
            onAddNote={onAddNote}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
          />
          {onDeleteQuote && (
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault()
                const ok = window.confirm(
                  'Delete this quote? This will move it to Deleted Quotes.'
                )
                if (ok) onDeleteQuote(quote.id)
              }}
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            className="flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-700 text-white h-10 rounded-lg font-medium"
          >
            <Link href={`/admin/quotes/${quote.id}`}>View Details</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 h-10 rounded-lg"
            onClick={async () => {
              try {
                const response = await fetch('/api/quotes/resend-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ quoteId: quote.id }),
                })
                const result = await response.json()
                if (result.success) {
                  alert('Quote email sent successfully!')
                } else {
                  alert(`Failed to send email: ${result.message}`)
                }
              } catch (error) {
                console.error('Resend email error:', error)
                alert('Failed to send email')
              }
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuotesGrid({
  quotes,
  isLoading,
  salespeople,
  visibleFields,
  onUpdateFollowUp,
  onUpdateStatus,
  onUpdateSalesRep,
  onAddNote,
  onAddTask,
  onToggleTask,
  isMinimized,
  onDeleteQuote,
}: QuotesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full rounded-2xl h-80" />
        ))}
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
    <div
      className={cn(
        'grid gap-6',
        isMinimized
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      )}
    >
      {quotes.map((quote) => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          visibleFields={visibleFields}
          isMinimized={isMinimized}
          _onUpdateFollowUp={onUpdateFollowUp}
          onUpdateStatus={onUpdateStatus}
          onUpdateSalesRep={onUpdateSalesRep}
          onAddNote={onAddNote}
          onAddTask={onAddTask}
          onToggleTask={onToggleTask}
          salespeople={salespeople}
          onDeleteQuote={onDeleteQuote}
        />
      ))}
    </div>
  )
}
export default QuotesGrid
