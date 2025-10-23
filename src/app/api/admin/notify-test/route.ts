import { NextRequest, NextResponse } from 'next/server'

const isDebugAllowed =
  process.env.POSTMARK_DEBUG === '1' && process.env.ALLOW_NOTIFY_TEST === '1'

export async function POST(request: NextRequest) {
  if (!isDebugAllowed) {
    return NextResponse.json(
      { ok: false, error: 'notify-test disabled' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const quoteId = body?.quoteId ?? 'DEBUG-QUOTE'

    const notificationData = {
      type: 'Quote' as const,
      id: quoteId,
      customerName: body?.customerName ?? 'Debug Customer',
      customerEmail: body?.customerEmail ?? 'debug@example.com',
      customerPhone: body?.customerPhone ?? '555-000-0000',
      timestamp: new Date(),
      totalAmount: body?.totalAmount ?? 12345,
      itemCount: body?.itemCount ?? 2,
      productTypes: body?.productTypes ?? ['Debug Product'],
      salesRep: body?.salesRep ?? 'Debug Rep',
    }

    const { sendNotificationEmails } = await import('@/lib/emailService')
    const result = await sendNotificationEmails(notificationData)

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('notify-test error', error)
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
