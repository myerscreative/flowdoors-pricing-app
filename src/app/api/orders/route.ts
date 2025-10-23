import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'

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

export async function GET(_request: NextRequest) {
  try {
    // TODO: Add authentication check here if needed
    const db = admin.firestore()
    const ordersSnapshot = await db.collection('orders').get()

    const orders: Array<Record<string, unknown>> = []
    ordersSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data()
      orders.push({
        id: doc.id,
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
      })
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders from Firestore:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
