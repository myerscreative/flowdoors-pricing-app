import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quoteId = params.id
    const note = await request.json()

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Add timestamp if not present
    const timestamp = note.timestamp || new Date().toISOString()
    const noteToSave = {
      ...note,
      timestamp,
    }

    // Update the quote with the new note
    const quoteRef = adminDb.collection('quotes').doc(quoteId)
    
    await quoteRef.update({
      notes: FieldValue.arrayUnion(noteToSave),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, note: noteToSave })
  } catch (error) {
    console.error('Error adding note to quote:', error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}
