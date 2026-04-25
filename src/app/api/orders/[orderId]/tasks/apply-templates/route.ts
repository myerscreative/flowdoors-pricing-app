import { adminDb } from '@/lib/firebaseAdmin'
import { tsToIso } from '@/lib/firestoreHelpers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const tasksRef = adminDb
      .collection('orders')
      .doc(orderId)
      .collection('tasks')

    const [templatesSnap, existingSnap] = await Promise.all([
      adminDb.collection('taskTemplates').orderBy('sortOrder', 'asc').get(),
      tasksRef.get(),
    ])

    const existingTitles = new Set<string>()
    let maxSort = -1
    existingSnap.forEach((d: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = d.data()
      existingTitles.add((data.title as string).trim().toLowerCase())
      if (typeof data.sortOrder === 'number' && data.sortOrder > maxSort) {
        maxSort = data.sortOrder
      }
    })

    const toCreate: Array<{
      title: string
      priority: string
      assignee: string | null
      sortOrder: number
    }> = []
    let nextSort = maxSort + 1
    templatesSnap.forEach(
      (d: FirebaseFirestore.QueryDocumentSnapshot) => {
        const tpl = d.data()
        const title = (tpl.title as string).trim()
        if (existingTitles.has(title.toLowerCase())) return
        toCreate.push({
          title,
          priority: (tpl.priority as string) ?? 'normal',
          assignee: (tpl.assignee as string) ?? null,
          sortOrder: nextSort++,
        })
      }
    )

    if (toCreate.length > 0) {
      const batch = adminDb.batch()
      const now = new Date()
      for (const t of toCreate) {
        const ref = tasksRef.doc()
        batch.set(ref, {
          title: t.title,
          done: false,
          completedAt: null,
          dueDate: null,
          priority: t.priority,
          assignee: t.assignee,
          sortOrder: t.sortOrder,
          createdAt: now,
          updatedAt: now,
        })
      }
      await batch.commit()
    }

    const finalSnap = await tasksRef.orderBy('sortOrder', 'asc').get()
    const tasks = finalSnap.docs.map(
      (d: FirebaseFirestore.QueryDocumentSnapshot) =>
        docToTask(d.id, d.data())
    )

    return NextResponse.json({ created: toCreate.length, tasks })
  } catch (err) {
    console.error('apply-templates error', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
