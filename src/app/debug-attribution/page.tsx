'use client'
import { useEffect, useState } from 'react'
import {
  initAttribution,
  getStoredAttribution,
  postLead,
  type Attribution,
} from '@/lib/marketing/attribution'

export default function DebugAttributionPage() {
  const [attr, setAttr] = useState<Attribution | undefined>(undefined)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    const a = initAttribution() || getStoredAttribution()
    setAttr(a)
  }, [])

  async function handleSimulate() {
    try {
      const r = await postLead({
        event_name: 'lead_submitted',
        user: {
          email: 'test@example.com',
          phone: '(555) 123-4567',
          name: 'Test User',
        },
        lead: {
          lead_id: 'LEAD-DEBUG-1',
          form_name: 'Debug Attribution',
          value: 0,
          currency: 'USD',
        },
      })
      setResult(JSON.stringify(r, null, 2))
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setResult(`Error: ${message}`)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Attribution Debug</h1>
      <p className="text-sm text-gray-600">
        This page shows the first-party attribution cookie and lets you send a
        test lead to the Firebase emulator.
      </p>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Stored Attribution</h2>
        <pre className="text-xs bg-gray-50 border p-3 rounded overflow-auto">
          {JSON.stringify(attr ?? {}, null, 2)}
        </pre>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSimulate}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Simulate Lead → trackLead
        </button>
        <a
          href="/debug-attribution?utm_source=google&utm_medium=cpc&utm_campaign=brand_test&gclid=TEST123"
          className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
        >
          Reload with UTM Example
        </a>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Function Response</h2>
        <pre className="text-xs bg-gray-50 border p-3 rounded overflow-auto">
          {result || '—'}
        </pre>
      </div>
    </div>
  )
}
