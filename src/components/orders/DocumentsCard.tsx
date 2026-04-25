import { cn } from '@/lib/utils'
import {
  ClipboardCheck,
  Download,
  FileText,
  Receipt,
} from 'lucide-react'
import type {
  DocumentCategory,
  DocumentRecord,
} from './types'

interface DocumentsCardProps {
  documents: DocumentRecord[]
  className?: string
}

export function DocumentsCard({ documents, className }: DocumentsCardProps) {
  return (
    <section
      aria-label="Documents"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Download className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Documents</h3>
        </div>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {documents.length}
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          No documents yet.
        </div>
      ) : (
        <ul className="space-y-2 p-3">
          {documents.map((doc) => {
            const Icon = iconFor(doc.category)
            const badge = statusBadge(doc.status)
            const isInteractive = Boolean(doc.url)
            const Container: 'a' | 'div' = isInteractive ? 'a' : 'div'
            const containerProps = isInteractive
              ? {
                  href: doc.url,
                  target: '_blank' as const,
                  rel: 'noopener noreferrer' as const,
                }
              : {}

            return (
              <li key={doc.id}>
                <Container
                  {...containerProps}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border bg-background/40 p-3 transition-colors',
                    isInteractive && 'hover:border-primary/40 hover:bg-muted/60'
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      iconTint(doc.category)
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {doc.title}
                    </div>
                    {doc.subtitle ? (
                      <div className="truncate font-mono text-[11px] text-muted-foreground">
                        {doc.subtitle}
                      </div>
                    ) : null}
                  </div>
                  {badge ? (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
                        badge.cls
                      )}
                    >
                      {badge.label}
                    </span>
                  ) : null}
                  {isInteractive ? (
                    <span
                      aria-hidden
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </span>
                  ) : null}
                </Container>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function iconFor(cat: DocumentCategory) {
  switch (cat) {
    case 'summary':
      return FileText
    case 'drawing':
      return ClipboardCheck
    case 'receipt':
      return Receipt
    default:
      return FileText
  }
}

function iconTint(cat: DocumentCategory): string {
  switch (cat) {
    case 'summary':
      return 'bg-primary/15 text-primary'
    case 'drawing':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
    case 'receipt':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function statusBadge(
  status: DocumentRecord['status']
): { label: string; cls: string } | null {
  if (!status) return null
  switch (status) {
    case 'paid':
      return {
        label: 'PAID',
        cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
      }
    case 'signed':
      return {
        label: 'SIGNED',
        cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
      }
    case 'pending':
      return {
        label: 'PENDING',
        cls: 'bg-muted text-muted-foreground ring-border',
      }
    default:
      return null
  }
}
