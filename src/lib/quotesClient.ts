'use client'

import { getQuotes as getQuotesFromService } from '@/services/quoteService'

// One UI-friendly shape that both sources map into
export type UIQuote = {
  id: string
  customerName: string
  total: number
  createdAtISO: string
  status: string
  salesRep?: string
  quoteNumber?: string
}

// Type for the raw quote data from Firestore service
type FirestoreQuoteData = {
  id?: string
  quoteNumber?: string
  status?: string
  pipelineStage?: string
  quoteAmount?: number
  firstName?: string
  lastName?: string
  company?: string
  createdAt?: Date | string
  salesRep?: string
}

/**
 * Check if mock data should be used based on localStorage setting.
 * Returns false (real data) by default.
 */
function shouldUseMockData(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = localStorage.getItem('useMockData')
    return stored === 'true'
  } catch {
    return false
  }
}

export async function getUIQuotes(): Promise<UIQuote[]> {
  const USE_MOCK = shouldUseMockData()

  if (USE_MOCK) {
    // Mock path: expect /api/mock/quotes array with {id, customerName, total, createdAt, status, salespersonId?, quoteNumber?}
    const res = await fetch('/api/mock/quotes', { cache: 'no-store' })
    if (!res.ok)
      throw new Error(
        `Mock quotes fetch failed: ${res.status} ${res.statusText}`
      )
    const arr = (await res.json()) as Array<{
      id?: string
      customerName?: string
      total?: number
      createdAt?: string
      status?: string
      salespersonId?: string
      salespersonCode?: string
      quoteNumber?: string
    }>
    return (arr ?? []).map((q, i) => ({
      id: q.id ?? `mock-${i}`,
      customerName: q.customerName ?? 'Customer',
      total: typeof q.total === 'number' ? q.total : 0,
      createdAtISO: q.createdAt ?? new Date().toISOString(),
      status: q.status ?? 'New',
      salesRep: q.salespersonId ?? q.salespersonCode,
      quoteNumber: q.quoteNumber,
    }))
  }

  // Real path: reuse your Firestore-mapped service
  const rows = await getQuotesFromService()
  // rows have: { id, quoteNumber, status, pipelineStage, quoteAmount, firstName, lastName, company, createdAt, salesRep, ... }
  return (rows ?? []).map((r: Record<string, unknown>) => {
    const quote = r as FirestoreQuoteData
    const name =
      [quote.firstName, quote.lastName].filter(Boolean).join(' ').trim() ||
      (quote.company ?? 'Customer')
    const created =
      quote.createdAt instanceof Date
        ? quote.createdAt.toISOString()
        : typeof quote.createdAt === 'string'
          ? quote.createdAt
          : new Date().toISOString()

    const total = typeof quote.quoteAmount === 'number' ? quote.quoteAmount : 0

    return {
      id: String(quote.id ?? ''),
      customerName: name || 'Customer',
      total,
      createdAtISO: created,
      status: String(quote.status ?? quote.pipelineStage ?? 'New'),
      salesRep: quote.salesRep,
      quoteNumber: quote.quoteNumber,
    } satisfies UIQuote
  })
}
