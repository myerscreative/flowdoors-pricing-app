import { NextRequest, NextResponse } from 'next/server'
import { emailQuote } from '@/ai/flows/emailQuoteFlow'
import { db } from '@/lib/firebaseClient'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, name, quoteId, pdfBase64 } = body

    if (!to || !name || !quoteId || !pdfBase64) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name, quoteId, pdfBase64' },
        { status: 400 }
      )
    }

    // Send email with the provided PDF
    const emailResult = await emailQuote({
      to,
      name,
      quoteId,
      pdfBase64,
    })

    // Log email event to Firestore
    try {
      const emailEvent = {
        to,
        sentAt: serverTimestamp(),
        status: emailResult.success ? 'sent' : 'failed',
        error: emailResult.success ? undefined : emailResult.message,
        messageId:
          emailResult.success && 'messageId' in emailResult
            ? emailResult.messageId
            : undefined,
      }

      const emailEventRef = await addDoc(
        collection(db, 'quotes', quoteId, 'emailEvents'),
        emailEvent
      )

      // Create messageId mapping for webhook lookups
      if (
        emailResult.success &&
        'messageId' in emailResult &&
        emailResult.messageId
      ) {
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
        messageId:
          'messageId' in emailResult ? emailResult.messageId : undefined,
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send quote email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
