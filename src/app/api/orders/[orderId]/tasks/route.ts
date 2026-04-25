import { adminDb } from '@/lib/firebaseAdmin'
import { isoToDate, tsToIso } from '@/lib/firestoreHelpers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CreateTaskPayload = {
  title: string
  priority?: 'low' | 'normal' | 'high'
  dueDate?: string | null
  assignee?: string | null
}

function isCreatePayload(x: unknown): x is CreateTaskPayload {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.title !== 'string' || o.title.trim().length === 0) return false
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const snap = await adminDb
      .collection('orders')
      .doc(orderId)
      .collection('tasks')
      .orderBy('sortOrder', 'asc')
      .get()
    const tasks = snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) =>
      docToTask(d.id, d.data())
    )
    return NextResponse.json(tasks)
  } catch (err) {
    console.error('tasks GET error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body: unknown = await req.json()
    if (!isCreatePayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const tasksRef = adminDb
      .collection('orders')
      .doc(orderId)
      .collection('tasks')

    // Compute next sortOrder
    const maxSnap = await tasksRef.orderBy('sortOrder', 'desc').limit(1).get()
    const nextSort = maxSnap.empty
      ? 0
      : (maxSnap.docs[0].data().sortOrder ?? -1) + 1

    const now = new Date()
    const docRef = await tasksRef.add({
      title: body.title.trim(),
      done: false,
      completedAt: null,
      dueDate: isoToDate(body.dueDate),
      priority: body.priority ?? 'normal',
      assignee: body.assignee ?? null,
      sortOrder: nextSort,
      createdAt: now,
      updatedAt: now,
    })
    const created = await docRef.get()
    return NextResponse.json(
      docToTask(docRef.id, created.data() ?? {}),
      { status: 201 }
    )
  } catch (err) {
    console.error('tasks POST error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
