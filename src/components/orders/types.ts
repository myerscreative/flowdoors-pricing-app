export type OrderStageId =
  | 'order'
  | 'deposit'
  | 'manufacturing'
  | 'balance'
  | 'shipping'
  | 'delivered'

export type OrderStageStatus = 'complete' | 'current' | 'pending'

export interface OrderStage {
  id: OrderStageId
  label: string
  status: OrderStageStatus
}

export type PaymentStatus = 'paid' | 'due' | 'overdue' | 'pending'

export interface PaymentRecord {
  id: string
  label: string
  amount: number
  status: PaymentStatus
  date?: string
  method?: string
}

export interface ShipmentInfo {
  trackingNumber: string
  carrier: string
  status: 'pending' | 'in_transit' | 'delivered'
  trackingUrl?: string
}

export interface EmailRecord {
  id: string
  subject: string
  sentAt: string
}

export type DocumentCategory = 'summary' | 'drawing' | 'receipt' | 'other'

export interface DocumentRecord {
  id: string
  title: string
  subtitle?: string
  category: DocumentCategory
  url?: string
  status?: 'paid' | 'signed' | 'pending'
}

export type ApprovalDrawingStatus = 'draft' | 'sent' | 'signed'

export interface ApprovalDrawing {
  status: ApprovalDrawingStatus
  panelCount?: number
  dimensions?: string
  url?: string
  signedAt?: string
}

export interface TaskRecord {
  id: string
  title: string
  done: boolean
  completedAt?: string
  dueDate?: string
  priority?: 'low' | 'normal' | 'high'
  assignee?: string
}

export interface TaskTemplate {
  id: string
  title: string
  priority?: 'low' | 'normal' | 'high'
  assignee?: string
}

export type SpecFieldKey =
  | 'doorType'
  | 'material'
  | 'overallSize'
  | 'panels'
  | 'panelLayout'
  | 'openingDirection'
  | 'swing'
  | 'frameColor'
  | 'glassType'
  | 'hardware'
  | 'systemType'
  | 'operation'
  | 'roughOpening'

export interface SpecField {
  key: SpecFieldKey
  label: string
  value: string
}

export interface LineItem {
  id: string
  description: string
  subtitle?: string
  qty: number
  unitPrice: number
}

export interface PricingRow {
  label: string
  amount: number
}
