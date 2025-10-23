// src/app/api/mock/quotes/route.ts
import { NextResponse } from 'next/server'

// Minimal shape expected by admin grid & services.
// Adjust fields later as needed, but keep id/customerName/total/createdAt/status present.
type QuoteStatus =
  | 'Hot'
  | 'Warm'
  | 'Cold'
  | 'New'
  | 'Won'
  | 'Lost'
  | 'Pending'
  | 'Follow-Up'

type QuoteRow = {
  id: string
  customerName: string
  total?: number
  createdAt?: string // ISO
  status: QuoteStatus
  salespersonId?: string
  salespersonCode?: string
  quoteNumber?: string
}

export async function GET() {
  const now = new Date().toISOString()
  const data: QuoteRow[] = [
    {
      id: 'Q-101',
      customerName: 'Acme Homes',
      total: 15800,
      createdAt: now,
      status: 'Hot',
      salespersonId: 'NYBL',
      salespersonCode: 'NYBL',
      quoteNumber: 'NYBL-101',
    },
    {
      id: 'Q-102',
      customerName: 'Oceanview Builders',
      total: 7680,
      createdAt: now,
      status: 'Warm',
      salespersonId: 'NYBL',
      salespersonCode: 'NYBL',
      quoteNumber: 'NYBL-102',
    },
  ]

  // Return a raw array so existing code expecting Array(...) continues to work.
  return NextResponse.json(data, { status: 200 })
}
