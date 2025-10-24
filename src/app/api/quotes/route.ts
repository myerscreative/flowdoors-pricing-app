import admin from 'firebase-admin'
import { NextRequest, NextResponse } from 'next/server'

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
    const db = admin.firestore()
    
    // Query quotes with a limit to prevent overload
    const limitParam = 500 // Same limit as client-side code
    const quotesSnapshot = await db
      .collection('quotes')
      .orderBy('createdAt', 'desc')
      .limit(limitParam)
      .get()

    const quotes: Array<Record<string, unknown>> = []
    
    quotesSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
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
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json([])
  }
}

