'use client'

import { useQuote } from '@/context/QuoteContext'
import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
    CONFIG_BASES,
    GLASS_BASE,
    GLASS_IMAGE_BY_KEY,
} from '../../../lib/assets'

type Finish = 'black' | 'white' | 'bronze' | 'anodized'
type GlassType = 'clear' | 'low-e3' | 'laminated'
type HardwareFinish = 'black' | 'white' | 'silver'
type SectionId =
  | 'size-config'
  | 'color-selection'
  | 'glass-options'
  | 'hardware-finish'

// Slide-&-Stack config images (centralized base)
const CONFIG_BASE = CONFIG_BASES.slideStack

// SAS layout filenames you provided
const LAYOUTS: Record<number, { code: string; title: string }[]> = {
  2: [
    { code: 'sas_2p_1L_1R', title: '1L + 1R' },
    { code: 'sas_2p_2L', title: '2L' },
    { code: 'sas_2p_2R', title: '2R' },
  ],
  3: [
    { code: 'sas_3p_3L', title: 'All Left (3L)' },
    { code: 'sas_3p_3R', title: 'All Right (3R)' },
  ],
  4: [
    { code: 'sas_4p_4L', title: 'All Left (4L)' },
    { code: 'sas_4p_4R', title: 'All Right (4R)' },
  ],
  5: [
    { code: 'sas_5p_5L', title: 'All Left (5L)' },
    { code: 'sas_5p_5R', title: 'All Right (5R)' },
  ],
  6: [
    { code: 'sas_6p_6L', title: 'All Left (6L)' },
    { code: 'sas_6p_6R', title: 'All Right (6R)' },
  ],
  7: [
    { code: 'sas_7p_7L', title: 'All Left (7L)' },
    { code: 'sas_7p_7R', title: 'All Right (7R)' },
  ],
  8: [
    { code: 'sas_8p_8L', title: 'All Left (8L)' },
    { code: 'sas_8p_8R', title: 'All Right (8R)' },
  ],
}

// utils
const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)
const fmtInches = (n: number) => `${Math.round(n * 10) / 10}"`

// Narrow typing helper so we can index GLASS_IMAGE_BY_KEY safely
const GLASS_IMAGES: Record<GlassType, string> = {
  clear: GLASS_IMAGE_BY_KEY['clear'],
  'low-e3': GLASS_IMAGE_BY_KEY['low-e3'],
  laminated: GLASS_IMAGE_BY_KEY['laminated'],
}

