import { DoorSpecsGrid } from '@/components/orders/DoorSpecsGrid'
import { OrderProgressTracker } from '@/components/orders/OrderProgressTracker'
import { ShippingTrackingCard } from '@/components/orders/ShippingTrackingCard'
import type {
  OrderStage,
  ShipmentInfo,
  SpecField,
} from '@/components/orders/types'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSessionBridge } from '@/components/portal/PortalSessionBridge'
import { Button } from '@/components/ui/button'
import { adminDb } from '@/lib/firebaseAdmin'
import { getPortalUser } from '@/lib/portalAuth'
import { ArrowLeft, CheckCircle2, Clock, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PortalOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login')

  const { orderId } = await params

  let data: FirebaseFirestore.DocumentData | undefined
  try {
    const snap = await adminDb.collection('orders').doc(orderId).get()
    if (snap.exists) data = snap.data()
  } catch (err) {
    console.warn('portal order fetch failed:', err)
  }

  if (!data) notFound()

  // Access check: match by customerUid or by email
  const belongsToUser =
    (data.customerUid === user.uid) || (data.email === user.email)
  if (!belongsToUser) {
    // Do not reveal existence
    notFound()
  }

  const orderNumber = (data.orderNumber as string) || orderId
  const status = (data.status as string) || 'pending'
  const total =
    typeof data.orderAmount === 'number'
      ? data.orderAmount
      : typeof data.amount === 'number'
        ? data.amount
        : 0
  const paid = typeof data.paymentAmount === 'number' ? data.paymentAmount : 0
  const balance =
    typeof data.balanceAmount === 'number'
      ? data.balanceAmount
      : Math.max(0, total - paid)

  // Derive progress stages from status
  const stages = deriveStages(status)

  // Customer-safe specs (placeholder until real data is wired up on orders)
  const specs: SpecField[] = [
    { key: 'systemType', label: 'System Type', value: (data.systemType as string) || '\u2014' },
    { key: 'material', label: 'Material', value: (data.material as string) || 'Aluminum' },
    { key: 'overallSize', label: 'Overall Size', value: (data.overallSize as string) || '\u2014' },
    { key: 'panels', label: 'Panels', value: String(data.panels ?? '\u2014') },
    { key: 'frameColor', label: 'Frame Color', value: (data.frameColor as string) || '\u2014' },
    { key: 'glassType', label: 'Glass Type', value: (data.glassType as string) || '\u2014' },
  ]

  const shipment: ShipmentInfo = {
    trackingNumber: (data.trackingNumber as string) || '\u2014',
    carrier: (data.carrier as string) || 'Carrier TBD',
    status:
      (data.shippingStatus as ShipmentInfo['status']) ??
      (status === 'delivered' ? 'delivered' : 'pending'),
    trackingUrl: (data.trackingUrl as string) || undefined,
  }

  return (
    <>
      <PortalSessionBridge />
      <PortalHeader email={user.email} />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/portal">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All orders
              </Link>
            </Button>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Order {orderNumber}
            </h1>
          </div>
        </div>

        <OrderProgressTracker stages={stages} />

        <div className="grid gap-6 md:grid-cols-2">
          <PaymentSummaryCard total={total} paid={paid} balance={balance} />
          <ShippingTrackingCard shipment={shipment} />
        </div>

        <DoorSpecsGrid
          fields={specs}
          title="Your Door"
        />

        <div className="rounded-2xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about your order? Contact your FlowDoors sales rep.
          </p>
        </div>
      </main>
    </>
  )
}

function deriveStages(status: string): OrderStage[] {
  const order = [
    { id: 'order', label: 'Order' },
    { id: 'deposit', label: 'Deposit' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'balance', label: 'Balance' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'delivered', label: 'Delivered' },
  ] as const
  const s = status.toLowerCase()
  let currentIdx = 0
  if (/deposit/.test(s)) currentIdx = 1
  else if (/manufactur|in_progress|progress/.test(s)) currentIdx = 2
  else if (/balance/.test(s)) currentIdx = 3
  else if (/ship/.test(s)) currentIdx = 4
  else if (/deliver|complet/.test(s)) currentIdx = 5

  return order.map((st, i) => ({
    id: st.id,
    label: st.label,
    status:
      i < currentIdx
        ? 'complete'
        : i === currentIdx
          ? /deliver|complet/.test(s) && i === order.length - 1
            ? 'complete'
            : 'current'
          : 'pending',
  }))
}

function PaymentSummaryCard({
  total,
  paid,
  balance,
}: {
  total: number
  paid: number
  balance: number
}) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Payments</h3>
        </div>
        <div className="text-right text-sm tabular-nums">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatUSD(paid)}
          </span>
          <span className="mx-1.5 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatUSD(total)}</span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
            aria-label={`${pct}% paid`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border bg-background/40 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Paid
            </div>
            <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
              {formatUSD(paid)}
            </div>
          </div>
          <div className="rounded-xl border bg-background/40 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Balance
            </div>
            <div className="mt-1 font-semibold">{formatUSD(balance)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
