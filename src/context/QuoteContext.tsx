'use client'

import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react'
import type {
  Quote,
  RalColor,
  SystemType,
  QuoteItem,
  ProductId,
  PriceBreakdown,
} from '@/lib/types'
import {
  TINT_OPTIONS,
  DELIVERY_OPTIONS,
  PRODUCT_TYPES,
  PRODUCT_SQFT_RATE,
} from '@/lib/constants'
// import { isEqual } from 'lodash'; // Unused import
import { useSearchParams } from 'next/navigation'

type Action =
  | { type: 'SET_CUSTOMER_DETAILS'; payload: Partial<Quote['customer']> }
  | { type: 'SET_PRODUCT_TYPE'; payload: ProductId }
  | { type: 'SET_PRODUCT_SIZE'; payload: { widthIn: number; heightIn: number } }
  | { type: 'SET_CONFIGURATION'; payload: { configuration: string } }
  | {
      type: 'SET_VISUAL_CONFIGURATION'
      payload: { configuration: string; panels: string }
    }
  | { type: 'SET_SYSTEM_TYPE'; payload: SystemType }
  | { type: 'SET_EXTERIOR_COLOR'; payload: RalColor }
  | { type: 'SET_INTERIOR_COLOR'; payload: RalColor }
  | { type: 'SET_COLORS_SAME'; payload: boolean }
  | { type: 'SET_GLAZING'; payload: Partial<QuoteItem['glazing']> }
  | { type: 'SET_HARDWARE'; payload: QuoteItem['hardwareFinish'] }
  | { type: 'SET_INSTALL'; payload: Quote['installOption'] }
  | { type: 'SET_DELIVERY'; payload: Quote['deliveryOption'] }
  | { type: 'SET_ROOM_NAME'; payload: string }
  | { type: 'ADD_ITEM' }
  | { type: 'DELETE_ITEM'; payload: number }
  | { type: 'SET_ACTIVE_ITEM'; payload: number }
  | { type: 'DUPLICATE_ITEM'; payload: number }
  | { type: 'SET_ITEM_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'CALCULATE_PRICES' }
  | { type: 'RESET_QUOTE' }
  | { type: 'HYDRATE_STATE'; payload: Quote }
  | { type: 'SET_QUOTE_NUMBER'; payload: string }

const initialQuoteItem: QuoteItem = {
  id: `item-${Date.now()}`,
  quantity: 1,
  roomName: '',
  product: {
    type: '',
    widthIn: 0,
    heightIn: 0,
    configuration: '',
    systemType: 'Multi-Slide',
    panels: '',
    track: '',
  },
  colors: {
    exterior: { ral: '', name: '', hex: '' },
    interior: { ral: '', name: '', hex: '' },
    isSame: true,
  },
  glazing: {
    paneCount: '',
    tint: '',
  },
  hardwareFinish: '',
}

const getInitialState = (): Quote => ({
  customer: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    zipCode: '',
    timeline: '',
    heardVia: [],
    customerType: '',
    referralCode: '',
    budget: '',
  },
  items: [{ ...initialQuoteItem, id: `item-${Date.now()}` }],
  activeItemIndex: 0,
  installOption: 'Professional Installation',
  deliveryOption: 'Regular Delivery',
  totals: {
    subtotal: 0,
    installationCost: 0,
    deliveryCost: 0,
    tax: 0,
    grandTotal: 0,
    itemTotals: [],
  },
})

const QuoteContext = createContext<
  { state: Quote; dispatch: Dispatch<Action> } | undefined
>(undefined)

