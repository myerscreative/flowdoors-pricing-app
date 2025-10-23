'use client'

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getStatusClasses } from './QuotesGrid'
import { GripVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Accept any object-shaped payload while preserving an optional 'status'
export type KanbanItemData = {
  status?: string
  referralCodeCustomer?: string
} & object

export type KanbanItem = {
  id: string
  title: string
  subtitle?: string
  amount?: number
  tags?: string[]
  data?: KanbanItemData
  movedAtISO?: string // when entered current column
}

export type KanbanColumn = {
  id: string // status key
  title: string
  items: KanbanItem[]
}

type DragData = { columnId?: string }

export function KanbanBoard({
  initialColumns,
  onMove,
  filterTags,
  onRenameColumn,
  onEditTags,
  statusOptions,
  onChangePillStatus,
  onDelete,
}: {
  initialColumns: KanbanColumn[]
  onMove: (
    _itemId: string,
    _fromColumnId: string,
    _toColumnId: string
  ) => Promise<void> | void
  filterTags?: string[]
  onRenameColumn?: (_columnId: string, _nextTitle: string) => void
  onEditTags?: (_itemId: string, _nextTags: string[]) => Promise<void> | void
  statusOptions?: string[]
  onChangePillStatus?: (
    _itemId: string,
    _nextStatus: string
  ) => Promise<void> | void
  onDelete?: (_itemId: string) => Promise<void> | void
}) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [editingCol, setEditingCol] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState<string>('')

  useEffect(() => setColumns(initialColumns), [initialColumns])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const fromColumnId = (active.data?.current as DragData | undefined)
      ?.columnId
    const toColumnId = String(over.id)
    if (!fromColumnId || fromColumnId === toColumnId) return

    const [fromColIdx, fromItemIdx] = findItemLocation(
      columns,
      String(active.id)
    )
    const toColIdx = columns.findIndex((c) => c.id === toColumnId)
    if (fromColIdx < 0 || fromItemIdx < 0 || toColIdx < 0) return

    const fromColumn = columns[fromColIdx]
    const toColumn = columns[toColIdx]
    const moving = fromColumn.items[fromItemIdx]

    setColumns((prev) => {
      const copy = prev.map((c) => ({ ...c, items: [...c.items] }))
      copy[fromColIdx].items.splice(fromItemIdx, 1)
      copy[toColIdx].items.unshift(moving)
      return copy
    })

    try {
      await onMove(moving.id, fromColumn.id, toColumn.id)
    } catch {
      // revert optimistic move on failure
      setColumns((prev) => {
        const copy = prev.map((c) => ({ ...c, items: [...c.items] }))
        const toIdx = copy.findIndex((c) => c.id === toColumn.id)
        const fromIdx = copy.findIndex((c) => c.id === fromColumn.id)
        const movedIdx = copy[toIdx].items.findIndex(
          (it) => it.id === moving.id
        )
        if (movedIdx >= 0) {
          const [restored] = copy[toIdx].items.splice(movedIdx, 1)
          copy[fromIdx].items.splice(fromItemIdx, 0, restored)
        }
        return copy
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DndContext onDragEnd={handleDragEnd}>
        {columns.map((col) => (
          <DroppableColumn
            key={col.id}
            columnId={col.id}
            className="rounded-lg border bg-white"
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              {editingCol === col.id ? (
                <form
                  className="flex items-center gap-2 w-full"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const trimmed = draftTitle.trim()
                    if (!trimmed) return setEditingCol(null)
                    onRenameColumn?.(col.id, trimmed)
                    setColumns((prev) =>
                      prev.map((c) =>
                        c.id === col.id ? { ...c, title: trimmed } : c
                      )
                    )
                    setEditingCol(null)
                  }}
                >
                  <input
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    autoFocus
                  />
                </form>
              ) : (
                <>
                  <div className="font-semibold">{col.title}</div>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setEditingCol(col.id)
                      setDraftTitle(col.title)
                    }}
                  >
                    Rename
                  </button>
                </>
              )}
            </div>
            <div className="p-3 space-y-3">
              {(col.items || [])
                .filter((it) =>
                  !filterTags || filterTags.length === 0
                    ? true
                    : (it.tags || []).some((t) =>
                        filterTags.includes(t.toLowerCase())
                      )
                )
                .map((item) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    columnId={col.id}
                    onEditTags={onEditTags}
                    statusOptions={statusOptions}
                    onChangePillStatus={(next) =>
                      onChangePillStatus?.(item.id, next)
                    }
                    onDelete={(id) => onDelete?.(id)}
                  />
                ))}
            </div>
          </DroppableColumn>
        ))}
      </DndContext>
    </div>
  )
}

