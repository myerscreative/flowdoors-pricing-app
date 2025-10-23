'use client'

import Link from 'next/link'
import Image from 'next/image'

export type ConfiguratorStep = { id: string; label: string }

export default function ConfiguratorSidebar({
  productImageSrc,
  productTitle,
  steps,
  activeStep,
  onStepClick,
  changeProductHref = '/select-product',
}: {
  productImageSrc: string
  productTitle: string
  steps: ConfiguratorStep[]
  activeStep?: string | null
  onStepClick: (_id: string) => void
  changeProductHref?: string
}) {
  return (
    <aside className="hidden lg:block self-start sticky top-20">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="rounded-xl border border-gray-200 p-3">
          <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg">
            <Image
              src={productImageSrc}
              alt={productTitle}
              width={280}
              height={112}
              className="max-h-full max-w-full object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <div className="mt-3 text-sm font-medium text-gray-800">
            {productTitle}
          </div>
          <Link
            href={changeProductHref}
            className="mt-1 inline-block text-xs text-blue-600 hover:underline"
          >
            Change Product Type
          </Link>
        </div>

        {/* Steps */}
        <nav className="mt-6 space-y-3" aria-label="Configuration steps">
          {steps.map((s, i) => {
            const isActive = activeStep === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onStepClick(s.id)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition ${
                  isActive
                    ? 'border-blue-400 bg-blue-50/50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    isActive ? 'bg-green-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  {i + 1}
                </span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
