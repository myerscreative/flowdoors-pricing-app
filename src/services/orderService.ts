// Canonical Order shape for Orders UI/Service
// We extend any base model you may have with UI-friendly fields used across the app.
import type { Order as BaseOrder } from '@/lib/types'

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'fulfilled'
  // include legacy/alt labels observed in UI to avoid TS2367
  | 'pending'
  | 'in_progress'
  | 'completed'

export type Order = BaseOrder & {
  /**
   * Primary numeric amount for the order. Some UI pieces reference `orderAmount`,
   * so we keep both – `orderAmount` remains optional and mirrors `amount`.
   */
  amount: number
  // Override the status field to be more specific
  status: OrderStatus
}

// Service functions - now using API routes instead of direct firebase-admin access
export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const orders = await response.json()
      return orders as Order[]
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch order')
      }
      const order = await response.json()
      return order as Order
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  },
}
