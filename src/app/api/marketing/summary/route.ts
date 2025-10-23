import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

type AttributionSource = 'google' | 'facebook' | 'direct' | 'other'

interface SourceMetrics {
  leads: number
  quotes: number
  orders: number
  revenue: number
  color?: string
  previousLeads?: number
  previousQuotes?: number
  previousRevenue?: number
}

interface MarketingSummary {
  range: { from: string; to: string }
  bySource: Record<AttributionSource, SourceMetrics>
  totals: SourceMetrics
  campaigns?: Array<{
    campaign: string
    leads: number
    quotes: number
    revenue: number
    costPerLead?: number
  }>
  timeSeries?: Array<{
    date: string
    leads: number
  }>
}

// OPTIMIZATION: Only fetch fields we need (for future field selection)
// Note: Firestore Admin SDK doesn't support .select() in all environments
// These are documented here for reference when implementing field-level filtering
const _LEAD_FIELDS = [
  'createdAt',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'gclid',
  'fbclid',
  'referrer',
  'referer',
]

const _QUOTE_FIELDS = [
  'createdAt',
  'status',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'gclid',
  'fbclid',
  'referrer',
  'referer',
  'totals',
  'quoteAmount',
  'grandTotal',
  'total',
]

function determineSource(doc: Record<string, unknown>): AttributionSource {
  // Check for explicit UTM source first
  if (doc.utmSource && typeof doc.utmSource === 'string') {
    const source = doc.utmSource.toLowerCase()
    if (source.includes('google')) return 'google'
    if (source.includes('facebook')) return 'facebook'
    return 'other'
  }

  // Check for Google Click ID
  if (doc.gclid) return 'google'

  // Check for Facebook Click ID
  if (doc.fbclid) return 'facebook'

  // Check referrer
  const referrer = (doc.referrer || doc.referer || '') as string
  if (referrer.includes('google')) return 'google'
  if (referrer.includes('facebook')) return 'facebook'

  // Check if there's any referrer/UTM data
  if (referrer || doc.utmMedium || doc.utmCampaign) return 'other'

  // No attribution data = direct
  return 'direct'
}

function extractAmount(doc: Record<string, unknown>): number {
  // Try different amount fields that might exist
  if (doc.totals && typeof doc.totals === 'object' && doc.totals !== null) {
    const totals = doc.totals as Record<string, unknown>
    // Check for grandTotal first (most accurate)
    if (typeof totals.grandTotal === 'number') return totals.grandTotal
    // Fall back to subtotal
    if (typeof totals.subtotal === 'number') return totals.subtotal
    // Legacy fields
    if (typeof totals.totalCents === 'number') return totals.totalCents / 100
    if (typeof totals.total === 'number') return totals.total
  }
  // Top-level fields
  if (typeof doc.quoteAmount === 'number') return doc.quoteAmount
  if (typeof doc.grandTotal === 'number') return doc.grandTotal
  if (typeof doc.total === 'number') return doc.total
  return 0
}

function extractCampaign(doc: Record<string, unknown>): string {
  // Try different campaign fields
  if (doc.utmCampaign && typeof doc.utmCampaign === 'string') {
    return doc.utmCampaign
  }
  if (doc.campaign && typeof doc.campaign === 'string') {
    return doc.campaign
  }
  if (doc.campaignName && typeof doc.campaignName === 'string') {
    return doc.campaignName
  }
  return 'Unknown Campaign'
}

