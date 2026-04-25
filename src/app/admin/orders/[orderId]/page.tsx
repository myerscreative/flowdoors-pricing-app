import { ApprovalDrawingCard } from '@/components/orders/ApprovalDrawingCard'
import { ClientPortalBar } from '@/components/orders/ClientPortalBar'
import { InviteCustomerButton } from '@/components/orders/InviteCustomerButton'
import { CollapsibleMediaCard } from '@/components/orders/CollapsibleMediaCard'
import { DocumentsCard } from '@/components/orders/DocumentsCard'
import { DoorSpecsGrid } from '@/components/orders/DoorSpecsGrid'
import { EmailsCard } from '@/components/orders/EmailsCard'
import { LineItemsTable } from '@/components/orders/LineItemsTable'
import { OrderProgressTracker } from '@/components/orders/OrderProgressTracker'
import { PaymentsCard } from '@/components/orders/PaymentsCard'
import { PricingBreakdown } from '@/components/orders/PricingBreakdown'
import { ShippingTrackingCard } from '@/components/orders/ShippingTrackingCard'
import { TasksCard } from '@/components/orders/TasksCard'
import type {
  ApprovalDrawing,
  DocumentRecord,
  EmailRecord,
  LineItem,
  OrderStage,
  PaymentRecord,
  PricingRow,
  ShipmentInfo,
  SpecField,
  TaskRecord,
} from '@/components/orders/types'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminDb } from '@/lib/firebaseAdmin'
import { tsToIso } from '@/lib/firestoreHelpers'
import { ArrowLeft, Paperclip, Camera } from 'lucide-react'
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
    title: `Order ${orderId} • FlowDoors Admin`,
  }
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // Placeholder data (wire to services in a later step)
  const status = 'Pending'
  const createdDate = '—'
  const customerName = '—'
  const email = '—'
  const phone = '—'
  const customerAddress = '—'

  const specs: SpecField[] = [
    { key: 'systemType', label: 'System Type', value: 'Multi-Slide' },
    { key: 'material', label: 'Material', value: 'Aluminum' },
    { key: 'overallSize', label: 'Overall Size', value: '192" × 96"' },
    { key: 'panels', label: 'Panels', value: '4' },
    { key: 'panelLayout', label: 'Panel Layout', value: '2 Left / 2 Right' },
    { key: 'openingDirection', label: 'Opening Direction', value: 'Slides Left' },
    { key: 'swing', label: 'Operation', value: '2 active, 2 stationary' },
    { key: 'frameColor', label: 'Frame Color', value: 'Black' },
    { key: 'glassType', label: 'Glass Type', value: 'Low-E3 Dual Pane' },
    { key: 'hardware', label: 'Hardware', value: 'Modern Pull' },
    { key: 'doorType', label: 'Track', value: 'Top-Hung (Concealed)' },
    { key: 'roughOpening', label: 'Rough Opening', value: '194" × 97"' },
  ]

  const itemPriceUSD = 12450
  const lineItems: LineItem[] = [
    {
      id: 'li1',
      description: 'Multi-Slide Door System',
      subtitle: '192" × 96" · Black · Low-E3 · Aluminum',
      qty: 1,
      unitPrice: itemPriceUSD,
    },
  ]

  const subtotal = lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const deliveryFee = 800
  const taxAmount = Math.round(subtotal * 0.0875)
  const pricingRows: PricingRow[] = [
    { label: 'Delivery (Regular)', amount: deliveryFee },
    { label: 'Tax', amount: taxAmount },
  ]
  const orderTotal = subtotal + deliveryFee + taxAmount

  const stages: OrderStage[] = [
    { id: 'order', label: 'Order', status: 'complete' },
    { id: 'deposit', label: 'Deposit', status: 'complete' },
    { id: 'manufacturing', label: 'Manufacturing', status: 'current' },
    { id: 'balance', label: 'Balance', status: 'pending' },
    { id: 'shipping', label: 'Shipping', status: 'pending' },
    { id: 'delivered', label: 'Delivered', status: 'pending' },
  ]

  const payments: PaymentRecord[] = [
    {
      id: 'advance',
      label: '50% Advance',
      amount: orderTotal * 0.5,
      status: 'paid',
      date: 'Apr 16, 2026',
      method: 'Square',
    },
    {
      id: 'balance',
      label: '50% Balance',
      amount: orderTotal * 0.5,
      status: 'due',
      date: 'Due on shipment',
    },
  ]

  const shipment: ShipmentInfo = {
    trackingNumber: '—',
    carrier: 'Carrier TBD',
    status: 'pending',
  }

  const emails: EmailRecord[] = [
    { id: 'e1', subject: `Manufacturing Update — ${orderId} | FlowDoors`, sentAt: 'Apr 18, 2026, 3:12 PM' },
    { id: 'e2', subject: `Deposit Received — ${orderId} | FlowDoors`, sentAt: 'Apr 16, 2026, 3:18 PM' },
    { id: 'e3', subject: `Balance Invoice — ${orderId} | FlowDoors`, sentAt: 'Apr 16, 2026, 3:16 PM' },
    { id: 'e4', subject: `Approval Drawing Ready — Quote QT-2026-006 | FlowDoors`, sentAt: 'Apr 14, 2026, 3:14 PM' },
    { id: 'e5', subject: `Quote Accepted — QT-2026-006 | FlowDoors`, sentAt: 'Apr 14, 2026, 2:58 PM' },
  ]

  const documents: DocumentRecord[] = [
    { id: 'd1', title: 'Order Summary', subtitle: `${orderId}.pdf`, category: 'summary' },
    { id: 'd2', title: 'Approval Drawing', subtitle: 'Signed — 4 panels, 192" × 96"', category: 'drawing', status: 'signed' },
    { id: 'd3', title: 'Receipt — 50% Advance Invoice', subtitle: 'INV-2026-006-A.pdf', category: 'receipt', status: 'paid' },
    { id: 'd4', title: 'Receipt — 50% Balance Invoice', subtitle: 'INV-2026-006-B.pdf', category: 'receipt', status: 'pending' },
  ]

  const approvalDrawing: ApprovalDrawing = {
    status: 'signed',
    panelCount: 4,
    dimensions: '192" W × 96" H',
    signedAt: 'Apr 14, 2026',
  }

  // Persisted tasks for this order (fall back to empty if Firestore unavailable)
  let tasks: TaskRecord[] = []
  try {
    const snap = await adminDb
      .collection('orders')
      .doc(orderId)
      .collection('tasks')
      .orderBy('sortOrder', 'asc')
      .get()
    tasks = snap.docs.map(
      (d: FirebaseFirestore.QueryDocumentSnapshot): TaskRecord => {
        const t = d.data()
        return {
          id: d.id,
          title: t.title ?? '',
          done: Boolean(t.done),
          completedAt: tsToIso(t.completedAt) ?? undefined,
          dueDate: tsToIso(t.dueDate) ?? undefined,
          priority:
            t.priority === 'low' ||
            t.priority === 'high' ||
            t.priority === 'normal'
              ? t.priority
              : undefined,
          assignee: t.assignee ?? undefined,
        }
      }
    )
  } catch (err) {
    console.warn('Tasks fetch skipped:', err)
  }

  const portalPath = `/portal/${orderId}`
  const portalUrl =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}${portalPath}`
      : portalPath
  const quoteUrl = `/admin/quotes/${orderId}`

  // Load persisted notes from Firestore. Guarded for dev without Firebase.
  let initialNotes: Array<{
    id: string
    content: string
    createdAt: string
    attachments: Array<{
      id: string
      name: string
      type: string
      size: number
      url: string
      isImage: boolean
    }>
  }> = []
  try {
    const snap = await adminDb
      .collection('notes')
      .orderBy('createdAt', 'desc')
      .get()
    initialNotes = snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = d.data()
      const attachments = Array.isArray(data.attachments)
        ? (data.attachments as Array<{
            name: string
            type: string
            size: number
            url: string
            isImage: boolean
          }>).map((a, i) => ({
            id: `${d.id}-a${i}`,
            name: a.name,
            type: a.type,
            size: a.size,
            url: a.url,
            isImage: a.isImage,
          }))
        : []
      return {
        id: d.id,
        content: data.content ?? '',
        createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
        attachments,
      }
    })
  } catch (err) {
    console.warn('Notes fetch skipped:', err)
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/admin/orders" aria-label="Back to Orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>

      <ClientPortalBar
        portalPath={portalPath}
        portalUrl={portalUrl}
        quoteUrl={quoteUrl}
      />

      <OrderProgressTracker
        stages={stages}
        summary={{
          title: 'Order in manufacturing',
          description:
            'Your doors are being built. You\u2019ll be notified when ready to ship.',
          tone: 'info',
        }}
      />

      {/* Main + right-rail grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer */}
          <SectionCard ariaLabel="Customer">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Customer
              </h2>
              <InviteCustomerButton
                orderId={orderId}
                defaultEmail={email !== '\u2014' ? email : ''}
                defaultName={customerName !== '\u2014' ? customerName : ''}
              />
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <InfoRow label="Name" value={customerName} />
                <InfoRow label="Phone" value={phone} />
                <InfoRow label="Email" value={email} />
                <InfoRow label="Address" value={customerAddress} />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quote
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm font-medium text-foreground">
                    Quote # {orderId}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Layout Preview */}
          <SectionCard ariaLabel="Layout Preview">
            <div className="aspect-[16/3.5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/60" />
            <div className="px-0 pb-0 pt-4">
              <div className="text-sm text-muted-foreground">Layout Preview</div>
              <div className="text-xs text-muted-foreground/80">
                (Visual rendering of the door layout — coming in a later step)
              </div>
            </div>
          </SectionCard>

          <DoorSpecsGrid fields={specs} />

          <LineItemsTable items={lineItems} />

          <PricingBreakdown
            subtotal={subtotal}
            rows={pricingRows}
            total={orderTotal}
            installQuoteUrl={`/admin/quotes/new?installFor=${orderId}`}
          />

          <ApprovalDrawingCard drawing={approvalDrawing} />

          <CollapsibleMediaCard
            title="Site Photos"
            icon={<Camera className="h-4 w-4" />}
            iconTint="bg-primary/15 text-primary"
            count={0}
            emptyMessage="No site photos uploaded yet."
          />

          <CollapsibleMediaCard
            title="Attachments"
            icon={<Paperclip className="h-4 w-4" />}
            iconTint="bg-primary/15 text-primary"
            count={0}
            emptyMessage="No attachments yet."
          />

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
            <NotesPanel initialNotes={initialNotes} />
          </SectionCard>
        </div>

        {/* Right rail */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <PaymentsCard payments={payments} total={orderTotal} />
          <ShippingTrackingCard shipment={shipment} />
          <EmailsCard emails={emails} />
          <DocumentsCard documents={documents} />
          <TasksCard orderId={orderId} initialTasks={tasks} />
        </aside>
      </div>
    </main>
  )
}

/* --- Shared presentational helpers --- */

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
      className={`rounded-2xl border bg-card text-card-foreground p-6 shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  )
}
