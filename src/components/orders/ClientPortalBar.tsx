'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Copy, ExternalLink, FileText, Link2 } from 'lucide-react'

interface ClientPortalBarProps {
  portalPath: string
  portalUrl: string
  quoteUrl?: string
  className?: string
}

export function ClientPortalBar({
  portalPath,
  portalUrl,
  quoteUrl,
  className,
}: ClientPortalBarProps) {
  const { toast } = useToast()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      toast({
        title: 'Portal link copied',
        description: portalUrl,
      })
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Copy the link manually.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Link2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            Client Portal
          </div>
          <div className="truncate font-mono text-xs text-muted-foreground">
            {portalPath}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 rounded-lg"
          onClick={copy}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 rounded-lg"
          asChild
        >
          <a href={portalUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        </Button>
        {quoteUrl ? (
          <Button size="sm" className="h-8 gap-1.5 rounded-lg" asChild>
            <a href={quoteUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="h-3.5 w-3.5" />
              View Quote
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
