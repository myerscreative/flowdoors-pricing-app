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

  const loadNotes = async () => {
    try {
      const list = await api.listNotes({ orderId })

      const mapped: UINote[] = list.map((n) => {
        const atts = (n.attachments ?? []).map((a, i) => mapAttachment(a, i))
        return {
          id: n.id,
          content: n.content,
          createdAt: n.createdAt ?? new Date().toISOString(),
          ...(atts.length ? { attachments: atts } : {}),
        }
      })

      setNotes(mapped)
      setErr(null)
    } catch (err) {
      setErr(err instanceof Error ? err.message : 'Failed to load notes')
    }
  }

  useEffect(() => {
    loadNotes()
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

  const handleCreate = async (note: UINote) => {
    try {
      await api.createNote({
        content: note.content,
        orderId,
        attachments: note.attachments?.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          url: a.url,
          isImage: a.isImage,
        })),
      })
      // Reload notes to get the server-generated data
      await loadNotes()
    } catch (err) {
      console.error('Failed to create note:', err)
      setErr(err instanceof Error ? err.message : 'Failed to create note')
    }
  }

  const handleUpdate = async (note: UINote) => {
    try {
      await api.updateNote(note.id, {
        content: note.content,
        attachments: note.attachments?.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          url: a.url,
          isImage: a.isImage,
        })),
      })
      // Reload notes to get the server-generated data
      await loadNotes()
    } catch (err) {
      console.error('Failed to update note:', err)
      setErr(err instanceof Error ? err.message : 'Failed to update note')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNote(id)
      // Reload notes after deletion
      await loadNotes()
    } catch (err) {
      console.error('Failed to delete note:', err)
      setErr(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  return (
    <NotesPanel
      initialNotes={notes}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}
