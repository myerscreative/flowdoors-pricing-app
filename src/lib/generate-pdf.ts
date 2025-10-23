// src/lib/generate-pdf.ts
// NOTE: no "use client" in this file

export type { GeneratePdfResult, QuoteLike } from './generate-pdf-client'

export async function generateQuotePdf(
  q: unknown
): Promise<import('./generate-pdf-client').GeneratePdfResult> {
  if (typeof window === 'undefined') {
    throw new Error('generateQuotePdf must be called in the browser')
  }
  const mod = await import('./generate-pdf-client')
  return mod.generateQuotePdf(q as import('./generate-pdf-client').QuoteLike) // correct function name with safe cast
}
