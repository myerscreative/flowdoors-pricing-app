'use client'

import { useEffect, useState } from 'react'

export default function EnvDebugPage() {
  const [serverData, setServerData] = useState<any>(null)
  const [clientData, setClientData] = useState<any>(null)

  useEffect(() => {
    // Check what's available on the client side
    const clientEnvVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        ? 'SET'
        : 'MISSING',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env
        .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ? 'SET'
        : 'MISSING',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env
        .NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ? 'SET'
        : 'MISSING',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env
        .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        ? 'SET'
        : 'MISSING',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env
        .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        ? 'SET'
        : 'MISSING',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        ? 'SET'
        : 'MISSING',
    }

    setClientData(clientEnvVars)

    // Fetch server-side data
    fetch('/api/env-check')
      .then((res) => res.json())
      .then((data) => setServerData(data))
      .catch((err) => console.error('Failed to fetch server data:', err))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Client-Side (Browser)</h2>
          {clientData ? (
            <div className="space-y-2">
              {Object.entries(clientData).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-2 rounded ${value === 'SET' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Server-Side (API)</h2>
          {serverData ? (
            <div className="space-y-2">
              <div className="p-2 bg-blue-100 rounded">
                <strong>Node Env:</strong> {serverData.nodeEnv}
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <strong>Vercel Env:</strong> {serverData.vercelEnv}
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <strong>Total Env Vars:</strong> {serverData.totalEnvVars}
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Firebase Variables:</h3>
                {Object.entries(serverData.firebaseVars || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className={`p-2 rounded ${value === 'SET' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  )
}
