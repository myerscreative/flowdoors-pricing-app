// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as notesService from '@/services/notesService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const quoteId = searchParams.get('quoteId')

    const notes = await notesService.listNotes({
      orderId: orderId || undefined,
      quoteId: quoteId || undefined,
    })

    // Convert dates to ISO strings for JSON serialization
    const serializedNotes = notes.map((note) => ({
      ...note,
      createdAt: note.createdAt?.toISOString() ?? null,
      updatedAt: note.updatedAt?.toISOString() ?? null,
      attachments: note.attachments.map((a) => ({
        ...a,
        createdAt: a.createdAt?.toISOString() ?? undefined,
      })),
    }))

    return NextResponse.json(serializedNotes)
  } catch (err) {
    console.error('notes GET error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

type AttachmentIn = {
  name: string
  type: string
  size: number
  url: string
  isImage: boolean
}

type CreateNotePayload = {
  content: string
  orderId?: string | null
  quoteId?: string | null
  userId?: string | null
  attachments?: AttachmentIn[]
}

function isCreateNotePayload(x: unknown): x is CreateNotePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>

  // Check content is a non-empty string
  if (typeof o.content !== 'string' || o.content.trim().length === 0)
    return false

  // orderId, quoteId, userId are optional
  if (o.orderId !== undefined && o.orderId !== null && typeof o.orderId !== 'string')
    return false
  if (o.quoteId !== undefined && o.quoteId !== null && typeof o.quoteId !== 'string')
    return false
  if (o.userId !== undefined && o.userId !== null && typeof o.userId !== 'string')
    return false

  // Check attachments if present
  if (o.attachments !== undefined) {
    if (!Array.isArray(o.attachments)) return false

    // Validate each attachment
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

export async function POST(req: NextRequest) {
  try {
    const bodyUnknown: unknown = await req.json()
    if (!isCreateNotePayload(bodyUnknown)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const body = bodyUnknown // typed via guard

    const content = body.content
    const attachments = body.attachments || []

    if (!content && attachments.length === 0) {
      return NextResponse.json({ error: 'Empty note' }, { status: 400 })
    }

    const created = await notesService.createNote({
      content,
      orderId: body.orderId,
      quoteId: body.quoteId,
      userId: body.userId,
      attachments,
    })

    // Convert dates to ISO strings for JSON serialization
    const serialized = {
      ...created,
      createdAt: created.createdAt?.toISOString() ?? null,
      updatedAt: created.updatedAt?.toISOString() ?? null,
      attachments: created.attachments.map((a) => ({
        ...a,
        createdAt: a.createdAt?.toISOString() ?? undefined,
      })),
    }

    return NextResponse.json(serialized, { status: 201 })
  } catch (err) {
    console.error('notes POST error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