function KanbanCard({
  item,
  columnId,
  onEditTags,
  statusOptions,
  onChangePillStatus,
  onDelete,
}: {
  item: KanbanItem
  columnId: string
  onEditTags?: (_id: string, _next: string[]) => void | Promise<void>
  statusOptions?: string[]
  onChangePillStatus?: (_next: string) => void | Promise<void>
  onDelete?: (_id: string) => void | Promise<void>
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id, data: { columnId } })
  const pillStatus = (item?.data?.status as string) || ''
  const statusBadge = pillStatus ? getStatusClasses(pillStatus) : null
  return (
    <div
      ref={setNodeRef}
      id={item.id}
      data-column-id={columnId}
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition'
      )}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <button
            aria-label="Drag"
            className="p-1 -ml-1 text-gray-400 hover:text-gray-600"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <div className="font-medium text-gray-800">{item.title}</div>
            {item.subtitle && (
              <div className="text-xs text-gray-500 mt-0.5">
                {item.subtitle}
              </div>
            )}
            {item.data?.referralCodeCustomer && (
              <div className="mt-1">
                <span className="text-[10px] px-2 py-1 rounded bg-slate-100 border text-slate-700">
                  Ref: {item.data.referralCodeCustomer}
                </span>
              </div>
            )}
          </div>
        </div>
        {statusBadge &&
          (statusOptions && statusOptions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase',
                    statusBadge.customClass
                  )}
                >
                  {pillStatus || 'Status'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => onChangePillStatus?.(opt)}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    const confirmed = window.confirm(
                      'Delete this quote? This moves it to Deleted Quotes.'
                    )
                    if (confirmed) onDelete?.(item.id)
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase',
                statusBadge.customClass
              )}
            >
              {columnId}
            </span>
          ))}
      </div>
      {typeof item.amount === 'number' && (
        <div className="text-sm font-semibold text-gray-700 mt-2">
          ${item.amount.toLocaleString()}
        </div>
      )}
      {Array.isArray(item.tags) && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 border text-gray-700"
              data-tag={t}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {item.movedAtISO && (
        <div className="mt-2 text-[10px] text-gray-500">
          Entered: {new Date(item.movedAtISO).toLocaleDateString()}
        </div>
      )}
      <div className="mt-2 flex justify-end">
        <button
          className="text-[10px] text-blue-600 hover:underline"
          onClick={async () => {
            const current = (item.tags || []).join(', ')
            const next = window.prompt('Edit tags (comma-separated)', current)
            if (next == null) return
            const tags = next
              .split(',')
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean)
            try {
              await onEditTags?.(item.id, tags)
            } catch {
              // no-op
            }
          }}
        >
          Edit tags
        </button>
      </div>
    </div>
  )
}

function DroppableColumn({
  columnId,
  className,
  children,
}: {
  columnId: string
  className?: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver ? 'ring-2 ring-blue-400' : undefined)}
    >
      {children}
    </div>
  )
}

function findItemLocation(cols: KanbanColumn[], id: string): [number, number] {
  for (let ci = 0; ci < cols.length; ci++) {
    const ii = cols[ci].items.findIndex((it) => it.id === id)
    if (ii >= 0) return [ci, ii]
  }
  return [-1, -1]
}
