'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NotesPanel, {
  type Note as NotesPanelNote,
} from '@/components/notes/NotesPanel'
import { listNotes, type Note as NotesApiNote } from '@/lib/notesApi'

// Narrow helper for optional date-like fields that may appear on API notes
type MaybeDates = {
  createdAt?: unknown
  timestamp?: unknown
  created_at?: unknown
}

function toIsoString(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }
  return null
}

// Convert API note shape → NotesPanel expected shape
const toNotesPanelNote = (n: NotesApiNote): NotesPanelNote => {
  const m = n as NotesApiNote & MaybeDates
  const iso =
    toIsoString(m.createdAt) ??
    toIsoString(m.timestamp) ??
    toIsoString(m.created_at) ??
    new Date().toISOString()

  return {
    id: n.id,
    content: n.content,
    createdAt: iso,
  }
}

export default function QuotesNotesSectionClient() {
  const [initialNotes, setInitialNotes] = useState<NotesPanelNote[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await listNotes()
        if (!mounted) return
        setInitialNotes((data ?? []).map(toNotesPanelNote))
      } catch (e) {
        console.error('Failed to load notes', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Let NotesPanel handle its own loading UI; we pre-seed with initialNotes */}
        <NotesPanel initialNotes={initialNotes} />
      </CardContent>
    </Card>
  )
}
