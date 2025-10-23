import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import * as admin from 'firebase-admin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  zip: string
  timeline: string
  role: string
  status: string
  source: string
  createdAt: Date | null
  referral?: string
  userAgent?: string
  referer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  gclid?: string
  fbclid?: string
  hasQuote: boolean
}

function toDateSafe(v: unknown): Date | null {
  try {
    if (
      v &&
      typeof v === 'object' &&
      'toDate' in v &&
      typeof (v as { toDate?: () => Date }).toDate === 'function'
    ) {
      return (v as { toDate: () => Date }).toDate()
    }
    if (v instanceof Date) return v
    if (typeof v === 'string' || typeof v === 'number') return new Date(v)
  } catch {
    // intentionally empty
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const withoutQuotes = url.searchParams.get('withoutQuotes') === 'true'

    const db = adminDb

    // Fetch all leads - without orderBy to avoid index issues
    let leadsSnapshot
    try {
      const leadsQuery = db.collection('leads')
      leadsSnapshot = await leadsQuery.get()
    } catch (queryError) {
      console.error('Firestore query error:', queryError)
      console.error('Error details:', {
        message:
          queryError instanceof Error ? queryError.message : 'Unknown error',
        stack: queryError instanceof Error ? queryError.stack : undefined,
      })
      return NextResponse.json(
        {
          error: 'Failed to query leads collection',
          details:
            queryError instanceof Error ? queryError.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    if (leadsSnapshot.empty) {
      return NextResponse.json([])
    }

    const leads: Lead[] = leadsSnapshot.docs.map(
      (doc: QueryDocumentSnapshot) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          zip: data.zip || '',
          timeline: data.timeline || '',
          role: data.role || '',
          status: data.status || 'new',
          source: data.source || 'web',
          createdAt: toDateSafe(data.createdAt),
          referral: data.referral,
          userAgent: data.userAgent,
          referer: data.referer,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          utmTerm: data.utmTerm,
          gclid: data.gclid,
          fbclid: data.fbclid,
          hasQuote: false, // Will be set below
        }
      }
    )

    // Sort in memory by createdAt descending
    leads.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0
      const bTime = b.createdAt?.getTime() || 0
      return bTime - aTime
    })

    // If requesting leads without quotes, check which ones have quotes
    if (withoutQuotes) {
      // Get all quotes to check which leads have converted
      const quotesSnapshot = await db.collection('quotes').get()

      const emailsWithQuotes = new Set<string>()
      quotesSnapshot.docs.forEach((quoteDoc: QueryDocumentSnapshot) => {
        const quoteData = quoteDoc.data()
        const email = quoteData.customer?.email || quoteData.email
        if (email) {
          emailsWithQuotes.add(email.toLowerCase())
        }
      })

      // Filter leads that don't have quotes
      const leadsWithoutQuotes = leads.filter(
        (lead) => !emailsWithQuotes.has(lead.email.toLowerCase())
      )

      return NextResponse.json(leadsWithoutQuotes)
    }

    // For regular leads request, mark which ones have quotes
    const quotesSnapshot = await db.collection('quotes').get()
    const emailsWithQuotes = new Set<string>()
    quotesSnapshot.docs.forEach((quoteDoc: QueryDocumentSnapshot) => {
      const quoteData = quoteDoc.data()
      const email = quoteData.customer?.email || quoteData.email
      if (email) {
        emailsWithQuotes.add(email.toLowerCase())
      }
    })

    const leadsWithQuoteStatus = leads.map((lead) => ({
      ...lead,
      hasQuote: emailsWithQuotes.has(lead.email.toLowerCase()),
    }))

    return NextResponse.json(leadsWithQuoteStatus)
  } catch (error) {
    console.error('Leads API error:', error)
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    )
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST endpoint for creating new leads from forms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Common fields
      name,
      email,
      phone,
      zipCode,
      location,
      timeline,
      source,
      type, // 'homeowner' or 'contractor'
      referralCode,
      
      // Homeowner-specific fields
      bestTimeToCall,
      projectType,
      projectDetails,
      budget,
      
      // Contractor-specific fields
      companyName,
      licenseNumber,
      tradeType,
      doorCount,
      doorWidth,
      doorHeight,
      notes,
    } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Get user agent and referer from headers
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Prepare the lead document
    const leadDoc: any = {
      name,
      email: email.toLowerCase(),
      phone,
      zip: zipCode || '',
      location: location || '',
      timeline: timeline || 'researching',
      role: type === 'contractor' ? 'contractor' : 'homeowner',
      status: 'new',
      source: source || 'web',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent,
      referer,
    }

    // Add optional fields
    if (referralCode) leadDoc.referral = referralCode
    if (bestTimeToCall) leadDoc.bestTimeToCall = bestTimeToCall
    if (projectType) leadDoc.projectType = projectType
    if (projectDetails) leadDoc.projectDetails = projectDetails
    if (budget) leadDoc.budget = budget

    // Add contractor-specific fields
    if (type === 'contractor') {
      if (companyName) leadDoc.companyName = companyName
      if (licenseNumber) leadDoc.licenseNumber = licenseNumber
      if (tradeType) leadDoc.tradeType = tradeType
      if (doorCount) leadDoc.doorCount = doorCount
      if (doorWidth) leadDoc.doorWidth = doorWidth
      if (doorHeight) leadDoc.doorHeight = doorHeight
      if (notes) leadDoc.notes = notes
    }

    // Save to Firestore
    const db = adminDb
    const docRef = await db.collection('leads').add(leadDoc)

    console.info(`✅ Lead created: ${docRef.id} for ${email} (${type})`)

    // TODO: Send email notification to sales team
    // You can implement email sending here using your email service

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        message: 'Lead submitted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      {
        error: 'Failed to create lead',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
