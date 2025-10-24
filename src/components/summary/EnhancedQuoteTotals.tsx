'use client'

import { useQuote } from '@/context/QuoteContext'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { generateQuotePdf } from '@/lib/generate-pdf'
import { addQuote } from '@/services/quoteService'
import { track } from '@/lib/analytics'
import { trackConversion } from '@/lib/analytics/googleAds'
import { readAttributionClient } from '@/lib/attributions'
import { getStoredAttribution } from '@/lib/marketing/attribution'

export function EnhancedQuoteTotals() {
  const { state, dispatch } = useQuote()
  const { totals } = state
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!totals) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-center text-slate-600">
          <p>No pricing data available</p>
        </div>
      </div>
    )
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

      await addQuote(quoteToSave)

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
        if (process.env.NODE_ENV === 'development') {
          console.warn('[GTM] Conversion tracking failed:', error)
        }
      })

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

        setTimeout(() => {
          window.location.replace('https://flowdoors.com/thank-you')
        }, 2000)
      } else {
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

  const handleAddItem = () => {
    dispatch({ type: 'ADD_ITEM' })
    router.push('/select-product')
  }

  const handleStartNew = () => {
    dispatch({ type: 'RESET_QUOTE' })
    router.push('/select-product')
  }

  return (
    <div className="lg:sticky lg:top-8">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
        {/* Dark Header */}
        <div className="bg-gradient-to-r from-flowdoors-charcoal to-flowdoors-charcoal-700 p-6 text-white">
          <h3 className="text-xl font-bold mb-1">Quote Summary</h3>
          <p className="text-sm text-white/80">Your custom door solution</p>
        </div>

        {/* Line Items */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between py-2">
            <dt className="text-sm text-slate-600">All Items Subtotal</dt>
            <dd className="text-sm font-semibold text-flowdoors-charcoal">
              ${totals.subtotal.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-sm text-slate-600">Installation</dt>
            <dd className="text-sm font-semibold text-flowdoors-charcoal">
              ${totals.installationCost.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-sm text-slate-600">Delivery</dt>
            <dd className="text-sm font-semibold text-flowdoors-charcoal">
              ${totals.deliveryCost.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-sm text-slate-600">Estimated Tax (8%)</dt>
            <dd className="text-sm font-semibold text-flowdoors-charcoal">
              ${totals.tax.toLocaleString()}
            </dd>
          </div>

          <Separator className="my-4" />

          {/* Total */}
          <div className="bg-gradient-to-r from-flowdoors-blue/10 to-flowdoors-green/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-semibold text-flowdoors-charcoal">
                Total Estimate
              </span>
              <span className="text-3xl font-bold text-flowdoors-blue">
                ${totals.grandTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-flowdoors-green font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Price guarantee: Valid for 30 days
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="p-6 pt-0 space-y-3">
          <Button
            size="lg"
            onClick={handleSaveAndEmail}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-flowdoors-blue to-flowdoors-blue-600 hover:from-flowdoors-blue-600 hover:to-flowdoors-blue-700 text-white font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
          >
            {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Save & Email Quote'}
          </Button>

          <Button
            variant="outline"
            onClick={handleAddItem}
            className="w-full border-flowdoors-blue/30 text-flowdoors-blue hover:bg-flowdoors-blue/10 font-semibold"
          >
            Add Another Item
          </Button>

          <Button
            variant="ghost"
            onClick={handleStartNew}
            className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            Start New Quote
          </Button>
        </div>

        {/* Trust Section */}
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <svg className="w-5 h-5 text-flowdoors-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-600">
                <span className="font-semibold text-flowdoors-charcoal">Free changes:</span> Modify anytime before ordering
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <svg className="w-5 h-5 text-flowdoors-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="text-slate-600">
                <span className="font-semibold text-flowdoors-charcoal">Expert support:</span> Call (619) 555-0123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

