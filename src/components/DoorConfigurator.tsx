'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  allowedPanelCounts,
  panelTemplates,
  type SystemType,
} from '@/lib/door-config'
import { useQuote } from '@/context/QuoteContext'

type ProductId = 'multi-slide' | 'bi-fold' | 'slide-stack' | 'awning'

type CardOption = {
  id: string
  title: string
  subtitle?: string
  bullets?: string[]
  priceLabel?: string
}

const GLASS_TYPE: (CardOption & { perPanel: number })[] = [
  {
    id: 'clear',
    title: 'Clear Glass',
    subtitle: 'Standard clear insulated glass',
    bullets: [
      'Maximum light transmission',
      'Standard option',
      'Clear view',
      'Dual-Pane Tempered',
    ],
    priceLabel: 'Included',
    perPanel: 0,
  },
  {
    id: 'low-e3',
    title: 'Low–E3 Glass',
    subtitle: 'Low–emissivity coating',
    bullets: [
      'Energy efficiency',
      'UV protection',
      'Reduced fading',
      'Dual-Pane Tempered',
    ],
    priceLabel: '+$50 per panel',
    perPanel: 50,
  },
  {
    id: 'laminated',
    title: 'Laminated Glass',
    subtitle: 'Safety glass with security',
    bullets: ['Security', 'Sound reduction', 'Safety', 'Dual-Pane Tempered'],
    priceLabel: '+$75 per panel',
    perPanel: 75,
  },
]

const HARDWARE_FINISH: CardOption[] = [
  { id: 'black', title: 'Black' },
  { id: 'white', title: 'White' },
  { id: 'silver', title: 'Silver' },
]

type ColorOption = { id: string; title: string; hex: string }
const COLOR_FINISH: ColorOption[] = [
  { id: 'black', title: 'Black', hex: '#000000' },
  { id: 'white', title: 'White', hex: '#ffffff' },
  { id: 'bronze', title: 'Bronze (paint)', hex: '#6b543d' },
  { id: 'anodized', title: 'Anodized Aluminum', hex: '#b4b5b8' },
]

const BASE_PRICING: Record<ProductId, number> = {
  'multi-slide': 95,
  'bi-fold': 95,
  'slide-stack': 95,
  awning: 75,
}

function SectionTitle({ index, title }: { index: number; title: string }) {
  return (
    <h3 className="mb-3 text-lg font-semibold text-gray-900">
      {index}. {title}
    </h3>
  )
}

function CardGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: CardOption[]
  selectedId?: string
  onSelect: (_id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={`text-left rounded-xl border bg-white p-4 transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedId === opt.id ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
        >
          <div className="font-medium text-gray-900">{opt.title}</div>
          {opt.subtitle ? (
            <div className="text-sm text-gray-500">{opt.subtitle}</div>
          ) : null}
          {opt.bullets?.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {opt.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full" />
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {opt.priceLabel ? (
            <div className="mt-3 font-semibold text-gray-800">
              {opt.priceLabel}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  )
}

function ColorSwatchGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: ColorOption[]
  selectedId?: string
  onSelect: (_id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-6">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className="flex w-28 flex-col items-center gap-2 focus:outline-none"
        >
          <div
            className={`relative h-20 w-20 rounded-xl border ${selectedId === opt.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
            style={{ backgroundColor: opt.hex }}
          >
            {opt.id === 'white' && (
              <div className="absolute inset-0 rounded-xl border border-gray-300" />
            )}
            {selectedId === opt.id && (
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                ✓
              </div>
            )}
          </div>
          <div className="text-sm text-gray-800">{opt.title}</div>
        </button>
      ))}
    </div>
  )
}

const STORAGE_KEY = 'sd_config_v1'
type Persisted = {
  product?: ProductId
  width?: number
  height?: number
  panelCount?: number
  layout?: string
}
function readLS(): Persisted | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Persisted) : null
  } catch {
    return null
  }
}
function writeLS(data: Persisted) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    return // avoid empty block; ignore storage write failures
  }
}

