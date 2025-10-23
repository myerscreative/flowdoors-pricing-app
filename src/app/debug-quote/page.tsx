'use client'

import { useState } from 'react'
import { addQuote } from '@/services/quoteService'

export default function DebugQuotePage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testQuoteSave = async () => {
    setLoading(true)
    setResult('Testing quote save...')

    try {
      console.warn('🔍 Starting quote save test...')

      const testQuote = {
        quoteId: 'DEBUG-' + Date.now(),
        activeItemIndex: 0,
        customer: {
          firstName: 'Debug',
          lastName: 'Test',
          email: 'debug@test.com',
          phone: '555-1234',
          zipCode: '12345',
          referralCode: '',
          company: '',
          customerType: 'Homeowner' as any,
          timeline: 'ASAP' as any,
          heardVia: [],
        },
        items: [
          {
            id: 'debug-item-1',
            quantity: 1,
            roomName: 'Debug Room',
            product: {
              type: 'Multi-Slide' as any,
              widthIn: 120,
              heightIn: 96,
              configuration: '4p_4L',
              systemType: 'Multi-Slide' as any,
              panels: '4',
              track: 'Standard',
            },
            colors: {
              exterior: { name: 'RAL 9006', hex: '#A1A1A1' },
              interior: { name: 'RAL 9006', hex: '#A1A1A1' },
              isSame: true,
            },
            glazing: {
              paneCount: 'Dual Pane' as any,
              tint: 'Clear Glass' as any,
            },
            hardwareFinish: 'Silver' as any,
            priceBreakdown: {
              baseCost: 7600,
              sizeAndPanelCost: 0,
              pocketDoorCost: 0,
              glazingCost: 0,
              totalUpgrades: 0,
              unitPrice: 7600,
              quantity: 1,
              itemSubtotal: 7600,
              installationCost: 0,
              itemTotal: 7600,
            },
          },
        ] as any[],
        installOption: 'None' as any,
        deliveryOption: 'Regular Delivery' as any,
        totals: {
          subtotal: 7600,
          grandTotal: 7600,
          installationCost: 0,
          deliveryCost: 0,
          tax: 0,
          itemTotals: [7600],
        },
        referralCodeSalesperson: undefined,
      }

      console.warn('🔍 Calling addQuote with:', testQuote)
      const docId = await addQuote(testQuote)
      console.warn('✅ Quote saved successfully with ID:', docId)
      setResult(`✅ SUCCESS: Quote saved with ID: ${docId}`)
    } catch (error) {
      console.error('❌ Quote save failed:', error)
      setResult(
        `❌ ERROR: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setLoading(false)
    }
  }

  const testFirebaseConnection = async () => {
    setLoading(true)
    setResult('Testing Firebase connection...')

    try {
      console.warn('🔍 Testing Firebase connection...')
      const { db } = await import('@/lib/firebaseClient')
      console.warn('🔍 Firebase client imported, db:', db)

      if (!db) {
        throw new Error('Firebase db is null/undefined')
      }

      // Try a simple read operation
      const { getDocs, collection } = await import('firebase/firestore')
      const testCollection = collection(db, 'test')
      const snapshot = await getDocs(testCollection)
      console.warn(
        '✅ Firebase connection successful, test collection read:',
        snapshot.size,
        'docs'
      )

      setResult('✅ Firebase connection successful')
    } catch (error) {
      console.error('❌ Firebase connection failed:', error)
      setResult(
        `❌ Firebase connection failed: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Quote Saving</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testFirebaseConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mr-4"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </button>

        <button
          onClick={testQuoteSave}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Quote Save'}
        </button>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Result:</h3>
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            Click "Test Firebase Connection" first to verify Firebase is working
          </li>
          <li>
            If Firebase works, click "Test Quote Save" to test the full quote
            saving process
          </li>
          <li>Check the browser console for detailed logs</li>
          <li>Report any errors or issues found</li>
        </ol>
      </div>
    </div>
  )
}
