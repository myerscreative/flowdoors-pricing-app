/* path: src/components/pdf/FlowDoorsQuoteLayout.tsx */
/* eslint-disable @next/next/no-img-element */

/** ===== Types kept narrow to avoid `any` and lint errors ===== */
type PdfTotals = {
  subtotal?: number
  tradeDiscounts?: Array<{ label?: string; amount?: number }>
  installationCost?: number
  deliveryCost?: number
  screens?: number
  crating?: number
  tax?: number
  grandTotal?: number
}

type PdfColorSpec = { name?: string; code?: string }
type PdfColors = {
  exterior?: PdfColorSpec
  interior?: PdfColorSpec
  isSame?: boolean
}
type PdfGlazing = { paneCount?: number | string; tint?: string }

type PdfProductShape = {
  id?: string | number
  type?: string
  systemType?: string
  configuration?: string
  configurationImageUrl?: string
  widthIn?: number
  heightIn?: number
  recommendedRoughOpenWidthIn?: number
  recommendedRoughOpenHeightIn?: number
  roWidthIn?: number
  roHeightIn?: number
  clearOpeningWidthIn?: number
  clearOpeningHeightIn?: number
  swing?: string
  operating?: string
  stackDirection?: string
  frameType?: string
  trackType?: string
  panelSizeIn?: number
  panelWidthIn?: number
  panels?: number
  panelCount?: number
  hardwareFinish?: string
  colors?: PdfColors
  glazing?: PdfGlazing

  // common image-ish fields that may exist in data
  imageUrl?: string
  image?: string
  photoUrl?: string
  coverImageUrl?: string
  thumbnailUrl?: string
  displayImageUrl?: string
  configImageUrl?: string
  configImg?: string
}

type PdfQuoteItem = {
  id?: string | number
  product?: PdfProductShape
  quantity?: number
  price?: number
  priceBreakdown?: { unitPrice?: number }
  roomName?: string

  // tolerate adapter mirrors at item level
  colors?: PdfColors
  glazing?: PdfGlazing
  hardwareFinish?: string

  // item-level image mirrors (just in case)
  configurationImageUrl?: string
  imageUrl?: string
  image?: string
  photoUrl?: string
  coverImageUrl?: string
  thumbnailUrl?: string
  displayImageUrl?: string
  configImageUrl?: string
  configImg?: string
}

type PdfQuoteLike = {
  totals?: PdfTotals
  items?: PdfQuoteItem[]
}

function asQuote(q: unknown): PdfQuoteLike {
  return (q as PdfQuoteLike) ?? {}
}

/** ===== Small formatters ===== */
const N = (v?: number) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const money = (v?: number) =>
  N(v).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
const inch = (v?: number) => (typeof v === 'number' ? `${v}"` : '—')

/** ===== Image URL helpers ===== */
// function normalizeAssetUrl(u?: string): string | undefined {
//   if (!u) return undefined;
//   const s = String(u).trim();
//   if (!s) return undefined;
//   if (s.startsWith("data:")) return s;                 // data URLs ok
//   if (/^https?:\/\//i.test(s)) return s;               // absolute http(s)
//   if (s.startsWith("/")) return s;                     // rooted public path
//   // common relative public assets -> root them
//   if (/^(products|images|img|assets|uploads|static)\b/i.test(s)) {
//     return `/${s.replace(/^\/+/, "")}`;
//   }
//   // unwrap Next optimized URLs if ever passed here
//   if (s.includes("/_next/image")) {
//     try {
//       const tmp = new URL(s, "http://localhost");
//       const inner = tmp.searchParams.get("url") ?? undefined;
//       const norm = normalizeAssetUrl(inner || undefined);
//       if (norm) return norm;
//     } catch {
//       /* noop */
//     }
//   }
//   return undefined;
// }

// function isSvg(url?: string): boolean {
//   if (!url) return false;
//   const s = url.toLowerCase().split("?")[0];
//   return s.endsWith(".svg");
// }

