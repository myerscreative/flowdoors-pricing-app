// src/components/summary/QuoteItemsList.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { DoorImage } from './DoorImage'

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

export function QuoteItemsList() {
  const { state, dispatch } = useQuote()

  const handleEdit = (index: number) => {
    // Navigate to the specific builder page with current item data
    const item = state.items[index]
    const productType = item.product.type

    // Map product types to their builder routes
    const productRouteMap: Record<string, string> = {
      'Multi-Slide': 'multi-slide',
      'Ultra Slim Multi-Slide & Pocket Systems': 'ultra-slim',
      'Bi-Fold': 'bi-fold',
      'Slide-and-Stack': 'slide-stack',
      'Pocket Door': 'pocket',
      'Awning Window': 'awning-window',
    }

    const route = productRouteMap[productType] || 'multi-slide'
    const params = new URLSearchParams()
    params.set('width', String(item.product.widthIn || 0))
    params.set('height', String(item.product.heightIn || 0))
    params.set('room', item.roomName || '')
    params.set('from', 'summary')

    // Add configuration-specific params
    if (item.product.configuration) {
      params.set('config', item.product.configuration)
    }

    // Add panel count from the panels field (e.g., "3 panels" -> "3")
    if (item.product.panels) {
      const panelMatch = item.product.panels.match(/(\d+)/)
      if (panelMatch) {
        params.set('panelCount', panelMatch[1])
      }
    }
    if (item.colors?.exterior?.name) {
      params.set('exterior', item.colors.exterior.name)
    }
    if (item.colors?.interior?.name) {
      params.set('interior', item.colors.interior.name)
    }
    if (item.colors?.isSame !== undefined) {
      params.set('sameInterior', String(item.colors.isSame))
    }
    if (item.glazing?.tint) {
      params.set('glass', item.glazing.tint.toLowerCase().replace(/\s+/g, '-'))
    }
    if (item.hardwareFinish) {
      params.set('hardware', item.hardwareFinish.toLowerCase())
    }

    window.location.href = `/configure/${route}?${params.toString()}`
  }

  const handleDuplicate = (index: number) => {
    dispatch({ type: 'DUPLICATE_ITEM', payload: index })
  }

  const handleDelete = (index: number) => {
    if (state.items.length <= 1) return
    dispatch({ type: 'DELETE_ITEM', payload: index })
  }

  // const _indexToLetters = (index: number): string => {
  //   let out = "";
  //   let n = index;
  //   while (n >= 0) {
  //     out = String.fromCharCode(65 + (n % 26)) + out;
  //     n = Math.floor(n / 26) - 1;
  //   }
  //   return out;
  // };

  // Only show the active item
  const activeItem = state.items[state.activeItemIndex]

  if (!activeItem) {
    return <div className="p-8 text-center text-gray-500">No item selected</div>
  }

  return (
    <div className="space-y-4">
      {/* Door Image */}
      <DoorImage />

      {/* Show only the active item */}
      <Card key={activeItem.id} className="border rounded-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">
              System Type: {activeItem.product.systemType || 'Not selected'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDuplicate(state.activeItemIndex)}
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
                      This will permanently remove this item from your quote.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(state.activeItemIndex)}
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
        {activeItem.roomName && (
          <div className="px-6 pb-1">
            <p className="text-sm text-muted-foreground">
              Room: {activeItem.roomName}
            </p>
          </div>
        )}
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Configuration Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(state.activeItemIndex)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      System & Configuration
                    </h4>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          System Type
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.product.type || 'Not selected'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Configuration
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.product.systemType || 'Not selected'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Dimensions
                    </h4>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Door Size
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.product.widthIn || 0}" W x{' '}
                          {activeItem.product.heightIn || 0}" H
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Recommended Rough Opening
                        </dt>
                        <dd className="text-sm font-medium">
                          {(activeItem.product.widthIn || 0) + 1}" W x{' '}
                          {(activeItem.product.heightIn || 0) + 1}" H
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Colors
                    </h4>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Exterior
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.colors?.exterior?.name
                            ? capitalizeColorName(
                                activeItem.colors.exterior.name
                              )
                            : 'Not selected'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Interior
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.colors?.isSame
                            ? 'Same as exterior'
                            : activeItem.colors?.interior?.name
                              ? capitalizeColorName(
                                  activeItem.colors.interior.name
                                )
                              : 'Not selected'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Options
                    </h4>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Glass Type
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.glazing?.tint || 'Not selected'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Hardware
                        </dt>
                        <dd className="text-sm font-medium">
                          {activeItem.hardwareFinish || 'Not selected'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2"
                htmlFor={`quantity-${state.activeItemIndex}`}
              >
                Quantity
              </label>
              <input
                type="number"
                id={`quantity-${state.activeItemIndex}`}
                min="1"
                max="10"
                value={activeItem.quantity || 1}
                onChange={(e) => {
                  const newQuantity = Math.max(
                    1,
                    Math.min(10, parseInt(e.target.value) || 1)
                  )
                  dispatch({
                    type: 'SET_ITEM_QUANTITY',
                    payload: {
                      index: state.activeItemIndex,
                      quantity: newQuantity,
                    },
                  })
                }}
                className="flex h-12 w-20 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-center"
              />
            </div>
          </div>

          {activeItem.priceBreakdown && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between font-semibold text-sm">
                <span>Door Cost:</span>
                <span>
                  ${activeItem.priceBreakdown.itemSubtotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
