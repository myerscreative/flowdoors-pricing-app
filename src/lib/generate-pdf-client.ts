// src/lib/generate-pdf-client.ts
// Client-only PDF generator that renders the PDF layout with real data,
// captures each .print-page section, and builds a multi-page PDF.

'use client'

import FlowDoorsQuoteLayout from '@/components/pdf/FlowDoorsQuoteLayout'
import { mapStateToPdfProps } from '@/lib/pdf-adapters'
import {
    getSalespersonByReferralCode,
    getSalespersonByZipcode,
} from '@/services/salesService'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React from 'react'
import { createRoot } from 'react-dom/client'

export type GeneratePdfResult = {
  pdfBase64: string
  fileName: string
  quoteId: string
}

/** Narrow customer-like data we read from state */
type CustomerLike = {
  firstName?: string
  lastName?: string
  phone?: string
  zipCode?: string
  zip?: string
  referralCode?: string
  [key: string]: unknown
}

/** Minimal item/total records (we don’t inspect their internals here) */
type QuoteItemLike = Record<string, unknown>
type TotalsLike = Record<string, unknown>

/** Salesperson shape we rely on when auto-assigning */
type SalespersonMinimal = {
  salesperson_id: string
  name?: string
  email?: string
  [key: string]: unknown
}

// Minimal structural type for callers/re-exports.
// Keeps things flexible while satisfying server shim re-export.
export type QuoteLike = {
  quoteNumber?: string
  customer?: CustomerLike
  shippingContact?: CustomerLike
  items?: QuoteItemLike[]
  totals?: TotalsLike
  salesRep?: string
  deliveryOption?: string
  estimatedCompletion?: string
  notes?: string
  createdAt?: string | Date
  // allow additional fields without narrowing
  [key: string]: unknown
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }
}

async function waitForImages(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll('img'))
  await Promise.all(
    imgs.map((img) =>
      (img as HTMLImageElement).decode?.().catch(() => {
        if (img.complete) return
        return new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
      })
    )
  )
}

function makeHiddenMount(widthPx = 816) {
  // US Letter width: 8.5in * 96dpi = 816px
  const mount = document.createElement('div')
  mount.setAttribute('data-pdf-mount', 'true')
  Object.assign(mount.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0px',
    width: `${widthPx}px`,
    minHeight: '1056px', // Letter height: 11" * 96dpi
    background: '#ffffff',
    zIndex: '-1000',
    overflow: 'visible',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    lineHeight: '1.32',
  } as Partial<CSSStyleDeclaration>)
  document.body.appendChild(mount)
  return mount
}

async function capturePages(container: HTMLElement) {
  const pages = Array.from(
    container.querySelectorAll('.print-page')
  ) as HTMLElement[]

  // If no explicit pages, capture the whole root
  if (pages.length === 0) {
    return [
      await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight,
        allowTaint: false,
        removeContainer: false,
      }),
    ]
  }

  const canvases: HTMLCanvasElement[] = []
  for (const el of pages) {
    // Ensure page is properly sized before capture
    el.style.minHeight = '1056px' // Letter height in pixels
    el.style.width = '816px' // Exact letter width at 96dpi

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: el.scrollWidth,
      height: Math.max(el.scrollHeight, 1056),
      allowTaint: false,
      removeContainer: false,
    })
    canvases.push(canvas)
  }
  return canvases
}

