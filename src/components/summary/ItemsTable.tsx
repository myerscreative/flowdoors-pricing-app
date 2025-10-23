// src/components/summary/ItemsTable.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Copy } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

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

export default function ItemsTable() {
  const { state, dispatch } = useQuote()
  const { toast } = useToast()

  const handleEdit = (index: number) => {
    // Navigate to the specific builder page with current item data
    const item = state.items[index]
    const productType = item.product.type

    // Map product types to their builder routes
    const productRouteMap: Record<string, string> = {
      'Multi-Slide': '/configure/multi-slide',
      'Slide-and-Stack': '/configure/slide-stack',
      'Ultra-Slim Slider': '/configure/ultra-slim',
      'Bi-Fold': '/configure/bi-fold',
      'Awning Window': '/configure/awning-window',
    }

    const baseRoute = productRouteMap[productType] || '/configure/multi-slide'

    // Build URL with current item data
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

    // Add panel count from the panels field (e.g., "3 panels" -> "3")
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
      <div className="text-sm text-gray-600 mb-4">
        Select an item below to view its details, or add another item to your
        quote.
      </div>

      <div className="grid gap-4">
        {state.items.map((item, index) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              state.activeItemIndex === index
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelectItem(index)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      state.activeItemIndex === index ? 'default' : 'secondary'
                    }
                  >
                    Item {String.fromCharCode(65 + index)}
                  </Badge>
                  <CardTitle className="text-lg">
                    {item.product.type} {item.roomName && `- ${item.roomName}`}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(index)
                    }}
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
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Dimensions</div>
                  <div className="font-medium">
                    {item.product.widthIn}" W × {item.product.heightIn}" H
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Configuration</div>
                  <div className="font-medium">
                    {item.product.systemType || 'Not selected'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Colors</div>
                  <div className="font-medium">
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
                  <div className="text-gray-500">Price</div>
                  <div className="font-medium">
                    {item.priceBreakdown
                      ? `$${item.priceBreakdown.itemSubtotal.toLocaleString()}`
                      : 'Not calculated'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
