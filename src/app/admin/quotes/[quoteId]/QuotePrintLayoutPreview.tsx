'use client'

import { STANDARD_QUOTE_BLURB } from '@/constants/quotePrint'

// ---------- Types & Guards ----------
type CustomerLike = {
  firstName?: string
  lastName?: string
  company?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email?: string
}

type ShippingContactLike = {
  name?: string
  phone?: string
  email?: string
}

type TotalsLike = {
  subtotal?: number
  tradeDiscount?: number
  installationCost?: number
  deliveryCost?: number
  tax?: number
  grandTotal?: number
  screens?: number
  crating?: number
} & Record<string, unknown>

type TimestampLike = { toDate: () => Date }

type QuoteLike = {
  quoteNumber?: string | number
  createdAt?: string | Date | TimestampLike
  estimatedCompletion?: string
  salesRep?: string
  deliveryOption?: { name?: string } | string
  customer?: CustomerLike
  shippingContact?: ShippingContactLike
  totals?: TotalsLike
}

type ProductLike = {
  widthIn?: number | string
  heightIn?: number | string
  recommendedRoughOpenWidthIn?: number | string
  roWidthIn?: number | string
  recommendedRoughOpenHeightIn?: number | string
  roHeightIn?: number | string
  type?: string
  configuration?: string
  panelCount?: number | string
  panelSizeIn?: number | string
  clearOpeningWidthIn?: number | string
  clearOpeningHeightIn?: number | string
  swing?: string
  operating?: string
  stackDirection?: string
  panelSlideStackDirection?: string
  frameType?: string
  trackType?: string
  hardwareFinish?: string
}

type ColorsLike = {
  isSame?: boolean
  exterior?: { name?: string; code?: string }
  interior?: { name?: string; code?: string }
}

type GlazingLike = { paneCount?: number | string; tint?: string }

type PriceBreakdownLike = { unitPrice?: number }

type ItemLike = {
  id?: string | number
  product?: ProductLike
  colors?: ColorsLike
  glazing?: GlazingLike
  quantity?: number
  productCode?: string
  sku?: string
  price?: number
  priceBreakdown?: PriceBreakdownLike
  hardwareFinish?: string
  hardwareOptions?: string
}

type Props = {
  items: ItemLike[]
  pdfNote?: string
  standardBlurb?: string
  quote?: QuoteLike
}

const isTimestampLike = (v: unknown): v is TimestampLike =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { toDate?: unknown }).toDate === 'function'

// ---------- Format Helpers ----------
const dash = (v: unknown) => (v === 0 ? '0' : v ? String(v) : '—')

const money = (n?: number) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '—'

