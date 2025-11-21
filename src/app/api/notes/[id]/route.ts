import { NextRequest, NextResponse } from 'next/server'
import * as notesService from '@/services/notesService'

type AttachmentIn = {
  name: string
  type: string
  size: number
  url: string
  isImage: boolean
}

type UpdateNotePayload = {
  content?: string
  attachments?: AttachmentIn[]
}

function isUpdateNotePayload(x: unknown): x is UpdateNotePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>

  // At least one field should be provided
  const hasContent = typeof o.content === 'string' && o.content.trim().length > 0
  const hasAttachments = Array.isArray(o.attachments)

  if (!hasContent && !hasAttachments) {
    return false
  }

  // Validate attachments if present
  if (o.attachments !== undefined) {
    if (!Array.isArray(o.attachments)) return false

    for (const attachment of o.attachments) {
      if (!attachment || typeof attachment !== 'object') return false
      const a = attachment as Record<string, unknown>

      if (
        typeof a.name !== 'string' ||
        typeof a.type !== 'string' ||
        typeof a.size !== 'number' ||
        typeof a.url !== 'string' ||
        typeof a.isImage !== 'boolean'
      ) {
        return false
      }
    }
  }

  return true
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    if (!noteId) {
      return NextResponse.json({ error: 'Missing note id' }, { status: 400 })
    }

    const bodyUnknown: unknown = await req.json()
    if (!isUpdateNotePayload(bodyUnknown)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const updated = await notesService.updateNote(noteId, {
      content: bodyUnknown.content,
      attachments: bodyUnknown.attachments,
    })

    // Convert dates to ISO strings for JSON serialization
    const serialized = {
      ...updated,
      createdAt: updated.createdAt?.toISOString() ?? null,
      updatedAt: updated.updatedAt?.toISOString() ?? null,
      attachments: updated.attachments.map((a) => ({
        ...a,
        createdAt: a.createdAt?.toISOString() ?? undefined,
      })),
    }

    return NextResponse.json(serialized)
  } catch (err) {
    console.error('notes/[id] PATCH error', err)

    // Handle specific errors
    if (err instanceof Error && err.message === 'Note not found') {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    if (!noteId) {
      return NextResponse.json({ error: 'Missing note id' }, { status: 400 })
    }

    await notesService.deleteNote(noteId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('notes/[id] DELETE error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
