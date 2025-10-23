// src/lib/quote/types.ts
export type CurrencyCents = number

export interface Dimensions {
  widthMm: number
  heightMm: number
  roughOpening?: boolean
}

export interface PanelConfig {
  count: number
  layoutCode: string // e.g., "RLLL"
  orientation: 'left' | 'right' | 'center' | 'both'
  threshold?: 'standard' | 'flush' | 'ADA'
}

export interface Finish {
  interior: string
  exterior: string
}

export interface Glass {
  type: string // e.g., "Low-E Double"
  uValue?: number
  rValue?: number
}

export interface Hardware {
  handle: string
  finish: string
  lockType?: string
}

export interface PriceLine {
  label: string
  qty?: number
  unitPriceCents?: CurrencyCents
  totalCents: CurrencyCents
  notes?: string
}

export interface Totals {
  subtotalCents: CurrencyCents
  taxCents: CurrencyCents
  totalCents: CurrencyCents
}

export interface Quote {
  id: string
  createdAt: string // ISO
  updatedAt: string // ISO

  /** Optional customer fields (lightweight model for PDF/preview) */
  customer?: { name: string; email?: string; phone?: string }

  /** Project metadata/location */
  project?: {
    address1?: string
    city?: string
    state?: string
    postalCode?: string
  }

  dimensions: Dimensions
  panels: PanelConfig
  finishes: Finish
  glass: Glass
  hardware: Hardware
  pricingLines: PriceLine[]
  totals: Totals
  leadTimeWeeks?: number
  notes?: string[]
  assets?: { logoUrl?: string }

  /** Referral code entered by the customer */
  referralCodeCustomer?: string

  /** Salesperson referral code captured/derived when known */
  referralCodeSalesperson?: string
}
