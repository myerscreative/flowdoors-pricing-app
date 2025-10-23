// src/app/admin/orders/[orderId]/NotesSectionClient.tsx
'use client'

import { useEffect, useState } from 'react'
import NotesPanel, {
  Note as UINote,
  NoteAttachment as UIAttachment,
} from '@/components/notes/NotesPanel'
import * as api from '@/lib/notesApi'

export default function NotesSectionClient({ orderId }: { orderId: string }) {
  const [notes, setNotes] = useState<UINote[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await api.listNotes()

        // Coerce API attachment (id?: string) -> UI attachment (id: string)
        const mapAttachment = (
          a: api.NoteAttachment,
          idx: number
        ): UIAttachment => ({
          id:
            a.id ??
            `${Date.now().toString(36)}-${idx}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
          name: a.name,
          type: a.type,
          size: a.size,
          url: a.url,
          isImage: a.isImage,
        })

        const mapped: UINote[] = list.map((n) => {
          const atts = (n.attachments ?? []).map((a, i) => mapAttachment(a, i))
          return {
            id: n.id,
            content: n.content,
            createdAt: n.createdAt,
            ...(atts.length ? { attachments: atts } : {}),
          }
        })

        if (alive) setNotes(mapped)
      } catch (err) {
        if (alive)
          setErr(err instanceof Error ? err.message : 'Failed to load notes')
      }
    })()

    return () => {
      alive = false
    }
  }, [orderId])

  if (err) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {err}
      </div>
    )
  }

  if (!notes) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Loading notes…
      </div>
    )
  }

  // NotesPanel handles add/edit/delete UI. Persisting actions via notesApi will be wired in a later step.
  return <NotesPanel initialNotes={notes} />
}
