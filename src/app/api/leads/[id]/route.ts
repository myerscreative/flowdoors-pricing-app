import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id
    if (!leadId) {
      return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })
    }

    const db = adminDb
    await db.collection('leads').doc(leadId).delete()

    console.info(`✅ Lead deleted: ${leadId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete lead',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

