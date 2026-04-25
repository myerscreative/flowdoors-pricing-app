import { adminDb } from '@/lib/firebaseAdmin'
import { isoToDate, tsToIso } from '@/lib/firestoreHelpers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type UpdateTaskPayload = {
  orderId: string
  title?: string
  done?: boolean
  completedAt?: string | null
  dueDate?: string | null
  priority?: 'low' | 'normal' | 'high' | null
  assignee?: string | null
}

function isUpdatePayload(x: unknown): x is UpdateTaskPayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.orderId !== 'string' || o.orderId.length === 0) return false
  if (o.title !== undefined && typeof o.title !== 'string') return false
  if (o.done !== undefined && typeof o.done !== 'boolean') return false
  if (
    o.priority !== undefined &&
    o.priority !== null &&
    !['low', 'normal', 'high'].includes(o.priority as string)
  )
    return false
  return true
}

function docToTask(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    title: data.title ?? '',
    done: Boolean(data.done),
    completedAt: tsToIso(data.completedAt) ?? undefined,
    dueDate: tsToIso(data.dueDate) ?? undefined,
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

    const taskRef = adminDb
      .collection('orders')
      .doc(body.orderId)
      .collection('tasks')
      .doc(id)

    const data: Record<string, unknown> = { updatedAt: new Date() }
    if (body.title !== undefined) data.title = body.title.trim()
    if (body.done !== undefined) {
      data.done = body.done
      if (body.completedAt === undefined) {
        data.completedAt = body.done ? new Date() : null
      }
    }
    if (body.completedAt !== undefined)
      data.completedAt = isoToDate(body.completedAt)
    if (body.dueDate !== undefined) data.dueDate = isoToDate(body.dueDate)
    if (body.priority !== undefined) data.priority = body.priority
    if (body.assignee !== undefined) data.assignee = body.assignee

    await taskRef.update(data)
    const snap = await taskRef.get()
    if (!snap.exists)
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    return NextResponse.json(docToTask(snap.id, snap.data() ?? {}))
  } catch (err) {
    console.error('task PATCH error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(req.url)
    const orderId = url.searchParams.get('orderId')
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId required' },
        { status: 400 }
      )
    }
    await adminDb
      .collection('orders')
      .doc(orderId)
      .collection('tasks')
      .doc(id)
      .delete()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('task DELETE error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
