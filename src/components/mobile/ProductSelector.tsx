'use client'

import React from 'react'
import Image from 'next/image'

type AnyProduct = {
  id?: string
  name?: string
  title?: string
  basePrice?: number | string
  image?: string | { src: string; alt?: string; hint?: string }
  description?: string
}

type Props = {
  products?: AnyProduct[]
  onSelect?: (_product: AnyProduct) => void
}

export default function ProductSelector({ products = [], onSelect }: Props) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-gray-600">
        No products available.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((product, idx) => {
        const displayName =
          product.name || product.title || `Product ${idx + 1}`

        // Base price: accept number or parse string safely
        const basePriceNum =
          typeof product.basePrice === 'number'
            ? product.basePrice
            : typeof product.basePrice === 'string'
              ? Number(product.basePrice.split(':').pop()?.trim() ?? '')
              : NaN

        const priceLabel = Number.isFinite(basePriceNum)
          ? `$${basePriceNum.toLocaleString()}`
          : String(product.basePrice ?? '')

        // Image may be a URL string or an object with src/alt/hint
        const imageSrc =
          typeof product.image === 'string'
            ? product.image
            : (product.image?.src ?? '')

        const imageAlt =
          typeof product.image === 'string'
            ? displayName
            : product.image?.alt || displayName

        const imageHint =
          typeof product.image === 'string' ? undefined : product.image?.hint

        return (
          <button
            key={product.id ?? idx}
            type="button"
            onClick={() => onSelect?.(product)}
            className="group flex items-center gap-4 rounded-xl border bg-white p-4 text-left transition hover:shadow-sm"
          >
            <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-md bg-gray-100">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt || 'Product image'}
                  width={400}
                  height={300}
                  data-ai-hint={imageHint}
                  className="max-h-20 object-contain"
                />
              ) : (
                <div className="text-xs text-gray-400">No image</div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{displayName}</div>
              {product.description ? (
                <div className="text-sm text-gray-600">
                  {product.description}
                </div>
              ) : null}
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {priceLabel || '—'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
