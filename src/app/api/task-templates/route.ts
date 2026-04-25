import { adminDb } from '@/lib/firebaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CreateTemplatePayload = {
  title: string
  priority?: 'low' | 'normal' | 'high'
  assignee?: string | null
}

function isCreatePayload(x: unknown): x is CreateTemplatePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.title !== 'string' || o.title.trim().length === 0) return false
  if (
    o.priority !== undefined &&
    !['low', 'normal', 'high'].includes(o.priority as string)
  )
    return false
  return true
}

function docToTemplate(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    title: data.title ?? '',
    priority: data.priority ?? undefined,
    assignee: data.assignee ?? undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
  }
}

export async function GET() {
  try {
    const snap = await adminDb
      .collection('taskTemplates')
      .orderBy('sortOrder', 'asc')
      .get()
    const templates = snap.docs.map(
      (d: FirebaseFirestore.QueryDocumentSnapshot) =>
        docToTemplate(d.id, d.data())
    )
    return NextResponse.json(templates)
  } catch (err) {
    console.error('templates GET error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    if (!isCreatePayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const col = adminDb.collection('taskTemplates')
    const maxSnap = await col.orderBy('sortOrder', 'desc').limit(1).get()
    const nextSort = maxSnap.empty
      ? 0
      : (maxSnap.docs[0].data().sortOrder ?? -1) + 1

    const now = new Date()
    const ref = await col.add({
      title: body.title.trim(),
      priority: body.priority ?? 'normal',
      assignee: body.assignee ?? null,
      sortOrder: nextSort,
      createdAt: now,
      updatedAt: now,
    })
    const snap = await ref.get()
    return NextResponse.json(docToTemplate(ref.id, snap.data() ?? {}), {
      status: 201,
    })
  } catch (err) {
    console.error('templates POST error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
