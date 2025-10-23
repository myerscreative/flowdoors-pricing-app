'use client'

import React, { useState, DragEvent, ChangeEvent, ReactNode } from 'react'
import { Trash2, Edit3 } from 'lucide-react'

/** =========================
 *  Literal unions & helpers
 *  ========================= */
const PIPELINE_STAGES = [
  'New',
  'Hot',
  'Warm',
  'Cold',
  'Hold',
  'Archived',
] as const
type PipelineStage = (typeof PIPELINE_STAGES)[number]

const DEAL_STATUS_OPTIONS = [
  'New',
  'Hot',
  'Warm',
  'Cold',
  'On Hold',
  'Urgent',
  'Archive',
] as const
type DealStatus = (typeof DEAL_STATUS_OPTIONS)[number]

const isDealStatus = (val: string): val is DealStatus =>
  (DEAL_STATUS_OPTIONS as readonly string[]).includes(val)

/** =========================
 *  Type definitions
 *  ========================= */
interface Quote {
  id: string
  quoteNumber: string
  firstName: string
  lastName: string
  quoteAmount: number
  pipelineStage: PipelineStage
  dealStatus: DealStatus
  tags: string[]
  stageDates: Record<string, string>
}

interface KanbanItem {
  id: string
  title: string
  subtitle: string
  amount: number
  tags: string[]
  data: Quote
  movedAtISO?: string
}

interface Column {
  id: PipelineStage
  title: string
  items: KanbanItem[]
}

interface CardProps {
  item: KanbanItem
  onDragStart: (_e: DragEvent<HTMLDivElement>, _itemId: string) => void
  onEditTags: (_itemId: string, _newTags: string[]) => void
  onDelete: (_itemId: string) => void
  onChangePillStatus: (_itemId: string, _newStatus: DealStatus) => void
}

interface ColumnProps {
  column: Column
  onDrop: (_itemId: string, _targetColumnId: PipelineStage) => void
  onRenameColumn: (_columnId: PipelineStage, _newTitle: string) => void
  children: ReactNode
}

/** =========================
 *  Mock data
 *  ========================= */
const MOCK_QUOTES: Quote[] = [
  {
    id: '5614df22-e3ff-4da0-baf9-43bd935e7289',
    quoteNumber: 'Q1-000001',
    firstName: 'John',
    lastName: 'Doe',
    quoteAmount: 39510,
    pipelineStage: 'New',
    dealStatus: 'New',
    tags: ['residential', 'solar'],
    stageDates: {},
  },
  {
    id: 'a52f746c-18f6-4417-a8ad-e681b927856a',
    quoteNumber: 'Q1-000002',
    firstName: 'Robert',
    lastName: 'Myers',
    quoteAmount: 39510,
    pipelineStage: 'Hot',
    dealStatus: 'Hot',
    tags: ['commercial'],
    stageDates: {},
  },
  {
    id: 'be8a6522-5943-4127-a4ca-5e948aec42ce',
    quoteNumber: 'Q1-000003',
    firstName: 'Robert',
    lastName: 'Myers',
    quoteAmount: 39510,
    pipelineStage: 'Hot',
    dealStatus: 'Urgent',
    tags: ['urgent'],
    stageDates: {},
  },
  {
    id: 'SD-TODO2025',
    quoteNumber: 'Q1-000004',
    firstName: 'Todd',
    lastName: 'Taylor',
    quoteAmount: 0,
    pipelineStage: 'Warm',
    dealStatus: 'On Hold',
    tags: ['follow-up'],
    stageDates: {},
  },
  {
    id: 'QT-000001',
    quoteNumber: 'QT-000001',
    firstName: 'Jane',
    lastName: 'Smith',
    quoteAmount: 0,
    pipelineStage: 'Cold',
    dealStatus: 'Cold',
    tags: ['commercial', 'large'],
    stageDates: {},
  },
]

/** =========================
 *  Typed color map
 *  ========================= */
const STATUS_COLORS: Record<DealStatus, string> = {
  New: 'bg-blue-500 text-white',
  Hot: 'bg-red-500 text-white',
  Warm: 'bg-yellow-500 text-white',
  Cold: 'bg-green-500 text-white',
  'On Hold': 'bg-gray-500 text-white',
  Urgent: 'bg-purple-500 text-white',
  Archive: 'bg-black text-white',
}

