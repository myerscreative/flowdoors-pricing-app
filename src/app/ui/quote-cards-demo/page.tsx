'use client'

import { useState } from 'react'

type ViewMode = 'list' | 'grid'

type QuoteItem = {
  id: string
  name: string
  config: string
  room: string
  qty: number
  price: number // cents or dollars; here dollars for demo
}

const MOCK_ITEMS: QuoteItem[] = [
  {
    id: 'q1',
    name: 'Bi-Fold',
    config: `144" × 96" • 4p_4L`,
    room: 'Living Room',
    qty: 1,
    price: 9120,
  },
  {
    id: 'q2',
    name: 'Multi-Slide',
    config: `216" × 96" • 6p_3L`,
    room: 'Great Room',
    qty: 2,
    price: 18450,
  },
  {
    id: 'q3',
    name: 'Pocket',
    config: `120" × 96" • 3p_3L`,
    room: 'Primary Suite',
    qty: 1,
    price: 11200,
  },
]

export default function QuoteCardsDemoPage() {
  const [mode, setMode] = useState<ViewMode>('list')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Quote Items — Demo
            </h1>
            <p className="text-sm text-gray-600">
              Toggle between List and Grid views.
            </p>
          </div>

          {/* View Toggle */}
          <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-black/5">
            <button
              onClick={() => setMode('list')}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                mode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-pressed={mode === 'list'}
            >
              List
            </button>
            <button
              onClick={() => setMode('grid')}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                mode === 'grid'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-pressed={mode === 'grid'}
            >
              Grid
            </button>
          </div>
        </header>

        {/* Items */}
        <section
          className={
            mode === 'grid'
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
              : 'space-y-4'
          }
        >
          {MOCK_ITEMS.map((item) =>
            mode === 'grid' ? (
              <Card key={item.id} item={item} compact />
            ) : (
              <Card key={item.id} item={item} />
            )
          )}
        </section>
      </div>
    </main>
  )
}

/** Apple/Tesla style card — compact variant for grid */
function Card({
  item,
  compact = false,
}: {
  item: QuoteItem
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md ${
        compact ? 'p-5' : 'p-6'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3
            className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}
          >
            {item.name}
          </h3>
          <p className="text-sm text-gray-500">{item.config}</p>
        </div>
        <p
          className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-emerald-600`}
        >
          {formatUSD(item.price)}
        </p>
      </div>

      {/* Body */}
      <div className={`grid gap-6 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Room</p>
          <p className="text-sm text-gray-800">{item.room}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Quantity
          </p>
          <div className="mt-1 inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 text-sm">
            {item.qty}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex items-center justify-end gap-1">
        <IconButton title="Edit" path={PENCIL} />
        <IconButton title="Duplicate" path={COPY} />
        <IconButton title="Delete" path={TRASH} className="text-red-500" />
        <IconButton title="Details" path={INFO} />
      </div>
    </div>
  )
}

/** Minimal inline SVG icon button (keeps this file self-contained) */
function IconButton({
  title,
  path,
  className = '',
}: {
  title: string
  path: string
  className?: string
}) {
  return (
    <button
      aria-label={title}
      title={title}
      className={`rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 ${className}`}
      type="button"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d={path} />
      </svg>
    </button>
  )
}

/** Icons (paths only) */
const PENCIL = 'M12 20h9'
const COPY = 'M8 8h12v12H8z M4 4h12v12H4z'
const TRASH = 'M3 6h18M19 6l-1 14H6L5 6m3 0V4h8v2'
const INFO = 'M12 8h.01M11 12h2v6h-2z'

/** Helper */
function formatUSD(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}