const calculatePrice = (state: Quote): Quote => {
  const newState = { ...state }
  let totalSubtotal = 0
  let totalInstallation = 0
  const itemTotals: number[] = []

  newState.items = newState.items.map((item, index) => {
    // Price any item that has dimensions. If glazing/tint are missing, assume
    // zero-cost defaults (already handled by the lookups below).
    if (!item.product.widthIn || !item.product.heightIn) {
      itemTotals[index] = 0
      return { ...item, priceBreakdown: undefined }
    }

    const sqFt = (item.product.widthIn * item.product.heightIn) / 144

    const rate = PRODUCT_SQFT_RATE[item.product.type] ?? 50
    const baseCost = 0
    const sizeAndPanelCost = sqFt * rate

    const paneCost = 0 // All systems now use dual pane by default
    const tintCost =
      TINT_OPTIONS.find((t) => t.name === item.glazing.tint)?.price || 0
    const glazingCost =
      (paneCost + tintCost) * (parseInt(item.product.panels, 10) || 1)

    const pocketDoorCost = item.product.systemType === 'Pocket Door' ? 1200 : 0

    const totalUpgrades = glazingCost + pocketDoorCost

    const unitPrice = baseCost + sizeAndPanelCost + totalUpgrades
    const itemSubtotal = unitPrice * item.quantity

    const installationCost =
      state.installOption === 'Professional Installation'
        ? sqFt * 30 * item.quantity
        : 0

    const itemTotal = itemSubtotal + installationCost
    itemTotals[index] = itemTotal

    totalSubtotal += itemSubtotal
    totalInstallation += installationCost

    const priceBreakdown: PriceBreakdown = {
      baseCost,
      sizeAndPanelCost,
      pocketDoorCost,
      glazingCost,
      totalUpgrades,
      unitPrice,
      quantity: item.quantity,
      itemSubtotal,
      installationCost,
      itemTotal,
    }

    return { ...item, priceBreakdown }
  })

  const deliveryOptionInfo = DELIVERY_OPTIONS.find(
    (opt) => opt.name === state.deliveryOption
  )
  let deliveryCost = 0
  if (deliveryOptionInfo) {
    const totalPanels = state.items.reduce(
      (sum, item) =>
        sum + (parseInt(item.product.panels, 10) || 0) * item.quantity,
      0
    )
    deliveryCost = deliveryOptionInfo.price
    if (totalPanels > 10) {
      const extraPanels = totalPanels - 10
      if (state.deliveryOption === 'Regular Delivery')
        deliveryCost += extraPanels * 10
      else if (state.deliveryOption === 'White Glove Delivery')
        deliveryCost += extraPanels * 12
    }
  }

  const grandSubtotal = totalSubtotal + totalInstallation + deliveryCost
  const tax = grandSubtotal * 0.08
  const grandTotal = grandSubtotal + tax

  newState.totals = {
    subtotal: totalSubtotal,
    installationCost: totalInstallation,
    deliveryCost,
    tax,
    grandTotal,
    itemTotals,
  }

  return newState
}

