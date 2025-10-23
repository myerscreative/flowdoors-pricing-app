// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      include: { attachments: { orderBy: { createdAt: 'asc' } } },
    })
    return NextResponse.json(notes)
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
  attachments?: AttachmentIn[]
}

function isCreateNotePayload(x: unknown): x is CreateNotePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>

  // Check content is a non-empty string
  if (typeof o.content !== 'string' || o.content.trim().length === 0)
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

    const created = await prisma.note.create({
      data: {
        content,
        attachments: {
          create: attachments.map((a) => ({
            name: a.name,
            type: a.type,
            size: Number(a.size) || 0,
            url: a.url,
            isImage: Boolean(a.isImage),
          })),
        },
      },
      include: { attachments: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('notes POST error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