function generateTimeSeriesData(
  fromDate: Date,
  toDate: Date,
  quotesData: Array<{ createdAt: unknown }> = []
): Array<{ date: string; leads: number }> {
  // Generate weekly time series data
  const timeSeries: Array<{ date: string; leads: number }> = []
  const current = new Date(fromDate)

  while (current <= toDate) {
    const weekEnd = new Date(current)
    weekEnd.setDate(current.getDate() + 6)
    if (weekEnd > toDate) weekEnd.setTime(toDate.getTime())

    const weekStartStr = current.toISOString().split('T')[0]

    // Count quotes created in this week
    const weekLeads = quotesData.filter((quote) => {
      if (!quote.createdAt) return false

      let quoteDate: Date
      const createdAt = quote.createdAt as
        | Date
        | string
        | number
        | { toDate?: () => Date }

      if (
        createdAt &&
        typeof createdAt === 'object' &&
        'toDate' in createdAt &&
        typeof createdAt.toDate === 'function'
      ) {
        quoteDate = createdAt.toDate()
      } else if (createdAt instanceof Date) {
        quoteDate = createdAt
      } else if (
        typeof createdAt === 'string' ||
        typeof createdAt === 'number'
      ) {
        quoteDate = new Date(createdAt)
      } else {
        return false
      }

      return quoteDate >= current && quoteDate <= weekEnd
    }).length

    timeSeries.push({
      date: `Week of ${weekStartStr}`,
      leads: weekLeads,
    })

    current.setDate(current.getDate() + 7)
  }

  return timeSeries
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('[Marketing API] Starting data fetch...')

    // Verify ID token
    const authHeader = request.headers.get('authorization')
    let hasValidAuth = false

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)

        // Check role permissions
        const userRole = decodedToken.role as string
        if (
          userRole &&
          ['marketing', 'manager', 'administrator'].includes(userRole)
        ) {
          hasValidAuth = true
        }
      } catch {
        // Auth failed, proceed without auth for development
      }
    }

    console.log(
      '[Marketing API] Using centralized Firebase Admin (from firebase-admin.ts)'
    )

    // Check if environment variables are loaded
    console.log('[Marketing API] Checking environment...')
    console.log(
      '[Marketing API] FIREBASE_SERVICE_ACCOUNT_KEY exists:',
      !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    )
    console.log(
      '[Marketing API] FIREBASE_SERVICE_ACCOUNT_KEY length:',
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0
    )

    // Parse optional filtering params
    const url = new URL(request.url)
    const sp = url.searchParams
    const sourceParam = (sp.get('source') || 'all').toLowerCase() as
      | 'all'
      | AttributionSource

    const fromParam = sp.get('from') // YYYY-MM-DD or empty for "all time"
    const toParam = sp.get('to') // YYYY-MM-DD or empty for "all time"

    // OPTIMIZATION: Add limit parameter (default to reasonable limit)
    const limitParam = parseInt(sp.get('limit') || '1000', 10)
    const maxLimit = Math.min(limitParam, 10000) // Cap at 10k for safety

    // If no date params provided, query all time (faster, no date filter)
    const useAllTime = !fromParam && !toParam
    const now = new Date()
    const fromDate = fromParam
      ? new Date(`${fromParam}T00:00:00.000Z`)
      : new Date(0) // epoch if all time
    const toDate = toParam ? new Date(`${toParam}T23:59:59.999Z`) : now
    const fromTs = useAllTime
      ? null
      : admin.firestore.Timestamp.fromDate(fromDate)
    const toTs = useAllTime ? null : admin.firestore.Timestamp.fromDate(toDate)

    // For development, proceed with real data even without auth
    if (!hasValidAuth) {
      console.warn(
        'No valid auth provided, proceeding with real data for development'
      )
    }

    // Initialize metrics with colors matching the marketing page
    const sourceMetrics: Record<AttributionSource, SourceMetrics> = {
      google: { leads: 0, quotes: 0, orders: 0, revenue: 0, color: '#F4B400' },
      facebook: {
        leads: 0,
        quotes: 0,
        orders: 0,
        revenue: 0,
        color: '#1877F2',
      },
      direct: { leads: 0, quotes: 0, orders: 0, revenue: 0, color: '#10B981' },
      other: { leads: 0, quotes: 0, orders: 0, revenue: 0, color: '#6B7280' },
    }

    // OPTIMIZATION: Parallel data fetching with Promise.all
    console.log(
      '[Marketing API] Starting parallel fetch of leads and quotes...'
    )
    const [leadsSnapshot, quotesSnapshot] = await Promise.all([
      // Leads query
      (async () => {
        try {
          let leadsQuery: FirebaseFirestore.Query = adminDb.collection('leads')

          // Add date filters if specified
          if (!useAllTime && fromTs && toTs) {
            leadsQuery = leadsQuery
              .where('createdAt', '>=', fromTs)
              .where('createdAt', '<=', toTs)
          }

          // OPTIMIZATION: Add limit to prevent over-fetching
          leadsQuery = leadsQuery.orderBy('createdAt', 'desc').limit(maxLimit)

          // OPTIMIZATION: Use select() to fetch only needed fields
          // Note: Firestore select() is not fully supported in all SDKs
          // If available, uncomment this:
          // leadsQuery = leadsQuery.select(...LEAD_FIELDS)

          const snapshot = await leadsQuery.get()
          console.log(
            `[Marketing API] ✓ Fetched ${snapshot.docs.length} leads in ${Date.now() - startTime}ms`
          )
          return snapshot
        } catch (error) {
          console.error('[Marketing API] Error fetching leads:', error)
          // Return empty result set
          return {
            docs: [],
            size: 0,
            empty: true,
          } as unknown as FirebaseFirestore.QuerySnapshot
        }
      })(),
      // Quotes query
      (async () => {
        try {
          let quotesQuery: FirebaseFirestore.Query =
            adminDb.collection('quotes')

          // Add date filters if specified
          if (!useAllTime && fromTs && toTs) {
            quotesQuery = quotesQuery
              .where('createdAt', '>=', fromTs)
              .where('createdAt', '<=', toTs)
          }

          // OPTIMIZATION: Add limit to prevent over-fetching
          quotesQuery = quotesQuery.orderBy('createdAt', 'desc').limit(maxLimit)

          // OPTIMIZATION: Use select() to fetch only needed fields
          // Note: Firestore select() is not fully supported in all SDKs
          // If available, uncomment this:
          // quotesQuery = quotesQuery.select(...QUOTE_FIELDS)

          const snapshot = await quotesQuery.get()
          console.log(
            `[Marketing API] ✓ Fetched ${snapshot.docs.length} quotes in ${Date.now() - startTime}ms`
          )
          return snapshot
        } catch (error) {
          console.error('[Marketing API] Error fetching quotes:', error)
          // Return empty result set
          return {
            docs: [],
            size: 0,
            empty: true,
          } as unknown as FirebaseFirestore.QuerySnapshot
        }
      })(),
    ])

    console.log('[Marketing API] Parallel fetch complete. Processing data...')

    // ADD DETAILED DEBUG LOGGING FOR QUOTES
    console.log(
      '[Marketing API] Total quotes in Firestore:',
      quotesSnapshot.size
    )
    console.log('[Marketing API] Total leads in Firestore:', leadsSnapshot.size)

    if (quotesSnapshot.size > 0) {
      const firstQuoteData = quotesSnapshot.docs[0].data()
      console.log(
        '[Marketing API] Sample quote data (first quote):',
        firstQuoteData
      )
      console.log('[Marketing API] Attribution fields in first quote:', {
        utm_source: firstQuoteData?.utm_source,
        utmSource: firstQuoteData?.utmSource,
        utm_medium: firstQuoteData?.utm_medium,
        utmMedium: firstQuoteData?.utmMedium,
        gclid: firstQuoteData?.gclid,
        fbclid: firstQuoteData?.fbclid,
        referrer: firstQuoteData?.referrer,
        referer: firstQuoteData?.referer,
      })

      // Check how many quotes have ANY attribution
      const quotesWithAttribution = quotesSnapshot.docs.filter((doc) => {
        const q = doc.data()
        return (
          q.utm_source ||
          q.utmSource ||
          q.utm_medium ||
          q.utmMedium ||
          q.gclid ||
          q.fbclid ||
          q.referrer ||
          q.referer
        )
      })
      console.log(
        '[Marketing API] Quotes with attribution data:',
        quotesWithAttribution.length
      )
      console.log(
        '[Marketing API] Quotes without attribution:',
        quotesSnapshot.size - quotesWithAttribution.length
      )

      // Show a sample of quotes with attribution
      if (quotesWithAttribution.length > 0) {
        const sampleWithAttribution = quotesWithAttribution[0].data()
        console.log(
          '[Marketing API] Sample quote WITH attribution:',
          sampleWithAttribution
        )
      }
    }

    // Process leads
    leadsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const source = determineSource(data)
      if (sourceParam !== 'all' && source !== sourceParam) return
      sourceMetrics[source].leads++
    })

    // Process quotes and collect time series data
    const allQuotes: Array<{ createdAt: unknown }> = []

    quotesSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const source = determineSource(data)
      if (sourceParam !== 'all' && source !== sourceParam) return

      sourceMetrics[source].quotes++
      allQuotes.push({ createdAt: data.createdAt })

      // Count orders (quotes with status 'won', 'completed', 'approved', or similar)
      const status = data.status?.toString().toLowerCase()
      if (
        status &&
        ['won', 'completed', 'approved', 'confirmed', 'accepted'].includes(
          status
        )
      ) {
        sourceMetrics[source].orders++
        const amount = extractAmount(data)
        sourceMetrics[source].revenue += amount
      }
    })

    // Calculate totals
    const totals: SourceMetrics = {
      leads: Object.values(sourceMetrics).reduce(
        (sum, metrics) => sum + metrics.leads,
        0
      ),
      quotes: Object.values(sourceMetrics).reduce(
        (sum, metrics) => sum + metrics.quotes,
        0
      ),
      orders: Object.values(sourceMetrics).reduce(
        (sum, metrics) => sum + metrics.orders,
        0
      ),
      revenue: Object.values(sourceMetrics).reduce(
        (sum, metrics) => sum + metrics.revenue,
        0
      ),
      // TODO: Implement previous period comparison
      previousLeads: 0,
      previousQuotes: 0,
      previousRevenue: 0,
    }

    const queryTime = Date.now() - startTime
    console.log(
      `[Marketing API] Total processing time: ${queryTime}ms | Returning: ${totals.leads} leads, ${totals.quotes} quotes, ${totals.orders} orders, $${totals.revenue} revenue`
    )

    console.log('[Marketing API] Source breakdown:', {
      google: sourceMetrics.google,
      facebook: sourceMetrics.facebook,
      direct: sourceMetrics.direct,
      other: sourceMetrics.other,
    })

    const summary: MarketingSummary = {
      range: { from: fromDate.toISOString(), to: toDate.toISOString() },
      bySource: sourceMetrics,
      totals,
      timeSeries: generateTimeSeriesData(fromDate, toDate, allQuotes),
    }

    console.log('[Marketing API] Summary generated successfully:', summary)

    // OPTIMIZATION: Only fetch drilldown data if specifically requested
    // This reduces initial page load time
    if (sourceParam !== 'all') {
      const campaignMetrics = new Map<
        string,
        { leads: number; quotes: number; revenue: number }
      >()

      // Re-use already fetched data instead of making new queries
      leadsSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const source = determineSource(data)
        if (source === sourceParam) {
          const campaign = extractCampaign(data)
          if (!campaignMetrics.has(campaign)) {
            campaignMetrics.set(campaign, { leads: 0, quotes: 0, revenue: 0 })
          }
          campaignMetrics.get(campaign)!.leads++
        }
      })

      quotesSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const source = determineSource(data)
        if (source === sourceParam) {
          const campaign = extractCampaign(data)
          if (!campaignMetrics.has(campaign)) {
            campaignMetrics.set(campaign, { leads: 0, quotes: 0, revenue: 0 })
          }
          campaignMetrics.get(campaign)!.quotes++

          const status = data.status?.toString().toLowerCase()
          if (
            status &&
            ['won', 'completed', 'approved', 'confirmed', 'accepted'].includes(
              status
            )
          ) {
            const amount = extractAmount(data)
            campaignMetrics.get(campaign)!.revenue += amount
          }
        }
      })

      const campaigns = Array.from(campaignMetrics.entries()).map(
        ([campaign, metrics]) => ({
          campaign,
          leads: metrics.leads,
          quotes: metrics.quotes,
          revenue: metrics.revenue,
          costPerLead: 0,
        })
      )

      summary.campaigns = campaigns
    }

    // Add performance headers for monitoring
    const response = NextResponse.json(summary)
    response.headers.set('X-Query-Time', queryTime.toString())
    response.headers.set('X-Cache-Control', 'private, max-age=3600')

    return response
  } catch (error) {
    console.error('[Marketing API] Fatal error:', error)
    console.error(
      '[Marketing API] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    )
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
