import type { Product } from '@/types/products'
import Image from 'next/image'

type Props = {
  product: Product
  selected: boolean
  onSelect: (_slug: string) => void
}

export default function ProductTile({ product, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(product.slug)}
      className="group relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm ring-offset-2 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      data-testid={`tile-${product.slug}`}
    >
      <div className="aspect-[3/2] w-full bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={300}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
      <div className="p-3 text-left">
        <div className="text-sm font-semibold text-neutral-900">
          {product.name}
        </div>
        {product.description ? (
          <div className="mt-0.5 text-xs text-neutral-500">
            {product.description}
          </div>
        ) : null}
      </div>

      {selected && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-black" />
          <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/80 px-2 py-1 text-[10px] font-medium text-white">
            Selected
          </div>
        </>
      )}
    </button>
  )
}
