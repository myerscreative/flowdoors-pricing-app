import { NextRequest, NextResponse } from 'next/server'
import { updateEmailEventWithWebhook } from '@/services/emailEventsService'
import crypto from 'crypto'

interface PostmarkWebhookEvent {
  RecordType: string
  MessageID: string
  Recipient: string
  ReceivedAt: string
  Tag?: string
  Metadata?: Record<string, string>
}

function verifyPostmarkSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Compute HMAC-SHA256 of the raw body
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBody, 'utf8')
    const computedSignature = hmac.digest('base64')

    // Validate signature format before comparison
    if (!signature || typeof signature !== 'string') {
      return false
    }

    // Check if signature is valid base64
    try {
      Buffer.from(signature, 'base64')
    } catch {
      return false
    }

    // Use timing-safe comparison to prevent timing attacks
    // Ensure both buffers are the same length
    const computedBuffer = Buffer.from(computedSignature, 'base64')
    const signatureBuffer = Buffer.from(signature, 'base64')

    if (computedBuffer.length !== signatureBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(computedBuffer, signatureBuffer)
  } catch (error) {
    console.error('Error verifying Postmark signature:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.POSTMARK_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('POSTMARK_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    // Get the signature from headers
    const signature = request.headers.get('x-postmark-signature')
    if (!signature) {
      console.warn('Missing X-Postmark-Signature header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the raw body as string for signature verification
    const rawBody = await request.text()

    // Verify the signature
    if (!verifyPostmarkSignature(rawBody, signature, webhookSecret)) {
      console.warn('Invalid Postmark webhook signature')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the verified JSON body
    const body = JSON.parse(rawBody)

    // Handle batch webhook events
    const events = Array.isArray(body) ? body : [body]

    for (const event of events) {
      const {
        RecordType,
        MessageID,
        Recipient: _Recipient,
        ReceivedAt: _ReceivedAt,
      } = event as PostmarkWebhookEvent

      console.warn(
        `Processing Postmark webhook: ${RecordType} for MessageID: ${MessageID}`
      )

      if (RecordType === 'Open') {
        await updateEmailEventWithWebhook(MessageID, 'open')
        console.warn(`Updated open tracking for MessageID: ${MessageID}`)
      } else if (RecordType === 'Click') {
        await updateEmailEventWithWebhook(MessageID, 'click')
        console.warn(`Updated click tracking for MessageID: ${MessageID}`)
      } else {
        console.warn(`Unhandled webhook event type: ${RecordType}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Postmark webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Postmark webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
