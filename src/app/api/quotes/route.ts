import { adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all quotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = adminDb.collection('quotes').orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const quotesSnapshot = await query.get();

    const quotes = quotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST - Create new quote
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const quoteData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status || 'draft',
    };

    const docRef = await adminDb.collection('quotes').add(quoteData);

    return NextResponse.json({
      id: docRef.id,
      ...quoteData,
      createdAt: quoteData.createdAt.toISOString(),
      updatedAt: quoteData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// PUT - Update existing quote
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('id');
    
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const quoteRef = adminDb.collection('quotes').doc(quoteId);

    await quoteRef.update({
      ...data,
      updatedAt: new Date(),
    });

    const updatedDoc = await quoteRef.get();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}