// ---------- Component ----------
export default function QuotePrintLayoutPreview({
  items = [],
  pdfNote = '',
  standardBlurb = STANDARD_QUOTE_BLURB,
  quote = {},
}: Props) {
  if (!Array.isArray(items) || items.length === 0) return null

  const customer: CustomerLike = quote?.customer ?? {}
  const ship: ShippingContactLike = quote?.shippingContact ?? {}
  const totals: TotalsLike = quote?.totals ?? {}

  // Helper to render a pricing row only if the value exists
  const PriceRow = ({
    label,
    value,
    accent = false,
  }: {
    label: string
    value?: number
    accent?: boolean
  }) =>
    typeof value === 'number' ? (
      <div
        className={`flex justify-between py-1 ${accent ? 'text-red-600 font-medium' : ''}`}
      >
        <span className="text-gray-600">{label}</span>
        <span className="font-mono">{money(value)}</span>
      </div>
    ) : null

  return (
    <div
      id="quote-pdf-root"
      className="bg-white text-gray-900 font-sans text-sm"
    >
      {/* ============= PAGE 1 ============= */}
      <div className="print-page w-full max-w-none p-6 space-y-4 min-h-screen">
        {/* Header (Scenic branding + quote meta) */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Logo placeholder block – replace with <img> when logo URL available */}
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-light text-gray-900">
                  FlowDoors
                </h1>
                <p className="text-teal-700 text-sm font-medium">
                  “Bringing the Outdoors In”
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-teal-700">
                Quote Estimate
              </div>
              <div className="text-xl font-light text-gray-900">
                {dash(quote?.quoteNumber)}
              </div>
              <div className="text-xs text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Project Info + Invoice */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              Project Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">
                  {dash(customer.firstName)} {dash(customer.lastName)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span>{dash(customer.company)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sales Rep:</span>
                <span>{dash(quote?.salesRep)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery/Pickup:</span>
                <span>
                  {dash(
                    (quote?.deliveryOption as { name?: string })?.name ??
                      quote?.deliveryOption
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Invoice</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order #:</span>
                <span className="font-mono">{dash(quote?.quoteNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>
                  {dash(
                    isTimestampLike(quote?.createdAt)
                      ? new Date(quote.createdAt.toDate()).toLocaleDateString()
                      : quote?.createdAt
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Print Date:</span>
                <span>{new Date().toLocaleDateString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Completion:</span>
                <span>{dash(quote?.estimatedCompletion)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing + Shipping */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              Billing Information
            </h2>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-600">Contact:</span>{' '}
                {dash(customer.firstName)} {dash(customer.lastName)}
              </div>
              <div>
                <span className="text-gray-600">Address:</span>{' '}
                {dash(customer.address)}
              </div>
              <div className="ml-12">
                {[customer.city, customer.state, customer.zip]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>{' '}
                {dash(customer.phone)}
              </div>
              <div>
                <span className="text-gray-600">Email:</span>{' '}
                {dash(customer.email)}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              Shipping Information
            </h2>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-600">Contact:</span>{' '}
                {dash(
                  ship.name ??
                    `${customer.firstName ?? ''} ${customer.lastName ?? ''}`
                )}
              </div>
              <div>
                <span className="text-gray-600">Address:</span>{' '}
                {dash(customer.address)}
              </div>
              <div className="ml-12">
                {[customer.city, customer.state, customer.zip]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>{' '}
                {dash(ship.phone ?? customer.phone)}
              </div>
              <div>
                <span className="text-gray-600">Email:</span>{' '}
                {dash(ship.email ?? customer.email)}
              </div>
            </div>
          </div>
        </div>

        {/* Project Summary (left) + Pricing (right) */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Project Summary
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Total Number of Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Door Systems:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Window Systems:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
              <div className="bg-white border border-teal-300 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-medium text-teal-700">IMPORTANT:</span>{' '}
                  A signed cover sheet and a signed item description page for
                  each item ordered, plus a 50% deposit, are required to start
                  production.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {/* Only render rows we actually have */}
              <PriceRow label="ITEM SUBTOTAL:" value={totals.subtotal} />
              {'tradeDiscount' in totals && (
                <PriceRow
                  label="Trade Discount:"
                  value={totals.tradeDiscount}
                  accent
                />
              )}
              <PriceRow label="Installation:" value={totals.installationCost} />
              <PriceRow label="Delivery:" value={totals.deliveryCost} />
              {'screens' in totals && (
                <PriceRow label="Screens:" value={totals.screens} />
              )}
              {'crating' in totals && (
                <PriceRow label="Crating:" value={totals.crating} />
              )}
              <PriceRow label="Estimated Tax:" value={totals.tax} />
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between py-1 font-medium">
                  <span className="text-gray-900">Grand Total:</span>
                  <span className="font-mono">{money(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes + Standard Blurb */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
          <div className="min-h-16 border border-gray-200 rounded p-2 text-sm text-gray-700 whitespace-pre-wrap">
            {pdfNote || '—'}
          </div>
          {standardBlurb && (
            <div className="mt-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
              {standardBlurb}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-200 text-center text-xs text-gray-600">
            By signing, you agree to all FlowDoors Terms &amp; Conditions.
            flowdoors.com/terms-and-conditions/
          </div>
        </div>
      </div>

      {/* ============= PAGE 2 ============= */}
      {items.map((item, idx) => {
        const p = item?.product ?? {}
        const colors = item?.colors ?? {}
        const glazing = item?.glazing ?? {}
        const qty = item?.quantity ?? 1
        const productCode = item?.productCode ?? item?.sku ?? `ITEM-${idx + 1}`

        const dimW = p?.widthIn,
          dimH = p?.heightIn
        const roW = p?.recommendedRoughOpenWidthIn ?? p?.roWidthIn
        const roH = p?.recommendedRoughOpenHeightIn ?? p?.roHeightIn

        return (
          <div
            key={item?.id ?? idx}
            className="print-page w-full max-w-none p-6 space-y-4 min-h-screen"
          >
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <div className="text-sm text-gray-600">
                    {dash(productCode)}
                  </div>
                  <div className="text-2xl font-light text-gray-900">
                    {dash(p?.type)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Item {idx + 1} of {items.length}
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    Factory Direct Price:{' '}
                    {money(item?.price ?? item?.priceBreakdown?.unitPrice)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Plus Applicable Sales Tax • Qty: {qty}
                  </div>
                </div>
              </div>

              {/* Door visualization (static arrows) */}
              <div className="text-center">
                <div className="flex justify-center items-center mb-3">
                  <div className="flex gap-2">
                    {[
                      ...Array(Math.max(1, Number(p?.panelCount ?? 5))).keys(),
                    ].map((n) => (
                      <div key={n} className="relative">
                        <div className="w-16 h-20 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded" />
                        {n < Number(p?.panelCount ?? 5) - 1 && (
                          <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2">
                            <div className="w-4 h-4 bg-teal-500 border border-teal-400 rounded-full flex items-center justify-center">
                              <svg width="8" height="8" className="fill-white">
                                <polygon points="0,0 8,4 0,8" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-teal-600 text-sm font-medium">
                  Viewed from Outside
                </div>
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Configuration */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Configuration
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Net Frame Dimensions:</span>
                    <br />
                    {dash(dimW)}" width × {dash(dimH)}" height
                  </div>
                  <div>
                    <span className="text-gray-600">
                      Recommended Rough Opening:
                    </span>
                    <br />
                    {dash(roW)}" width × {dash(roH)}" height
                  </div>
                  <div>
                    <span className="text-gray-600">Configuration:</span>{' '}
                    {dash(p?.configuration)}
                  </div>
                  <div>
                    <span className="text-gray-600">Number of Panels:</span>{' '}
                    {dash(p?.panelCount)}
                  </div>
                  <div>
                    <span className="text-gray-600">Panel Width:</span>{' '}
                    {dash(p?.panelSizeIn)}"
                  </div>
                  <div>
                    <span className="text-gray-600">Clear Opening:</span>{' '}
                    {dash(p?.clearOpeningWidthIn)}" ×{' '}
                    {dash(p?.clearOpeningHeightIn)}"
                  </div>
                  <div>
                    <span className="text-gray-600">
                      Swing Door(s) Position:
                    </span>{' '}
                    {dash(p?.swing)}
                  </div>
                  <div>
                    <span className="text-gray-600">Swing Door Direction:</span>{' '}
                    {dash(p?.operating)}
                  </div>
                  <div>
                    <span className="text-gray-600">Panel Slide/Stack:</span>{' '}
                    {dash(p?.stackDirection ?? p?.panelSlideStackDirection)}
                  </div>
                  <div>
                    <span className="text-gray-600">Frame Type:</span>{' '}
                    {dash(p?.frameType)}
                  </div>
                  <div>
                    <span className="text-gray-600">Track:</span>{' '}
                    {dash(p?.trackType)}
                  </div>
                </div>
              </div>

              {/* Finish Options */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Finish Options
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Exterior Finish:
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-800 border-2 border-gray-600 rounded" />
                      <div>
                        <div className="text-sm font-medium">
                          {dash(colors?.exterior?.name)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dash(colors?.exterior?.code)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Interior Finish:
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-800 border-2 border-gray-600 rounded" />
                      <div>
                        <div className="text-sm font-medium">
                          {dash(
                            colors?.isSame
                              ? 'Same as Ext.'
                              : colors?.interior?.name
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dash(colors?.interior?.code)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Glass:</div>
                    <div className="text-sm font-medium">
                      {dash(glazing?.paneCount)}
                      {glazing?.tint ? `, ${glazing.tint}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Hardware
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Hardware Finish:
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-700 border-2 border-amber-600 rounded" />
                      <div>
                        <div className="text-sm font-medium">
                          {dash(item?.hardwareFinish ?? p?.hardwareFinish)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {'hardwareOptions' in item && item.hardwareOptions && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Hardware Options:
                      </div>
                      <div className="text-sm font-medium">
                        {dash(item.hardwareOptions)}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-2">Qty: {qty}</div>
                </div>
              </div>
            </div>

            {/* Notes / Installation / Disclaimer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Notes
                </h3>
                <div className="min-h-20 border border-gray-200 rounded p-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {pdfNote || '—'}
                </div>
              </div>
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Installation Requirements
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">Rough Opening:</span> Net
                    frame is overall net width/height. Recommended RO is
                    typically +1&quot; in width and height.
                  </div>
                  <div>
                    <span className="font-medium">Foundation:</span> Level,
                    structural floor capable of supporting distributed weight;
                    proper flashing/waterproofing required.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Disclaimer
              </h3>
              <div className="text-xs text-gray-700 leading-relaxed">
                All doors &amp; windows are custom built to the customer’s
                specifications. FlowDoors does not take responsibility for
                orders placed with incorrect specifications. Contact Scenic
                Doors for clarification. No verbal changes will be recognized.
                Written, approved changes are required.
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Terms &amp; Conditions
              </h3>
              <div className="text-xs text-gray-700 leading-relaxed space-y-1">
                <p>• Quote valid for 30 days from the date shown</p>
                <p>• 50% deposit required upon signed approval</p>
                <p>• Balance due upon delivery and prior to installation</p>
                <p>• Custom products are non-returnable</p>
              </div>
              <div className="text-center mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-teal-700 font-medium">
                  Complete terms: flowdoors.com/terms-and-conditions
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
