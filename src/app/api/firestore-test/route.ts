import { NextResponse } from 'next/server'
import { db, app } from '@/lib/firebaseClient'
import { collection, addDoc } from 'firebase/firestore'

function extractError(e: unknown): {
  message?: string
  code?: unknown
  stack?: string
} {
  if (e && typeof e === 'object') {
    const obj = e as Record<string, unknown>
    return {
      message: typeof obj.message === 'string' ? obj.message : undefined,
      code: obj.code,
      stack: typeof obj.stack === 'string' ? obj.stack : undefined,
    }
  }
  return { message: String(e) }
}

export async function POST() {
  try {
    console.warn('🧪 Testing direct Firestore save...')
    console.warn('🗄️ Database exists:', !!db)
    console.warn('🔥 Project ID:', app?.options?.projectId) // informational logging only

    const docRef = await addDoc(collection(db, 'api-tests'), {
      message: 'Hello from API test',
      timestamp: new Date(),
      test: true,
    })

    console.warn('✅ TEST SAVE SUCCESSFUL!')
    console.warn('📄 Document ID:', docRef.id)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      path:
        (docRef as unknown as { path?: string }).path ??
        `api-tests/${docRef.id}`,
      message: 'Test document saved successfully to Firestore!',
    })
  } catch (err) {
    const info = extractError(err)
    console.error('💥 TEST SAVE FAILED:', err)
    if (info.stack) console.error('💥 Error stack:', info.stack)

    return NextResponse.json(
      {
        success: false,
        error: info.message,
        code: info.code,
        details: String(err),
      },
      { status: 500 }
    )
  }
}
