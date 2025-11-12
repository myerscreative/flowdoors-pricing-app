import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { verifyAuthToken, isAuthorized } from '@/lib/apiAuth'

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT

    let credential: admin.credential.Credential

    if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      projectId
    ) {
      const pk = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      credential = admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: pk,
      })
      admin.initializeApp({ projectId, credential })
    } else {
      credential = admin.credential.applicationDefault()
      admin.initializeApp({ projectId, credential })
    }
  } catch (e) {
    console.error('Firebase Admin initialization failed:', e)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check authorization - only admin, manager, and salesperson can view orders
    if (!isAuthorized(authResult, ['admin', 'manager', 'salesperson'])) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    const db = admin.firestore()
    const orderDoc = await db.collection('orders').doc(params.id).get()

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const data = orderDoc.data()
    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = {
      id: orderDoc.id,
      orderNumber: data.orderNumber || '',
      customerName: data.customerName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company || '',
      phone: data.phone || '',
      email: data.email || '',
      zip: data.zip || '',
      salesRep: data.salesRep || '',
      orderAmount: data.orderAmount || 0,
      amount: data.orderAmount || data.amount || 0,
      paymentAmount: data.paymentAmount || 0,
      balanceAmount: data.balanceAmount || 0,
      paymentDueDate: data.paymentDueDate || '',
      installDate: data.installDate || '',
      shippingAddress: data.shippingAddress || '',
      status: data.status || 'draft',
      notes: data.notes || '',
      createdAt: data.createdAt
        ? data.createdAt.toDate
          ? data.createdAt.toDate().toISOString()
          : new Date(data.createdAt).toISOString()
        : '',
      updatedAt: data.updatedAt
        ? data.updatedAt.toDate
          ? data.updatedAt.toDate().toISOString()
          : new Date(data.updatedAt).toISOString()
        : '',
      quoteId: data.quoteId || '',
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order from Firestore:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check authorization - only admin and manager can delete orders
    if (!isAuthorized(authResult, ['admin', 'manager'])) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    const db = admin.firestore()
    await db.collection('orders').doc(params.id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order from Firestore:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check authorization - only admin, manager, and salesperson can update orders
    if (!isAuthorized(authResult, ['admin', 'manager', 'salesperson'])) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    const db = admin.firestore()
    const updates = await request.json()

    await db
      .collection('orders')
      .doc(params.id)
      .update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order in Firestore:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}











