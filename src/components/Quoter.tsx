'use client'

import { useState } from 'react'
import { useQuote } from '@/context/QuoteContext'
import type { Customer } from '@/lib/types'

export default function Quoter() {
  const { state, dispatch } = useQuote()
  const [isGenerating, setIsGenerating] = useState(false)

  const customer = state.customer ?? ({} as Customer)
  const activeItem = state.items?.[state.activeItemIndex]

  function setCustomerField<K extends keyof Customer>(
    key: K,
    value: Customer[K]
  ) {
    dispatch({
      type: 'SET_CUSTOMER_DETAILS',
      payload: { [key]: value } as Partial<Customer>,
    })
  }

  const isFormValid = () =>
    Boolean(
      customer.firstName &&
        customer.lastName &&
        customer.email &&
        customer.phone
    )

  const generateQuote = async () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 1200)
  }

  const productName = activeItem?.product?.type || 'Custom Door'
  const size =
    activeItem?.product?.widthIn && activeItem?.product?.heightIn
      ? `${activeItem.product.widthIn}" × ${activeItem.product.heightIn}"`
      : 'Not selected'
  const color = activeItem?.colors?.exterior?.name || 'Not selected'
  const hardware = activeItem?.hardwareFinish || 'Not selected'

  const totalPrice =
    state.totals?.grandTotal ??
    (Array.isArray(state.items)
      ? state.items.reduce(
          (sum, it) => sum + (it.priceBreakdown?.itemTotal ?? 0),
          0
        )
      : 0)

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Customer Information
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={customer.firstName ?? ''}
            onChange={(e) => setCustomerField('firstName', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={customer.lastName ?? ''}
            onChange={(e) => setCustomerField('lastName', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={customer.email ?? ''}
            onChange={(e) => setCustomerField('email', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={customer.phone ?? ''}
            onChange={(e) => setCustomerField('phone', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label
            htmlFor="zip"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            ZIP Code
          </label>
          <input
            id="zip"
            type="text"
            value={customer.zipCode ?? ''}
            onChange={(e) => setCustomerField('zipCode', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ZIP code"
          />
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Quote Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Product:</span>
            <span>{productName}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="capitalize">{size}</span>
          </div>
          <div className="flex justify-between">
            <span>Color:</span>
            <span className="capitalize">{color}</span>
          </div>
          <div className="flex justify-between">
            <span>Hardware:</span>
            <span className="capitalize">{hardware}</span>
          </div>
        </div>
        <div className="mt-3 border-t border-blue-200 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Price:</span>
            <span>${Number(totalPrice || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={generateQuote}
        disabled={!isFormValid() || isGenerating}
        className={`mt-6 w-full rounded-md px-6 py-3 text-lg font-medium transition-colors ${
          isFormValid() && !isGenerating
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        }`}
      >
        {isGenerating ? 'Generating Quote...' : 'Generate Quote'}
      </button>
    </div>
  )
}
