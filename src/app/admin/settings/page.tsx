'use client'

import { useEffect, useState } from 'react'
import { kanbanService } from '@/services/kanbanService'
import { backfillDeletedExpires } from '@/services/quoteService'
import { Button } from '@/components/ui/button'

export default function AdminSettingsPage() {
  const [days, setDays] = useState<number>(30)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const d = await kanbanService.getDeletedRetentionDays()
      setDays(d)
    })()
  }, [])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      <section className="max-w-md space-y-3">
        <div className="font-semibold">Deleted Quotes Retention</div>
        <div className="text-sm text-gray-600">
          Number of days to keep deleted quotes before permanent purge.
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="h-9 w-24 rounded-md border px-2"
            min={1}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value || '30', 10))}
          />
          <Button
            onClick={async () => {
              setSaving(true)
              await kanbanService.setDeletedRetentionDays(days)
              // Optional: backfill expiresAt to reflect new retention for existing records
              await backfillDeletedExpires(days)
              setSaving(false)
            }}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </section>
    </main>
  )
}
