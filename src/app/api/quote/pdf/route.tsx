// src/app/api/quote/pdf/route.tsx
import { NextRequest } from 'next/server'
import {
  pdf,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'

// Use Node runtime; react-pdf relies on Node APIs
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const styles = StyleSheet.create({
  page: { padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logo: { width: 120, height: 40, objectFit: 'contain' },
  section: { marginTop: 8 },
  h1: { fontSize: 18, marginBottom: 6 },
  text: { fontSize: 12 },
})

export async function GET(req: NextRequest) {
  // Optional logo from /public/logo.png
  let logoBytes: Uint8Array | null = null
  try {
    const url = new URL('/logo.png', req.nextUrl.origin).toString()
    const res = await fetch(url)
    if (res.ok) {
      const ab = await res.arrayBuffer()
      logoBytes = new Uint8Array(ab)
    }
  } catch {
    // ignore missing logo/network errors
  }

  // react-pdf <Image> expects a Buffer-backed src object for binary data
  const logoSrc = logoBytes
    ? { data: Buffer.from(logoBytes), format: 'png' as const }
    : null

  const Doc = () => (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {logoSrc ? (
            <Image src={logoSrc} style={{ width: 160, height: 40 }} />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.h1}>Hello Scenic</Text>
          <Text style={styles.text}>This is a placeholder PDF endpoint.</Text>
        </View>
      </Page>
    </Document>
  )

  // Generate a Node Buffer for the PDF
  const instance = pdf(<Doc />)
  const pdfBuffer = await (instance.toBuffer() as unknown as Promise<Buffer>)

  // Convert Buffer -> Uint8Array with an ArrayBuffer-backed view
  const body = new Uint8Array(pdfBuffer.length)
  body.set(pdfBuffer)

  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="quote.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}
