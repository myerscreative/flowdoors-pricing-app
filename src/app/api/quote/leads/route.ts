import { adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create the lead document
    const leadDoc = {
      email: body.email,
      name: body.name || '',
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      phone: body.phone || '',
      zip: body.zipCode || body.zip || '',
      timeline: body.timeline || '',
      role: body.customerType || body.role || 'homeowner',
      referral: body.heardVia?.[0] || body.referral || '',
      source: 'web',
      status: 'new',
      referer: body.referer || '',
      userAgent: body.userAgent || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use email as document ID to prevent duplicates
    const docId = `email:${encodeURIComponent(body.email)}`;
    const docRef = adminDb.collection('leads').doc(docId);

    // Check if lead already exists
    const existingDoc = await docRef.get();

    if (existingDoc.exists) {
      // Update existing lead
      await docRef.update({
        ...leadDoc,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        id: docRef.id,
        ...leadDoc,
        message: 'Lead updated',
      });
    } else {
      // Create new lead
      await docRef.set(leadDoc);

      return NextResponse.json({
        id: docRef.id,
        ...leadDoc,
        message: 'Lead created',
      });
    }
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}