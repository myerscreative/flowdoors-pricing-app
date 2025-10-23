'use client'

import { useEffect, useState } from 'react'
import {
  listDeletedQuotes,
  restoreDeletedQuote,
  purgeDeletedQuote,
  purgeExpiredDeletedQuotes,
  type DeletedQuoteListItem,
} from '@/services/quoteService'
import { Button } from '@/components/ui/button'
import { kanbanService } from '@/services/kanbanService'
type DeletedQuote = {
  id: string
  quoteNumber?: string | number
  firstName?: string
  lastName?: string
  company?: string
  quoteAmount?: number
  deletedAt?: string | Date
  expiresAt?: string | Date
}

export default function DeletedQuotesPage() {
  const [rows, setRows] = useState<DeletedQuote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const dataUnknown: unknown = await listDeletedQuotes()
        const data: DeletedQuote[] = Array.isArray(dataUnknown)
          ? dataUnknown
              .filter(
                (x): x is DeletedQuoteListItem =>
                  x && typeof x === 'object' && 'id' in x
              )
              .map((item) => ({
                ...item,
                deletedAt: item.deletedAt || undefined,
                expiresAt: item.expiresAt || undefined,
              }))
          : []
        setRows(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Deleted Quotes</h1>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const retention = await kanbanService.getDeletedRetentionDays()
            const count = await purgeExpiredDeletedQuotes(retention)
            const dataUnknown = await listDeletedQuotes()
            const data: DeletedQuote[] = Array.isArray(dataUnknown)
              ? dataUnknown
                  .filter(
                    (x): x is DeletedQuoteListItem =>
                      x && typeof x === 'object' && 'id' in x
                  )
                  .map((item) => ({
                    ...item,
                    deletedAt: item.deletedAt || undefined,
                    expiresAt: item.expiresAt || undefined,
                  }))
              : []
            setRows(data)
            if (typeof window !== 'undefined') {
              // simple feedback
              alert(`Purged ${count} expired record(s).`)
            }
          }}
        >
          Purge Expired Now
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">No deleted quotes.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Quote #</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Deleted</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.quoteNumber}</td>
                  <td className="px-3 py-2">
                    {`${r.firstName ?? ''} ${r.lastName ?? ''}`.trim()}
                  </td>
                  <td className="px-3 py-2">
                    {typeof r.quoteAmount === 'number'
                      ? r.quoteAmount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })
                      : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {r.deletedAt
                      ? new Date(r.deletedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await restoreDeletedQuote(r.id)
                        setRows((prev) => prev.filter((x) => x.id !== r.id))
                      }}
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const ok = window.confirm(
                          'Permanently purge this quote?'
                        )
                        if (!ok) return
                        await purgeDeletedQuote(r.id)
                        setRows((prev) => prev.filter((x) => x.id !== r.id))
                      }}
                    >
                      Purge
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
