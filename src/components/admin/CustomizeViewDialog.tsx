'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

/** Public shape for Quotes Grid preferences */
export type ColumnKey =
  | 'quoteId'
  | 'customer'
  | 'salesperson'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'subtotal'
  | 'grandTotal'

export type ColumnVisibility = Record<ColumnKey, boolean>

const DEFAULT_COLUMNS: ColumnVisibility = {
  quoteId: true,
  customer: true,
  salesperson: true,
  status: true,
  createdAt: true,
  updatedAt: false,
  subtotal: true,
  grandTotal: true,
}

interface CustomizeViewDialogProps {
  /** Controls dialog open state */
  open: boolean
  /** Called when dialog should close (e.g., after save, or user clicks outside) */
  onOpenChange: (_open: boolean) => void
  /** Current persisted selection (used to initialize the dialog draft) */
  initial: ColumnVisibility
  /** Called on Save, then this component will call onOpenChange(false) */
  onSave: (_next: ColumnVisibility) => void
  /** Optional: called when Reset is clicked (after draft reset) */
  onResetDefaults?: () => void
}

const FIELD_META: Array<{
  key: keyof ColumnVisibility
  label: string
  help?: string
}> = [
  { key: 'quoteId', label: 'Quote ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'salesperson', label: 'Salesperson' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'updatedAt', label: 'Updated Date' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'grandTotal', label: 'Grand Total' },
]

export function CustomizeViewDialog(props: CustomizeViewDialogProps) {
  // Ensure we always have a valid initial state, fallback to defaults if needed
  const safeInitial = React.useMemo(() => {
    if (!props.initial || typeof props.initial !== 'object') {
      return DEFAULT_COLUMNS
    }
    // Merge with defaults to ensure all required keys exist
    return { ...DEFAULT_COLUMNS, ...props.initial }
  }, [props.initial])

  const [draft, setDraft] = React.useState<ColumnVisibility>(safeInitial)

  // When dialog opens, re-sync draft from latest initial
  React.useEffect(() => {
    if (props.open) {
      setDraft(safeInitial)
    }
  }, [props.open, safeInitial])

  // Focus Save button when opened
  const saveRef = React.useRef<HTMLButtonElement | null>(null)
  React.useEffect(() => {
    if (props.open) {
      const id = setTimeout(() => saveRef.current?.focus(), 0)
      return () => clearTimeout(id)
    }
  }, [props.open])

  const toggleField = (key: keyof ColumnVisibility, value: boolean) => {
    setDraft((prev: ColumnVisibility) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setDraft({ ...DEFAULT_COLUMNS })
    props.onResetDefaults?.()
  }

  const handleSave = () => {
    props.onSave(draft)
    props.onOpenChange(false)
  }

  // Ensure draft is always defined before rendering
  if (!draft) {
    return null // Don't render until we have a valid draft
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        aria-label="Customize Quotes Grid View"
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Customize view</DialogTitle>
          <DialogDescription>
            Choose which columns appear in the quotes grid table view.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {FIELD_META.map((f) => {
            const checked = draft[f.key]
            const keyStr = String(f.key)
            return (
              <div
                key={keyStr}
                className="flex items-center space-x-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={`cv-${keyStr}`}
                  checked={checked}
                  onCheckedChange={(v) => toggleField(f.key, Boolean(v))}
                  aria-label={`Toggle ${f.label}`}
                />
                <Label htmlFor={`cv-${keyStr}`} className="cursor-pointer">
                  {f.label}
                </Label>
              </div>
            )
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            aria-label="Reset to defaults"
          >
            Reset to defaults
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            ref={saveRef}
            aria-label="Save view preferences"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomizeViewDialog
