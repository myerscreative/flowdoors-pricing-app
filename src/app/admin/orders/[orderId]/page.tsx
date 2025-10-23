import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ReactNode } from 'react'

/** Client-only NotesPanel (avoid making this page a client component) */
const NotesPanel = dynamic(() => import('@/components/notes/NotesPanel'), {})

/** Route Metadata (server-only) */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  return {
    title: `Order ${orderId} • Scenic Admin`,
  }
}

// Server Component (Next.js 15): unwrap params via await
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // TODO: Replace these placeholders with real data (service call) in a later step
  const status = 'Pending'
  const createdDate = '—' // e.g., Sep 10, 2025
  const customerName = '—'
  const email = '—'
  const phone = '—'
  const customerAddress = '—'

  // Options (left rail)
  const optionFinishExterior = 'Black'
  const optionFinishInterior = 'Black'
  const optionHandle = 'Modern Pull'
  const optionTrack = 'Top-Hung (Concealed)'
  const optionGlass = 'Low-E3, Dual Pane'

  // Specs (main sheet)
  const systemType = 'Multi-Slide'
  const operation = '2 Left / 2 Right'
  const panelConfig = '4 Panels (2 active, 2 stationary)'
  const systemWidthIn = '192' // inches
  const systemHeightIn = '96' // inches
  const roWidthIn = '194' // recommended rough opening (W)
  const roHeightIn = '97' // recommended rough opening (H)

  // Pricing (footer)
  const itemPriceUSD = 12450

  // Load persisted notes (internal follow-up notes).
  // For now, show all notes. In a later step we can scope notes to this orderId.
  const rawNotes = await prisma.note.findMany({
    include: { attachments: true },
    orderBy: { createdAt: 'desc' },
  })
  const initialNotes = rawNotes.map((n) => ({
    id: n.id,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    attachments: n.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      size: a.size,
      url: a.url,
      isImage: a.isImage,
    })),
  }))

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Order {orderId}
            </h1>
            <Badge variant="secondary" className="rounded-full">
              {status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created: {createdDate} · Customer: {customerName}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/admin/orders" aria-label="Back to Orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      {/* NEW: Company & Customer Info (above hero) */}
      <SectionCard ariaLabel="Order & Parties">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              FlowDoors
            </h2>
            <div className="mt-2 text-sm text-gray-900">
              <div>1234 Coastal View Dr.</div>
              <div>San Diego, CA 92130</div>
              <div className="mt-1">Phone: (858) 555-0138</div>
              <div>Email: info@flowdoors.com</div>
            </div>
          </div>

          {/* Customer + Quote */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Customer
            </h3>
            <div className="mt-2 space-y-1.5">
              <InfoRow label="Name" value={customerName} />
              <InfoRow label="Phone" value={phone} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Address" value={customerAddress} />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Quote
              </h3>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-900">
                  Quote # {orderId}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="text-sm text-muted-foreground">
            Items: Item 1 · Item 2 · Item 3
          </div>
        </div>
      </SectionCard>

      {/* Hero: Layout Preview (half height) */}
      <SectionCard ariaLabel="Layout Preview">
        <div className="aspect-[16/3.5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100" />
        <div className="px-0 pb-0 pt-4">
          <div className="text-sm text-muted-foreground">Layout Preview</div>
          <div className="text-xs text-gray-500">
            (This will render a visual of the door layout in a later step)
          </div>
        </div>
      </SectionCard>

      {/* Content Grid: Left Options Rail + Main Spec Sheet */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left rail: Options */}
        <SectionCard className="md:col-span-1" ariaLabel="Options">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Options</h2>

          <OptionGroup title="Exterior Finish" value={optionFinishExterior} />
          <OptionGroup title="Interior Finish" value={optionFinishInterior} />
          <OptionGroup title="Handle" value={optionHandle} />
          <OptionGroup title="Track" value={optionTrack} />
          <OptionGroup title="Glass" value={optionGlass} />

          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <div>Customer Email: {email}</div>
            <div>Phone: {phone}</div>
          </div>
        </SectionCard>

        {/* Main spec sheet */}
        <SectionCard className="md:col-span-2" ariaLabel="Specification">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Specification
          </h2>

          <div className="divide-y divide-gray-100">
            <DetailRow label="System Type" value={systemType} />
            <DetailRow label="Operation" value={operation} />
            <DetailRow label="Panel Configuration" value={panelConfig} />
            <DetailRow
              label="System Size (in)"
              value={`${systemWidthIn}" W × ${systemHeightIn}" H`}
            />
            <DetailRow
              label="Recommended Rough Opening (in)"
              value={`${roWidthIn}" W × ${roHeightIn}" H`}
            />
            <DetailRow label="Exterior Finish" value={optionFinishExterior} />
            <DetailRow label="Interior Finish" value={optionFinishInterior} />
            <DetailRow label="Track Type" value={optionTrack} />
            <DetailRow label="Glass" value={optionGlass} />
            <DetailRow label="Hardware" value={optionHandle} />
          </div>
        </SectionCard>
      </div>

      {/* Follow-up Notes (Internal, not client-visible) */}
      <SectionCard ariaLabel="Follow-up Notes (Internal)">
        <div className="mb-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Follow-up Notes{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (internal)
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            These notes are for sales/ops only and are not shown to the client.
          </p>
        </div>
        {/* Client-side Notes UI fed by server-fetched data */}
        <NotesPanel initialNotes={initialNotes} />
      </SectionCard>

      {/* Footer: Pricing */}
      <SectionCard ariaLabel="Item Price">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Item Price</h2>
            <p className="text-sm text-muted-foreground">
              For this configuration
            </p>
          </div>
          <div className="text-2xl font-bold">{formatUSD(itemPriceUSD)}</div>
        </div>
      </SectionCard>
    </main>
  )
}

/* --- Helpers (server-safe, presentation only) --- */

function SectionCard({
  children,
  className = '',
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  )
}

function OptionGroup({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-800">
        {value}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <span className="w-48 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-gray-900">{value}</span>
    </div>
  )
}

function formatUSD(n: number): string {
  try {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  } catch {
    return `$${(Math.round(n * 100) / 100).toFixed(2)}`
  }
}
