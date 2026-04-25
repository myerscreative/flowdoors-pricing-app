import { adminDb } from '@/lib/firebaseAdmin'
import { tsToIso } from '@/lib/firestoreHelpers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
  if (typeof o.content !== 'string' || o.content.trim().length === 0)
    return false
  if (o.attachments !== undefined) {
    if (!Array.isArray(o.attachments)) return false
    for (const a of o.attachments) {
      if (!a || typeof a !== 'object') return false
      const r = a as Record<string, unknown>
      if (
        typeof r.name !== 'string' ||
        typeof r.type !== 'string' ||
        typeof r.size !== 'number' ||
        typeof r.url !== 'string' ||
        typeof r.isImage !== 'boolean'
      ) {
        return false
      }
    }
  }
  return true
}

function docToNote(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    content: data.content ?? '',
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    attachments: Array.isArray(data.attachments)
      ? (data.attachments as AttachmentIn[]).map((a, i) => ({
          id: `${id}-a${i}`,
          name: a.name,
          type: a.type,
          size: a.size,
          url: a.url,
          isImage: a.isImage,
        }))
      : [],
  }
}

export async function GET() {
  try {
    const snap = await adminDb
      .collection('notes')
      .orderBy('createdAt', 'desc')
      .get()
    const notes = snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) =>
      docToNote(d.id, d.data())
    )
    return NextResponse.json(notes)
  } catch (err) {
    console.error('notes GET error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    if (!isCreateNotePayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const now = new Date()
    const ref = await adminDb.collection('notes').add({
      content: body.content,
      attachments: (body.attachments ?? []).map((a) => ({
        name: a.name,
        type: a.type,
        size: Number(a.size) || 0,
        url: a.url,
        isImage: Boolean(a.isImage),
      })),
      createdAt: now,
      updatedAt: now,
    })
    const snap = await ref.get()
    return NextResponse.json(docToNote(ref.id, snap.data() ?? {}), {
      status: 201,
    })
  } catch (err) {
    console.error('notes POST error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
