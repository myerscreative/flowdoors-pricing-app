'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  CheckSquare,
  ChevronDown,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { TaskTemplatesDialog } from './TaskTemplatesDialog'
import type { TaskRecord } from './types'

interface TasksCardProps {
  orderId: string
  initialTasks: TaskRecord[]
  className?: string
  defaultOpen?: boolean
}

export function TasksCard({
  orderId,
  initialTasks,
  className,
  defaultOpen = true,
}: TasksCardProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(defaultOpen)
  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks)
  const [composerOpen, setComposerOpen] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftPriority, setDraftPriority] =
    useState<TaskRecord['priority']>('normal')
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const pending = tasks.filter((t) => !t.done).length

  const patchTask = async (id: string, patch: Partial<TaskRecord>) => {
    const prev = tasks
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patch, orderId }),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = (await res.json()) as TaskRecord
      setTasks((curr) => curr.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      console.error(err)
      setTasks(prev)
      toast({
        title: 'Could not update task',
        variant: 'destructive',
      })
    }
  }

  const toggle = (id: string, done: boolean) => {
    // Optimistic: set completedAt locally too
    patchTask(id, {
      done,
      completedAt: done ? new Date().toISOString() : undefined,
    })
  }

  const updateCompletedAt = (id: string, iso: string) => {
    patchTask(id, { completedAt: iso })
  }

  const remove = async (id: string) => {
    const prev = tasks
    setTasks(tasks.filter((t) => t.id !== id))
    try {
      const res = await fetch(
        `/api/tasks/${id}?orderId=${encodeURIComponent(orderId)}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Delete failed')
    } catch (err) {
      console.error(err)
      setTasks(prev)
      toast({
        title: 'Could not delete task',
        variant: 'destructive',
      })
    }
  }

  const addTask = async () => {
    const title = draftTitle.trim()
    if (!title) return
    setPendingAction('add')
    try {
      const res = await fetch(`/api/orders/${orderId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority: draftPriority ?? 'normal' }),
      })
      if (!res.ok) throw new Error('Create failed')
      const created = (await res.json()) as TaskRecord
      setTasks((curr) => [...curr, created])
      setDraftTitle('')
      setDraftPriority('normal')
      setComposerOpen(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Could not add task',
        variant: 'destructive',
      })
    } finally {
      setPendingAction(null)
    }
  }

  const applyTemplates = async () => {
    setPendingAction('apply')
    try {
      const res = await fetch(
        `/api/orders/${orderId}/tasks/apply-templates`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Apply failed')
      const { tasks: nextTasks, created } = (await res.json()) as {
        tasks: TaskRecord[]
        created: number
      }
      setTasks(nextTasks)
      toast({
        title:
          created > 0
            ? `Added ${created} template task${created === 1 ? '' : 's'}`
            : 'All templates already applied',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Could not apply templates',
        variant: 'destructive',
      })
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <section
      aria-label="Tasks"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-2 p-5">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckSquare className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">Tasks</h3>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
                  pending > 0
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/20'
                    : 'bg-muted text-muted-foreground ring-border'
                )}
              >
                {pending} pending
              </span>
            </button>
          </CollapsibleTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Task options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={applyTemplates}>
                {pendingAction === 'apply' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Apply Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTemplatesOpen(true)}>
                <Settings2 className="mr-2 h-4 w-4" />
                Manage Templates
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setComposerOpen((v) => !v)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={open ? 'Collapse tasks' : 'Expand tasks'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  open && 'rotate-180'
                )}
                aria-hidden
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          {composerOpen ? (
            <div className="space-y-2 border-t bg-muted/30 p-4">
              <div className="flex flex-wrap gap-2">
                <Input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="New task title"
                  className="min-w-[12rem] flex-1"
                  disabled={pendingAction === 'add'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTask()
                    } else if (e.key === 'Escape') {
                      setComposerOpen(false)
                      setDraftTitle('')
                    }
                  }}
                />
                <Select
                  value={draftPriority ?? 'normal'}
                  onValueChange={(v) =>
                    setDraftPriority(v as TaskRecord['priority'])
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={addTask}
                  className="gap-1.5"
                  disabled={pendingAction === 'add'}
                >
                  {pendingAction === 'add' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setComposerOpen(false)
                    setDraftTitle('')
                  }}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {tasks.length === 0 && !composerOpen ? (
            <div className="border-t p-5 text-sm text-muted-foreground">
              No tasks for this order.{' '}
              <button
                onClick={() => setComposerOpen(true)}
                className="font-medium text-primary hover:underline"
              >
                Add one
              </button>{' '}
              or{' '}
              <button
                onClick={applyTemplates}
                className="font-medium text-primary hover:underline"
              >
                apply templates
              </button>
              .
            </div>
          ) : (
            <ul className="divide-y border-t">
              {tasks.map((t) => {
                const isEditingDate = editingDateId === t.id
                return (
                  <li
                    key={t.id}
                    className="group flex items-start gap-3 p-4 transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      id={`task-${t.id}`}
                      checked={t.done}
                      onCheckedChange={(v) => toggle(t.id, v === true)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`task-${t.id}`}
                        className={cn(
                          'block cursor-pointer text-sm font-medium leading-snug',
                          t.done && 'text-muted-foreground line-through'
                        )}
                      >
                        {t.title}
                      </label>

                      {t.done ? (
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                          {isEditingDate ? (
                            <>
                              <input
                                type="date"
                                defaultValue={toDateInput(t.completedAt)}
                                onChange={(e) =>
                                  updateCompletedAt(
                                    t.id,
                                    fromDateInput(e.target.value)
                                  )
                                }
                                className="rounded-md border bg-background px-1.5 py-0.5 text-xs"
                              />
                              <button
                                onClick={() => setEditingDateId(null)}
                                className="text-primary hover:underline"
                              >
                                Done
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingDateId(t.id)}
                              className="inline-flex items-center gap-1 rounded-md px-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label="Edit completion date"
                            >
                              {formatDate(t.completedAt) ?? 'Set date'}
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : t.dueDate || t.assignee ? (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t.dueDate ? `Due ${formatDate(t.dueDate)}` : ''}
                          {t.dueDate && t.assignee ? ' · ' : ''}
                          {t.assignee ? t.assignee : ''}
                        </div>
                      ) : null}
                    </div>

                    {t.priority && t.priority !== 'normal' ? (
                      <span
                        className={cn(
                          'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
                          priorityCls(t.priority)
                        )}
                      >
                        {t.priority}
                      </span>
                    ) : null}

                    <button
                      onClick={() => remove(t.id)}
                      aria-label={`Delete ${t.title}`}
                      className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {!composerOpen && tasks.length > 0 ? (
            <div className="flex items-center justify-between gap-2 border-t p-3">
              <button
                onClick={() => setComposerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add task
              </button>
              <button
                onClick={applyTemplates}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                disabled={pendingAction === 'apply'}
              >
                {pendingAction === 'apply' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Apply templates
              </button>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>

      <TaskTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
      />
    </section>
  )
}

function priorityCls(p: 'low' | 'high'): string {
  if (p === 'high')
    return 'bg-destructive/15 text-destructive ring-destructive/20'
  return 'bg-muted text-muted-foreground ring-border'
}

function toDateInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function fromDateInput(value: string): string {
  if (!value) return ''
  const d = new Date(value + 'T12:00:00')
  return d.toISOString()
}

function formatDate(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
