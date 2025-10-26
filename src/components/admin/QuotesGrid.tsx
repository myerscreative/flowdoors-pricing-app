// src/components/admin/QuotesGrid.tsx
'use client'

import {
  STATUS_FILTERS,
  type Status,
} from '@/components/admin/quotes-constants'
import NotesPanel, {
  type Note as NotesPanelNote,
} from '@/components/notes/NotesPanel'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Salesperson } from '@/services/salesService'
import type { QuoteTask, Quote as QuoteType } from '@/types/quote'
import { addDays, format } from 'date-fns'
import {
  Building2,
  Calendar,
  CheckCircle,
  MapPin,
  Notebook,
  Package,
  Phone,
  Search,
  Send,
  Trash2,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

export const getStatusClasses = (status: string) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'new':
      return {
        customClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        buttonColorClass: 'bg-emerald-500',
        textColor: 'text-emerald-600',
      }
    case 'hot':
      return {
        customClass: 'bg-red-100 text-red-700 border-red-200',
        buttonColorClass: 'bg-red-500',
        textColor: 'text-red-600',
      }
    case 'warm':
      return {
        customClass: 'bg-amber-100 text-amber-700 border-amber-200',
        buttonColorClass: 'bg-amber-500',
        textColor: 'text-amber-600',
      }
    case 'cold':
      return {
        customClass: 'bg-sky-100 text-sky-700 border-sky-200',
        buttonColorClass: 'bg-sky-400',
        textColor: 'text-sky-500',
      }
    case 'hold':
      return {
        customClass: 'bg-gray-100 text-gray-500 border-gray-200',
        buttonColorClass: 'bg-gray-400',
        textColor: 'text-gray-500',
      }
    case 'archived':
      return {
        customClass: 'bg-gray-100 text-gray-500 border-gray-200',
        buttonColorClass: 'bg-gray-500',
        textColor: 'text-gray-600',
      }
    default:
      return {
        customClass: 'bg-gray-100 text-gray-700 border-gray-200',
        buttonColorClass: 'bg-gray-400',
        textColor: 'text-gray-600',
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

  // Convert quote-specific notes to NotesPanel format
  const quoteNotes = quote.notes || []
  const notesCount = quoteNotes.length
  const initialNotes: NotesPanelNote[] = quoteNotes.map((note) => ({
    id: note.id,
    content: note.content,
    createdAt: note.timestamp,
    author: note.author,
  }))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Notebook className="w-4 h-4" />
            Notes ({notesCount}) · Tasks ({tasksCount})
          </span>
          <span className="text-xs text-gray-400">→</span>
        </button>
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

          {/* Notes tab: quote-specific notes from Firestore */}
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
      <div className="w-full min-w-[320px] max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-2xl font-bold text-flowdoors-charcoal">
                  {customerName || '—'}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      'px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wide transition-colors',
                      customClass
                    )}>
                      {quote.status}
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
                <Notebook className="w-3.5 h-3.5" />
                <span className="font-mono">#{quote.quoteNumber ?? '—'}</span>
                <span className="mx-1">•</span>
                <Calendar className="w-3.5 h-3.5" />
                {createdAt ? format(createdAt, 'MMM d, yyyy') : '—'}
              </p>
            </div>
          </div>

          {/* Amount - Most prominent */}
          <div className="bg-gradient-to-br from-flowdoors-blue-50 to-indigo-50 rounded-lg p-4 border border-flowdoors-blue-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Quote Amount</p>
            <p className="text-3xl font-bold text-flowdoors-charcoal">
              {typeof amount === 'number'
                ? amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6"></div>

        {/* Details Grid */}
        <div className="space-y-3 mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
                  <User className="w-4 h-4" />
                  Rep
                </div>
                <div className="flex-1 text-left text-flowdoors-charcoal font-medium">
                  {repNameFromQuote(quote, salespeople)}
                </div>
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

          {quote.company && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
                <Building2 className="w-4 h-4" />
                Company
              </div>
              <div className="flex-1 text-flowdoors-charcoal">{quote.company}</div>
            </div>
          )}

          {quote.phone && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
                <Phone className="w-4 h-4" />
                Phone
              </div>
              <div className="flex-1 text-flowdoors-charcoal">{quote.phone}</div>
            </div>
          )}

          {quote.zip && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
                <MapPin className="w-4 h-4" />
                ZIP
              </div>
              <div className="flex-1 text-flowdoors-charcoal">{quote.zip}</div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
              <Package className="w-4 h-4" />
              Items
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-flowdoors-blue-700 bg-flowdoors-blue-100 rounded-full">
                {quote.numberOfItems ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <ActivityDialog
            quote={quote}
            onAddNote={onAddNote}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            asChild
            className="flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Link href={`/admin/quotes/${quote.id}`}>
              <span>View Details</span>
            </Link>
          </Button>
          
          <button
            className="p-3 border-2 border-gray-200 hover:border-flowdoors-blue hover:bg-flowdoors-blue-50 text-gray-700 hover:text-flowdoors-blue rounded-lg transition-colors"
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
            <Send className="w-5 h-5" />
          </button>
          
          {onDeleteQuote && (
            <button
              className="p-3 border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg transition-colors"
              onClick={(e) => {
                e.preventDefault()
                const ok = window.confirm(
                  'Delete this quote? This will move it to Deleted Quotes.'
                )
                if (ok) onDeleteQuote(quote.id)
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Expanded card with optional fields controlled by visibleFields
  const amount = getNumberProp(quote, 'quoteAmount')
  const createdAt = coerceDate(quote.createdAt)

  return (
    <div className="w-full min-w-[320px] max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-2xl font-bold text-flowdoors-charcoal">
                {customerName || '—'}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    'px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wide transition-colors',
                    customClass
                  )}>
                    {quote.status}
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
              <Notebook className="w-3.5 h-3.5" />
              <span className="font-mono">#{quote.quoteNumber ?? '—'}</span>
              <span className="mx-1">•</span>
              <Calendar className="w-3.5 h-3.5" />
              {createdAt ? format(createdAt, 'MMM d, yyyy') : '—'}
            </p>
          </div>
        </div>

        {/* Amount - Most prominent */}
        <div className="bg-gradient-to-br from-flowdoors-blue-50 to-indigo-50 rounded-lg p-4 border border-flowdoors-blue-100">
          <p className="text-sm font-medium text-gray-600 mb-1">Quote Amount</p>
          <p className="text-3xl font-bold text-flowdoors-charcoal">
            {typeof amount === 'number'
              ? amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })
              : '—'}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-6"></div>

      {/* Details Grid */}
      <div className="space-y-3 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
              <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
                <User className="w-4 h-4" />
                Rep
              </div>
              <div className="flex-1 text-left text-flowdoors-charcoal font-medium">
                {repNameFromQuote(quote, salespeople)}
              </div>
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

        {visibleFields.company && quote.company && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
              <Building2 className="w-4 h-4" />
              Company
            </div>
            <div className="flex-1 text-flowdoors-charcoal">{quote.company}</div>
          </div>
        )}

        {visibleFields.phone && quote.phone && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
              <Phone className="w-4 h-4" />
              Phone
            </div>
            <div className="flex-1 text-flowdoors-charcoal">{quote.phone}</div>
          </div>
        )}

        {visibleFields.zip && quote.zip && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
              <MapPin className="w-4 h-4" />
              ZIP
            </div>
            <div className="flex-1 text-flowdoors-charcoal">{quote.zip}</div>
          </div>
        )}

        {visibleFields.numberOfItems && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 w-24 text-gray-500 font-medium">
              <Package className="w-4 h-4" />
              Items
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-flowdoors-blue-700 bg-flowdoors-blue-100 rounded-full">
                {quote.numberOfItems ?? 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="mb-6">
        <ActivityDialog
          quote={quote}
          onAddNote={onAddNote}
          onAddTask={onAddTask}
          onToggleTask={onToggleTask}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          asChild
          className="flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Link href={`/admin/quotes/${quote.id}`}>
            <span>View Details</span>
          </Link>
        </Button>
        
        <button
          className="p-3 border-2 border-gray-200 hover:border-flowdoors-blue hover:bg-flowdoors-blue-50 text-gray-700 hover:text-flowdoors-blue rounded-lg transition-colors"
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
          <Send className="w-5 h-5" />
        </button>
        
        {onDeleteQuote && (
          <button
            className="p-3 border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg transition-colors"
            onClick={(e) => {
              e.preventDefault()
              const ok = window.confirm(
                'Delete this quote? This will move it to Deleted Quotes.'
              )
              if (ok) onDeleteQuote(quote.id)
            }}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
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
      <div className="grid gap-4 md:gap-6 xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="min-w-0 w-full">
            <Skeleton className="w-full rounded-xl h-96" />
          </div>
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
    <div className="grid gap-4 md:gap-6 xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-max">
      {quotes.map((quote) => (
        <div key={quote.id} className="min-w-0 w-full overflow-hidden">
          <QuoteCard
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
        </div>
      ))}
    </div>
  )
}
export default QuotesGrid
