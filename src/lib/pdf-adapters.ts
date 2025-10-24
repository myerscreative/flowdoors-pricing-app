// src/lib/pdf-adapters.ts
import { STANDARD_QUOTE_BLURB } from '@/constants/quotePrint'
import { PRODUCT_SQFT_RATE } from '@/lib/constants'
import { PANEL_GAP_IN } from '@/lib/door-config'

/** Generic record */
type AnyRec = Record<string, unknown>

/** Output item shape expected by FlowDoorsQuoteLayout */
export type PdfItem = {
  id: string
  index: number
  roomName: string
  quantity: number
  price: number
  productCode: string
  product: {
    type?: string
    systemType?: string
    configuration?: string
    configurationImageUrl?: string
    widthIn?: number
    heightIn?: number
    recommendedRoughOpenWidthIn?: number
    recommendedRoughOpenHeightIn?: number
    panelCount?: number
    panelSizeIn?: number
    clearOpeningWidthIn?: number
    clearOpeningHeightIn?: number
    swing?: string
    operating?: string
    stackDirection?: string
    frameType?: string
    trackType?: string
  }
  colors: {
    isSame: boolean
    exterior: { name?: string; code?: string }
    interior: { name?: string; code?: string }
  }
  glazing: {
    paneCount?: number | string
    tint?: string
  }
  hardwareFinish?: string
  priceBreakdown?: AnyRec
  sku: string
  /** hints for assignment */
  referralCode?: string
  customerZip?: string
}

export type PdfQuote = {
  id?: string
  customer: {
    firstName: string
    lastName: string
    company: string
    phone: string
    email: string
    address: string
    city: string
    state: string
    zip: string
    name: string
  }
  shippingContact: AnyRec
  salesRep: string
  salesRepId?: string
  quoteNumber: string
  deliveryOption: string
  totals: {
    subtotal: number
    installationCost: number
    deliveryCost: number
    tax: number
    grandTotal: number
    tradeDiscount: number
    screens: number
    crating: number
  }
  estimatedCompletion: string
  createdAt: string | Date
}

export type ScenicLayoutProps = {
  items: PdfItem[]
  pdfNote?: string
  standardBlurb?: string
  quote?: PdfQuote
}

/* ----------------------------- Helpers -------------------------------- */

const pick = <T>(...vals: Array<T | undefined | null>): T | undefined =>
  vals.find((v): v is T => v !== undefined && v !== null)

const fullName = (first?: string, last?: string) =>
  [first, last].filter(Boolean).join(' ').trim()

const isRecord = (v: unknown): v is AnyRec => !!v && typeof v === 'object'

const isNonEmptyRecord = (v: unknown): v is AnyRec =>
  isRecord(v) && Object.keys(v as AnyRec).length > 0

const asNum = (v: unknown): number | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

const asStr = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined

const round2 = (n?: number) =>
  typeof n === 'number' ? Math.round(n * 100) / 100 : undefined

