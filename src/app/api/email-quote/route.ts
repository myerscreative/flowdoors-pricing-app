import { NextRequest, NextResponse } from 'next/server'
import { emailQuote } from '@/ai/flows/emailQuoteFlow'

type EmailQuotePayload = {
  to: string
  name: string
  quoteId: string
  pdfBase64: string
}

function isEmailQuotePayload(x: unknown): x is EmailQuotePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.to === 'string' &&
    typeof o.name === 'string' &&
    typeof o.quoteId === 'string' &&
    typeof o.pdfBase64 === 'string'
  )
}

export async function POST(req: NextRequest) {
  try {
    const bodyUnknown: unknown = await req.json()
    if (!isEmailQuotePayload(bodyUnknown)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const body = bodyUnknown // now typed as EmailQuotePayload via the guard

    const result = await emailQuote({
      to: body.to,
      name: body.name,
      quoteId: body.quoteId,
      pdfBase64: body.pdfBase64,
    })
    return NextResponse.json(result)
  } catch (err) {
    // Allowed console method per lint rules
    console.error('email-quote API error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
