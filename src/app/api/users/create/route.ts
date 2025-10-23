import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebaseClient'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { sendWelcomeEmail } from '@/lib/emailService'
import { generateActivationToken } from '@/lib/authUtils'

function extractError(e: unknown): {
  message?: string
  code?: unknown
  stack?: string
} {
  if (e && typeof e === 'object') {
    const anyObj = e as Record<string, unknown>
    return {
      message: typeof anyObj.message === 'string' ? anyObj.message : undefined,
      code: anyObj.code,
      stack: typeof anyObj.stack === 'string' ? anyObj.stack : undefined,
    }
  }
  return { message: String(e) }
}

export async function POST(request: NextRequest) {
  try {
    console.warn('🚀 User creation API called - FIREBASE VERSION')

    const body = await request.json()
    console.warn('📝 Request body:', body)

    const {
      name,
      email,
      role,
      phone,
      location_code,
      prefix,
      referralCodes,
      zipcodes,
      homeZip,
      startDate,
    } = body

    // Validate required fields
    if (!name || !email || !role) {
      console.warn('❌ Missing required fields:', {
        name: !!name,
        email: !!email,
        role: !!role,
      })
      return NextResponse.json(
        {
          error: 'Missing required fields: name, email, and role are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.warn('❌ Invalid email format:', email)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.warn('🔍 Checking for existing user in Firebase...')

    // Check for existing user in Firebase
    try {
      const existingQuery = query(
        collection(db, 'salespeople'),
        where('email', '==', email.toLowerCase())
      )
      const existingDocs = await getDocs(existingQuery)

      if (!existingDocs.empty) {
        console.warn('❌ User already exists in Firebase')
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
      console.warn('✅ No existing user found, proceeding...')
    } catch (queryError) {
      console.error('💥 Error checking existing user:', queryError)
      // Continue anyway - don't fail creation for this
    }

    // Generate credentials
    const tempPassword = generateActivationToken(12)
    const activationToken = generateActivationToken(32)
    const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    const salesperson_id = `SP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    console.warn('🔐 Generated credentials:', { salesperson_id })

    // Create user document for Firebase
    const userDoc = {
      salesperson_id,
      firebase_uid: null,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      location_code: String(location_code || 'SD').trim(),
      role: role as 'salesperson' | 'manager' | 'admin' | 'marketing',
      status: 'pending_activation' as
        | 'pending_activation'
        | 'active'
        | 'inactive',
      referralCodes: Array.isArray(referralCodes) ? referralCodes : [],
      prefix: String(prefix || '').trim(),
      zipcodes: Array.isArray(zipcodes) ? zipcodes : [],
      homeZip: String(homeZip || '').trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      email_verified: false,
      activation_token: activationToken,
      token_expires_at: tokenExpiresAt,
      account_status: 'pending_activation',
      temp_password: tempPassword,
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.warn('💾 Saving user to Firebase...')

    // Save to Firebase
    const docRef = await addDoc(collection(db, 'salespeople'), userDoc)

    console.warn('✅ USER SAVED TO FIREBASE!')
    console.warn('📄 Document ID:', docRef.id)
    console.warn('📄 Document path:', docRef.path)

    // Send welcome email
    try {
      console.warn('📧 Sending welcome email...')
      await sendWelcomeEmail({
        to: userDoc.email,
        name: userDoc.name,
        activationToken,
        salesperson_id,
      })
      console.warn('✅ Welcome email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      // Don't fail creation if email fails
    }

    console.warn('🎉 User creation completed successfully!')

    return NextResponse.json(
      {
        success: true,
        message: '🔥 User created and saved to Firebase successfully!',
        id: docRef.id,
        salesperson_id,
        status: userDoc.status,
        firebaseDocument: docRef.path,
        activation_token: activationToken,
        activation_link: (() => {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            'http://localhost:3000'
          const link = `${appUrl}/activate-account?token=${activationToken}&email=${encodeURIComponent(email)}`
          console.warn('🔗 API ROUTE - Activation Link Generation:')
          console.warn(
            '  NEXT_PUBLIC_APP_URL:',
            process.env.NEXT_PUBLIC_APP_URL
          )
          console.warn(
            '  NEXT_PUBLIC_SITE_URL:',
            process.env.NEXT_PUBLIC_SITE_URL
          )
          console.warn('  Selected URL:', appUrl)
          console.warn('  Generated Link:', link)
          return link
        })(),
        checkFirebaseConsole: `Look for document ${docRef.id} in salespeople collection`,
      },
      { status: 201 }
    )
  } catch (err) {
    const info = extractError(err)
    console.error('💥 User creation error:', err)
    if (info.stack) console.error('💥 Error stack:', info.stack)

    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: info.message,
        code: info.code,
      },
      { status: 500 }
    )
  }
}