function inferPanelCountFromConfig(config?: string): number | undefined {
  if (!config) return undefined
  const m = config.match(/(\d+)\s*p/i)
  if (!m) return undefined
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** Optional global for config bases, used to mimic old dynamic require behavior without require(). */
type ConfigBases = { multiSlide?: string; slideStack?: string; bifold?: string }
const GLOBAL_BASES: ConfigBases | undefined = (
  globalThis as unknown as { CONFIG_BASES?: ConfigBases }
).CONFIG_BASES

/** Attempt to derive a configuration image URL from a configuration code and optional bases. */
function deriveConfigImageUrl(configuration?: string): string | undefined {
  const code = configuration?.trim()
  if (!code) return undefined
  const lower = code.toLowerCase()

  // If CONFIG_BASES was injected globally somewhere, use it. Otherwise, return undefined (non-fatal).
  const bases = GLOBAL_BASES
  if (!bases) return undefined

  if (lower.startsWith('ms_') && bases.multiSlide)
    return `${bases.multiSlide}${code}.svg`
  if (lower.startsWith('sas_') && bases.slideStack)
    return `${bases.slideStack}${code}.svg`
  if (/^\d+p_/i.test(lower) && bases.bifold) return `${bases.bifold}${code}.svg`
  return undefined
}

/* ----------------------------- Main Map -------------------------------- */

export function mapStateToPdfProps(state: unknown): ScenicLayoutProps {
  const s = (isRecord(state) ? state : {}) as AnyRec

  const customer = (isRecord(s.customer) ? s.customer : {}) as AnyRec
  const shippingContactIn = (
    isRecord(s.shippingContact) ? s.shippingContact : {}
  ) as AnyRec
  const totals = (isRecord(s.totals) ? s.totals : {}) as AnyRec
  const itemsIn: AnyRec[] = Array.isArray(s.items) ? (s.items as AnyRec[]) : []

  // Shipping contact falls back to customer
  const ship: AnyRec = isNonEmptyRecord(shippingContactIn)
    ? shippingContactIn
    : {
        name:
          fullName(asStr(customer.firstName), asStr(customer.lastName)) ||
          (asStr(customer.company) ?? ''),
        phone: asStr(customer.phone) ?? '',
        email: asStr(customer.email) ?? '',
        address: asStr(customer.address) ?? '',
        city: asStr(customer.city) ?? '',
        state: asStr(customer.state) ?? '',
        zip:
          asStr((customer as AnyRec).zip) ??
          asStr((customer as AnyRec).zipCode) ??
          '',
      }

  // Helper: calculate a price for an item with multiple fallbacks
  const calculateItemPrice = (item: AnyRec): number => {
    const product = (isRecord(item.product) ? item.product : {}) as AnyRec
    const priceBreakdown = (
      isRecord(item.priceBreakdown) ? item.priceBreakdown : {}
    ) as AnyRec
    const quantity =
      (asNum(item.quantity) ?? 0) > 0 ? (asNum(item.quantity) ?? 1) : 1

    const itemSubtotal = asNum(priceBreakdown.itemSubtotal)
    if (typeof itemSubtotal === 'number' && itemSubtotal > 0)
      return itemSubtotal

    const price = asNum(item.price)
    if (typeof price === 'number' && price > 0) return price * quantity

    // Fallback: area-based (align with summary page preview)
    const productType = asStr(product.type) ?? ''
    const RATE_PER_SQFT =
      PRODUCT_SQFT_RATE[productType as keyof typeof PRODUCT_SQFT_RATE] ?? 95
    const baseDoorCost = 2500
    const sizePanelsCost = 4800

    const widthIn =
      pick<number>(asNum(product.widthIn), asNum(product.width)) ?? 0
    const heightIn =
      pick<number>(asNum(product.heightIn), asNum(product.height)) ?? 0

    const areaSqFt =
      widthIn > 0 && heightIn > 0 ? (widthIn * heightIn) / 144 : 0
    const systemPrice = areaSqFt
      ? Math.round(areaSqFt * RATE_PER_SQFT)
      : baseDoorCost + sizePanelsCost

    const glassUpgrade =
      asNum(item.glassUpgrade) ?? asNum(priceBreakdown.glassUpgrade) ?? 0

    return (systemPrice + glassUpgrade) * quantity
  }

  const mappedItems: PdfItem[] = itemsIn.map((it, idx) => {
    const product = (isRecord(it.product) ? it.product : it) as AnyRec
    const colors = (isRecord(it.colors) ? it.colors : {}) as AnyRec
    const glazing = (isRecord(it.glazing) ? it.glazing : {}) as AnyRec
    const priceBreakdown = (
      isRecord(it.priceBreakdown) ? it.priceBreakdown : {}
    ) as AnyRec

    // --- Normalize product fields with broad fallbacks ---
    const configuration = pick<string>(
      asStr(product.configuration),
      asStr(it.configuration),
      asStr(product.config),
      asStr(product.configurationCode)
    )

    const inferredPanels = inferPanelCountFromConfig(configuration)
    const panelCount = pick<number>(
      asNum(product.panelCount),
      asNum(it.panelCount),
      (() => {
        // Parse panels as string first (it's stored as string in QuoteContext)
        const panelsStr = asStr(product.panels) ?? asStr(it.panels)
        if (panelsStr) {
          const n = Number.parseInt(panelsStr, 10)
          return Number.isFinite(n) ? n : undefined
        }
        return undefined
      })(),
      asNum(product.leafCount),
      inferredPanels
    )

    const widthIn = pick<number>(
      asNum(product.widthIn),
      asNum(it.widthIn),
      asNum(product.width)
    )
    const heightIn = pick<number>(
      asNum(product.heightIn),
      asNum(it.heightIn),
      asNum(product.height)
    )

    // Rough opening dimensions
    const recommendedRoughOpenWidthIn = pick<number>(
      asNum(product.recommendedRoughOpenWidthIn),
      asNum(it.recommendedRoughOpenWidthIn),
      asNum(product.roWidthIn),
      asNum(product.roughOpeningWidthIn),
      isRecord(product.roughOpening)
        ? asNum((product.roughOpening as AnyRec).widthIn)
        : undefined
    )
    const recommendedRoughOpenHeightIn = pick<number>(
      asNum(product.recommendedRoughOpenHeightIn),
      asNum(it.recommendedRoughOpenHeightIn),
      asNum(product.roHeightIn),
      asNum(product.roughOpeningHeightIn),
      isRecord(product.roughOpening)
        ? asNum((product.roughOpening as AnyRec).heightIn)
        : undefined
    )

    const panelSizeIn = pick<number>(
      asNum(product.panelSizeIn),
      asNum(product.panelWidthIn),
      asNum(it.panelSizeIn),
      asNum(it.panelWidthIn),
      widthIn && panelCount ? round2((widthIn - PANEL_GAP_IN) / panelCount) : undefined
    )

    const clearOpeningWidthIn = pick<number>(
      asNum(product.clearOpeningWidthIn),
      isRecord(product.clearOpening)
        ? asNum((product.clearOpening as AnyRec).widthIn)
        : undefined,
      asNum(product.clearOpeningWidth),
      asNum(product.clearWidthIn),
      asNum(it.clearOpeningWidthIn),
      asNum(it.clearWidthIn)
    )
    const clearOpeningHeightIn = pick<number>(
      asNum(product.clearOpeningHeightIn),
      isRecord(product.clearOpening)
        ? asNum((product.clearOpening as AnyRec).heightIn)
        : undefined,
      asNum(product.clearOpeningHeight),
      asNum(product.clearHeightIn),
      asNum(it.clearOpeningHeightIn),
      asNum(it.clearHeightIn)
    )

    const swing = pick<string>(
      asStr(product.swing),
      asStr(it.swing),
      asStr(product.swingPosition),
      asStr(product.doorSwing),
      asStr(product.swingDirection)
    )
    const operating = pick<string>(
      asStr(product.operating),
      asStr(it.operating),
      asStr(product.swingDirection),
      asStr(product.doorDirection),
      asStr(product.operatingDirection)
    )

    const stackDirection = pick<string>(
      asStr(product.stackDirection),
      asStr(product.panelSlideStackDirection),
      asStr(product.panelSlideStack),
      asStr(product.stack),
      asStr(product.slideDirection),
      asStr(product.panelDirection),
      asStr(it.stackDirection)
    )

    const frameType = pick<string>(
      asStr(product.frameType),
      isRecord(product.frame)
        ? asStr((product.frame as AnyRec).type)
        : undefined,
      asStr((product as AnyRec).frameType),
      asStr(product.frameStyle),
      asStr(it.frameType)
    )
    const trackType = pick<string>(
      asStr(product.trackType),
      isRecord(product.track)
        ? asStr((product.track as AnyRec).type)
        : undefined,
      asStr((product as AnyRec).trackType),
      asStr(product.trackStyle),
      asStr(it.trackType)
    )

    const hardwareFinish = pick<string>(
      asStr(it.hardwareFinish),
      asStr(product.hardwareFinish),
      isRecord(product.hardware)
        ? asStr((product.hardware as AnyRec).finish)
        : undefined
    )

    const ext = (isRecord(colors.exterior) ? colors.exterior : {}) as AnyRec
    const int = (isRecord(colors.interior) ? colors.interior : {}) as AnyRec

    // Capitalize color names for display
    const capitalizeColorName = (name?: string) => {
      if (!name) return name
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }

    const exterior = {
      name: capitalizeColorName(
        pick<string>(
          asStr(ext.name),
          asStr((colors as AnyRec).exteriorName),
          asStr(it.exteriorColor)
        )
      ),
      code: pick<string>(
        asStr(ext.code),
        asStr((colors as AnyRec).exteriorCode)
      ),
    }
    const interior = {
      name: capitalizeColorName(
        pick<string>(
          asStr(int.name),
          asStr((colors as AnyRec).interiorName),
          asStr(it.interiorColor)
        )
      ),
      code: pick<string>(
        asStr(int.code),
        asStr((colors as AnyRec).interiorCode)
      ),
    }

    const price = calculateItemPrice(it)

    const configurationImageUrl = pick<string>(
      asStr((product as AnyRec).configurationImageUrl),
      asStr((it as AnyRec).configurationImageUrl),
      asStr((product as AnyRec).layoutImageUrl),
      asStr((product as AnyRec).imageUrl),
      deriveConfigImageUrl(configuration)
    )

    return {
      id: asStr(it.id) ?? `item-${idx + 1}`,
      index: idx + 1,
      roomName: asStr(it.roomName) ?? '',
      quantity:
        asNum(it.quantity) && (it.quantity as number) > 0
          ? (it.quantity as number)
          : 1,
      price,
      productCode:
        asStr(it.productCode) ??
        asStr(it.sku) ??
        `ITEM ${String.fromCharCode(65 + idx)}`,
      product: {
        type: asStr(product.type) ?? '',
        systemType: asStr(product.systemType) ?? '',
        configuration,
        configurationImageUrl,
        widthIn,
        heightIn,
        recommendedRoughOpenWidthIn,
        recommendedRoughOpenHeightIn,
        panelCount,
        panelSizeIn,
        clearOpeningWidthIn,
        clearOpeningHeightIn,
        swing,
        operating,
        stackDirection,
        frameType,
        trackType,
      },
      colors: {
        isSame: Boolean((colors as AnyRec).isSame),
        exterior,
        interior,
      },
      glazing: {
        paneCount: asNum(glazing.paneCount) ?? asStr(glazing.paneCount),
        tint: asStr(glazing.tint),
      },
      hardwareFinish,
      priceBreakdown,
      sku: asStr(it.sku) ?? '',
      referralCode:
        asStr((s.customer as AnyRec | undefined)?.referralCode) ?? undefined,
      customerZip:
        asStr((s.customer as AnyRec | undefined)?.zipCode) ?? undefined,
    }
  })

  // Derive totals when missing (fallback to item prices)
  const subtotalFromItems = mappedItems.reduce(
    (sum, itm) => sum + (typeof itm.price === 'number' ? itm.price : 0),
    0
  )

  const derivedSubtotal = (asNum(totals.subtotal) ?? 0) || subtotalFromItems
  const derivedInstall = asNum(totals.installationCost) ?? 0
  const derivedDelivery = asNum(totals.deliveryCost) ?? 0
  const derivedTax =
    asNum(totals.tax) ??
    Math.round((derivedSubtotal + derivedInstall + derivedDelivery) * 0.08)
  const derivedGrand =
    asNum(totals.grandTotal) ??
    derivedSubtotal + derivedInstall + derivedDelivery + derivedTax

  return {
    items: mappedItems,
    pdfNote: asStr(s.notes) ?? '',
    standardBlurb: STANDARD_QUOTE_BLURB ?? '',
    quote: {
      id: asStr(s.id) ?? asStr(s.quoteId) ?? undefined,
      customer: {
        firstName:
          asStr(customer.firstName) ?? asStr((customer as AnyRec).first) ?? '',
        lastName:
          asStr(customer.lastName) ?? asStr((customer as AnyRec).last) ?? '',
        company: asStr(customer.company) ?? '',
        phone: asStr(customer.phone) ?? '',
        email: asStr(customer.email) ?? '',
        address: asStr(customer.address) ?? '',
        city: asStr(customer.city) ?? '',
        state: asStr(customer.state) ?? '',
        zip:
          asStr((customer as AnyRec).zip) ??
          asStr((customer as AnyRec).zipCode) ??
          '',
        name:
          fullName(
            asStr(customer.firstName) ?? asStr((customer as AnyRec).first),
            asStr(customer.lastName) ?? asStr((customer as AnyRec).last)
          ) ||
          (asStr(customer.company) ?? ''),
      },
      shippingContact: ship,
      salesRep: asStr(s.salesRep) ?? asStr(s.salesperson_id) ?? '',
      salesRepId: asStr(s.salesperson_id) ?? undefined,
      quoteNumber: asStr(s.quoteNumber) ?? asStr(s.quote_number) ?? '',
      deliveryOption: asStr(s.deliveryOption) ?? '',
      totals: {
        subtotal: derivedSubtotal,
        installationCost: derivedInstall,
        deliveryCost: derivedDelivery,
        tax: derivedTax,
        grandTotal: derivedGrand,
        tradeDiscount: asNum(totals.tradeDiscount) ?? 0,
        screens: asNum(totals.screens) ?? 0,
        crating: asNum(totals.crating) ?? 0,
      },
      estimatedCompletion: asStr(s.estimatedCompletion) ?? '',
      createdAt:
        (s.createdAt as string | Date | undefined) ?? new Date().toISOString(),
    },
  }
}
