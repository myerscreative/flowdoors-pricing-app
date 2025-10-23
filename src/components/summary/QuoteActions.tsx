// src/components/summary/QuoteActions.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useQuote } from '@/context/QuoteContext'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'
import { trackConversion } from '@/lib/analytics/googleAds'
import { readAttributionClient } from '@/lib/attributions'
import { generateQuotePdf } from '@/lib/generate-pdf'
import { getStoredAttribution } from '@/lib/marketing/attribution'
import { addQuote } from '@/services/quoteService'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function QuoteActions() {
  const { state, dispatch } = useQuote()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddItem = () => {
    dispatch({ type: 'ADD_ITEM' })
    router.push('/select-product')
  }

  const handleStartNew = () => {
    dispatch({ type: 'RESET_QUOTE' })
    router.push('/select-product')
  }

  const handleSaveAndEmail = async () => {
    setIsProcessing(true)
    toast({
      title: 'Processing Quote...',
      description: 'Please wait while we generate and save your quote.',
    })

    let pdfBase64: string | undefined
    let quoteId: string | undefined
    const finalQuoteState = { ...state }

    console.warn('Final Quote State for PDF and Save:', finalQuoteState)

    try {
      const result = await generateQuotePdf(finalQuoteState)
      pdfBase64 = result.pdfBase64
      quoteId = result.quoteId
    } catch (error: unknown) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'PDF Generation Failed',
        description: 'There was a problem creating the quote PDF.',
        variant: 'destructive',
      })
      setIsProcessing(false)
      return
    }

    try {
      const quoteToSave = {
        ...finalQuoteState,
        quoteId,
        createdAt: new Date(),
      }

      console.warn('Object being passed to addQuote:', quoteToSave)
      await addQuote(quoteToSave)

      // 🔸 Track Google Ads conversion via GTM after quote is saved
      const attribution = getStoredAttribution()
      const conversionLabel =
        process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ||
        'quote_submission'

      trackConversion(
        conversionLabel,
        state.totals?.grandTotal ?? 0,
        attribution?.gclid,
        quoteId
      ).catch((error) => {
        // Silently fail - don't block user flow
        if (process.env.NODE_ENV === 'development') {
          console.warn('[GTM] Conversion tracking failed:', error)
        }
      })

      // 🔸 Attribution + event after the quote is saved
      const at = readAttributionClient()
      track('quote_saved', {
        value: state.totals?.grandTotal ?? 0,
        currency: 'USD',
        quote_id: quoteId ?? '',
        items_count: state.items.length,
        product_types: state.items.map((i) => i.product?.type).filter(Boolean),
        ...at,
      })

      toast({
        title: 'Quote Saved!',
        description: 'Your quote has been saved to our system.',
      })

      // Send notification emails to team
      try {
        const salesRepName = localStorage.getItem('salesRepName') || undefined
        const notifyResponse = await fetch('/api/quotes/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId: quoteId ?? '',
            customerName: `${state.customer.firstName} ${state.customer.lastName}`,
            customerEmail: state.customer.email,
            customerPhone: state.customer.phone,
            totalAmount: state.totals?.grandTotal ?? 0,
            itemCount: state.items.length,
            productTypes: state.items
              .map((i) => i.product?.type)
              .filter(Boolean),
            salesRep: salesRepName,
          }),
        })

        const notifyResult = await notifyResponse.json()

        if (notifyResponse.ok && notifyResult.success) {
          console.warn('✅ Quote notification sent successfully for:', quoteId)
        } else {
          console.error('❌ Quote notification failed:', notifyResult)
        }
      } catch (notifyError) {
        // Don't fail the quote process if notifications fail
        console.error('❌ Failed to send quote notifications:', notifyError)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Error saving quote to Firestore:', error)
      toast({
        title: 'Database Save Failed',
        description: `Could not save quote. Reason: ${message}`,
        variant: 'destructive',
      })
      setIsProcessing(false)
      return
    }

    try {
      // Send email via API route instead of server action
      const emailResponse = await fetch('/api/quotes/email-with-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: state.customer.email,
          name: `${state.customer.firstName} ${state.customer.lastName}`,
          quoteId,
          pdfBase64,
        }),
      })

      const emailResult = await emailResponse.json()
      const at = readAttributionClient()

      if (emailResponse.ok && emailResult.success) {
        // 🔸 Event after email succeeds
        track('quote_emailed', {
          quote_id: quoteId ?? '',
          email: state.customer.email,
          ...at,
        })

        toast({
          title: 'Quote Emailed!',
          description:
            'The quote has been sent to your email address. Redirecting...',
        })

        // Log dev-only confirmation
        console.warn('[saveQuote] email sent', { quoteId })

        // Safe redirect to flowdoors.com after successful email
        setTimeout(() => {
          window.location.replace('https://flowdoors.com/thank-you')
        }, 2000) // Give user time to see the success message
      } else {
        // Optional: failure event
        track('quote_email_failed', {
          quote_id: quoteId ?? '',
          email: state.customer.email,
          error: emailResult.message ?? emailResult.error ?? 'unknown',
          ...at,
        })

        toast({
          title: 'Email Failed',
          description:
            'Quote was saved but could not be emailed. Please contact support.',
          variant: 'destructive',
        })
      }
    } catch (emailError: unknown) {
      console.error('Error sending email:', emailError)
      toast({
        title: 'Email Error',
        description:
          'Quote was saved but there was an error sending the email.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <Button variant="outline" onClick={handleAddItem}>
          Add Another Item
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleStartNew}>
          Start New Quote
        </Button>
        <Button size="lg" onClick={handleSaveAndEmail} disabled={isProcessing}>
          {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isProcessing ? 'Processing...' : 'Save & Email Quote'}
        </Button>
      </div>
    </div>
  )
}
