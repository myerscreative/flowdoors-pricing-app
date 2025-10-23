import type { LucideProps } from 'lucide-react'
import type {
    ComponentType,
    ForwardRefExoticComponent,
    RefAttributes,
} from 'react'

// Reusable safe types for JSON-like data
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray
export interface JsonObject {
  [key: string]: JsonValue
}
export type JsonArray = JsonValue[]
// For very loose shapes
export type UnknownRecord = Record<string, unknown>

export type Timeline =
  | 'ASAP'
  | '1-2 Months'
  | '3-6 Months'
  | 'Just Planning'
  | ''
export type CustomerType =
  | 'Homeowner'
  | 'Contractor'
  | 'Builder'
  | 'Architect'
  | 'Designer'
  | 'Dealer'
  | ''
export type ProductId =
  | 'Slide-and-Stack'
  | ''
export type SystemType = 'Multi-Slide' | 'Pocket Door' | ''
export type PaneCount = 'Dual Pane' | 'Triple Pane' | ''
export type Tint = 'Clear Glass' | 'Low-E3 Glass' | 'Laminated Glass' | ''
export type HardwareFinish = 'Black' | 'White' | 'Silver' | ''
export type InstallOption = 'None' | 'Professional Installation' | ''
export type DeliveryOption = 'Regular Delivery' | 'White Glove Delivery' | ''
export type BudgetRange = '$10k-$20k' | '$20k-$30k' | '$30k-$50k' | '$50k+' | ''

export interface Customer {
  firstName: string
  lastName: string
  phone: string
  email: string
  zipCode: string
  timeline: Timeline
  heardVia: string[]
  customerType: CustomerType
  referralCode?: string
  budget?: BudgetRange
}

export interface RalColor {
  ral?: string
  name: string
  hex: string
}

export interface ProductSizeConstraints {
  minPanelWidth: number
  maxPanelWidth: number
  maxHeight: number
  maxWidth: number
}

export interface ProductTypeInfo {
  id: ProductId
  name: string
  icon: ComponentType<{ className?: string }>
  description: string
  basePrice: string
  features: string[]
  image: { src: string; alt: string; hint: string }
  sizeConstraints: ProductSizeConstraints
}

export interface BaseOption {
  name: string
  description: string
  features: string[]
  price: number
  isStandard: boolean
  image: string
  aiHint: string
}

export interface PaneOption extends BaseOption {
  name: PaneCount
}

export interface GlazingOption extends BaseOption {
  name: Tint
}

export interface DeliveryOptionInfo {
  name: DeliveryOption
  description: string
  price: number
  features?: string[]
}

export interface InstallationFeature {
  title: string
  description: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}

export interface PriceBreakdown {
  baseCost: number
  sizeAndPanelCost: number
  pocketDoorCost: number
  glazingCost: number
  totalUpgrades: number
  unitPrice: number
  quantity: number
  itemSubtotal: number
  installationCost: number
  itemTotal: number
}

export interface QuoteItem {
  id: string
  quantity: number
  roomName?: string
  product: {
    type: ProductId
    widthIn: number
    heightIn: number
    configuration: string
    configurationImageUrl?: string
    systemType: SystemType
    panels: string
    track: string
  }
  colors: {
    exterior: RalColor
    interior: RalColor
    isSame: boolean
  }
  glazing: {
    paneCount: PaneCount
    tint: Tint
  }
  hardwareFinish: HardwareFinish
  priceBreakdown?: PriceBreakdown
}

export interface QuoteTotals {
  subtotal: number
  installationCost: number
  deliveryCost: number
  tax: number
  grandTotal: number
  itemTotals: number[]
}

export interface Note {
  id: string
  type: 'call' | 'email' | 'text' | 'visit' | 'note'
  content: string
  timestamp: Date
  author: string
}

export interface Task {
  id: string
  content: string
  dueDate: Date
  completed: boolean
}

export interface Quote {
  customer: Customer
  items: QuoteItem[]
  activeItemIndex: number
  installOption: InstallOption
  deliveryOption: DeliveryOption
  totals: QuoteTotals
  quoteNumber?: string

  /** NEW: duplicated for admin/query convenience */
  referralCodeCustomer?: string
  referralCodeSalesperson?: string
}

export interface Order {
  id: string
  orderNumber: string
  quoteId?: string
  customerName: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  email?: string
  zip?: string
  salesRep?: string
  orderAmount: number
  paymentAmount?: number
  balanceAmount?: number
  paymentDueDate?: string
  balanceDueDate?: string
  paymentReceivedDate?: string
  balanceReceivedDate?: string
  productionStartDate?: string
  shippedDate?: string
  deliveredDate?: string
  installedDate?: string
  followUpDate?: string
  status: string
  createdAt: string
  updatedAt: string
  numberOfItems: number
  notes: Note[]
  tasks: Task[]
  lastContact?: string
}

export interface Salesperson {
  id: string // Document ID
  salesperson_id: string // e.g., SP-001
  firebase_uid?: string
  name: string
  email: string
  phone?: string
  location_code: string
  role: 'salesperson' | 'manager' | 'admin' | 'marketing'
  status: 'active' | 'inactive' | 'pending_activation'
  referralCodes?: string[]
  prefix?: string // 2-4 letter prefix for quote numbers
  zipcodes?: string[] // zips assigned to rep
  homeZip?: string
  startDate?: Date
  created_at: Date
  updated_at: Date

  // New fields for user activation flow
  email_verified?: boolean
  activation_token?: string | null
  token_expires_at?: Date | null
  account_status?: 'pending_activation' | 'active' | 'inactive'
  temp_password?: string
}
