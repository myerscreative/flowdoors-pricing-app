export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  role: 'homeowner' | 'contractor' | 'business'
  location: string
  zipCode: string
  timeline: string
  source: 'web' | 'phone' | 'referral' | 'social'
  status: 'new' | 'contacted' | 'quoted' | 'cold'
  hasQuote: boolean
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export interface LeadStats {
  total: number
  withoutQuotes: number
  withQuotes: number
  newThisWeek: number
  unassigned: number
}

export interface LeadFilters {
  search: string
  status: string
  source: string
  timeline: string
  showOnlyNonConverted: boolean
}
