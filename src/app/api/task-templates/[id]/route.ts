import { adminDb } from '@/lib/firebaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type UpdateTemplatePayload = {
  title?: string
  priority?: 'low' | 'normal' | 'high' | null
  assignee?: string | null
  sortOrder?: number
}

function isUpdatePayload(x: unknown): x is UpdateTemplatePayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (o.title !== undefined && typeof o.title !== 'string') return false
  if (
    o.priority !== undefined &&
    o.priority !== null &&
    !['low', 'normal', 'high'].includes(o.priority as string)
  )
    return false
  if (o.sortOrder !== undefined && typeof o.sortOrder !== 'number') return false
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: unknown = await req.json()
    if (!isUpdatePayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const ref = adminDb.collection('taskTemplates').doc(id)
    const data: Record<string, unknown> = { updatedAt: new Date() }
    if (body.title !== undefined) data.title = body.title.trim()
    if (body.priority !== undefined) data.priority = body.priority
    if (body.assignee !== undefined) data.assignee = body.assignee
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

    await ref.update(data)
    const snap = await ref.get()
    if (!snap.exists)
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    return NextResponse.json(docToTemplate(snap.id, snap.data() ?? {}))
  } catch (err) {
    console.error('template PATCH error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await adminDb.collection('taskTemplates').doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('template DELETE error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
