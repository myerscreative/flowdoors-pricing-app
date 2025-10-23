'use client'

import { DeleteOrderDialog } from '@/components/admin/DeleteOrderDialog'
import { OrdersGrid } from '@/components/admin/OrdersGrid'
import OrdersTable from '@/components/admin/OrdersTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'
import type { Order } from '@/services/orderService'; // service Order type
import { orderService } from '@/services/orderService'; // keep your existing service object
import { useEffect, useState } from 'react'
import { FileDown, Settings, LayoutGrid, List, Columns, Minimize2, PlusCircle, Search, AlertCircle } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('newest')
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
      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-flowdoors-charcoal">Orders</h1>
          <p className="text-gray-600">Manage and view all customer orders.</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize View
            </Button>
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button className="bg-flowdoors-blue hover:bg-flowdoors-blue-700 gap-2">
            <PlusCircle className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, order #, status, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus:border-flowdoors-blue focus:ring-flowdoors-blue"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? 'bg-flowdoors-blue hover:bg-flowdoors-blue-700 border-flowdoors-blue focus:ring-flowdoors-blue' : ''}
          >
            PENDING
          </Button>
          <Button
            variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('confirmed')}
            className={statusFilter === 'confirmed' ? 'bg-flowdoors-blue hover:bg-flowdoors-blue-700 border-flowdoors-blue focus:ring-flowdoors-blue' : ''}
          >
            CONFIRMED
          </Button>
          <Button
            variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('in_progress')}
            className={statusFilter === 'in_progress' ? 'bg-flowdoors-blue hover:bg-flowdoors-blue-700 border-flowdoors-blue focus:ring-flowdoors-blue' : ''}
          >
            IN PROGRESS
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
            className={statusFilter === 'completed' ? 'bg-flowdoors-blue hover:bg-flowdoors-blue-700 border-flowdoors-blue focus:ring-flowdoors-blue' : ''}
          >
            COMPLETED
          </Button>
          <Button
            variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('cancelled')}
            className={statusFilter === 'cancelled' ? 'bg-flowdoors-blue hover:bg-flowdoors-blue-700 border-flowdoors-blue focus:ring-flowdoors-blue' : ''}
          >
            CANCELLED
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'bg-flowdoors-blue hover:bg-flowdoors-blue-700 border-flowdoors-blue focus:ring-flowdoors-blue' : ''}
          >
            VIEW ALL
          </Button>
        </div>
      </div>

      {/* Content */}
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
          isLoading={loading}
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
