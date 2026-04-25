import { cn } from '@/lib/utils'
import {
  ArrowLeftRight,
  Blinds,
  Columns3,
  DoorClosed,
  Frame,
  Layers,
  Palette,
  Ruler,
  Settings,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { SpecField, SpecFieldKey } from './types'

const ICONS: Record<SpecFieldKey, LucideIcon> = {
  doorType: DoorClosed,
  material: Layers,
  overallSize: Ruler,
  panels: Columns3,
  panelLayout: Blinds,
  openingDirection: ArrowLeftRight,
  swing: ArrowLeftRight,
  frameColor: Palette,
  glassType: Sparkles,
  hardware: Wrench,
  systemType: Frame,
  operation: Settings,
  roughOpening: Ruler,
}

interface DoorSpecsGridProps {
  fields: SpecField[]
  title?: string
  className?: string
}

export function DoorSpecsGrid({
  fields,
  title = 'Door Specifications',
  className,
}: DoorSpecsGridProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3 border-b p-5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <DoorClosed className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => {
          const Icon = ICONS[f.key] ?? Settings
          return (
            <div
              key={f.key}
              className="flex items-start gap-3 rounded-xl border bg-background/40 p-4 transition-colors hover:border-primary/30"
            >
              <span
                aria-hidden
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </div>
                <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                  {f.value}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
