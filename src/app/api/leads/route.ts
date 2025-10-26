import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Fetch all leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = adminDb.collection('leads');
    
    if (status) {
      query = query.where('status', '==', status);
    }

    if (startDate) {
      query = query.where('createdAt', '>=', new Date(startDate));
    }

    if (endDate) {
      query = query.where('createdAt', '<=', new Date(endDate));
    }

    query = query.orderBy('createdAt', 'desc');

    const leadsSnapshot = await query.get();

    const leads = leadsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    // Also fetch quotes count for dashboard
    const quotesSnapshot = await adminDb.collection('quotes').get();

    return NextResponse.json({ 
      leads,
      totalQuotes: quotesSnapshot.size 
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const leadData = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      projectType: data.projectType || '',
      message: data.message || '',
      source: data.source || 'website',
      status: 'new',
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('leads').add(leadData);

    return NextResponse.json({
      id: docRef.id,
      ...leadData,
      createdAt: leadData.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}