const quoteReducer = (state: Quote, action: Action): Quote => {
  let tempState = { ...state }

  const updateActiveItem = (updates: Partial<QuoteItem>) => {
    const activeItem = tempState.items[tempState.activeItemIndex]
    const newItems = [...tempState.items]
    newItems[tempState.activeItemIndex] = { ...activeItem, ...updates }
    tempState.items = newItems
  }

  const updateProduct = (productUpdates: Partial<QuoteItem['product']>) => {
    const activeItem = tempState.items[tempState.activeItemIndex]
    const newProduct = { ...activeItem.product, ...productUpdates }
    updateActiveItem({ product: newProduct })
  }

  const updateColors = (colorUpdates: Partial<QuoteItem['colors']>) => {
    const activeItem = tempState.items[tempState.activeItemIndex]
    const newColors = { ...activeItem.colors, ...colorUpdates }
    updateActiveItem({ colors: newColors })
  }

  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload

    case 'SET_CUSTOMER_DETAILS':
      tempState.customer = { ...tempState.customer, ...action.payload }
      return tempState

    case 'SET_PRODUCT_TYPE': {
      const productType = action.payload
      updateProduct({
        ...tempState.items[tempState.activeItemIndex].product,
        type: productType,
      })
      break
    }

    case 'SET_PRODUCT_SIZE': {
      updateProduct(action.payload)
      break
    }

    case 'SET_CONFIGURATION': {
      updateProduct(action.payload)
      break
    }

    case 'SET_VISUAL_CONFIGURATION': {
      updateProduct(action.payload)
      break
    }

    case 'SET_SYSTEM_TYPE': {
      updateProduct({ systemType: action.payload })
      break
    }

    case 'SET_EXTERIOR_COLOR': {
      const activeItemForExt = tempState.items[tempState.activeItemIndex]
      const newColorsExt = {
        ...activeItemForExt.colors,
        exterior: action.payload,
      }
      if (activeItemForExt.colors.isSame) {
        newColorsExt.interior = action.payload
      }
      updateActiveItem({ colors: newColorsExt })
      break
    }

    case 'SET_INTERIOR_COLOR': {
      updateColors({ interior: action.payload })
      break
    }

    case 'SET_COLORS_SAME': {
      const isSame = action.payload
      const activeItemForSame = tempState.items[tempState.activeItemIndex]
      const updatedColors = { ...activeItemForSame.colors, isSame }
      if (isSame) {
        updatedColors.interior = activeItemForSame.colors.exterior
      } else {
        updatedColors.interior = { ral: '', name: '', hex: '' }
      }
      updateActiveItem({ colors: updatedColors })
      tempState = {
        ...tempState,
        items: tempState.items.map((item, index) =>
          index === tempState.activeItemIndex
            ? { ...item, colors: updatedColors }
            : item
        ),
      }
      return tempState
    }

    case 'SET_GLAZING': {
      const activeItemForGlazing = tempState.items[tempState.activeItemIndex]
      updateActiveItem({
        glazing: { ...activeItemForGlazing.glazing, ...action.payload },
      })
      break
    }

    case 'SET_HARDWARE': {
      updateActiveItem({ hardwareFinish: action.payload })
      break
    }

    case 'SET_ROOM_NAME': {
      updateActiveItem({ roomName: action.payload })
      break
    }

    case 'SET_INSTALL': {
      tempState.installOption = action.payload
      break
    }

    case 'SET_DELIVERY': {
      tempState.deliveryOption = action.payload
      break
    }

    case 'ADD_ITEM': {
      const currentItem = tempState.items[tempState.activeItemIndex]
      const newItem: QuoteItem = {
        ...initialQuoteItem,
        id: `item-${Date.now()}`,
        product: {
          ...initialQuoteItem.product,
          systemType: currentItem.product.systemType || 'Multi-Slide',
        },
      }
      tempState.items = [...tempState.items, newItem]
      tempState.activeItemIndex = tempState.items.length - 1
      break
    }

    case 'DELETE_ITEM': {
      const itemIndexToDelete = action.payload
      if (tempState.items.length <= 1) return tempState
      const newItemsDel = tempState.items.filter(
        (_, index) => index !== itemIndexToDelete
      )
      const newActiveIndex = Math.max(
        0,
        tempState.activeItemIndex >= itemIndexToDelete
          ? tempState.activeItemIndex - 1
          : tempState.activeItemIndex
      )
      tempState.items = newItemsDel
      tempState.activeItemIndex = newActiveIndex
      break
    }

    case 'DUPLICATE_ITEM': {
      const itemToDuplicate = tempState.items[action.payload]
      const duplicatedItem: QuoteItem = {
        ...itemToDuplicate,
        id: `item-${Date.now()}`,
        roomName: itemToDuplicate.roomName
          ? `${itemToDuplicate.roomName} (Copy)`
          : '',
      }
      const newItemsDup = [...tempState.items, duplicatedItem]
      tempState.items = newItemsDup
      tempState.activeItemIndex = newItemsDup.length - 1
      break
    }

    case 'SET_ITEM_QUANTITY': {
      const { index, quantity } = action.payload
      const newItemsQuant = [...tempState.items]
      if (newItemsQuant[index]) {
        newItemsQuant[index] = { ...newItemsQuant[index], quantity }
        tempState.items = newItemsQuant
      }
      break
    }

    case 'SET_ACTIVE_ITEM': {
      tempState.activeItemIndex = action.payload
      return tempState
    }

    case 'CALCULATE_PRICES': {
      return calculatePrice(tempState)
    }

    case 'RESET_QUOTE': {
      localStorage.removeItem('quoteState')
      return {
        ...getInitialState(),
        customer: tempState.customer,
      }
    }

    case 'SET_QUOTE_NUMBER': {
      tempState.quoteNumber = action.payload
      return tempState
    }

    default:
      return tempState
  }

  return calculatePrice(tempState)
}

