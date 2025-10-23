/* path: src/components/steps/StepQuote-summary.tsx */
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
import { DELIVERY_OPTIONS, INSTALLATION_INCLUSIONS } from '@/lib/constants'
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
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { StepContainer } from './StepContainer'

// Helper function to capitalize color names
const capitalizeColorName = (colorName: string) => {
  const colorMap: Record<string, string> = {
    black: 'Black',
    white: 'White',
    bronze: 'Bronze',
    anodized: 'Anodized',
  }
  return colorMap[colorName.toLowerCase()] || colorName
}

// --- Summary image helpers (local) ---
const normalizeAssetUrl = (u?: string): string | undefined => {
  if (!u) return undefined
  const s = String(u).trim()
  if (!s) return undefined
  if (s.startsWith('data:')) return s
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('/')) return s
  if (/^(products|images|img|assets|uploads|static)\b/i.test(s))
    return `/${s.replace(/^\/+/, '')}`
  if (s.includes('/_next/image')) {
    try {
      const tmp = new URL(s, 'http://localhost')
      const inner = tmp.searchParams.get('url') ?? undefined
      return normalizeAssetUrl(inner || undefined)
    } catch {
      /* noop */
    }
  }
  return undefined
}

const resolveItemImage = (
  product: Record<string, unknown> | undefined,
  item: Record<string, unknown> | undefined
): string | undefined => {
  const p = (product ?? {}) as Record<string, unknown>
  const i = (item ?? {}) as Record<string, unknown>
  const candidates = [
    p.configurationImageUrl,
    i.configurationImageUrl,
    p.imageUrl,
    i.imageUrl,
    p.image,
    i.image,
    p.photoUrl,
    i.photoUrl,
    p.coverImageUrl,
    i.coverImageUrl,
    p.thumbnailUrl,
    i.thumbnailUrl,
  ]
  for (const v of candidates) {
    const norm = normalizeAssetUrl(typeof v === 'string' ? v : undefined)
    if (norm) return norm
  }
  return undefined
}

