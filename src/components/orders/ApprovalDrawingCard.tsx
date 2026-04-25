'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ClipboardCheck,
  Download,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import type { ApprovalDrawing, ApprovalDrawingStatus } from './types'

interface ApprovalDrawingCardProps {
  drawing: ApprovalDrawing
  className?: string
  defaultOpen?: boolean
}

export function ApprovalDrawingCard({
  drawing,
  className,
  defaultOpen = false,
}: ApprovalDrawingCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const badge = statusBadge(drawing.status)

  return (
    <section
      aria-label="Approval Drawing"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ClipboardCheck className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                Approval Drawing
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
                  badge.cls
                )}
              >
                {badge.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  open && 'rotate-180'
                )}
                aria-hidden
              />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 border-t p-5">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {drawing.panelCount ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Panels
                  </dt>
                  <dd className="mt-0.5 font-medium">{drawing.panelCount}</dd>
                </div>
              ) : null}
              {drawing.dimensions ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Size
                  </dt>
                  <dd className="mt-0.5 font-medium">{drawing.dimensions}</dd>
                </div>
              ) : null}
              {drawing.signedAt ? (
                <div className="col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Signed
                  </dt>
                  <dd className="mt-0.5 font-medium">{drawing.signedAt}</dd>
                </div>
              ) : null}
            </dl>

            {drawing.url ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={drawing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Drawing
                </a>
                <a
                  href={drawing.url}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Drawing will appear here once generated.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

function statusBadge(status: ApprovalDrawingStatus): {
  label: string
  cls: string
} {
  switch (status) {
    case 'signed':
      return {
        label: 'Signed',
        cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
      }
    case 'sent':
      return {
        label: 'Sent',
        cls: 'bg-primary/15 text-primary ring-primary/25',
      }
    default:
      return {
        label: 'Draft',
        cls: 'bg-muted text-muted-foreground ring-border',
      }
  }
}
