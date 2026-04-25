import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink, Pencil, Truck } from 'lucide-react'
import type { ShipmentInfo } from './types'

interface ShippingTrackingCardProps {
  shipment: ShipmentInfo
  onEdit?: () => void
  className?: string
}

export function ShippingTrackingCard({
  shipment,
  onEdit,
  className,
}: ShippingTrackingCardProps) {
  const { label, cls } = statusBadge(shipment.status)

  return (
    <section
      aria-label="Shipping & Tracking"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Truck className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">
            Shipping &amp; Tracking
          </h3>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
            cls
          )}
        >
          {label}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            >
              <Truck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold tracking-tight">
                {shipment.trackingNumber}
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {shipment.carrier}
              </div>
              {shipment.trackingUrl ? (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Track Shipment
                </a>
              ) : null}
            </div>
          </div>

          {onEdit ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5 rounded-lg"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function statusBadge(status: ShipmentInfo['status']): {
  label: string
  cls: string
} {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
      }
    case 'in_transit':
      return {
        label: 'In Transit',
        cls: 'bg-primary/15 text-primary ring-primary/25',
      }
    default:
      return {
        label: 'Pending',
        cls: 'bg-muted text-muted-foreground ring-border',
      }
  }
}
