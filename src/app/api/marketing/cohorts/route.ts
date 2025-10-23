import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// Attribution helper from marketing/summary
function determineSource(lead: Record<string, unknown>): string {
  const utmSource = lead.utmSource?.toString().toLowerCase()
  const utmMedium = lead.utmMedium?.toString().toLowerCase()
  const referrer = lead.referrer?.toString().toLowerCase()
  const gclid = lead.gclid
  const fbclid = lead.fbclid

  // Google Ads
  if (gclid || utmSource === 'google' || utmMedium === 'cpc') {
    return 'google'
  }

  // Facebook Ads
  if (fbclid || utmSource === 'facebook' || utmSource === 'fb') {
    return 'facebook'
  }

  // Direct traffic
  if (
    !referrer ||
    referrer.includes(window?.location?.hostname || '') ||
    utmSource === 'direct' ||
    utmMedium === 'none'
  ) {
    return 'direct'
  }

  // Other sources
  return 'other'
}

// Helper to get start of week (Monday)
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper to format cohort label
function formatCohortLabel(date: Date): string {
  return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

type CohortRow = {
  cohortLabel: string
  cohortStartISO: string
  totalLeads: number
  totalConversions: number
  rate: number
  [key: `week${number}`]: number
}

type CohortSummary = {
  meta: {
    from: string | null
    to: string | null
    weeks: number
    source: 'all' | 'google' | 'facebook' | 'direct' | 'other'
  }
  totals: {
    cohorts: number
    leads: number
    averageRate: number
  }
  rows: CohortRow[]
}

export async function GET(request: NextRequest) {
  try {
    // Debug environment variables
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY exists:',
      !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    )
    console.warn(
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID:',
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )

    // For development/testing, allow bypassing auth if no token provided
    const authHeader = request.headers.get('authorization')
    let hasValidAuth = false

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)

        // Check if user has required role
        const customClaims = decodedToken.customClaims as Record<
          string,
          unknown
        >
        const userRole = customClaims?.role
        console.warn('User role:', userRole, 'Custom claims:', customClaims)

        if (
          userRole &&
          ['marketing', 'manager', 'administrator'].includes(userRole as string)
        ) {
          hasValidAuth = true
          console.warn(
            'User has valid marketing role, proceeding with real data'
          )
        } else {
          console.warn('User lacks marketing role, falling back to mock data')
        }
      } catch (authError) {
        console.warn(
          'Auth token verification failed, falling back to mock data:',
          authError
        )
      }
    } else {
      console.warn('No auth header provided, using mock data for development')
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const source =
      (searchParams.get('source') as
        | 'all'
        | 'google'
        | 'facebook'
        | 'direct'
        | 'other') || 'all'
    const weeks = parseInt(searchParams.get('weeks') || '9')

    // For development without valid auth, return mock data immediately
    if (!hasValidAuth) {
      console.warn('Returning mock data for development')
      // TODO: replace with live data from Firestore
      const mockCohortRows: CohortRow[] = []

      // TODO: replace with live data filtering by source
      const filteredMockRows = mockCohortRows

      const mockTotalLeads = filteredMockRows.reduce(
        (sum, row) => sum + row.totalLeads,
        0
      )
      const mockWeightedRateSum = filteredMockRows.reduce(
        (sum, row) => sum + row.rate * row.totalLeads,
        0
      )
      const mockAverageRate =
        mockTotalLeads > 0 ? mockWeightedRateSum / mockTotalLeads : 0

      const mockSummary: CohortSummary = {
        meta: {
          from: from || null,
          to: to || null,
          weeks,
          source,
        },
        totals: {
          cohorts: filteredMockRows.length,
          leads: mockTotalLeads,
          averageRate: mockAverageRate,
        },
        rows: filteredMockRows,
      }

      return NextResponse.json(mockSummary)
    }

    // Build date range filters
    const now = new Date()
    const endDate = to ? new Date(to) : now
    const startDate = from
      ? new Date(from)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // Default 30 days

    // Query leads collection
    const leadsQuery = adminDb
      .collection('leads')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate))

    const leadsSnapshot = await leadsQuery.get()
    const leads = leadsSnapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })
    ) as Array<Record<string, unknown> & { id: string; createdAt?: Date }>

    // Filter leads by source if not "all"
    const filteredLeads =
      source === 'all'
        ? leads
        : leads.filter((lead) => determineSource(lead) === source)

    // Group leads by cohort week
    const cohortMap = new Map<
      string,
      Array<
        Record<string, unknown> & {
          id: string
          createdAt?: Date
          email?: string
        }
      >
    >()

    filteredLeads.forEach((lead) => {
      if (!lead.createdAt || !lead.email) return // Skip leads without email

      const cohortStart = startOfWeek(lead.createdAt)
      const cohortKey = cohortStart.toISOString()

      if (!cohortMap.has(cohortKey)) {
        cohortMap.set(cohortKey, [])
      }
      cohortMap.get(cohortKey)!.push(lead)
    })

    // Query quotes for conversion tracking
    const quotesQuery = adminDb
      .collection('quotes')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate))

    const quotesSnapshot = await quotesQuery.get()
    const quotes = quotesSnapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })
    ) as Array<
      Record<string, unknown> & {
        id: string
        createdAt?: Date
        email?: string
        leadId?: string
      }
    >

    // Build cohort rows
    const cohortRows: CohortRow[] = []
    let totalLeads = 0
    let weightedRateSum = 0

    for (const [cohortKey, cohortLeads] of cohortMap.entries()) {
      const cohortStart = new Date(cohortKey)
      const cohortLabel = formatCohortLabel(cohortStart)

      // Initialize week data
      const weekData: { [key: `week${number}`]: number } = {}
      for (let i = 0; i < weeks; i++) {
        weekData[`week${i}`] = 0
      }

      let cohortConversions = 0
      const leadEmails = new Set(cohortLeads.map((lead) => lead.email))

      // Count conversions for each week
      for (let weekOffset = 0; weekOffset < weeks; weekOffset++) {
        const weekStart = new Date(cohortStart)
        weekStart.setDate(weekStart.getDate() + weekOffset * 7)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

        const weekConversions = quotes.filter((quote) => {
          if (!quote.createdAt || (!quote.email && !quote.leadId)) return false

          const quoteDate = quote.createdAt
          if (quoteDate < weekStart || quoteDate >= weekEnd) return false

          // Match by email or leadId
          if (quote.email && leadEmails.has(quote.email)) return true
          if (
            quote.leadId &&
            cohortLeads.some((lead) => lead.id === quote.leadId)
          )
            return true

          return false
        }).length

        weekData[`week${weekOffset}`] = weekConversions
        cohortConversions += weekConversions
      }

      const cohortTotalLeads = cohortLeads.length
      const cohortRate =
        cohortTotalLeads > 0 ? cohortConversions / cohortTotalLeads : 0

      cohortRows.push({
        cohortLabel,
        cohortStartISO: cohortStart.toISOString(),
        totalLeads: cohortTotalLeads,
        totalConversions: cohortConversions,
        rate: cohortRate,
        ...weekData,
      })

      totalLeads += cohortTotalLeads
      weightedRateSum += cohortRate * cohortTotalLeads
    }

    // If no real data, return empty results
    if (cohortRows.length === 0) {
      const emptySummary: CohortSummary = {
        meta: {
          from: from || null,
          to: to || null,
          weeks,
          source,
        },
        totals: {
          cohorts: 0,
          leads: 0,
          averageRate: 0,
        },
        rows: [],
      }

      return NextResponse.json(emptySummary)
    }

    // Sort rows by cohort start date (newest first)
    cohortRows.sort(
      (a, b) =>
        new Date(b.cohortStartISO).getTime() -
        new Date(a.cohortStartISO).getTime()
    )

    // Calculate weighted average rate
    const averageRate = totalLeads > 0 ? weightedRateSum / totalLeads : 0

    const summary: CohortSummary = {
      meta: {
        from: from || null,
        to: to || null,
        weeks,
        source,
      },
      totals: {
        cohorts: cohortRows.length,
        leads: totalLeads,
        averageRate,
      },
      rows: cohortRows,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Cohort analysis error:', error)
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error)
    )
    return NextResponse.json(
      {
        error: 'Failed to fetch cohort data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
