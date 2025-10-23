// src/components/summary/ItemsCards.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Copy, Plus } from 'lucide-react'
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
import { QuoteItem } from '@/lib/types'

export default function ItemsCards() {
  const { state, dispatch } = useQuote()
  const { items, activeItemIndex } = state

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return
    dispatch({ type: 'DELETE_ITEM', payload: index })
  }

  const handleDuplicateItem = (index: number) => {
    dispatch({ type: 'DUPLICATE_ITEM', payload: index })
  }

  const handleSetActiveItem = (index: number) => {
    dispatch({ type: 'SET_ACTIVE_ITEM', payload: index })
  }

  const handleAddItem = () => {
    dispatch({ type: 'ADD_ITEM' })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDimensions = (width: number, height: number): string => {
    return `${width}" × ${height}"`
  }

  const getProductDisplayName = (item: QuoteItem): string => {
    if (item.product.type) {
      return item.product.type
    }
    return 'Unconfigured Product'
  }

  const getConfigurationDisplay = (item: QuoteItem): string => {
    const parts = []
    if (item.product.configuration) parts.push(item.product.configuration)
    if (item.product.panels) parts.push(`${item.product.panels} panels`)
    if (item.product.systemType) parts.push(item.product.systemType)
    return parts.join(' • ') || 'No configuration'
  }

  const getColorDisplay = (item: QuoteItem): string => {
    if (item.colors.isSame && item.colors.exterior.name) {
      return item.colors.exterior.name
    } else if (item.colors.exterior.name && item.colors.interior.name) {
      return `${item.colors.exterior.name} / ${item.colors.interior.name}`
    }
    return 'No colors selected'
  }

  return (
    <div className="space-y-4">
      {/* Add Item Button */}
      <Button onClick={handleAddItem} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Item
      </Button>

      {/* Items Cards */}
      {items.map((item, index) => (
        <Card
          key={item.id}
          className={`cursor-pointer transition-all ${
            activeItemIndex === index
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:shadow-md'
          }`}
          onClick={() => handleSetActiveItem(index)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {getProductDisplayName(item)}
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      Qty: {item.quantity}
                    </Badge>
                  )}
                  {activeItemIndex === index && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                {item.roomName && (
                  <p className="text-sm text-gray-600 mt-1">{item.roomName}</p>
                )}
              </div>

              {/* Item Actions */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicateItem(index)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {items.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this item? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteItem(index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Dimensions */}
            {item.product.widthIn > 0 && item.product.heightIn > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">
                  {formatDimensions(
                    item.product.widthIn,
                    item.product.heightIn
                  )}
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No dimensions set
              </div>
            )}

            {/* Configuration */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Configuration:</span>
              <span className="font-medium text-right max-w-[60%]">
                {getConfigurationDisplay(item)}
              </span>
            </div>

            {/* Colors */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Colors:</span>
              <span className="font-medium text-right max-w-[60%]">
                {getColorDisplay(item)}
              </span>
            </div>

            {/* Glazing */}
            {(item.glazing.paneCount || item.glazing.tint) && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Glazing:</span>
                <span className="font-medium">
                  {[item.glazing.paneCount, item.glazing.tint]
                    .filter(Boolean)
                    .join(' • ') || 'Standard'}
                </span>
              </div>
            )}

            {/* Hardware */}
            {item.hardwareFinish && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hardware:</span>
                <span className="font-medium">{item.hardwareFinish}</span>
              </div>
            )}

            {/* Pricing */}
            {item.priceBreakdown && (
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">
                    {formatCurrency(item.priceBreakdown.unitPrice)}
                  </span>
                </div>
                {item.quantity > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(item.priceBreakdown.itemSubtotal)}
                    </span>
                  </div>
                )}
                {item.priceBreakdown.installationCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Installation:</span>
                    <span className="font-medium">
                      {formatCurrency(item.priceBreakdown.installationCost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                  <span>Item Total:</span>
                  <span className="text-blue-600">
                    {formatCurrency(item.priceBreakdown.itemTotal)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500 mb-4">No items in this quote</p>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
