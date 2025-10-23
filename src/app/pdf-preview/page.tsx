// src/app/pdf-preview/page.tsx
'use client'

import FlowDoorsQuoteLayout from '@/components/pdf/FlowDoorsQuoteLayout'
import { useQuote } from '@/context/QuoteContext'
import { CONFIG_BASES } from '@/lib/assets'
import { mapStateToPdfProps } from '@/lib/pdf-adapters'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { initializeApp } from 'firebase/app'
import {
    collection,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
} from 'firebase/firestore'

/** ---------- Safe global injection (no `any`) ---------- */
type GlobalWithConfig = typeof globalThis & {
  CONFIG_BASES?: typeof CONFIG_BASES
}
if (typeof globalThis !== 'undefined') {
  ;(globalThis as GlobalWithConfig).CONFIG_BASES = CONFIG_BASES
}

/** ---------- Firebase init (expects .env vars) ---------- */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function PdfPreviewPage() {
  const [firestoreQuote, setFirestoreQuote] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Read current in-memory quote from context
  const quoteCtxUnknown = useQuote() as unknown
  const contextState =
    (quoteCtxUnknown as { state?: unknown } | undefined)?.state ?? null

  // Load the latest quote from Firestore ONLY if context is empty
  useEffect(() => {
    if (contextState) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const q = query(
          collection(db, 'quotes'),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          setFirestoreQuote(snapshot.docs[0].data() as Record<string, unknown>)
        }
      } catch (err) {
        console.error('Error fetching latest quote:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [contextState])

  // Mock fallback (only if neither context nor Firestore have data)
  const mockState: Record<string, unknown> = {
    customer: {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Sample Builders',
      address: '1234 Example St, San Diego, CA 92101',
      phone: '(555) 123-4567',
      email: 'john.doe@example.com',
    },
    totals: { subtotal: 12000, tax: 975, grandTotal: 12975 },
    items: [
      {
        id: 'abc123',
        product: {
          type: 'Multi-Slide',
          systemType: 'Multi-Slide',
          configuration: 'ms_4p_ox_xo',
          configurationImageUrl:
            'https://storage.googleapis.com/scenic_images/Configs/Multi-slide/ms_4p_ox_xo.svg',
          widthIn: 144,
          heightIn: 96,
          panels: '4',
          track: '',
        },
        colors: {
          exterior: { ral: 'AN-BLK', name: 'Black Anodized', hex: '#000000' },
          interior: { ral: 'WH-01', name: 'White', hex: '#FFFFFF' },
          isSame: false,
        },
        glazing: {
          paneCount: '2',
          tint: 'Clear',
        },
        hardwareFinish: 'Chrome',
        quantity: 1,
        price: 12000,
      },
    ],
    notes:
      'Customer requested special hardware finish and wants installation completed by end of month. Please confirm availability with installation team.',
  }

  // Choose the data source: context → Firestore → mock
  const source = (contextState as unknown) ?? firestoreQuote ?? mockState

  // Build PDF props from unified source (infer the expected arg type)
  type MapArg = Parameters<typeof mapStateToPdfProps>[0]
  const pdfProps = mapStateToPdfProps(source as MapArg)

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar (hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <h1 className="text-2xl font-bold">PDF Preview</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            Print PDF
          </button>
          <button
            onClick={() => router.push('/summary')}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Summary
          </button>
        </div>
      </div>

      {!contextState && loading ? (
        <p>Loading latest quote…</p>
      ) : (
        <div className="border shadow bg-white">
          <FlowDoorsQuoteLayout {...pdfProps} />
        </div>
      )}

      {/* Hide toolbar in print; ensure white background */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  )
}
