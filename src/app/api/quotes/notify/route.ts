import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationEmails } from '@/lib/emailService'

interface NotifyQuotePayload {
  quoteId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  totalAmount: number
  itemCount: number
  productTypes: string[]
  salesRep?: string
}

function isNotifyQuotePayload(x: unknown): x is NotifyQuotePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.quoteId === 'string' &&
    typeof o.customerName === 'string' &&
    typeof o.customerEmail === 'string' &&
    typeof o.totalAmount === 'number' &&
    typeof o.itemCount === 'number' &&
    Array.isArray(o.productTypes)
  )
}

export async function POST(req: NextRequest) {
  try {
    const bodyUnknown: unknown = await req.json()
    if (!isNotifyQuotePayload(bodyUnknown)) {
      return NextResponse.json(
        { error: 'Invalid payload', success: false },
        { status: 400 }
      )
    }
    const body = bodyUnknown

    const notificationData = {
      type: 'Quote' as const,
      id: body.quoteId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      timestamp: new Date(),
      totalAmount: body.totalAmount,
      itemCount: body.itemCount,
      productTypes: body.productTypes,
      salesRep: body.salesRep,
    }

    console.warn('📧 Sending quote notification emails for:', body.quoteId)
    const result = await sendNotificationEmails(notificationData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      console.error('❌ Quote notification failed:', result.message)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('quote notification API error', err)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        success: false,
      },
      { status: 500 }
    )
  }
}



