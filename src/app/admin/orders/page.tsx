'use client'

import { useEffect, useState } from 'react'
import { orderService } from '@/services/orderService' // keep your existing service object
import type { Order } from '@/services/orderService' // service Order type
import OrdersTable from '@/components/admin/OrdersTable'
import { OrdersGrid } from '@/components/admin/OrdersGrid'
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'
import { toast } from '@/hooks/use-toast'
import { DeleteOrderDialog } from '@/components/admin/DeleteOrderDialog'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string
    orderNumber: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { role } = useCurrentUserRole()

  const isAdmin = role === 'admin'

  const handleDeleteClick = (orderId: string) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete orders',
        variant: 'destructive',
      })
      return
    }

    // Find the order to get its order number
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setOrderToDelete({
        id: orderId,
        orderNumber: order.orderNumber || order.id,
      })
      setDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return

    setIsDeleting(true)
    try {
      await orderService.deleteOrder(orderToDelete.id)
      setOrders(orders.filter((order) => order.id !== orderToDelete.id))
      toast({
        title: 'Success',
        description: 'Order deleted successfully',
        variant: 'success',
      })
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the order',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  useEffect(() => {
    let mounted = true
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders() // returns array of orders
        // If your service doesn’t yet return the canonical Order shape,
        // this cast keeps the UI compiling; we can harden by mapping later.
        if (mounted) setOrders(data as unknown as Order[])
      } catch (e) {
        console.error('Failed to fetch orders:', e)
        if (mounted) setOrders([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOrders()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  const hasOrders = orders.length > 0

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-md px-4 py-2 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md px-4 py-2 ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {!hasOrders ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-dashed py-24 text-center">
          <div>
            <h3 className="text-2xl font-bold">No Orders Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try again later or adjust your filters.
            </p>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <OrdersTable
          orders={orders as Order[]}
          onDeleteOrder={handleDeleteClick}
          canDelete={isAdmin}
        />
      ) : (
        <OrdersGrid
          orders={orders}
          onDeleteOrder={handleDeleteClick}
          canDelete={isAdmin}
        />
      )}

      <DeleteOrderDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        orderNumber={orderToDelete?.orderNumber || ''}
        isLoading={isDeleting}
      />
    </div>
  )
}
