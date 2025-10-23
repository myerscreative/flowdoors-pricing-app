import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebaseClient'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'customer'
    const maxQuotes = parseInt(searchParams.get('max') || '100')

    if (!params.code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Determine which field to query based on scope
    const field =
      scope === 'salesperson'
        ? 'referralCodeSalespersonLower'
        : 'referralCodeCustomerLower'

    // Query quotes with the specified referral code
    const quotesQuery = query(
      collection(db, 'quotes'),
      where(field, '==', params.code.toLowerCase()),
      orderBy('createdAt', 'desc'),
      limit(maxQuotes)
    )

    const snapshot = await getDocs(quotesQuery)

    const quotes = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        quoteNumber: data.quote_number || data.quoteId || 'N/A',
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        customerName:
          data.customerName ||
          data.customer?.name ||
          (data.customer?.firstName && data.customer?.lastName
            ? `${data.customer.firstName} ${data.customer.lastName}`.trim()
            : 'N/A'),
        totalAmount:
          data.totalAmount ||
          data.grandTotal ||
          data.totals?.grandTotal ||
          data.totals?.subtotal ||
          0,
        status: data.status || 'Active',
        referralCode: data[field] || params.code,
        productType: data.productType || 'N/A',
        salesRep: data.salesRep || 'N/A',
      }
    })

    return NextResponse.json({
      success: true,
      referralCode: params.code,
      scope,
      count: quotes.length,
      quotes,
    })
  } catch (error) {
    console.error('Error fetching quotes for referral code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
