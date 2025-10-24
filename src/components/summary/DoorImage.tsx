// src/components/summary/DoorImage.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import Image from 'next/image'

const PRODUCT_IMAGES: Record<string, string> = {
  'Multi-Slide': '/products/multi-slide/multi-slide.png',
  'Ultra Slim Multi-Slide & Pocket Systems':
    '/products/ultra-slim/slider-narrow.png',
  'Bi-Fold': '/products/bi-fold/bi-fold.png',
  'Slide-and-Stack': '/products/slide-stack/slide-and-stack.png',
  'Pocket Door': '/products/pocket/pocket-door.png',
  'Awning Window': '/products/awning-window/awning-window.png',
}

const CONFIG_BASES = {
  bifold: 'https://storage.googleapis.com/scenic_images/Configs/Bifold/',
  slideStack:
    'https://storage.googleapis.com/scenic_images/Configs/Slide-and-Stack/',
  multiSlide:
    'https://storage.googleapis.com/scenic_images/Configs/Multi-slide/',
} as const

const FALLBACK_IMAGE = '/products/multi-slide/multi-slide.png'

export function DoorImage() {
  const { state } = useQuote()

  // Get the active item's product type and configuration
  const activeItem = state.items[state.activeItemIndex]
  const productType = activeItem?.product?.type || 'Multi-Slide'
  const configuration = activeItem?.product?.configuration
  const imagePath = PRODUCT_IMAGES[productType] || FALLBACK_IMAGE

  // Generate configuration image URL if available
  const getConfigImageUrl = () => {
    if (!configuration) return null
    const code = configuration.toLowerCase()

    if (code.startsWith('ms_') && CONFIG_BASES.multiSlide) {
      return `${CONFIG_BASES.multiSlide}${configuration}.svg`
    }
    if (code.startsWith('sas_') && CONFIG_BASES.slideStack) {
      return `${CONFIG_BASES.slideStack}${configuration}.svg`
    }
    if (/^\d+p_/i.test(code) && CONFIG_BASES.bifold) {
      return `${CONFIG_BASES.bifold}${configuration}.svg`
    }
    return null
  }

  const configImageUrl = getConfigImageUrl()

  return (
    <div className="flex justify-center mb-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {activeItem?.product?.systemType || 'Multi-Slide'}
          </h2>
          <h3 className="text-lg font-semibold text-gray-900">
            Selected Configuration
          </h3>
        </div>

        {/* Configuration Diagram - Priority display */}
        {configImageUrl ? (
          <div className="relative w-full max-w-2xl h-[250px] bg-white rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 flex items-center justify-center px-6 py-[5px]">
            <Image
              src={configImageUrl}
              alt={`${configuration} configuration diagram`}
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          /* Fallback to product image if no configuration available */
          <div className="relative w-full max-w-2xl h-[250px] bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center px-6 py-[5px]">
            <Image
              src={imagePath}
              alt={`${productType} door`}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>
    </div>
  )
}
