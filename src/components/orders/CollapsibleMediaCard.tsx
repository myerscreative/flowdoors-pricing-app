'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface CollapsibleMediaCardProps {
  title: string
  icon: ReactNode
  iconTint?: string
  count: number
  emptyMessage?: string
  children?: ReactNode
  className?: string
  defaultOpen?: boolean
}

export function CollapsibleMediaCard({
  title,
  icon,
  iconTint = 'bg-primary/15 text-primary',
  count,
  emptyMessage = 'Nothing here yet.',
  children,
  className,
  defaultOpen = false,
}: CollapsibleMediaCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      aria-label={title}
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
              <span
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-lg',
                  iconTint
                )}
              >
                {icon}
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border">
                {count}
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
          <div className="border-t p-5">
            {count === 0 ? (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              children
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
