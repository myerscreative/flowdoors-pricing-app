/* path: src/components/steps/StepQuoteSummary.tsx */
'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuote } from '@/context/QuoteContext'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'
import { readAttributionClient } from '@/lib/attributions'
import { DELIVERY_OPTIONS, INSTALLATION_INCLUSIONS } from '@/lib/constants'
import { PANEL_GAP_IN } from '@/lib/door-config'
import { generateQuotePdf } from '@/lib/generate-pdf'
import type { DeliveryOption, InstallOption } from '@/lib/types'
import { cn } from '@/lib/utils'
import { addQuote } from '@/services/quoteService'
import {
    AlertTriangle,
    CheckCircle,
    Copy,
    Loader2,
    Pencil,
    Trash2,
    Truck,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { StepContainer } from './StepContainer'

/* ----------------------------- helper types ----------------------------- */

type ProductLike = {
  widthIn?: number
  heightIn?: number
  configuration?: string
  type?: string
  recommendedRoughOpenWidthIn?: number
  roWidthIn?: number
  recommendedRoughOpenHeightIn?: number
  roHeightIn?: number
  panelCount?: number
  panelSizeIn?: number
  swing?: string
  operating?: string
  configurationImageUrl?: string
}

type PriceBreakdownLike = {
  baseCost: number
  sizeAndPanelCost: number
  totalUpgrades: number
  pocketDoorCost: number
  glazingCost: number
  unitPrice: number
  itemSubtotal: number
  installationCost: number
  itemTotal: number
}

type QuoteItemLike = {
  id: string
  roomName?: string
  quantity: number
  product: ProductLike
  priceBreakdown?: PriceBreakdownLike
}

/* ------------------------------- utilities ------------------------------ */

function toCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// mirror PDF logic
function computePanelWidthIn(totalWidthIn?: number, panelCount?: number) {
  if (!totalWidthIn || !panelCount || panelCount <= 0) return undefined
  const usable = Math.max(totalWidthIn - PANEL_GAP_IN, 0)
  return Math.round((usable / panelCount) * 100) / 100
}

function parseTotalPanelsFromConfiguration(
  config?: string
): number | undefined {
  if (!config || typeof config !== 'string') return undefined
  const matches = config.match(/(\d+)\s*p/gi)
  if (!matches) return undefined
  const sum = matches.reduce((acc, token) => {
    const m = token.match(/(\d+)/)
    return acc + (m ? Number(m[1]) : 0)
  }, 0)
  return sum > 0 ? sum : undefined
}

const SummaryItem = ({
  label,
  value,
  className = '',
}: {
  label: string
  value?: string | number | null
  className?: string
}) => {
  if (!value && value !== 0) return null
  return (
    <div className={`flex justify-between py-1 ${className}`}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{String(value)}</dd>
    </div>
  )
}

const SummarySection = ({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-base font-semibold">{title}</h3>
      <Button
        variant="link"
        size="sm"
        onClick={onEdit}
        className="h-auto px-2 py-1"
      >
        <Pencil className="mr-2 h-4 w-4" /> Edit
      </Button>
    </div>
    {children}
  </div>
)

const ServicesSelector = () => {
  const { state, dispatch } = useQuote()
  const { installOption, deliveryOption } = state

  const handleInstallToggle = useCallback(
    (checked: boolean) => {
      const option: InstallOption = checked
        ? 'Professional Installation'
        : 'None'
      dispatch({ type: 'SET_INSTALL', payload: option })
    },
    [dispatch]
  )

  const handleSelectDelivery = useCallback(
    (optionName: DeliveryOption) => {
      dispatch({ type: 'SET_DELIVERY', payload: optionName })
    },
    [dispatch]
  )

  // Potential (display-only) install cost
  const potentialInstallationCost = state.items.reduce(
    (acc: number, item: QuoteItemLike) => {
      const w = item.product?.widthIn
      const h = item.product?.heightIn
      if (!w || !h) return acc
      const sqFt = (w * h) / 144
      return acc + sqFt * 22 * item.quantity
    },
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <Label
                htmlFor="install-toggle"
                className="text-base font-semibold"
              >
                Professional Installation
              </Label>
              <p
                className={cn(
                  'font-bold text-lg',
                  installOption === 'Professional Installation'
                    ? 'text-green-600'
                    : 'text-foreground'
                )}
              >
                {toCurrency(potentialInstallationCost)}
                {installOption === 'Professional Installation' && (
                  <span className="text-sm ml-2">Added</span>
                )}
              </p>
            </div>
            <Switch
              id="install-toggle"
              checked={installOption === 'Professional Installation'}
              onCheckedChange={handleInstallToggle}
            />
          </div>
          {installOption === 'Professional Installation' ? (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4 text-sm">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-blue-800">
                {INSTALLATION_INCLUSIONS.map((inclusion) => (
                  <li key={inclusion} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>{inclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mt-4 text-sm">
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                </div>
                <div>
                  <p className="font-bold">Important Note</p>
                  <p>
                    Choosing not to include professional installation may void
                    certain warranty coverages.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Delivery Options
          </h3>
          <div className="space-y-3">
            {DELIVERY_OPTIONS.map((option) => (
              <Card
                key={option.name}
                onClick={() => handleSelectDelivery(option.name)}
                className={cn(
                  'cursor-pointer transition-all p-3',
                  deliveryOption === option.name
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-border'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="mt-1">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        deliveryOption === option.name
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )}
                    >
                      {deliveryOption === option.name && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{option.name}</h4>
                      <p className="font-bold text-md">
                        ${option.price.toLocaleString()}+
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StepQuoteSummary({
  goToStep,
}: {
  goToStep: (_step: number) => void
}) {
  const { state, dispatch } = useQuote()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const activeTab = `item-${state.activeItemIndex}`

  const handleAddItem = () => {
    dispatch({ type: 'ADD_ITEM' })
    goToStep(1)
  }

  const handleTabChange = (value: string) => {
    const index = parseInt(value.split('-')[1], 10)
    dispatch({ type: 'SET_ACTIVE_ITEM', payload: index })
  }

  const handleDeleteItem = (index: number) => {
    if (state.items.length > 1) {
      dispatch({ type: 'DELETE_ITEM', payload: index })
      toast({
        title: 'Item Removed',
        description: `Item ${String.fromCharCode(65 + index)} has been removed from your quote.`,
      })
    } else {
      toast({
        title: 'Cannot Remove Item',
        description: 'You must have at least one item in your quote.',
        variant: 'destructive',
      })
    }
  }

  const handleDuplicateItem = (index: number) => {
    dispatch({ type: 'DUPLICATE_ITEM', payload: index })
    toast({
      title: 'Item Duplicated',
      description: `Item ${String.fromCharCode(65 + index)} has been duplicated.`,
    })
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity > 0) {
      dispatch({ type: 'SET_ITEM_QUANTITY', payload: { index, quantity } })
    }
  }

  const handleStartNew = () => {
    dispatch({ type: 'RESET_QUOTE' })
    window.location.href = '/quote/start'
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
          message: emailResult.message ?? emailResult.error ?? 'unknown',
          ...at,
        })
        throw new Error(
          emailResult.message ?? emailResult.error ?? 'Unknown error'
        )
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Error sending email:', error)
      toast({
        title: 'Email Send Failed',
        description: `Could not email quote. Reason: ${message}`,
        variant: 'destructive',
      })
    }

    setIsProcessing(false)
  }

  const { totals } = state

  return (
    <StepContainer
      title="Your Quote Summary"
      description="Review your selections below. You can go back to make changes."
    >
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Ready to receive your quote?
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleStartNew}>
            Start New Quote
          </Button>
          <Button
            size="lg"
            onClick={handleSaveAndEmail}
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Save & Email Quote'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList>
          {state.items.map((item: QuoteItemLike, index: number) => (
            <TabsTrigger key={item.id} value={`item-${index}`}>
              Item {String.fromCharCode(65 + index)}
              {item.roomName ? ` - ${item.roomName}` : ''}
            </TabsTrigger>
          ))}
        </TabsList>

        {state.items.map((item: QuoteItemLike, index: number) => {
          const { priceBreakdown } = item
          // const _costLabel = item.product.type === "Awning-Window" ? "Window Cost" : "Door Cost";

          return (
            <TabsContent key={item.id} value={`item-${index}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Item Details</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateItem(index)}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={state.items.length <= 1}
                              className="text-destructive hover:text-destructive/90 hover:border-destructive/50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this item from your
                                quote.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(index)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-end">
                      <SummarySection
                        title="Configuration"
                        onEdit={() => goToStep(1)}
                      >
                        {(() => {
                          const p: ProductLike = item.product ?? {}
                          const dimW = p.widthIn
                          const dimH = p.heightIn
                          const roW =
                            p.recommendedRoughOpenWidthIn ?? p.roWidthIn
                          const roH =
                            p.recommendedRoughOpenHeightIn ?? p.roHeightIn
                          const panelCount: number | undefined =
                            typeof p.panelCount === 'number' && p.panelCount > 0
                              ? p.panelCount
                              : parseTotalPanelsFromConfiguration(
                                  p.configuration
                                )
                          const panelWidth =
                            p.panelSizeIn ??
                            computePanelWidthIn(dimW, panelCount)
                          const roWEff =
                            typeof roW === 'number'
                              ? roW
                              : typeof dimW === 'number'
                                ? dimW + 1
                                : undefined
                          const roHEff =
                            typeof roH === 'number'
                              ? roH
                              : typeof dimH === 'number'
                                ? dimH + 1
                                : undefined
                          const isSlideStack = String(p.type || '')
                            .toLowerCase()
                            .includes('stack')
                          const swing = p.swing ?? p.operating

                          return (
                            <dl>
                              <SummaryItem
                                label="Net Frame Dimensions"
                                value={`${dimW ?? '—'}" width × ${dimH ?? '—'}" height`}
                              />
                              <SummaryItem
                                label="Recommended Rough Opening"
                                value={`${roWEff ?? '—'}" width × ${roHEff ?? '—'}" height`}
                              />
                              <SummaryItem
                                label="Configuration"
                                value={p.configuration}
                              />
                              <SummaryItem
                                label="Number of Panels"
                                value={panelCount ?? '—'}
                              />
                              <SummaryItem
                                label="Panel Width"
                                value={
                                  typeof panelWidth === 'number'
                                    ? `${panelWidth}"`
                                    : '—'
                                }
                              />
                              {isSlideStack ? (
                                <SummaryItem
                                  label="Swing Door Positions"
                                  value={swing ?? '—'}
                                />
                              ) : null}
                            </dl>
                          )
                        })()}
                      </SummarySection>
                      <div className="space-y-2 w-24">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="text-center"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Price Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {priceBreakdown && (
                      <dl>
                        <SummaryItem
                          label="Door Cost"
                          value={toCurrency(priceBreakdown.itemSubtotal)}
                          className="font-semibold"
                        />
                        <SummaryItem
                          label="Installation"
                          value={
                            priceBreakdown.installationCost > 0
                              ? toCurrency(priceBreakdown.installationCost)
                              : 'Not Included'
                          }
                          className="font-semibold"
                        />
                        <Separator className="my-2" />
                        <div className="flex justify-between py-2 text-lg">
                          <dt className="font-bold">Item Total</dt>
                          <dd className="font-bold">
                            {toCurrency(priceBreakdown.itemTotal)}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ServicesSelector />
        {totals && (
          <Card>
            <CardHeader>
              <CardTitle>Total Quote Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <SummaryItem
                  label="All Items Subtotal"
                  value={toCurrency(totals.subtotal)}
                />
                <SummaryItem
                  label="Installation"
                  value={toCurrency(totals.installationCost)}
                />
                <SummaryItem
                  label="Delivery"
                  value={toCurrency(totals.deliveryCost)}
                />
                <SummaryItem
                  label="Estimated Tax (8%)"
                  value={toCurrency(totals.tax)}
                />
                <Separator className="my-4" />
                <div className="flex justify-between py-2 text-xl">
                  <dt className="font-bold">Grand Total</dt>
                  <dd className="font-bold">{toCurrency(totals.grandTotal)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={handleAddItem}>
          Add Another Item
        </Button>
      </div>
    </StepContainer>
  )
}