/**
 * Prefer the adapter-provided configuration diagram first (guaranteed by your
 * pdf-adapters/deriveConfigImageUrl), then try photo-like fields.
 */
// const _findProductImageUrl = (
//   prod: Record<string, unknown>,
//   item: Record<string, unknown>
// ): { url?: string; sourceKey?: string } => {
//   // Pass 0: configuration diagram (often SVG from GCS) — this fixes the placeholder issue
//   const cfg =
//     normalizeAssetUrl(
//       (prod as { configurationImageUrl?: string }).configurationImageUrl
//     ) ??
//     normalizeAssetUrl(
//       (item as { configurationImageUrl?: string }).configurationImageUrl
//     );
//   if (cfg) return { url: cfg, sourceKey: "configurationImageUrl" };

//   // Pass 1: photo-like fields (prefer non-SVG) - but only if they exist and are valid
//   const pairs: Array<[string, unknown]> = [
//     ["product.displayImageUrl", (prod as { displayImageUrl?: string }).displayImageUrl],
//     ["item.displayImageUrl", (item as { displayImageUrl?: string }).displayImageUrl],
//     ["product.imageUrl", (prod as { imageUrl?: string }).imageUrl],
//     ["item.imageUrl", (item as { imageUrl?: string }).imageUrl],
//     ["product.image", (prod as { image?: string }).image],
//     ["item.image", (item as { image?: string }).image],
//     ["product.photoUrl", (prod as { photoUrl?: string }).photoUrl],
//     ["item.photoUrl", (item as { photoUrl?: string }).photoUrl],
//     ["product.coverImageUrl", (prod as { coverImageUrl?: string }).coverImageUrl],
//     ["item.coverImageUrl", (item as { coverImageUrl?: string }).coverImageUrl],
//     ["product.thumbnailUrl", (prod as { thumbnailUrl?: string }).thumbnailUrl],
//     ["item.thumbnailUrl", (item as { thumbnailUrl?: string }).thumbnailUrl],
//   ];
//   for (const [key, val] of pairs) {
//     const norm = normalizeAssetUrl(typeof val === "string" ? val : undefined);
//     if (norm && !isSvg(norm)) return { url: norm, sourceKey: key };
//   }

//   // Pass 2: allow any valid URL (including SVG) from the same fields
//   for (const [key, val] of pairs) {
//     const norm = normalizeAssetUrl(typeof val === "string" ? val : undefined);
//     if (norm) return { url: norm, sourceKey: key };
//   }

//   // No image; caller will render panel boxes
//   return {};
// };

/**
 * Image selection:
 * 1) configurationImageUrl (product → item)
 * 2) photo-like fields (prefer NON-SVG)
 * 3) any valid URL from same fields
 * 4) fallback panel placeholders (handled by caller)
 */
// function _findBestImageUrl(prod: PdfProductShape, item: PdfQuoteItem): { url?: string; sourceKey?: string } {
//   // 0) Config diagram first (accurate to layout)
//   const cfg =
//     normalizeAssetUrl(prod.configurationImageUrl) ??
//     normalizeAssetUrl(item.configurationImageUrl);
//   if (cfg) return { url: cfg, sourceKey: "configurationImageUrl" };

//   // 1) Try real photos (prefer non-SVG)
//   const pairs: Array<[string, string | undefined]> = [
//     ["displayImageUrl", prod.displayImageUrl ?? item.displayImageUrl],
//     ["imageUrl", prod.imageUrl ?? item.imageUrl],
//     ["image", prod.image ?? item.image],
//     ["photoUrl", prod.photoUrl ?? item.photoUrl],
//     ["coverImageUrl", prod.coverImageUrl ?? item.coverImageUrl],
//     ["thumbnailUrl", prod.thumbnailUrl ?? item.thumbnailUrl],
//   ];
//   for (const [key, val] of pairs) {
//     const norm = normalizeAssetUrl(val);
//     if (norm && !isSvg(norm)) return { url: norm, sourceKey: key };
//   }
//   // 2) Allow any valid URL (including SVG)
//   for (const [key, val] of pairs) {
//     const norm = normalizeAssetUrl(val);
//     if (norm) return { url: norm, sourceKey: key };
//   }
//   return {};
// }