export default function SlideStackBuilder() {
  const router = useRouter()
  const { dispatch } = useQuote()
  const searchParams = useSearchParams()

  // state
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [exterior, setExterior] = useState<Finish | null>(null)
  const [interior, setInterior] = useState<Finish | null>(null)
  // const [_sameInterior] = useState<boolean>(true);
  const [glassType, setGlassType] = useState<GlassType>('low-e3')
  const [hardware, setHardware] = useState<HardwareFinish>('black')
  const [twoTone, setTwoTone] = useState<boolean>(false)
  const [showErrors, setShowErrors] = useState(false)
  const [panelCount, setPanelCount] = useState<number | null>(null)
  const [layoutCode, setLayoutCode] = useState<string | null>(null)

  // ---- URL parameter reading ----
  useEffect(() => {
    const widthParam = searchParams.get('width')
    const heightParam = searchParams.get('height')
    const configParam = searchParams.get('config')
    const panelCountParam = searchParams.get('panelCount')
    const exteriorParam = searchParams.get('exterior')
    const interiorParam = searchParams.get('interior')
    const sameInteriorParam = searchParams.get('sameInterior')
    const glassParam = searchParams.get('glass')
    const hardwareParam = searchParams.get('hardware')

    // Set dimensions
    if (widthParam) {
      const widthNum = parseFloat(widthParam)
      if (!isNaN(widthNum) && widthNum > 0) {
        setWidth(widthNum)
      }
    }
    if (heightParam) {
      const heightNum = parseFloat(heightParam)
      if (!isNaN(heightNum) && heightNum > 0) {
        setHeight(heightNum)
      }
    }

    // Set configuration
    if (configParam) {
      setLayoutCode(configParam)
    }

    // Set panel count
    if (panelCountParam) {
      const panelCountNum = parseInt(panelCountParam, 10)
      if (!isNaN(panelCountNum) && panelCountNum > 0) {
        setPanelCount(panelCountNum)
      }
    }

    // Set colors
    if (
      exteriorParam &&
      ['black', 'white', 'bronze', 'anodized'].includes(exteriorParam)
    ) {
      setExterior(exteriorParam as Finish)
    }
    if (
      interiorParam &&
      ['black', 'white', 'bronze', 'anodized'].includes(interiorParam)
    ) {
      setInterior(interiorParam as Finish)
    }
    if (sameInteriorParam) {
      // setSameInterior(sameInteriorParam === "true");
      setTwoTone(sameInteriorParam === 'false')
    }

    // Set glass type
    if (glassParam) {
      const glassTypeMap: Record<string, GlassType> = {
        'clear-glass': 'clear',
        'low-e3-glass': 'low-e3',
        'laminated-glass': 'laminated',
      }
      const mappedGlass = glassTypeMap[glassParam]
      if (mappedGlass) {
        setGlassType(mappedGlass)
      }
    }

    // Set hardware
    if (hardwareParam && ['black', 'white', 'silver'].includes(hardwareParam)) {
      setHardware(hardwareParam as HardwareFinish)
    }
  }, [searchParams])

  // sticky steps
  const [active, setActive] = useState<SectionId>('size-config')
  const sections: { id: SectionId; label: string }[] = [
    { id: 'size-config', label: 'Size & Configuration' },
    { id: 'color-selection', label: 'Color Selection' },
    { id: 'glass-options', label: 'Glass Options' },
    { id: 'hardware-finish', label: 'Hardware Finish' },
  ]
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && setActive(e.target.id as SectionId)
        ),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const scrollTo = (id: SectionId) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // ---- keep interior synced when two-tone is false ----
  useEffect(() => {
    if (!twoTone) setInterior(exterior)
  }, [twoTone, exterior])

  // Defer completeness until after panel state declarations (below)

  // ---- Panel count math (Bi-Fold rules reused) ----
  // usable opening = width - 5"
  const opening = typeof width === 'number' ? Math.max(width - 5, 0) : null
  // per-panel must be 25"–39"; allow 2..8 panels; max height 120"
  const validPanelOptions = useMemo(() => {
    if (opening == null || opening <= 0)
      return [] as { n: number; per: number }[]
    const opts: { n: number; per: number }[] = []
    for (let n = 2; n <= 8; n++) {
      const per = opening / n
      if (per >= 25 && per <= 39) opts.push({ n, per })
    }
    return opts
  }, [opening])

  // Check if form is complete (after panel/layout state exists)
  const isFormComplete = useMemo(() => {
    const wOk = typeof width === 'number' && width >= 24 && width <= 240
    const hOk = typeof height === 'number' && height >= 48 && height <= 120
    const colorOk = !!exterior && (!twoTone || !!interior)
    return (
      wOk &&
      hOk &&
      !!panelCount &&
      !!layoutCode &&
      colorOk &&
      !!glassType &&
      !!hardware
    )
  }, [
    width,
    height,
    panelCount,
    layoutCode,
    exterior,
    twoTone,
    interior,
    glassType,
    hardware,
  ])

  const getMissingSections = () => {
    const missing: string[] = []
    const wOk = typeof width === 'number' && width >= 24 && width <= 240
    const hOk = typeof height === 'number' && height >= 48 && height <= 120
    if (!wOk || !hOk || !panelCount || !layoutCode)
      missing.push('Size & Configuration')
    if (!exterior || (twoTone && !interior)) missing.push('Color Selection')
    if (!glassType) missing.push('Glass Options')
    if (!hardware) missing.push('Hardware Finish')
    return missing
  }

  useEffect(() => {
    if (!validPanelOptions.length) {
      setPanelCount(null)
      setLayoutCode(null)
      return
    }
    const n = validPanelOptions[0].n
    setPanelCount((prev) =>
      prev && validPanelOptions.some((o) => o.n === prev) ? prev : n
    )
  }, [validPanelOptions])

  useEffect(() => {
    if (!panelCount) {
      setLayoutCode(null)
      return
    }
    const first = LAYOUTS[panelCount]?.[0]?.code ?? null
    setLayoutCode((prev) =>
      prev && LAYOUTS[panelCount]?.some((l) => l.code === prev) ? prev : first
    )
  }, [panelCount])

  // shared subcomponents (identical styling to Multi-Slide/Bi-Fold)
  const getColorDisplay = (color: Finish | null) => {
    if (!color) return { label: 'Select a Finish', colorClass: 'bg-gray-200' }
    const displays = {
      black: { label: 'Black', colorClass: 'bg-black' },
      white: { label: 'White', colorClass: 'bg-white border border-gray-300' },
      bronze: { label: 'Bronze (paint)', colorClass: 'bg-[#6B4F3B]' },
      anodized: { label: 'Anodized Aluminum', colorClass: 'bg-gray-400' },
    } as const
    return displays[color]
  }

  const selectExteriorColor = (color: Finish) => {
    setExterior(color)
  }

  const selectInteriorColor = (color: Finish) => {
    setInterior(color)
  }

  const ColorOption = ({
    color,
    label,
    selected,
    onSelect,
  }: {
    color: Finish
    label: string
    selected: boolean
    onSelect: () => void
  }) => {
    const display = getColorDisplay(color)
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 bg-white p-4 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          selected ? 'border-blue-500' : 'border-gray-200'
        }`}
      >
        {selected && (
          <div className="absolute -top-2 -right-2">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <div className={`h-16 w-16 rounded ${display.colorClass}`} />
        <div className="text-center">
          <div className="font-medium text-gray-900">{label}</div>
        </div>
      </button>
    )
  }

  const FinishSwatch = ({
    label,
    value,
    selected,
    onSelect,
    colorClass,
  }: {
    label: string
    value: HardwareFinish
    selected: boolean
    onSelect: (_v: HardwareFinish) => void
    colorClass: string
  }) => (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md focus:ring-2 focus:ring-blue-500 ${
        selected ? 'ring-2 ring-blue-500' : 'border-gray-200'
      }`}
    >
      <span className={`h-12 w-12 shrink-0 rounded-full ${colorClass}`} />
      <span className="font-medium text-gray-800">{label}</span>
    </button>
  )

  const Tile = ({
    title,
    subtitle,
    selected,
    onSelect,
    children,
  }: {
    title: string
    subtitle?: string
    selected: boolean
    onSelect: () => void
    children?: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        selected ? 'ring-2 ring-blue-500' : 'border-gray-200'
      }`}
    >
      {children}
      <div className="mt-2 text-base font-semibold text-gray-900">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-gray-600">{subtitle}</div>
      ) : null}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              FlowDoors Quote Builder
            </h1>
            <p className="text-sm text-gray-500">
              Premium Window &amp; Door Solutions
            </p>
          </div>
          <div className="text-right text-sm leading-5 text-gray-600">
            <div>
              <span className="font-medium text-gray-800">Configuring:</span>{' '}
              Item A
            </div>
            <Link
              href="/select-product"
              className="text-blue-600 hover:underline"
            >
              Change Product Type
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr]">
          {/* Sticky sidebar */}
          <aside className="hidden lg:block self-start sticky top-20">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg">
                  <Image
                    src="/products/slide-stack/slide-and-stack.png"
                    alt="Slide & Stack System"
                    width={280}
                    height={112}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 text-sm font-medium text-gray-800">
                  Slide &amp; Stack System
                </div>
                <Link
                  href="/select-product"
                  className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                >
                  Change Product Type
                </Link>
              </div>

              <nav className="mt-6 space-y-3" aria-label="Configuration steps">
                {sections.map((s, i) => {
                  const isActive = active === s.id
                  const sizeSummary = () => {
                    if (typeof width !== 'number' || typeof height !== 'number')
                      return '—'
                    const size = `${width}" × ${height}"`
                    if (panelCount && layoutCode)
                      return `${size} · ${panelCount}p`
                    return size
                  }
                  const colorSummary = () => {
                    if (!exterior) return '—'
                    const ext = getColorDisplay(exterior).label
                    if (!twoTone) return `Ext/Int: ${ext}`
                    if (interior)
                      return `Ext: ${ext}, Int: ${getColorDisplay(interior).label}`
                    return `Ext: ${ext}`
                  }
                  const glassSummary = () =>
                    glassType === 'low-e3'
                      ? 'Low–E3 Glass'
                      : glassType === 'laminated'
                        ? 'Laminated Glass'
                        : 'Clear Glass'
                  const hardwareSummary = () =>
                    hardware === 'silver'
                      ? 'Silver'
                      : hardware
                        ? hardware.charAt(0).toUpperCase() + hardware.slice(1)
                        : '—'
                  const summary =
                    s.id === 'size-config'
                      ? sizeSummary()
                      : s.id === 'color-selection'
                        ? colorSummary()
                        : s.id === 'glass-options'
                          ? glassSummary()
                          : hardwareSummary()
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition ${
                        isActive
                          ? 'border-blue-400 bg-blue-50/50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                            isActive ? 'bg-green-600 text-white' : 'bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="flex flex-col">
                          <span>{s.label}</span>
                          <span className="text-xs text-gray-500">
                            {summary}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="space-y-8">
            {/* 1) Size & Configuration */}
            <section
              id="size-config"
              className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                1. Size &amp; Configuration
              </h2>

              {/* Dimensions */}
              <div className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Width (inches) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={24}
                    max={240}
                    value={width}
                    onChange={(e) =>
                      setWidth(
                        e.target.value === ''
                          ? ''
                          : clamp(Number(e.target.value), 0, 10000)
                      )
                    }
                    placeholder="Enter width"
                    className={`w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 ${showErrors && (typeof width !== 'number' || width < 24 || width > 240) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 ring-blue-500'}`}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Usable opening = width − 5".
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Height (inches) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={48}
                    max={120}
                    value={height}
                    onChange={(e) =>
                      setHeight(
                        e.target.value === ''
                          ? ''
                          : clamp(Number(e.target.value), 0, 10000)
                      )
                    }
                    placeholder="Enter height"
                    className={`w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 ${showErrors && (typeof height !== 'number' || height < 48 || height > 120) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 ring-blue-500'}`}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Max height: 120"
                  </div>
                </div>
              </div>

              {/* Panel Count */}
              <div
                className={`mt-6 rounded-xl border p-4 ${showErrors && !panelCount ? 'border-red-400' : 'border-gray-200'}`}
              >
                <div className="text-lg font-semibold text-gray-900">
                  Panel Count
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Usable opening = width − 5". Per-panel must be 25"–39".
                </div>

                {typeof width !== 'number' ? (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    Enter width to see available panel counts.
                  </div>
                ) : validPanelOptions.length === 0 ? (
                  <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    No valid panel counts for {width}" width. Try adjusting the
                    width.
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {validPanelOptions.map((opt) => {
                      const sel = panelCount === opt.n
                      return (
                        <Tile
                          key={opt.n}
                          title={`${opt.n} Panels`}
                          subtitle={`≈ ${fmtInches(opt.per)} each`}
                          selected={sel}
                          onSelect={() => {
                            setPanelCount(opt.n)
                            const first = LAYOUTS[opt.n]?.[0]?.code ?? null
                            setLayoutCode(first)
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Panel Layout */}
              <div
                className={`mt-6 rounded-xl border p-4 ${showErrors && !layoutCode ? 'border-red-400' : 'border-gray-200'}`}
              >
                <div className="text-lg font-semibold text-gray-900">
                  Panel Layout
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  As viewed from outside the building.
                </div>

                {!panelCount ? (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    Select a panel count to see layouts.
                  </div>
                ) : (LAYOUTS[panelCount] ?? []).length === 0 ? (
                  <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    No layouts available for {panelCount} panels yet.
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {LAYOUTS[panelCount].map((cfg) => {
                      const sel = layoutCode === cfg.code
                      return (
                        <Tile
                          key={cfg.code}
                          title={cfg.title}
                          selected={sel}
                          onSelect={() => setLayoutCode(cfg.code)}
                        >
                          <div className="grid h-28 place-items-center rounded-lg">
                            {/* eslint-disable @next/next/no-img-element */}
                            <img
                              src={`${CONFIG_BASE}${cfg.code}.svg`}
                              alt={cfg.title}
                              className="max-h-28 max-w-full object-contain"
                              draggable={false}
                            />
                            {/* eslint-enable @next/next/no-img-element */}
                          </div>
                        </Tile>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 2) Color Selection */}
            <section
              id="color-selection"
              className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                2. Color Selection
              </h2>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-4 text-lg font-semibold text-gray-900">
                  Exterior Finish
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {(['black', 'white', 'bronze', 'anodized'] as Finish[]).map(
                    (color) => {
                      const display = getColorDisplay(color)
                      return (
                        <ColorOption
                          key={color}
                          color={color}
                          label={display.label}
                          selected={exterior === color}
                          onSelect={() => selectExteriorColor(color)}
                        />
                      )
                    }
                  )}
                </div>

                {/* Two-tone toggle */}
                <div className="mt-6 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={twoTone}
                    onClick={() => setTwoTone((v) => !v)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                      twoTone ? 'bg-blue-600' : 'bg-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <span
                      className={`absolute left-1 inline-block h-6 w-6 transform rounded-full bg-white shadow ring-1 ring-black/5 transition ${
                        twoTone ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Two-tone</span> (different
                    interior color)
                  </span>
                </div>

                {/* Interior color selection - only show when two-tone is enabled */}
                {twoTone && (
                  <div className="mt-6">
                    <div className="mb-4 text-lg font-semibold text-gray-900">
                      Interior Finish
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {(
                        ['black', 'white', 'bronze', 'anodized'] as Finish[]
                      ).map((color) => {
                        const display = getColorDisplay(color)
                        return (
                          <ColorOption
                            key={color}
                            color={color}
                            label={display.label}
                            selected={interior === color}
                            onSelect={() => selectInteriorColor(color)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3) Glass Options */}
            <section
              id="glass-options"
              className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                3. Glass Options
              </h2>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-2 text-sm font-medium text-gray-800">
                  Glass Type
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['low-e3', 'clear', 'laminated'] as GlassType[]).map(
                    (g) => (
                      <Tile
                        key={g}
                        title={
                          g === 'clear'
                            ? 'Clear Glass'
                            : g === 'low-e3'
                              ? 'Low-E3 Glass'
                              : 'Laminated Glass'
                        }
                        subtitle={
                          g === 'clear'
                            ? '-$50 per panel'
                            : g === 'low-e3'
                              ? 'Included'
                              : '+$75 per panel'
                        }
                        selected={glassType === g}
                        onSelect={() => setGlassType(g)}
                      >
                        <div className="grid h-24 place-items-center rounded-lg">
                          {/* eslint-disable @next/next/no-img-element */}
                          <img
                            src={`${GLASS_BASE}${GLASS_IMAGES[g]}`}
                            alt={
                              g === 'clear'
                                ? 'Clear Glass'
                                : g === 'low-e3'
                                  ? 'Low-E3 Glass'
                                  : 'Laminated Glass'
                            }
                            className="max-h-24 max-w-full object-contain"
                            draggable={false}
                          />
                          {/* eslint-enable @next/next/no-img-element */}
                        </div>
                      </Tile>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* 4) Hardware Finish */}
            <section
              id="hardware-finish"
              className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                4. Hardware Finish
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <FinishSwatch
                  label="Black"
                  value="black"
                  selected={hardware === 'black'}
                  onSelect={() => setHardware('black')}
                  colorClass="bg-black"
                />
                <FinishSwatch
                  label="White"
                  value="white"
                  selected={hardware === 'white'}
                  onSelect={() => setHardware('white')}
                  colorClass="bg-white border border-gray-300"
                />
                <FinishSwatch
                  label="Silver"
                  value="silver"
                  selected={hardware === 'silver'}
                  onSelect={() => setHardware('silver')}
                  colorClass="bg-gray-400"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!isFormComplete) {
                      setShowErrors(true)
                      if (
                        typeof width !== 'number' ||
                        typeof height !== 'number' ||
                        !panelCount ||
                        !layoutCode
                      ) {
                        scrollTo('size-config')
                        return
                      }
                      if (!exterior || (twoTone && !interior)) {
                        scrollTo('color-selection')
                        return
                      }
                      return
                    }
                    // Save configuration to quote context using individual actions
                    if (width && height && exterior && hardware) {
                      dispatch({
                        type: 'SET_PRODUCT_TYPE',
                        payload: 'Slide-and-Stack',
                      })
                      // Keep systemType aligned with allowed values (Multi-Slide or Pocket Door)
                      dispatch({
                        type: 'SET_SYSTEM_TYPE',
                        payload: 'Multi-Slide',
                      })
                      dispatch({
                        type: 'SET_PRODUCT_SIZE',
                        payload: {
                          widthIn: width as number,
                          heightIn: height as number,
                        },
                      })
                      if (layoutCode) {
                        dispatch({
                          type: 'SET_CONFIGURATION',
                          payload: {
                            configuration: layoutCode,
                          },
                        })
                      }
                      dispatch({
                        type: 'SET_EXTERIOR_COLOR',
                        payload: { ral: '', name: exterior, hex: '#000000' },
                      })
                      if (twoTone && interior) {
                        dispatch({
                          type: 'SET_INTERIOR_COLOR',
                          payload: { ral: '', name: interior, hex: '#000000' },
                        })
                        dispatch({ type: 'SET_COLORS_SAME', payload: false })
                      } else {
                        dispatch({ type: 'SET_COLORS_SAME', payload: true })
                      }
                      dispatch({
                        type: 'SET_GLAZING',
                        payload: {
                          paneCount: 'Dual Pane',
                          tint:
                            glassType === 'low-e3'
                              ? 'Low-E3 Glass'
                              : glassType === 'laminated'
                                ? 'Laminated Glass'
                                : 'Clear Glass',
                        },
                      })
                      dispatch({
                        type: 'SET_HARDWARE',
                        payload:
                          hardware === 'white'
                            ? 'White'
                            : hardware === 'silver'
                              ? 'Silver'
                              : 'Black',
                      })
                      dispatch({
                        type: 'SET_ROOM_NAME',
                        payload: 'Living Room',
                      })
                      dispatch({ type: 'CALCULATE_PRICES' })
                    }

                    // Navigate to summary page
                    router.push('/summary')
                  }}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700`}
                >
                  {isFormComplete
                    ? 'Finalize Selections & View Summary →'
                    : 'Some selections still not made'}
                </button>

                {showErrors && !isFormComplete && (
                  <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                    <div className="font-semibold mb-1">
                      Please complete the following sections:
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {getMissingSections().map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