const QuoteProviderWithSearchParams = ({
  children,
}: {
  children: ReactNode
}) => {
  const [state, dispatch] = useReducer(quoteReducer, getInitialState())
  const searchParams = useSearchParams()

  // Hydrate from localStorage and URL params on initial mount
  useEffect(() => {
    let loadedState = getInitialState()
    let isInitialized = false

    try {
      const savedState = localStorage.getItem('quoteState')
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        // console.log('Loading state from localStorage:', parsedState);

        // Ensure we have valid items
        if (
          parsedState.items &&
          Array.isArray(parsedState.items) &&
          parsedState.items.length > 0
        ) {
          const hydratedItems = parsedState.items.map((item: unknown) => {
            if (item && typeof item === 'object' && 'quantity' in item) {
              return {
                ...loadedState.items[0],
                ...(item as Record<string, unknown>),
                quantity:
                  ((item as Record<string, unknown>).quantity as number) || 1,
              }
            }
            return {
              ...loadedState.items[0],
              quantity: 1,
            }
          })
          loadedState = { ...loadedState, ...parsedState, items: hydratedItems }
        } else {
          // console.log('No valid items found in saved state, using initial state');
        }
      } else {
        // console.log('No saved state found in localStorage');
      }
    } catch (error) {
      console.error('Could not load state from localStorage', error)
    }

    const preselectedProductId = searchParams?.get('product') as ProductId

    if (
      preselectedProductId &&
      PRODUCT_TYPES.some((p) => p.id === preselectedProductId)
    ) {
      // If a product is passed via URL, it takes precedence for the first item.
      // This ensures a seamless flow from the product selector page.
      const newItems = [...loadedState.items]
      newItems[0] = {
        ...newItems[0],
        product: {
          ...newItems[0].product,
          type: preselectedProductId,
        },
      }
      loadedState = { ...loadedState, items: newItems, activeItemIndex: 0 }
    }

    if (!isInitialized) {
      // console.log('Dispatching HYDRATE_STATE with:', loadedState);
      dispatch({ type: 'HYDRATE_STATE', payload: loadedState })
      isInitialized = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // This effect should only run ONCE on initial mount.

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      // Always save the state if we have customer details or meaningful quote data
      const hasCustomerDetails =
        state.customer.firstName ||
        state.customer.lastName ||
        state.customer.email ||
        state.customer.phone

      const hasItems =
        state.items.length > 0 &&
        state.items.some(
          (item) =>
            item.product.type ||
            item.product.widthIn > 0 ||
            item.product.heightIn > 0
        )

      if (hasCustomerDetails || hasItems) {
        const stateToSave = { ...state }
        localStorage.setItem('quoteState', JSON.stringify(stateToSave))
        // console.log('State saved to localStorage:', stateToSave);
      }
    } catch (error) {
      console.error('Could not save state to localStorage', error)
    }
  }, [state])

  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  )
}

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <QuoteProviderWithSearchParams>{children}</QuoteProviderWithSearchParams>
    </React.Suspense>
  )
}

export const useQuote = () => {
  const context = useContext(QuoteContext)
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider')
  }
  return context
}

// Utility function to test localStorage persistence
export const testPersistence = () => {
  try {
    const savedState = localStorage.getItem('quoteState')
    // console.log('Current saved state:', savedState ? JSON.parse(savedState) : 'No saved state');
    return savedState ? JSON.parse(savedState) : null
  } catch (error) {
    console.error('Error testing persistence:', error)
    return null
  }
}