/** ===== Utility & UI helpers ===== */
type AnyRec = Record<string, unknown>
type Props = { items: AnyRec[]; pdfNote?: string; quote?: AnyRec }

// ----- Swatch helpers -----
function swatchClasses(name?: string, code?: string): string {
  const key = `${name ?? ''} ${code ?? ''}`.toLowerCase()
  if (/\bral[\s-]*9005\b/.test(key) || /\bblack\b/.test(key))
    return 'bg-neutral-900 border-neutral-700'
  if (/\bral[\s-]*9016\b/.test(key) || /\bwhite\b/.test(key))
    return 'bg-white border-neutral-300'
  if (/\bral[\s-]*7016\b/.test(key) || /\banthracite\b/.test(key))
    return 'bg-slate-700 border-slate-600'
  if (/\bral[\s-]*7021\b/.test(key) || /\bblack[-\s]*grey\b/.test(key))
    return 'bg-neutral-800 border-neutral-700'
  if (/\boil(ed)?\s*rubbed\s*bronze\b|\borb\b|\bbronze\b/.test(key))
    return 'bg-amber-900 border-amber-800'
  if (/\bbrushed\s*nickel\b|\bnickel\b/.test(key))
    return 'bg-zinc-400 border-zinc-500'
  if (/\bstainless\b/.test(key)) return 'bg-zinc-300 border-zinc-400'
  if (/\bchrome\b/.test(key)) return 'bg-slate-300 border-slate-400'
  if (/\banod(i[sz])?ed\b/.test(key) || /\bsilver\b/.test(key))
    return 'bg-slate-400 border-slate-500'
  if (/\bbrass\b/.test(key)) return 'bg-yellow-700 border-yellow-600'
  return 'bg-neutral-800 border-neutral-700'
}

function computePanelWidthIn(totalWidthIn?: number, panelCount?: number) {
  if (!totalWidthIn || !panelCount || panelCount <= 0) return undefined
  return Math.round((totalWidthIn / panelCount) * 100) / 100
}