/** =========================
 *  Card
 *  ========================= */
const Card: React.FC<CardProps> = ({
  item,
  onDragStart,
  onEditTags,
  onDelete,
  onChangePillStatus,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagInput, setTagInput] = useState(item.tags.join(', '))

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(true)
    onDragStart(e, item.id)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleTagSubmit = () => {
    const newTags = tagInput
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean)
    onEditTags(item.id, newTags)
    setIsEditingTags(false)
  }

  const handleStatusChange = (newStatus: DealStatus) => {
    onChangePillStatus(item.id, newStatus)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg shadow-sm border p-3 mb-3 cursor-grab hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      style={{ transform: isDragging ? 'scale(1.02)' : 'scale(1)' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-sm text-gray-900">{item.title}</div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditingTags(!isEditingTags)}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Edit tags"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-600 p-1"
            aria-label="Delete card"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {item.subtitle && (
        <div className="text-xs text-gray-600 mb-2">{item.subtitle}</div>
      )}

      {item.amount !== undefined && (
        <div className="text-sm font-semibold text-gray-900 mb-2">
          ${item.amount.toLocaleString()}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {item.tags.map((tag: string, idx: number) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            data-tag={tag}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Deal Status Pill with Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={item.data.dealStatus ?? 'New'}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const val = e.target.value
            if (isDealStatus(val)) handleStatusChange(val)
          }}
          className={`text-xs px-3 py-1 rounded-full border-0 font-medium cursor-pointer ${
            STATUS_COLORS[item.data.dealStatus ?? 'New']
          }`}
        >
          {DEAL_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Tag Editor */}
      {isEditingTags && (
        <div className="mt-2 pt-2 border-t">
          <input
            type="text"
            value={tagInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTagInput(e.target.value)
            }
            className="w-full text-xs border rounded px-2 py-1 mb-2"
            placeholder="Enter tags separated by commas"
            onKeyDown={(e) => e.key === 'Enter' && handleTagSubmit()}
          />
          <div className="flex gap-1">
            <button
              onClick={handleTagSubmit}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingTags(false)}
              className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** =========================
 *  Column
 *  ========================= */
const Column: React.FC<ColumnProps> = ({
  column,
  onDrop,
  onRenameColumn,
  children,
}) => {
  const [isOver, setIsOver] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(column.title)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as Node | null
    if (!related || !e.currentTarget.contains(related)) {
      setIsOver(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(false)
    const cardId = e.dataTransfer.getData('text/plain')
    onDrop(cardId, column.id)
  }

  const handleRename = () => {
    onRenameColumn(column.id, newTitle)
    setIsRenaming(false)
  }

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 min-h-[600px] transition-all duration-200 ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
      }`}
      style={{ minWidth: '280px', width: '280px' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-column-id={column.id}
    >
      <div className="flex items-center justify-between mb-4">
        {isRenaming ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewTitle(e.target.value)
            }
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="font-semibold text-gray-800 bg-transparent border-b border-gray-400 outline-none"
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
            onClick={() => setIsRenaming(true)}
          >
            {column.title}
          </h3>
        )}
        <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-1">
          {column.items.length}
        </span>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  )
}

/** =========================
 *  KanbanBoard
 *  ========================= */
const KanbanBoard: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES)
  const [columnTitles, setColumnTitles] = useState<
    Partial<Record<PipelineStage, string>>
  >({})
  const [tagFilter, setTagFilter] = useState<string>('')
  const [, setDraggedItem] = useState<string | null>(null)
  const [hiddenColumns, setHiddenColumns] = useState<Set<PipelineStage>>(
    new Set()
  )
  const [focusedColumns, setFocusedColumns] = useState<Set<PipelineStage>>(
    new Set()
  )

  // Group quotes by pipeline stage and filter visible columns
  const allColumns: Column[] = PIPELINE_STAGES.map((stage) => {
    const items: KanbanItem[] = quotes
      .filter((quote) => (quote.pipelineStage || 'New') === stage)
      .filter((quote) => {
        if (!tagFilter.trim()) return true
        const filterTags = tagFilter
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
        return filterTags.some((filterTag) =>
          quote.tags.some((tag) => tag.toLowerCase().includes(filterTag))
        )
      })
      .map((quote) => ({
        id: quote.id,
        title: quote.quoteNumber || quote.id,
        subtitle: `${quote.firstName || ''} ${quote.lastName || ''}`.trim(),
        amount: quote.quoteAmount,
        tags: quote.tags || [],
        data: quote,
        movedAtISO: quote.stageDates?.[stage],
      }))

    return {
      id: stage,
      title: columnTitles[stage] || stage,
      items,
    }
  })

  // Filter columns based on hide/focus state
  const visibleColumns = allColumns.filter((column) => {
    if (focusedColumns.size > 0) {
      return focusedColumns.has(column.id)
    }
    return !hiddenColumns.has(column.id)
  })

  const handleDragStart = (e: DragEvent<HTMLDivElement>, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId)
    setDraggedItem(itemId)
  }

  const handleDrop = (itemId: string, targetColumnId: PipelineStage) => {
    if (!itemId || !targetColumnId) return

    setQuotes((prev) =>
      prev.map((quote) =>
        quote.id === itemId
          ? { ...quote, pipelineStage: targetColumnId }
          : quote
      )
    )
    setDraggedItem(null)
  }

  const handleRenameColumn = (columnId: PipelineStage, newTitle: string) => {
    setColumnTitles((prev) => ({ ...prev, [columnId]: newTitle }))
  }

  const handleEditTags = (itemId: string, newTags: string[]) => {
    setQuotes((prev) =>
      prev.map((quote) =>
        quote.id === itemId ? { ...quote, tags: newTags } : quote
      )
    )
  }

  const handleDelete = (itemId: string) => {
    setQuotes((prev) => prev.filter((quote) => quote.id !== itemId))
  }

  const handleChangePillStatus = (itemId: string, newStatus: DealStatus) => {
    setQuotes((prev) =>
      prev.map((quote) =>
        quote.id === itemId ? { ...quote, dealStatus: newStatus } : quote
      )
    )
  }

  const toggleColumnVisibility = (columnId: PipelineStage) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) next.delete(columnId)
      else next.add(columnId)
      return next
    })
    setFocusedColumns(new Set())
  }

  const toggleColumnFocus = (columnId: PipelineStage) => {
    setFocusedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) next.delete(columnId)
      else next.add(columnId)
      return next
    })
    setHiddenColumns(new Set())
  }

  const clearAllFilters = () => {
    setHiddenColumns(new Set())
    setFocusedColumns(new Set())
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Quotes Pipeline</h1>
        <input
          value={tagFilter}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTagFilter(e.target.value)
          }
          placeholder="Filter by tag (comma to add multiple)"
          className="h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
        />
      </div>

      {/* Column Visibility Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Column Visibility
          </h3>
          <button
            onClick={clearAllFilters}
            className="text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-300 hover:border-gray-400 transition-all"
          >
            Show All
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const isHidden = hiddenColumns.has(stage)
            const isFocused = focusedColumns.has(stage)
            const count =
              allColumns.find((col) => col.id === stage)?.items.length || 0

            return (
              <div key={stage} className="flex items-center gap-1">
                <button
                  onClick={() => toggleColumnVisibility(stage)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    isHidden
                      ? 'bg-white text-red-600 border-red-300 opacity-60'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
                >
                  {isHidden ? 'Hidden' : 'Visible'} • {stage} ({count})
                </button>

                <button
                  onClick={() => toggleColumnFocus(stage)}
                  className={`text-xs px-2 py-1 rounded border transition-all ${
                    isFocused
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
                  title={
                    isFocused ? 'Remove from focus' : 'Focus on this column'
                  }
                >
                  {isFocused ? '👁️' : '🎯'}
                </button>
              </div>
            )
          })}
        </div>

        {focusedColumns.size > 0 && (
          <div className="mt-2 text-xs text-blue-600">
            Focus mode: Showing only {focusedColumns.size} selected column
            {focusedColumns.size !== 1 ? 's' : ''}
          </div>
        )}

        {hiddenColumns.size > 0 && focusedColumns.size === 0 && (
          <div className="mt-2 text-xs text-red-600">
            {hiddenColumns.size} column{hiddenColumns.size !== 1 ? 's' : ''}{' '}
            hidden
          </div>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {visibleColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onDrop={handleDrop}
            onRenameColumn={handleRenameColumn}
          >
            {column.items.map((item) => (
              <Card
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                onEditTags={handleEditTags}
                onDelete={handleDelete}
                onChangePillStatus={handleChangePillStatus}
              />
            ))}
          </Column>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
