import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { OrderStage } from './types'

interface OrderProgressTrackerProps {
  stages: OrderStage[]
  summary?: {
    title: string
    description: string
    tone?: 'success' | 'info'
  }
  className?: string
}

export function OrderProgressTracker({
  stages,
  summary,
  className,
}: OrderProgressTrackerProps) {
  return (
    <section
      aria-label="Order Progress"
      className={cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="p-6 md:p-8">
        <ol className="flex items-start">
          {stages.map((stage, i) => {
            const isLast = i === stages.length - 1
            const nextComplete =
              !isLast &&
              (stages[i + 1].status === 'complete' ||
                stages[i + 1].status === 'current')
            return (
              <li
                key={stage.id}
                className={cn(
                  'relative flex flex-col items-center',
                  isLast ? 'flex-none' : 'flex-1'
                )}
              >
                <div className="flex w-full items-center">
                  {/* left connector (hidden on first) */}
                  {i > 0 ? (
                    <span
                      aria-hidden
                      className={cn(
                        'h-0.5 flex-1',
                        stage.status === 'complete' ||
                          stage.status === 'current'
                          ? 'bg-emerald-500'
                          : 'bg-border'
                      )}
                    />
                  ) : (
                    <span aria-hidden className="flex-1" />
                  )}
                  {/* dot */}
                  <StageDot status={stage.status} />
                  {/* right connector (hidden on last) */}
                  {!isLast ? (
                    <span
                      aria-hidden
                      className={cn(
                        'h-0.5 flex-1',
                        nextComplete ? 'bg-emerald-500' : 'bg-border'
                      )}
                    />
                  ) : (
                    <span aria-hidden className="flex-1" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-3 text-xs font-medium tracking-wide md:text-sm',
                    stage.status === 'current'
                      ? 'text-primary'
                      : stage.status === 'complete'
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </span>
              </li>
            )
          })}
        </ol>

        {summary ? (
          <div
            className={cn(
              'mt-8 flex items-start gap-3 rounded-xl border p-4',
              summary.tone === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-primary/30 bg-primary/10'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                summary.tone === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              <Check className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <div
                className={cn(
                  'text-sm font-semibold',
                  summary.tone === 'success'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-primary'
                )}
              >
                {summary.title}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {summary.description}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function StageDot({ status }: { status: OrderStage['status'] }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background transition-colors',
        status === 'complete' && 'bg-emerald-500 text-white',
        status === 'current' &&
          'bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]',
        status === 'pending' &&
          'border border-border bg-card text-muted-foreground'
      )}
    >
      <Check
        className={cn(
          'h-4 w-4 transition-opacity',
          status === 'pending' && 'opacity-40'
        )}
      />
    </span>
  )
}