/** Inch-based layout: what you see is what you print (8.5in × 11in) */
export default function FlowDoorsQuoteLayout({
  items,
  pdfNote,
  quote,
}: Props) {
  const totals = (asQuote(quote).totals ?? {}) as PdfTotals
  const customer = (quote as Record<string, unknown>)?.customer ?? {}
  type QuoteMeta = {
    quoteNumber?: string
    salesRep?: string
    estimatedCompletion?: string
    createdAt?: unknown
  }
  const qmeta = (quote ? (quote as QuoteMeta) : {}) as QuoteMeta

  const PriceRow = ({
    label,
    value,
    accent = false,
  }: {
    label: string
    value?: number
    accent?: boolean
  }) =>
    typeof value === 'number' && value !== 0 ? (
      <div
        className={`flex justify-between py-0.5 ${accent ? 'text-red-600 font-medium' : ''}`}
      >
        <span className="text-gray-600 text-sm">{label}</span>
        <span className="font-mono text-sm">{money(value)}</span>
      </div>
    ) : null

  const formatDate = (dateInput: unknown) => {
    if (!dateInput) return '—'
    try {
      const date = (dateInput as { toDate?: () => Date })?.toDate
        ? (dateInput as { toDate: () => Date }).toDate()
        : new Date(dateInput as string | number | Date)
      return date.toLocaleDateString('en-US')
    } catch {
      return '—'
    }
  }

  // ============= PAGE 2+ (per item) =============
  const itemPages = (() => {
    const qItemsRaw = (
      Array.isArray(items) && items.length
        ? items
        : (asQuote(quote).items ?? [])
    ) as PdfQuoteItem[]

    return qItemsRaw.map((raw, idx) => {
      const qItem = (raw ?? {}) as PdfQuoteItem
      const p = (qItem.product ?? {}) as PdfProductShape

      const panelCount: number | undefined =
        typeof p.panelCount === 'number' && p.panelCount > 0
          ? p.panelCount
          : typeof p.panels === 'number' && p.panels > 0
            ? p.panels
            : undefined

      const dimW = p.widthIn
      const dimH = p.heightIn
      const roW = p.recommendedRoughOpenWidthIn ?? p.roWidthIn
      const roH = p.recommendedRoughOpenHeightIn ?? p.roHeightIn

      const panelWidth =
        p.panelSizeIn ??
        p.panelWidthIn ??
        computePanelWidthIn(p.widthIn, panelCount)

      // Accept colors/glazing/hardware either inside product or at item level
      const colors = ((p as AnyRec).colors ??
        (qItem as AnyRec).colors ??
        {}) as PdfColors
      const glazing = ((p as AnyRec).glazing ??
        (qItem as AnyRec).glazing ??
        {}) as PdfGlazing
      const hardwareFinish = (p.hardwareFinish ??
        (qItem as AnyRec).hardwareFinish) as string | undefined

      const extSwatch = swatchClasses(
        colors?.exterior?.name,
        colors?.exterior?.code
      )
      const intSwatch = swatchClasses(
        colors?.isSame ? colors?.exterior?.name : colors?.interior?.name,
        colors?.isSame ? colors?.exterior?.code : colors?.interior?.code
      )
      const hardwareSwatch = swatchClasses(hardwareFinish)

      const isLast = idx === qItemsRaw.length - 1

      return (
        <div
          key={String(qItem.id ?? idx)}
          className="print-page bg-white"
          style={{
            width: '8.5in',
            minHeight: '11in',
            padding: '0.85in 0.5in 0.5in 0.5in',
            boxSizing: 'border-box',
            pageBreakBefore: 'always',
            pageBreakInside: 'avoid',
            pageBreakAfter: isLast ? 'auto' : 'always',
          }}
        >
          <div className="space-y-3">
            {/* Header + Visualization */}
            <div className="text-center">
              {/* System Type Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                System Type: {p.systemType ?? p.type ?? 'Multi-Slide'}
              </h2>

              <div className="flex justify-center items-center mb-1">
                {(() => {
                  // Use the stored configurationImageUrl first, then fallback to product image
                  const PRODUCT_IMAGES: Record<string, string> = {
                    'Multi-Slide': '/products/multi-slide/multi-slide.png',
                    'Ultra Slim Multi-Slide & Pocket Systems':
                      '/products/ultra-slim/slider-narrow.png',
                    'Bi-Fold': '/products/bi-fold/bi-fold.png',
                    'Slide-and-Stack':
                      '/products/slide-stack/slide-and-stack.png',
                    'Pocket Door': '/products/pocket/pocket-door.png',
                    'Awning Window':
                      '/products/awning-window/awning-window.png',
                  }

                  const FALLBACK_IMAGE = '/products/multi-slide/multi-slide.png'

                  const productType = p.type ?? p.systemType ?? 'Multi-Slide'
                  const imagePath =
                    PRODUCT_IMAGES[productType] || FALLBACK_IMAGE

                  // Use the stored configurationImageUrl if available, otherwise use product image
                  let chosen = p.configurationImageUrl || imagePath

                  // Proxy external URLs to avoid CORS issues during PDF generation
                  if (chosen && /^https?:\/\//i.test(chosen)) {
                    chosen = `/api/image-proxy?url=${encodeURIComponent(chosen)}`
                  }

                  return (
                    <img
                      src={chosen}
                      alt={String(
                        p.configuration || p.type || 'door configuration'
                      )}
                      width={260}
                      height={90}
                      style={{
                        maxWidth: 260,
                        maxHeight: 90,
                        objectFit: 'contain',
                      }}
                      loading="eager"
                      decoding="sync"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.warn(
                          '[PDF Image] Failed to load configuration image, falling back to product image:',
                          chosen
                        )
                        // Fallback to product image on error
                        ;(e.target as HTMLImageElement).src = imagePath
                      }}
                    />
                  )
                })()}
              </div>
              <div className="text-teal-600 text-xs font-medium">
                Viewed from Outside
              </div>
            </div>

            {/* Compact two-column layout */}
            <div className="grid grid-cols-12 gap-3">
              {/* LEFT: Configuration + Finish Options */}
              <div className="col-span-6 space-y-3">
                {/* Configuration */}
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Configuration
                  </h3>
                  <div className="space-y-1.5 text-sm leading-tight">
                    <div>
                      <span className="text-gray-600">
                        Net Frame Dimensions:
                      </span>
                      <br />
                      {inch(dimW)} width × {inch(dimH)} height
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Recommended Rough Opening:
                      </span>
                      <br />
                      {inch(roW ?? (dimW ? dimW + 1 : undefined))} width ×{' '}
                      {inch(roH ?? (dimH ? dimH + 1 : undefined))} height
                    </div>
                    <div>
                      <span className="text-gray-600">System Type:</span>{' '}
                      {p.systemType ?? p.type ?? '—'}
                    </div>
                    <div>
                      <span className="text-gray-600">Configuration:</span>{' '}
                      {p.configuration ?? '—'}
                    </div>
                    {qItem.roomName && (
                      <div>
                        <span className="text-gray-600">Room:</span>{' '}
                        {qItem.roomName}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Number of Panels:</span>{' '}
                      {panelCount ?? '—'}
                    </div>
                    <div>
                      <span className="text-gray-600">Panel Width:</span>{' '}
                      {inch(panelWidth)}
                    </div>
                    <div>
                      <span className="text-gray-600">Clear Opening:</span>{' '}
                      {inch(p.clearOpeningWidthIn)} ×{' '}
                      {inch(p.clearOpeningHeightIn)}
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Swing Door(s) Position:
                      </span>{' '}
                      {p.swing ?? '—'}
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Swing Door Direction:
                      </span>{' '}
                      {p.operating ?? '—'}
                    </div>
                    <div>
                      <span className="text-gray-600">Panel Slide/Stack:</span>{' '}
                      {p.stackDirection ?? '—'}
                    </div>
                    <div>
                      <span className="text-gray-600">Track:</span>{' '}
                      {p.trackType ?? '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Pricing + Finish Options + Notes + Disclaimer */}
              <div className="col-span-6 space-y-3">
                {/* Price Information */}
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Pricing
                  </h3>
                  <div className="space-y-1.5 text-sm leading-tight">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Door Cost:</span>
                      <span className="font-semibold">
                        {money(qItem.price)}
                      </span>
                    </div>
                    {(qItem.quantity ?? 1) > 1 && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Quantity:</span>
                        <span>{qItem.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Finish Options */}
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Finish Options
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Exterior Finish:
                      </div>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 border-2 rounded ${extSwatch}`}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {colors?.exterior?.name ?? '—'}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {colors?.exterior?.code ?? '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Interior Finish:
                      </div>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 border-2 rounded ${intSwatch}`}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {colors?.isSame
                              ? 'Same as Ext.'
                              : (colors?.interior?.name ?? '—')}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {colors?.interior?.code ?? '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Hardware Finish:
                      </div>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 border-2 rounded ${hardwareSwatch}`}
                        />
                        <div className="text-sm font-medium">
                          {hardwareFinish ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-0.5">Glass:</div>
                      <div className="text-sm font-medium">
                        {glazing?.paneCount ?? '—'}
                        {glazing?.tint ? `, ${String(glazing.tint)}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes - Full width when present */}
            {pdfNote && pdfNote.trim() && (
              <div className="mt-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Notes
                  </h3>
                  <div className="min-h-16 border border-gray-200 rounded p-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {pdfNote}
                  </div>
                </div>
              </div>
            )}

            {/* Page-wide two-column container for Installation and Disclaimer */}
            <div className="mt-4 grid grid-cols-12 gap-3">
              {/* Installation Requirements */}
              <div className="col-span-6">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Installation Requirements
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1.5 leading-tight">
                    <div>
                      <span className="font-medium">Rough Opening:</span> Net
                      frame is overall net width/height. Recommended RO is
                      typically +1".
                    </div>
                    <div>
                      <span className="font-medium">Foundation:</span> Level,
                      structural floor capable of supporting distributed weight;
                      proper flashing/waterproofing required.
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="col-span-6">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <h3 className="text-base font-medium text-gray-900 mb-1.5">
                    Disclaimer
                  </h3>
                  <div className="text-[11px] text-gray-700 leading-snug">
                    All doors & windows are custom built to the customer's
                    specifications. FlowDoors does not take responsibility
                    for orders placed with incorrect specifications. Written,
                    approved changes are required.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    })
  })()

  // ============= COVER PAGE (page 1) =============
  return (
    <div
      id="quote-pdf-root"
      className="bg-white text-gray-900 font-sans"
      style={{ width: '8.5in', margin: '0 auto' }}
    >
      <div
        className="print-page bg-white"
        style={{
          width: '8.5in',
          minHeight: '11in',
          padding: '0.35in 0.5in 0.5in 0.5in',
          boxSizing: 'border-box',
          pageBreakAfter: 'always',
        }}
      >
        <div className="space-y-4">
          {/* Top logo + quote meta */}
          <div className="mb-3">
            <div className="flex items-start justify-between">
              <img
                src="/brand/flowdoors-logo.png"
                alt="FlowDoors logo"
                className="w-auto object-contain self-start align-top"
                style={{ height: '1.5in' }}
              />
              <div className="text-right leading-[1.2]">
                <div className="text-lg font-bold text-blue-600 mb-2">
                  Quote Estimate
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="text-gray-600">Order #:</span>{' '}
                  {qmeta.quoteNumber ?? '—'}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Project Information and Invoice */}
          <div className="grid grid-cols-2 gap-8 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Project Information
              </h2>
              <div className="space-y-1 leading-[1.2]">
                <div className="flex">
                  <span className="text-gray-600 w-28 text-sm">Customer:</span>
                  <span className="font-medium text-sm">
                    {`${(customer as Record<string, string>)?.firstName ?? ''} ${(customer as Record<string, string>)?.lastName ?? ''}`.trim() ||
                      '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-28 text-sm">Company:</span>
                  <span className="text-sm">
                    {(customer as Record<string, string>)?.company ?? '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-28 text-sm">Sales Rep:</span>
                  <span className="text-sm">{qmeta.salesRep ?? '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-28 text-sm">
                    Delivery/Pickup:
                  </span>
                  <span className="text-sm">Regular Delivery</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Invoice
              </h2>
              <div className="space-y-1 leading-[1.2]">
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">
                    Order Date:
                  </span>
                  <span className="text-sm">{formatDate(qmeta.createdAt)}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">
                    Print Date:
                  </span>
                  <span className="text-sm">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">
                    Est. Completion:
                  </span>
                  <span className="text-sm">
                    {qmeta.estimatedCompletion ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing and Shipping Information */}
          <div className="grid grid-cols-2 gap-8 mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                Billing Information
              </h2>
              <div className="text-sm leading-[1.2] space-y-0.5">
                <div className="flex">
                  <span className="text-gray-600 w-20">Contact:</span>
                  <span className="truncate">
                    {`${(customer as Record<string, string>)?.firstName ?? ''} ${(customer as Record<string, string>)?.lastName ?? ''}`.trim() ||
                      '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">Address:</span>
                  <span className="truncate">
                    {(customer as Record<string, string>)?.address ?? '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">Phone:</span>
                  <span>
                    {(customer as Record<string, string>)?.phone ?? '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">Email:</span>
                  <span className="truncate">
                    {(customer as Record<string, string>)?.email ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                Shipping Information
              </h2>
              <div className="text-sm leading-[1.2] space-y-0.5">
                <div className="flex">
                  <span className="text-gray-600 w-20">Contact:</span>
                  <span className="truncate">
                    {`${(customer as Record<string, string>)?.firstName ?? ''} ${(customer as Record<string, string>)?.lastName ?? ''}`.trim() ||
                      '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">Address:</span>
                  <span className="truncate">
                    {(customer as Record<string, string>)?.address ?? '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">Phone:</span>
                  <span>
                    {(customer as Record<string, string>)?.phone ?? '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">Email:</span>
                  <span className="truncate">
                    {(customer as Record<string, string>)?.email ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div className="grid grid-cols-2 gap-8 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Project Summary
              </h2>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Total Number of Items:
                    </span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Door Systems:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Window Systems:</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>

                {/* Important Notice Box */}
                <div className="bg-blue-50 border border-blue-300 rounded p-2.5 mt-3">
                  <p className="text-xs text-gray-700 leading-4">
                    <span className="font-semibold text-blue-700">
                      IMPORTANT:
                    </span>{' '}
                    A signed cover sheet and a signed item description page for
                    each item ordered, plus a 50% deposit, are required to start
                    production.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-1">
              <PriceRow label="ITEM SUBTOTAL:" value={N(totals.subtotal)} />
              {(totals.tradeDiscounts ?? []).length > 0 ? (
                <>
                  {(totals.tradeDiscounts ?? []).map((d, i) => (
                    <PriceRow
                      key={i}
                      label={d?.label ?? 'Trade Discount'}
                      value={-N(d?.amount)}
                    />
                  ))}
                </>
              ) : null}
              <PriceRow
                label="Installation:"
                value={N(totals.installationCost)}
              />
              <PriceRow label="Delivery:" value={N(totals.deliveryCost)} />
              <PriceRow label="Screens:" value={N(totals.screens)} />
              <PriceRow label="Crating:" value={N(totals.crating)} />
              <PriceRow label="Estimated Tax:" value={N(totals.tax)} />
              <div className="border-t border-gray-400 pt-2 mt-3">
                <div className="flex justify-between font-bold text-xl text-teal-700">
                  <span>Grand Total:</span>
                  <span className="font-mono">{money(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section - Only show if there are actual notes */}
          {pdfNote && pdfNote.trim() && (
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h2>
              <div className="min-h-12 border border-gray-300 rounded p-2 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50">
                {pdfNote}
              </div>
            </div>
          )}

          {/* Compact Terms */}
          <p className="text-[10px] leading-[1.2] text-gray-600 mb-3">
            All products are custom fabricated to the specifications shown.
            Please verify all dimensions, configuration, finishes, hardware,
            handling, and glass details prior to approval. Recommended rough
            openings are advisory and must be confirmed in the field by others.
            This quote is an estimate and is valid for 30 days unless otherwise
            noted. Lead times begin after signed approval documents and required
            deposit are received. Prices exclude taxes, permits, and site prep
            unless explicitly stated. Installation and delivery are subject to
            site access and conditions. Report any discrepancies before
            production; verbal changes are not accepted.
          </p>

          {/* Terms & Signature */}
          <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-2 pb-8 mb-24">
            By signing, you agree to all FlowDoors Terms & Conditions.
            flowdoors.com/terms-and-conditions/
          </div>

          {/* Compact Signature Lines */}
          <div className="grid grid-cols-2 gap-8 mb-3">
            <div>
              <div className="border-t border-gray-400 pt-1">
                <div className="text-xs text-gray-600">Customer Signature</div>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-1">
                <div className="text-xs text-gray-600">Date</div>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-1 mt-4">
                <div className="text-xs text-gray-600">FlowDoors Rep</div>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-1 mt-4">
                <div className="text-xs text-gray-600">Date</div>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-500">
            FlowDoors • 5678 Innovation Drive • Austin, TX 78701 • (555)
            789-0123 • flowdoors.com
          </div>
        </div>
      </div>

      {/* ============= PAGE 2+ (per item) ============= */}
      {itemPages}
    </div>
  )
}
