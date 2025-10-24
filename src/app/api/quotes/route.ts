import { adminDb } from '@/lib/firebase-admin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const db = adminDb
    
    // Query quotes with a limit to prevent overload
    const limitParam = 500 // Same limit as client-side code
    const quotesSnapshot = await db
      .collection('quotes')
      .orderBy('createdAt', 'desc')
      .limit(limitParam)
      .get()

    const quotes: Array<Record<string, unknown>> = []
    
    quotesSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      quotes.push({
        id: doc.id,
        ...data,
        // Ensure dates are serialized properly
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      })
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes from Firestore:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        error: 'Failed to fetch quotes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quoteId = searchParams.get('id')
    
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const db = adminDb
    
    // Get the quote to soft delete
    const quoteRef = db.collection('quotes').doc(quoteId)
    const quoteSnap = await quoteRef.get()
    
    if (!quoteSnap.exists) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    const quoteData = quoteSnap.data()
    
    // Soft delete: move to deleted_quotes with timestamp for retention
    const retentionDays = 30 // Default retention period
    const now = Date.now()
    const expiresAt = new Date(now + retentionDays * 24 * 60 * 60 * 1000)
    
    await db.collection('deleted_quotes').doc(quoteId).set({
      ...quoteData,
      deletedAt: new Date(),
      expiresAt,
    })
    
    // Delete the original quote
    await quoteRef.delete()
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete quote',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

