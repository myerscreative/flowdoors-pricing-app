import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

interface CampaignMetrics {
  campaign: string
  source: string
  leads: number
  quotes: number
  orders: number
  revenue: number
  convRate: number
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

        // Check role permissions
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
    // const stage = searchParams.get("stage") as "visitors" | "leads" | "quotes" | "orders" | "revenue" || "leads";
    const source =
      (searchParams.get('source') as
        | 'all'
        | 'google'
        | 'facebook'
        | 'direct'
        | 'other') || 'all'

    // For development without valid auth, return mock data immediately
    if (!hasValidAuth) {
      console.warn('Returning mock funnel drilldown data for development')

      // TODO: replace with live data from Firestore
      const mockCampaignData: CampaignMetrics[] = []

      // Filter by source if specified
      const filteredData =
        source === 'all'
          ? mockCampaignData
          : mockCampaignData.filter((item) => item.source === source)

      // TODO: replace with live data processing by stage
      const adjustedData = filteredData

      return NextResponse.json(adjustedData)
    }

    // Real Firestore implementation would go here
    // For now, return empty array as we're using mock data
    return NextResponse.json([])
  } catch (error) {
    console.error('Funnel drilldown API error:', error)
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error)
    )
    return NextResponse.json(
      {
        error: 'Failed to fetch funnel drilldown data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
