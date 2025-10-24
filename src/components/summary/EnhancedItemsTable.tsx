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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuote } from '@/context/QuoteContext'
import { useToast } from '@/hooks/use-toast'
import { Copy, Pencil, Trash2 } from 'lucide-react'

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

export function EnhancedItemsTable() {
  const { state, dispatch } = useQuote()
  const { toast } = useToast()

  const handleEdit = (index: number) => {
    const item = state.items[index]
    const productType = item.product.type

    const productRouteMap: Record<string, string> = {
      'Multi-Slide': '/configure/multi-slide',
      'Slide-and-Stack': '/configure/slide-stack',
      'Ultra-Slim Slider': '/configure/ultra-slim',
      'Bi-Fold': '/configure/bi-fold',
      'Awning Window': '/configure/awning-window',
    }

    const baseRoute = productRouteMap[productType] || '/configure/multi-slide'

    const params = new URLSearchParams()
    params.set('width', item.product.widthIn?.toString() || '')
    params.set('height', item.product.heightIn?.toString() || '')
    params.set('room', item.roomName || '')
    params.set('from', 'summary')
    params.set('config', item.product.configuration || '')
    params.set('exterior', item.colors?.exterior?.name || '')
    params.set('interior', item.colors?.interior?.name || '')
    params.set('sameInterior', item.colors?.isSame ? 'true' : 'false')
    params.set('glass', item.glazing?.tint || '')
    params.set('hardware', item.hardwareFinish || '')

    if (item.product.panels) {
      const panelMatch = item.product.panels.match(/(\d+)/)
      if (panelMatch) {
        params.set('panelCount', panelMatch[1])
      }
    }

    window.location.href = `${baseRoute}?${params.toString()}`
  }

  const handleDelete = (index: number) => {
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

  const handleDuplicate = (index: number) => {
    dispatch({ type: 'DUPLICATE_ITEM', payload: index })
    toast({
      title: 'Item Duplicated',
      description: `Item ${String.fromCharCode(65 + index)} has been duplicated.`,
    })
  }

  const handleSelectItem = (index: number) => {
    dispatch({ type: 'SET_ACTIVE_ITEM', payload: index })
  }

  if (state.items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No items in quote</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-flowdoors-charcoal">
          Your Items ({state.items.length})
        </h3>
        <p className="text-sm text-slate-600">
          Click an item to view details
        </p>
      </div>

      <div className="grid gap-4">
        {state.items.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-xl border-2 transition-all cursor-pointer ${
              state.activeItemIndex === index
                ? 'border-flowdoors-blue bg-flowdoors-blue/5 ring-2 ring-flowdoors-blue/20 shadow-lg'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
            onClick={() => handleSelectItem(index)}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      state.activeItemIndex === index
                        ? 'bg-gradient-to-r from-flowdoors-blue to-flowdoors-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Item {String.fromCharCode(65 + index)}
                  </Badge>
                  <div>
                    <h4 className="font-semibold text-flowdoors-charcoal">
                      {item.product.type}
                    </h4>
                    {item.roomName && (
                      <p className="text-sm text-slate-600">{item.roomName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(index)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicate(index)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {state.items.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove Item{' '}
                            {String.fromCharCode(65 + index)}? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(index)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-600 text-xs mb-1">Dimensions</div>
                  <div className="font-medium text-flowdoors-charcoal">
                    {item.product.widthIn}" W × {item.product.heightIn}" H
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 text-xs mb-1">Configuration</div>
                  <div className="font-medium text-flowdoors-charcoal">
                    {item.product.systemType || 'Not selected'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 text-xs mb-1">Colors</div>
                  <div className="font-medium text-flowdoors-charcoal">
                    {item.colors?.exterior?.name
                      ? capitalizeColorName(item.colors.exterior.name)
                      : 'Not selected'}
                    {item.colors?.isSame
                      ? ''
                      : item.colors?.interior?.name
                        ? ` / ${capitalizeColorName(item.colors.interior.name)}`
                        : ''}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 text-xs mb-1">Price</div>
                  <div className="font-bold text-flowdoors-blue text-base">
                    {item.priceBreakdown
                      ? `$${item.priceBreakdown.itemSubtotal.toLocaleString()}`
                      : 'Not calculated'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

