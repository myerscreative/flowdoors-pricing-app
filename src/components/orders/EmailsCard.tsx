import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'
import type { EmailRecord } from './types'

interface EmailsCardProps {
  emails: EmailRecord[]
  limit?: number
  className?: string
}

export function EmailsCard({ emails, limit = 5, className }: EmailsCardProps) {
  const sorted = [...emails].sort((a, b) =>
    a.sentAt < b.sentAt ? 1 : a.sentAt > b.sentAt ? -1 : 0
  )
  const visible = sorted.slice(0, limit)
  const overflow = Math.max(0, sorted.length - visible.length)

  return (
    <section
      aria-label="Emails"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Mail className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Emails</h3>
        </div>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {emails.length}
        </span>
      </div>

      {emails.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          No emails sent yet.
        </div>
      ) : (
        <ul className="divide-y">
          {visible.map((e) => (
            <li
              key={e.id}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/40"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-medium leading-snug">
                  {e.subject}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {e.sentAt}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {overflow > 0 ? (
        <div className="border-t p-3 text-center text-xs text-muted-foreground">
          +{overflow} more
        </div>
      ) : null}
    </section>
  )
}
