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
import { Copy, Pencil, Trash2 } from 'lucide-react'
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

export function EnhancedQuoteItemCard() {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]

  if (!activeItem) {
    return <div className="p-8 text-center text-gray-500">No item selected</div>
  }

  const handleEdit = (index: number) => {
    const item = state.items[index]
    const productType = item.product.type

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

    if (item.product.configuration) {
      params.set('config', item.product.configuration)
    }

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

  return (
    <div className="space-y-6">
      {/* Visual Configuration Section */}
      <div className="bg-gradient-to-br from-flowdoors-blue/10 via-flowdoors-blue/5 to-transparent rounded-2xl p-8 border border-flowdoors-blue/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-flowdoors-blue to-flowdoors-blue-600 text-white px-4 py-1.5 text-sm font-bold">
              Item {String.fromCharCode(65 + state.activeItemIndex)}
            </Badge>
            {activeItem.roomName && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-medium">{activeItem.roomName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(state.activeItemIndex)}
              className="text-flowdoors-blue border-flowdoors-blue/30 hover:bg-flowdoors-blue/10"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDuplicate(state.activeItemIndex)}
              className="text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={state.items.length <= 1}
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
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

        <h2 className="text-2xl font-bold text-flowdoors-charcoal mb-2">
          {activeItem.product.type}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {activeItem.product.configuration || activeItem.product.systemType}
        </p>

        {/* Door Image */}
        <DoorImage />
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-flowdoors-charcoal mb-4">
          Configuration Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System & Colors */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                System & Configuration
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">System Type</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.product.type || 'Not selected'}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Configuration</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.product.systemType || 'Not selected'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Colors
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Exterior</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.colors?.exterior?.name
                      ? capitalizeColorName(activeItem.colors.exterior.name)
                      : 'Not selected'}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Interior</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.colors?.isSame
                      ? 'Same as exterior'
                      : activeItem.colors?.interior?.name
                        ? capitalizeColorName(activeItem.colors.interior.name)
                        : 'Not selected'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Dimensions & Options */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Dimensions
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Door Size</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.product.widthIn || 0}" W ×{' '}
                    {activeItem.product.heightIn || 0}" H
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Rough Opening</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {(activeItem.product.widthIn || 0) + 1}" W ×{' '}
                    {(activeItem.product.heightIn || 0) + 1}" H
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Options
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Glass Type</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.glazing?.tint || 'Not selected'}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-sm text-slate-600">Hardware</dt>
                  <dd className="text-sm font-medium text-flowdoors-charcoal">
                    {activeItem.hardwareFinish || 'Not selected'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Price Section */}
        {activeItem.priceBreakdown && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="bg-gradient-to-r from-flowdoors-blue/10 to-flowdoors-green/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-flowdoors-charcoal">
                  Door System Price
                </span>
                <span className="text-2xl font-bold text-flowdoors-blue">
                  ${activeItem.priceBreakdown.itemSubtotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

