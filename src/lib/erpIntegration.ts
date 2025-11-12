/**
 * FlowDoors ERP Integration Utilities
 *
 * This module provides utilities for integrating with the FlowDoors ERP system.
 * Configure the ERP_API_BASE_URL and ERP_API_KEY in your environment variables.
 */

export interface ERPConfig {
  baseUrl: string
  apiKey: string
  timeout?: number
}

export interface ERPOrder {
  id?: string
  orderNumber: string
  customerName: string
  email: string
  phone: string
  amount: number
  status: string
  items: ERPOrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface ERPOrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specifications?: Record<string, unknown>
}

export interface ERPCustomer {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface ERPProduct {
  id: string
  name: string
  sku: string
  description?: string
  basePrice: number
  category?: string
  inStock: boolean
  specifications?: Record<string, unknown>
}

export interface ERPResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ERPClient {
  private config: ERPConfig

  constructor(config: ERPConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 30000, // Default 30s timeout
    }
  }

  /**
   * Make an authenticated request to the ERP API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ERPResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          }
        }
        return {
          success: false,
          error: error.message,
        }
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      }
    }
  }

  /**
   * Create a new order in the ERP system
   */
  async createOrder(order: ERPOrder): Promise<ERPResponse<ERPOrder>> {
    return this.request<ERPOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  /**
   * Update an existing order in the ERP system
   */
  async updateOrder(
    orderId: string,
    updates: Partial<ERPOrder>
  ): Promise<ERPResponse<ERPOrder>> {
    return this.request<ERPOrder>(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Get order details from ERP system
   */
  async getOrder(orderId: string): Promise<ERPResponse<ERPOrder>> {
    return this.request<ERPOrder>(`/orders/${orderId}`, {
      method: 'GET',
    })
  }

  /**
   * Get order status from ERP system
   */
  async getOrderStatus(orderNumber: string): Promise<ERPResponse<{ status: string; updatedAt: string }>> {
    return this.request<{ status: string; updatedAt: string }>(`/orders/${orderNumber}/status`, {
      method: 'GET',
    })
  }

  /**
   * Create or update customer in ERP system
   */
  async syncCustomer(customer: ERPCustomer): Promise<ERPResponse<ERPCustomer>> {
    const endpoint = customer.id ? `/customers/${customer.id}` : '/customers'
    const method = customer.id ? 'PATCH' : 'POST'

    return this.request<ERPCustomer>(endpoint, {
      method,
      body: JSON.stringify(customer),
    })
  }

  /**
   * Get product information from ERP system
   */
  async getProduct(productId: string): Promise<ERPResponse<ERPProduct>> {
    return this.request<ERPProduct>(`/products/${productId}`, {
      method: 'GET',
    })
  }

  /**
   * Check product availability in ERP system
   */
  async checkInventory(productId: string): Promise<ERPResponse<{ inStock: boolean; quantity: number }>> {
    return this.request<{ inStock: boolean; quantity: number }>(`/products/${productId}/inventory`, {
      method: 'GET',
    })
  }

  /**
   * Get pricing information from ERP system
   */
  async getProductPricing(
    productId: string,
    quantity: number
  ): Promise<ERPResponse<{ unitPrice: number; totalPrice: number }>> {
    return this.request<{ unitPrice: number; totalPrice: number }>(
      `/products/${productId}/pricing?quantity=${quantity}`,
      {
        method: 'GET',
      }
    )
  }

  /**
   * Sync a quote to ERP system
   */
  async syncQuote(quote: {
    quoteNumber: string
    customer: ERPCustomer
    items: ERPOrderItem[]
    totalAmount: number
    validUntil?: string
  }): Promise<ERPResponse<{ quoteId: string }>> {
    return this.request<{ quoteId: string }>('/quotes', {
      method: 'POST',
      body: JSON.stringify(quote),
    })
  }
}

/**
 * Create and configure ERP client instance
 */
export function createERPClient(): ERPClient | null {
  const baseUrl = process.env.ERP_API_BASE_URL
  const apiKey = process.env.ERP_API_KEY

  if (!baseUrl || !apiKey) {
    console.warn('ERP integration not configured. Set ERP_API_BASE_URL and ERP_API_KEY environment variables.')
    return null
  }

  return new ERPClient({
    baseUrl,
    apiKey,
    timeout: parseInt(process.env.ERP_API_TIMEOUT || '30000', 10),
  })
}

/**
 * Singleton ERP client instance
 */
let erpClientInstance: ERPClient | null = null

export function getERPClient(): ERPClient | null {
  if (!erpClientInstance) {
    erpClientInstance = createERPClient()
  }
  return erpClientInstance
}

/**
 * Transform a quote from our system format to ERP format
 */
export function transformQuoteToERP(quote: any): {
  quoteNumber: string
  customer: ERPCustomer
  items: ERPOrderItem[]
  totalAmount: number
} {
  return {
    quoteNumber: quote.quoteNumber || quote.id,
    customer: {
      firstName: quote.firstName || quote.customer?.firstName || '',
      lastName: quote.lastName || quote.customer?.lastName || '',
      email: quote.email || quote.customer?.email || '',
      phone: quote.phone || quote.customer?.phone || '',
      company: quote.company || quote.customer?.company,
      zipCode: quote.zip || quote.zipCode || quote.customer?.zipCode,
    },
    items: (quote.items || []).map((item: any) => ({
      productId: item.productId || item.id || '',
      productName: item.name || item.productName || '',
      quantity: item.quantity || 1,
      unitPrice: item.price || item.unitPrice || 0,
      totalPrice: item.totalPrice || (item.quantity || 1) * (item.price || 0),
      specifications: item.specifications || item.configuration,
    })),
    totalAmount: quote.quoteAmount || quote.totalAmount || 0,
  }
}

/**
 * Transform an order from our system format to ERP format
 */
export function transformOrderToERP(order: any): ERPOrder {
  return {
    orderNumber: order.orderNumber || order.id || '',
    customerName: order.customerName || `${order.firstName} ${order.lastName}`.trim(),
    email: order.email || '',
    phone: order.phone || '',
    amount: order.orderAmount || order.amount || 0,
    status: order.status || 'pending',
    items: (order.items || []).map((item: any) => ({
      productId: item.productId || item.id || '',
      productName: item.name || item.productName || '',
      quantity: item.quantity || 1,
      unitPrice: item.price || item.unitPrice || 0,
      totalPrice: item.totalPrice || (item.quantity || 1) * (item.price || 0),
      specifications: item.specifications || item.configuration,
    })),
  }
}

export default {
  createERPClient,
  getERPClient,
  transformQuoteToERP,
  transformOrderToERP,
}