function buildPdfFromCanvases(canvases: HTMLCanvasElement[]) {
  // US Letter in mm
  const pageWidthMm = 216
  const pageHeightMm = 279
  const leftRightMarginMm = 6 // ~1/4 inch
  const topMarginMm = 6
  const bottomMarginMm = 8

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'letter',
    compress: true,
    putOnlyUsedFonts: true,
  })

  canvases.forEach((canvas, index) => {
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const imgWidthPx = canvas.width
    const imgHeightPx = canvas.height

    const availWidthMm = pageWidthMm - leftRightMarginMm * 2
    const availHeightMm = pageHeightMm - topMarginMm - bottomMarginMm

    // Preserve aspect ratio using pixel dimensions directly to avoid DPI confusion
    const aspect = imgHeightPx / imgWidthPx
    let renderWidthMm = availWidthMm
    let renderHeightMm = renderWidthMm * aspect
    if (renderHeightMm > availHeightMm) {
      renderHeightMm = availHeightMm
      renderWidthMm = renderHeightMm / aspect
    }

    const x = (pageWidthMm - renderWidthMm) / 2
    const y = topMarginMm

    if (index > 0) pdf.addPage('letter', 'p')
    pdf.addImage(imgData, 'JPEG', x, y, renderWidthMm, renderHeightMm)
  })

  return pdf
}

function safeQuoteId(
  state: QuoteLike | Record<string, unknown> | null | undefined
): string {
  const id = (state as QuoteLike | undefined)?.quoteNumber
  if (id && String(id).trim().length > 0) return String(id)
  const rnd =
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : null
  if (rnd) return rnd
  return `quote-${Date.now()}`
}

export async function generateQuotePdf(
  quoteState: QuoteLike
): Promise<GeneratePdfResult> {
  if (typeof window === 'undefined') throw new Error('Client only')

  const props = mapStateToPdfProps(quoteState)

  // Auto-assign sales rep by referral code or zipcode if not already set
  try {
    const currentRep = quoteState?.salesRep
    const referral =
      quoteState?.customer?.referralCode ||
      (quoteState as Record<string, unknown>)?.referralCode
    const zip = quoteState?.customer?.zipCode || quoteState?.customer?.zip

    if (!currentRep) {
      let sp: SalespersonMinimal | null = null
      if (typeof referral === 'string' && referral.trim()) {
        sp = (await getSalespersonByReferralCode(
          referral
        )) as unknown as SalespersonMinimal | null
      }
      if (!sp && typeof zip === 'string' && zip.trim()) {
        sp = (await getSalespersonByZipcode(
          zip
        )) as unknown as SalespersonMinimal | null
      }
      if (sp) {
        const display = (sp.name || sp.email || sp.salesperson_id) ?? ''
        if (props.quote) {
          props.quote.salesRep = display
          props.quote.salesRepId = sp.salesperson_id
        }
        try {
          localStorage.setItem('salesRepName', String(display))
          localStorage.setItem('salesRepId', sp.salesperson_id)
        } catch {
          // ignore storage failures
        }
      }
    }
  } catch (e) {
    console.warn('Auto-assign sales rep skipped:', e)
  }

  const quoteId = safeQuoteId(quoteState)
  const fileName = `ScenicQuote-${quoteState?.quoteNumber ?? 'Draft'}.pdf`

  // 1) Hidden mount + render with proper sizing
  const mount = makeHiddenMount(816)
  const root = createRoot(mount)
  root.render(React.createElement(FlowDoorsQuoteLayout, { ...props }))

  // 2) Wait for layout/paint, fonts, and images
  await new Promise((r) => setTimeout(r, 100)) // Increased wait time
  await new Promise<void>((r) => requestAnimationFrame(() => r()))
  await new Promise<void>((r) => requestAnimationFrame(() => r())) // Double RAF
  await waitForFonts()
  await waitForImages(mount)

  // 3) Additional wait for layout stabilization
  await new Promise((r) => setTimeout(r, 200))

  // 4) Capture each .print-page
  const canvases = await capturePages(mount)

  // 5) Build jsPDF with proper scaling
  const pdf = buildPdfFromCanvases(canvases)
  const arrayBuf = pdf.output('arraybuffer')
  const pdfBase64 = arrayBufferToBase64(arrayBuf)

  // 6) Cleanup
  root.unmount()
  mount.remove()

  return { pdfBase64, fileName, quoteId }
}
