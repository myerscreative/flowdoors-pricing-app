'use client'

import { useEffect, useMemo, useState } from 'react'
import { KanbanBoard, KanbanColumn } from '@/components/admin/KanbanBoard'
import { orderService } from '@/services/orderService'
import type { Order } from '@/services/orderService'

// Define sold deal stages for orders
const ORDER_STAGES = [
  'Pending',
  'In Production',
  'Shipped',
  'Delivered',
  'Installed',
  'Closed',
] as const

export default function OrdersKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [columnTitles, setColumnTitles] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      try {
        const data = await orderService.getOrders()
        // Ensure we store the normalized Order[] from service shape
        setOrders(
          data.map((o) => ({
            ...o,
            orderAmount: o.orderAmount ?? o.amount,
          })) as Order[]
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const columns: KanbanColumn[] = useMemo(() => {
    const byStage: Record<string, Order[]> = {}
    for (const s of ORDER_STAGES) byStage[s] = []
    for (const o of orders) {
      const s = normalizeStage(o.status as string)
      if (!byStage[s]) byStage[s] = []
      byStage[s].push(o)
    }

    return (ORDER_STAGES as readonly string[]).map((s) => ({
      id: s,
      title: columnTitles[s] || s,
      items: (byStage[s] || []).map((o) => ({
        id: o.id,
        title: o.orderNumber ?? o.id,
        subtitle: o.customerName ?? '',
        amount: (o as Order).orderAmount ?? (o as Order).amount ?? 0,
        data: o,
      })),
    }))
  }, [orders, columnTitles])

  if (loading) {
    return <div className="p-6">Loading…</div>
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sold Deals (Orders) Pipeline</h1>
      <KanbanBoard
        initialColumns={columns}
        onMove={async (id, from, to) => {
          // In a real implementation, call orderService.updateOrderStatus with mapped status
          console.warn('move order', { id, from, to })
        }}
        onRenameColumn={(colId, nextTitle) =>
          setColumnTitles((prev) => ({ ...prev, [colId]: nextTitle }))
        }
      />
    </main>
  )
}

function normalizeStage(input: string): string {
  const s = String(input || '').toLowerCase()
  if (s.includes('progress') || s.includes('production')) return 'In Production'
  if (s.includes('ship')) return 'Shipped'
  if (s.includes('deliver')) return 'Delivered'
  if (s.includes('install')) return 'Installed'
  if (s.includes('close')) return 'Closed'
  return 'Pending'
}