export default function DoorConfigurator({
  widthIn,
  heightIn,
}: {
  widthIn?: number
  heightIn?: number
  systemType?: SystemType
}) {
  const search = useSearchParams()
  const router = useRouter()
  const product =
    (search?.get('product') as ProductId) || ('multi-slide' as ProductId)
  const { state, dispatch } = useQuote()

  const [glassType, setGlassType] = useState<string>('low-e3')

  const [hardwareFinish, setHardwareFinish] = useState<string>('black')
  const [exteriorColor, setExteriorColor] = useState<string>('black')
  const [interiorSame, setInteriorSame] = useState<boolean>(true)
  const [interiorColor, setInteriorColor] = useState<string>('black')

  const [panelCount, setPanelCount] = useState<number | null>(null)
  const [selectedConfigCode, setSelectedConfigCode] = useState<string | null>(
    null
  )

  const [showDebug, setShowDebug] = useState(false)
  const [debugSnapshot, setDebugSnapshot] = useState<Record<
    string,
    unknown
  > | null>(null)

  const totalWidth = useMemo(() => {
    if (typeof widthIn === 'number' && Number.isFinite(widthIn) && widthIn > 0)
      return widthIn
    const w = Number(
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('width')
        : null) || '144'
    )
    return Number.isFinite(w) ? w : 144
  }, [widthIn])

  // Match helper signature (expects a single argument)
  const allowedCounts = useMemo(
    () => allowedPanelCounts(totalWidth),
    [totalWidth]
  )
  // keep to avoid side-effects elsewhere
  useMemo(() => panelTemplates(panelCount ?? 0), [panelCount]) // templates derived, not directly used here

  const derivedPanelCount = useMemo(() => {
    if (panelCount && panelCount > 0) return panelCount
    const activeItem = state?.items?.[state?.activeItemIndex]
    const ctxCount = activeItem?.product?.panels
      ? Number(activeItem.product.panels)
      : undefined
    if (ctxCount && ctxCount > 0) return ctxCount
    const urlCountStr = search?.get('panelCount')
    const urlCount = urlCountStr ? Number(urlCountStr) : undefined
    if (urlCount && urlCount > 0) return urlCount
    const ls = readLS()
    if (ls?.panelCount && ls.panelCount > 0) return ls.panelCount
    return null
  }, [panelCount, state?.activeItemIndex, state?.items, search])

  const derivedLayout = useMemo(() => {
    if (selectedConfigCode && selectedConfigCode.length)
      return selectedConfigCode
    const activeItem = state?.items?.[state?.activeItemIndex]
    const ctxLayout = activeItem?.product?.configuration || ''
    if (ctxLayout) return ctxLayout
    const urlLayout =
      search?.get('panelConfig') ||
      search?.get('layout') ||
      search?.get('config') ||
      ''
    if (urlLayout) return urlLayout
    const ls = readLS()
    if (ls?.layout) return ls.layout
    return ''
  }, [selectedConfigCode, state?.activeItemIndex, state?.items, search])

  useEffect(() => {
    const activeItem = state?.items?.[state?.activeItemIndex]
    const productCfg = activeItem?.product
    const snapshot = {
      source: 'derived',
      ctx: {
        activeItemIndex: state?.activeItemIndex,
        itemsLen: state?.items?.length,
        panels: productCfg?.panels,
        configuration: productCfg?.configuration,
      },
      url: {
        panelCount: search?.get('panelCount'),
        layout:
          search?.get('panelConfig') ||
          search?.get('layout') ||
          search?.get('config'),
      },
      ls: readLS(),
      resolved: { derivedPanelCount, derivedLayout },
    }
    console.warn('[DoorConfigurator derived]', snapshot)
    setDebugSnapshot(snapshot)
  }, [
    derivedPanelCount,
    derivedLayout,
    search,
    state?.activeItemIndex,
    state?.items,
  ])

  useEffect(() => {
    if (derivedPanelCount && !allowedCounts.includes(derivedPanelCount)) {
      setPanelCount(null)
      setSelectedConfigCode(null)
    }
  }, [allowedCounts, derivedPanelCount])

  const glassPerPanel = useMemo(
    () => GLASS_TYPE.find((g) => g.id === glassType)?.perPanel ?? 0,
    [glassType]
  )

  const glassUpgradeTotal = glassPerPanel * (derivedPanelCount ?? 0)

  const basePrice = useMemo(() => {
    const basePricePerSqFt = BASE_PRICING[product]
    const totalSqFt = (totalWidth * (heightIn || 96)) / 144
    return basePricePerSqFt * totalSqFt
  }, [product, totalWidth, heightIn])

  const totalPrice = useMemo(
    () => basePrice + glassUpgradeTotal,
    [basePrice, glassUpgradeTotal]
  )

  const summaryHref = useMemo(() => {
    const p = new URLSearchParams()
    p.set('product', String(product))
    if (totalWidth) p.set('width', String(totalWidth))
    if (typeof heightIn !== 'undefined') p.set('height', String(heightIn || 96))
    if (derivedPanelCount && Number.isFinite(derivedPanelCount))
      p.set('panelCount', String(derivedPanelCount))
    const layout = derivedLayout
    if (layout) p.set('panelConfig', String(layout))
    if (Number.isFinite(glassUpgradeTotal))
      p.set('glassUpgradeTotal', String(glassUpgradeTotal))
    p.set('rev', String(Date.now()))
    return `/summary?${p.toString()}`
  }, [
    product,
    totalWidth,
    heightIn,
    derivedPanelCount,
    derivedLayout,
    glassUpgradeTotal,
  ])

  // Autosave customer data before navigation
  const autosaveCustomerData = () => {
    const { customer } = state
    if (customer.firstName && customer.lastName && customer.email) {
      const payload = {
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        zip: customer.zipCode || '',
        timeline: customer.timeline || 'asap',
        role: customer.customerType?.toLowerCase() || 'homeowner',
        referral: customer.referralCode || '',
      }

      // Send to leads API (non-blocking)
      fetch('/api/quote/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
        .then(() => {
          console.warn('✅ Customer data autosaved after door configuration')
        })
        .catch((err) => {
          console.warn('❌ Autosave failed:', err)
        })
    }
  }

  const finalizeSelections = (): void => {
    // Safe numeric values (avoid .trim() and bad coercions)
    const widthInches =
      typeof totalWidth === 'number' && Number.isFinite(totalWidth)
        ? totalWidth
        : 0
    const heightInches =
      typeof heightIn === 'number' && Number.isFinite(heightIn) ? heightIn : 96

    // If somehow invalid, bail early
    if (!Number.isFinite(widthInches) || !Number.isFinite(heightInches)) {
      console.warn('finalizeSelections: invalid width/height', {
        widthInches,
        heightInches,
      })
      return
    }

    const layoutCode = derivedLayout || ''
    const panelsToPersist =
      typeof derivedPanelCount === 'number' &&
      Number.isFinite(derivedPanelCount)
        ? derivedPanelCount
        : null
    const panelsStr = panelsToPersist != null ? String(panelsToPersist) : ''

    // Keep reducers in sync
    dispatch({
      type: 'SET_VISUAL_CONFIGURATION',
      payload: { configuration: layoutCode, panels: panelsStr },
    })
    dispatch({
      type: 'SET_CONFIGURATION',
      payload: { configuration: layoutCode },
    })

    // Persist to localStorage
    writeLS({
      product,
      width: widthInches,
      height: heightInches,
      panelCount: panelsToPersist ?? undefined,
      layout: layoutCode,
    })

    // Autosave customer data before navigation
    autosaveCustomerData()

    // Navigate after state flush
    setTimeout(() => {
      try {
        router.push(summaryHref)
      } catch (err) {
        console.error('finalizeSelections: navigation failed', err)
      }
    }, 0)
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
          onClick={() => setShowDebug((s) => !s)}
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>
      {showDebug && (
        <pre className="mb-6 max-h-72 overflow-auto rounded-lg border bg-gray-50 p-3 text-[11px] leading-tight text-gray-800">
          {JSON.stringify(debugSnapshot, null, 2)}
        </pre>
      )}

      <div className="space-y-8">
        <section id="step-2">
          <SectionTitle index={2} title="Color Selection" />
          <div className="mb-3 text-center font-medium text-gray-800">
            Select Exterior Finish
          </div>
          <ColorSwatchGrid
            options={COLOR_FINISH}
            selectedId={exteriorColor}
            onSelect={(id) => {
              setExteriorColor(id)
              if (interiorSame) setInteriorColor(id)
            }}
          />
          <div className="mt-4 flex items-center gap-2">
            <input
              id="interior-same"
              type="checkbox"
              checked={interiorSame}
              onChange={(e) => {
                const v = e.target.checked
                setInteriorSame(v)
                if (v) setInteriorColor(exteriorColor)
              }}
              className="h-4 w-4"
            />
            <label htmlFor="interior-same" className="text-sm text-gray-700">
              Use same finish for interior
            </label>
          </div>
          {!interiorSame && (
            <div className="mt-4">
              <div className="mb-3 text-center font-medium text-gray-800">
                Select Interior Finish
              </div>
              <ColorSwatchGrid
                options={COLOR_FINISH}
                selectedId={interiorColor}
                onSelect={(_id) => setInteriorColor(_id)}
              />
            </div>
          )}
        </section>

        <section id="step-3">
          <SectionTitle index={3} title="Glass Options" />
          <div className="mb-3 mt-6 font-medium text-gray-800">Glass Type</div>
          <CardGrid
            options={GLASS_TYPE}
            selectedId={glassType}
            onSelect={(_id) => setGlassType(_id)}
          />
        </section>

        <section id="step-4">
          <SectionTitle index={4} title="Hardware Finish" />
          <CardGrid
            options={HARDWARE_FINISH}
            selectedId={hardwareFinish}
            onSelect={(_id) => setHardwareFinish(_id)}
          />
        </section>

        <section id="step-5">
          <SectionTitle index={5} title="Next Step" />
          <div className="pt-2">
            <button
              type="button"
              onClick={finalizeSelections}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Finalize Selections & View Summary
            </button>
          </div>
        </section>

        <div className="text-sm text-gray-700">
          <div className="mt-4 rounded-md border p-3">
            <div className="mb-2 font-medium">Price Estimate</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>
                  System Cost ({product} system, {derivedPanelCount ?? '?'}{' '}
                  panels)
                </span>
                <span>${basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Glass Upgrades</span>
                <span>${glassUpgradeTotal.toLocaleString()}</span>
              </div>
              <div className="mt-1 border-t pt-1">
                <div className="flex justify-between font-medium">
                  <span>Total Estimate</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Based on {totalWidth}" × {heightIn || 96}" (
              {((totalWidth * (heightIn || 96)) / 144).toFixed(1)} sq ft)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
