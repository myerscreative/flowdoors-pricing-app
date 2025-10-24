import { adminDb } from '@/lib/firebase-admin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const db = adminDb
    
    // Query salespeople with orderBy
    const salespeopleSnapshot = await db
      .collection('salespeople')
      .orderBy('created_at', 'desc')
      .get()

    const salespeople: Array<Record<string, unknown>> = []
    
    salespeopleSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      salespeople.push({
        id: doc.id,
        ...data,
        // Ensure dates are serialized properly
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
      })
    })

    return NextResponse.json(salespeople)
  } catch (error) {
    console.error('Error fetching salespeople from Firestore:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        error: 'Failed to fetch salespeople',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

