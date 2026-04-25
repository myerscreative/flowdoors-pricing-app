'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  createTaskTemplate,
  deleteTaskTemplate,
  fetchTaskTemplates,
} from './taskTemplates'
import type { TaskTemplate } from './types'

interface TaskTemplatesDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onChanged?: (_templates: TaskTemplate[]) => void
}

export function TaskTemplatesDialog({
  open,
  onOpenChange,
  onChanged,
}: TaskTemplatesDialogProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftPriority, setDraftPriority] =
    useState<TaskTemplate['priority']>('normal')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    fetchTaskTemplates()
      .then((list) => {
        if (cancelled) return
        setTemplates(list)
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        toast({
          title: 'Could not load templates',
          description: 'Check your connection and try again.',
          variant: 'destructive',
        })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, toast])

  const add = async () => {
    const title = draftTitle.trim()
    if (!title) return
    setSaving(true)
    try {
      const created = await createTaskTemplate({
        title,
        priority: draftPriority ?? 'normal',
      })
      const next = [...templates, created]
      setTemplates(next)
      onChanged?.(next)
      setDraftTitle('')
      setDraftPriority('normal')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Could not add template',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    const prev = templates
    const next = templates.filter((t) => t.id !== id)
    setTemplates(next)
    onChanged?.(next)
    try {
      await deleteTaskTemplate(id)
    } catch (err) {
      console.error(err)
      setTemplates(prev)
      onChanged?.(prev)
      toast({
        title: 'Could not delete template',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Task Templates</DialogTitle>
          <DialogDescription>
            Templates are the default tasks that can be applied to any order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading templates…
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              No templates yet.
            </div>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border bg-background/40 p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {t.title}
                    </div>
                    {t.priority && t.priority !== 'normal' ? (
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {t.priority} priority
                      </div>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(t.id)}
                    aria-label={`Delete template ${t.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New Template
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Task title"
                className="min-w-[12rem] flex-1"
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    add()
                  }
                }}
              />
              <Select
                value={draftPriority ?? 'normal'}
                onValueChange={(v) =>
                  setDraftPriority(v as TaskTemplate['priority'])
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
              <Button onClick={add} className="gap-1.5" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
