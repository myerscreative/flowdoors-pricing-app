import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

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

