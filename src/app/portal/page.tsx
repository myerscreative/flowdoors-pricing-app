import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSessionBridge } from '@/components/portal/PortalSessionBridge'
import { adminDb } from '@/lib/firebaseAdmin'
import { tsToIso } from '@/lib/firestoreHelpers'
import { getPortalUser } from '@/lib/portalAuth'
import { ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface CustomerOrderRow {
  id: string
  orderNumber: string
  status: string
  createdAt: string | null
  total: number
}

async function loadOrdersForCustomer(
  uid: string,
  email: string
): Promise<CustomerOrderRow[]> {
  try {
    // Match by customerUid (set when the invite was sent) OR by email
    const byUid = adminDb
      .collection('orders')
      .where('customerUid', '==', uid)
      .get()
    const byEmail = adminDb
      .collection('orders')
      .where('email', '==', email)
      .get()
    const [uidSnap, emailSnap] = await Promise.all([byUid, byEmail])

    const seen = new Set<string>()
    const rows: CustomerOrderRow[] = []
    const push = (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      if (seen.has(doc.id)) return
      seen.add(doc.id)
      const d = doc.data()
      rows.push({
        id: doc.id,
        orderNumber: (d.orderNumber as string) || doc.id,
        status: (d.status as string) || 'pending',
        createdAt: tsToIso(d.createdAt),
        total:
          typeof d.orderAmount === 'number'
            ? d.orderAmount
            : typeof d.amount === 'number'
              ? d.amount
              : 0,
      })
    }
    uidSnap.forEach(push)
    emailSnap.forEach(push)

    rows.sort((a, b) => (a.createdAt ?? '') < (b.createdAt ?? '') ? 1 : -1)
    return rows
  } catch (err) {
    console.warn('portal orders load failed:', err)
    return []
  }
}

export default async function PortalHomePage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login')

  const orders = await loadOrdersForCustomer(user.uid, user.email)

  return (
    <>
      <PortalSessionBridge />
      <PortalHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length === 0
              ? 'No orders linked to your account yet.'
              : `${orders.length} order${orders.length === 1 ? '' : 's'} on file.`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            If you&apos;re expecting an order here, contact your FlowDoors sales
            rep and confirm the email on your account matches the one on your
            order.
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/portal/orders/${o.id}`}
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Package className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold">
                      {o.orderNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : ''}
                      {o.createdAt ? ' · ' : ''}
                      {formatUSD(o.total)}
                    </div>
                  </div>
                  <StatusPill status={o.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}

function StatusPill({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ')
  const cls = /complet|deliver/i.test(status)
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20'
    : /progress|manufac|ship/i.test(status)
      ? 'bg-primary/15 text-primary ring-primary/25'
      : 'bg-muted text-muted-foreground ring-border'
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${cls}`}
    >
      {label}
    </span>
  )
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
