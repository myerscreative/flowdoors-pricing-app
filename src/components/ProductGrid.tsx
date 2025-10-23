'use client'

import { useState } from 'react'
import type { Product } from '@/types/products'
import ProductTile from './ProductTile'

type Props = {
  products: Product[]
  defaultSelectedSlug?: string | null
  onChange?: (_slug: string) => void // optional hook for wiring later
}

export default function ProductGrid({
  products,
  defaultSelectedSlug = null,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<string | null>(defaultSelectedSlug)

  const handleSelect = (slug: string) => {
    setSelected(slug)
    onChange?.(slug)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Choose your product
      </h1>

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Product list"
      >
        {products.map((p) => (
          <div role="listitem" key={p.slug}>
            <ProductTile
              product={p}
              selected={p.slug === selected}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
