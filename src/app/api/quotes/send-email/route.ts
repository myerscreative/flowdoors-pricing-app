import { NextRequest, NextResponse } from 'next/server'
import { getQuoteById } from '@/services/quoteService'
import { emailQuote } from '@/ai/flows/emailQuoteFlow'
import { generateQuotePdf } from '@/lib/generate-pdf'
import { db } from '@/lib/firebaseClient'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quoteId } = body

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Get the quote details
    const quote = await getQuoteById(quoteId)
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Generate PDF for the quote
    const pdfResult = await generateQuotePdf(quote)

    // Send email
    if (!quote.customer?.email) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    const emailResult = await emailQuote({
      to: quote.customer.email,
      name: `${quote.customer.firstName || ''} ${quote.customer.lastName || ''}`.trim(),
      quoteId: quote.quote_number || quoteId,
      pdfBase64: pdfResult.pdfBase64,
    })

    // Log email event to Firestore
    try {
      const emailEvent = {
        to: quote.customer!.email,
        sentAt: serverTimestamp(),
        status: emailResult.success ? 'sent' : 'failed',
        error: emailResult.success ? undefined : emailResult.message,
        messageId: emailResult.success ? emailResult.messageId : undefined,
      }

      const emailEventRef = await addDoc(
        collection(db, 'quotes', quoteId, 'emailEvents'),
        emailEvent
      )

      // Create messageId mapping for webhook lookups
      if (emailResult.success && emailResult.messageId) {
        await addDoc(collection(db, 'emailMessageIds'), {
          messageId: emailResult.messageId,
          quoteId: quoteId,
          emailEventId: emailEventRef.id,
          createdAt: serverTimestamp(),
        })
      }
    } catch (logError) {
      console.error('Failed to log email event:', logError)
      // Don't fail the request if logging fails
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Quote email sent successfully',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Send quote email error:', error)

    // Log failed email event
    try {
      const body = await request.json()
      const { quoteId } = body
      if (quoteId) {
        const emailEvent = {
          to: 'unknown',
          sentAt: serverTimestamp(),
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
        await addDoc(
          collection(db, 'quotes', quoteId, 'emailEvents'),
          emailEvent
        )
      }
    } catch (logError) {
      console.error('Failed to log email event:', logError)
    }

    return NextResponse.json(
      {
        error: 'Failed to send quote email',
      },
      { status: 500 }
    )
  }
}