const configCaption = (config?: string): string => {
  if (!config) return ''
  // pattern 1: ms_3p_oox -> "Operating + Operating + Fixed"
  const ox = config.match(/_([ox]+)$/i)
  if (ox) {
    return ox[1]
      .split('')
      .map((c) => (c.toLowerCase() === 'o' ? 'Operating' : 'Fixed'))
      .join(' + ')
  }
  // pattern 2: sas_4p_4L -> "Stack Left (4)"
  const stack = config.match(/_(\d+)([LR])$/i)
  if (stack) {
    const n = stack[1]
    const dir = stack[2].toUpperCase() === 'L' ? 'Left' : 'Right'
    return `Stack ${dir} (${n})`
  }
  return ''
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

  // Potential installation cost (display only).
  const potentialInstallationCost = useMemo(() => {
    return state.items.reduce((acc, item) => {
      if (!item.product.widthIn || !item.product.heightIn) return acc
      const sqFt = (item.product.widthIn * item.product.heightIn) / 144
      return acc + sqFt * 22 * item.quantity
    }, 0)
  }, [state.items])

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
                {potentialInstallationCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
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

  useEffect(() => {
    // Trigger a price calculation when relevant state changes.
    if (state.items.length > 0) {
      dispatch({ type: 'CALCULATE_PRICES' })
    }
  }, [state.items, state.installOption, state.deliveryOption, dispatch])

  const handleAddItem = () => {
    dispatch({ type: 'ADD_ITEM' })
    goToStep(2)
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

  const handleSaveAndEmail = async () => {
    setIsProcessing(true)
    toast({
      title: 'Processing Quote...',
      description: 'Please wait while we generate and save your quote.',
    })

    let pdfBase64: string | undefined
    let quoteId: string | undefined
    const finalQuoteState = { ...state }
    // Allowed by lint policy: prefer warn/error over log
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

      if (emailResponse.ok && emailResult.success) {
        toast({
          title: 'Quote Emailed!',
          description:
            'The quote has been sent to your email address. Redirecting...',
        })

        // Safe redirect to flowdoors.com after successful email
        setTimeout(() => {
          window.location.replace('https://flowdoors.com/thank-you')
        }, 2000) // Give user time to see the success message
      } else {
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

  const handleStartNew = () => {
    dispatch({ type: 'RESET_QUOTE' })
    goToStep(1)
  }

  const { totals } = state

  return (
    <StepContainer
      title="Your Quote Summary"
      description="Review your selections below. You can go back to make changes."
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList>
          {state.items.map((item, index) => (
            <TabsTrigger key={item.id} value={`item-${index}`}>
              Item {String.fromCharCode(65 + index)}
              {item.roomName ? ` - ${item.roomName}` : ''}
            </TabsTrigger>
          ))}
        </TabsList>
        {state.items.map((item, index) => {
          const { priceBreakdown } = item
          const costLabel =
            item.product.type === 'Awning-Window' ? 'Window Cost' : 'Door Cost'

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
                    {/* Door image + caption */}
                    {(() => {
                      const imgSrc = resolveItemImage(
                        item.product as Record<string, unknown>,
                        item as unknown as Record<string, unknown>
                      )
                      const caption = configCaption(item.product?.configuration)
                      if (!imgSrc) return null
                      return (
                        <div className="mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgSrc}
                            alt="Door configuration"
                            className="mx-auto h-24 w-auto object-contain"
                            loading="eager"
                            decoding="sync"
                          />
                          {caption ? (
                            <div className="mt-1 text-center text-sm text-muted-foreground">
                              {caption}
                            </div>
                          ) : null}
                        </div>
                      )
                    })()}

                    <div className="flex justify-between items-end">
                      <SummarySection
                        title="Configuration"
                        onEdit={() => goToStep(2)}
                      >
                        <dl>
                          <SummaryItem
                            label="Product"
                            value={item.product.type}
                          />
                          {item.product.type === 'Multi-Slide' && (
                            <SummaryItem
                              label="System Type"
                              value={item.product.systemType}
                            />
                          )}
                          <SummaryItem
                            label="Dimensions"
                            value={`${item.product.widthIn}" W x ${item.product.heightIn}" H`}
                          />
                          <SummaryItem
                            label="Configuration"
                            value={item.product.configuration}
                          />
                          <SummaryItem
                            label="Colors"
                            value={`Ext: ${capitalizeColorName(item.colors.exterior.name)}, Int: ${
                              item.colors.isSame
                                ? 'Same'
                                : capitalizeColorName(item.colors.interior.name)
                            }`}
                          />
                          <SummaryItem
                            label="Glass"
                            value={`${item.glazing.paneCount}, ${item.glazing.tint}`}
                          />
                          <SummaryItem
                            label="Hardware Finish"
                            value={item.hardwareFinish}
                          />
                        </dl>
                      </SummarySection>

                      <div className="space-y-2 w-24">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                          label={`${costLabel} (Base)`}
                          value={priceBreakdown.baseCost.toLocaleString(
                            'en-US',
                            { style: 'currency', currency: 'USD' }
                          )}
                        />
                        <SummaryItem
                          label="Size & Panels"
                          value={priceBreakdown.sizeAndPanelCost.toLocaleString(
                            'en-US',
                            { style: 'currency', currency: 'USD' }
                          )}
                        />
                        <Separator className="my-1" />
                        <SummaryItem
                          label="Upgrades"
                          value={priceBreakdown.totalUpgrades.toLocaleString(
                            'en-US',
                            { style: 'currency', currency: 'USD' }
                          )}
                        />
                        {priceBreakdown.pocketDoorCost > 0 && (
                          <SummaryItem
                            label="&nbsp;&nbsp;&nbsp;Pocket System"
                            value={priceBreakdown.pocketDoorCost.toLocaleString(
                              'en-US',
                              { style: 'currency', currency: 'USD' }
                            )}
                          />
                        )}
                        {priceBreakdown.glazingCost > 0 && (
                          <SummaryItem
                            label="&nbsp;&nbsp;&nbsp;Glass"
                            value={priceBreakdown.glazingCost.toLocaleString(
                              'en-US',
                              { style: 'currency', currency: 'USD' }
                            )}
                          />
                        )}
                        <Separator className="my-1" />
                        <SummaryItem
                          label="Unit Price"
                          value={priceBreakdown.unitPrice.toLocaleString(
                            'en-US',
                            { style: 'currency', currency: 'USD' }
                          )}
                          className="font-semibold"
                        />
                        <SummaryItem
                          label="Item Subtotal"
                          value={priceBreakdown.itemSubtotal.toLocaleString(
                            'en-US',
                            { style: 'currency', currency: 'USD' }
                          )}
                          className="font-semibold"
                        />
                        <SummaryItem
                          label="Installation"
                          value={
                            priceBreakdown.installationCost > 0
                              ? priceBreakdown.installationCost.toLocaleString(
                                  'en-US',
                                  { style: 'currency', currency: 'USD' }
                                )
                              : 'Not Included'
                          }
                          className="font-semibold"
                        />
                        <Separator className="my-2" />
                        <div className="flex justify-between py-2 text-lg">
                          <dt className="font-bold">Item Total</dt>
                          <dd className="font-bold">
                            {priceBreakdown.itemTotal.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            })}
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
                  value={totals.subtotal.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                />
                <SummaryItem
                  label="Installation"
                  value={totals.installationCost.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                />
                <SummaryItem
                  label="Delivery"
                  value={totals.deliveryCost.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                />
                <SummaryItem
                  label="Estimated Tax (8%)"
                  value={totals.tax.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                />
                <Separator className="my-4" />
                <div className="flex justify-between py-2 text-xl">
                  <dt className="font-bold">Grand Total</dt>
                  <dd className="font-bold">
                    {totals.grandTotal.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

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
    </StepContainer>
  )
}
