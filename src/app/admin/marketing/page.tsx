'use client'

import {
  Calendar,
  DollarSign,
  Download,
  FileText,
  RefreshCw,
  Target,
  Users
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import ConversionFunnel from '@/components/marketing/ConversionFunnel'
import CustomerJourneyFunnel from '@/components/marketing/CustomerJourneyFunnel'
import DrilldownModal from '@/components/marketing/DrilldownModal'
import KpiCard from '@/components/marketing/KpiCard'
import LeadsOverTimeChart from '@/components/marketing/LeadsOverTimeChart'
import MetricCard from '@/components/marketing/MetricCard'
import RevenueBySourceChart from '@/components/marketing/RevenueBySourceChart'
import SourceCard from '@/components/marketing/SourceCard'
import { Skeleton } from '@/components/ui/skeleton'
import { exportFunnelData, exportMarketingSummary } from '@/lib/exportUtils'

export default function MarketingPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize useMockData from localStorage, default to false (real data)
  const [useMockData, setUseMockData] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const stored = localStorage.getItem('useMockData')
      return stored === 'true'
    } catch {
      return false
    }
  })

  // Date range state
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [marketingData, setMarketingData] = useState<typeof mockData | null>(
    null
  )

  // Persist toggle state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('useMockData', String(useMockData))
    } catch (error) {
      console.error('Failed to save mock data preference:', error)
    }
  }, [useMockData])

  // Drilldown modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [drilldownData, setDrilldownData] = useState<
    Array<{
      campaign: string
      leads: number
      quotes: number
      revenue: number
      costPerLead?: number
    }>
  >([])
  const [drilldownTimeSeries, setDrilldownTimeSeries] = useState<
    Array<{ date: string; leads: number }>
  >([])

  useEffect(() => setMounted(true), [])

  // Calculate date range based on selected period
  const getDateRange = useCallback(() => {
    const now = new Date()
    const to = now.toISOString().split('T')[0]

    if (selectedPeriod === 'custom') {
      return { from: customRange.from, to: customRange.to }
    }

    const from = new Date()
    switch (selectedPeriod) {
      case '7d':
        from.setDate(now.getDate() - 7)
        break
      case '30d':
        from.setDate(now.getDate() - 30)
        break
      case '90d':
        from.setDate(now.getDate() - 90)
        break
      case '12m':
        from.setMonth(now.getMonth() - 12)
        break
      default:
        from.setDate(now.getDate() - 30)
    }

    return { from: from.toISOString().split('T')[0], to }
  }, [selectedPeriod, customRange.from, customRange.to])

  const mockData = useMemo(
    () => ({
      totals: {
        leads: 0,
        quotes: 0,
        orders: 0,
        revenue: 0,
        previousLeads: 0,
        previousQuotes: 0,
        previousRevenue: 0,
      },
      bySource: {
        google: {
          leads: 0,
          quotes: 0,
          orders: 0,
          revenue: 0,
          color: '#F4B400',
        },
        facebook: {
          leads: 0,
          quotes: 0,
          orders: 0,
          revenue: 0,
          color: '#1877F2',
        },
        direct: {
          leads: 0,
          quotes: 0,
          orders: 0,
          revenue: 0,
          color: '#10B981',
        },
        other: { leads: 0, quotes: 0, orders: 0, revenue: 0, color: '#6B7280' },
      },
    }),
    []
  )

  // Fetch marketing data from API
  const fetchMarketingData = useCallback(async () => {
    console.log('[Marketing Page] Starting data fetch...')
    console.log('[Marketing Page] useMockData:', useMockData)

    // If using mock data, just set it and return
    if (useMockData) {
      console.log('[Marketing Page] Using mock data (all zeros)')
      setMarketingData(mockData)
      setLastUpdated(new Date())
      return
    }

    // Otherwise fetch real data from API
    console.log('[Marketing Page] Fetching real data from API...')
    setIsLoading(true)
    try {
      const { from, to } = getDateRange()
      const url = `/api/marketing/summary?from=${from}&to=${to}`
      console.log('[Marketing Page] Fetching from:', url)

      const response = await fetch(url)
      console.log('[Marketing Page] Response status:', response.status)
      console.log('[Marketing Page] Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('[Marketing Page] ✓ Data received from API:', data)
        console.log('[Marketing Page] Totals:', {
          leads: data.totals?.leads,
          quotes: data.totals?.quotes,
          orders: data.totals?.orders,
          revenue: data.totals?.revenue,
        })
        console.log('[Marketing Page] By Source:', data.bySource)

        // ADD DETAILED DEBUG LOGGING
        console.log(
          '[Marketing Page] Full data structure:',
          JSON.stringify(data, null, 2)
        )
        console.log('[Marketing Page] Number of leads:', data.totals?.leads)
        console.log('[Marketing Page] Number of quotes:', data.totals?.quotes)
        console.log('[Marketing Page] By Source data:', data.bySource)
        console.log(
          '[Marketing Page] Sources with data:',
          Object.keys(data.bySource || {}).filter((key) => {
            const source = data.bySource[key]
            return source.leads > 0 || source.quotes > 0
          })
        )

        setMarketingData(data)
      } else {
        const errorText = await response.text()
        console.error('[Marketing Page] Failed to fetch marketing data')
        console.error('[Marketing Page] Response status:', response.status)
        console.error('[Marketing Page] Response body:', errorText)
        // When in real data mode, show zeros instead of falling back to mock
        setMarketingData(mockData)
      }
    } catch (error) {
      console.error('[Marketing Page] Error fetching marketing data:', error)
      console.error(
        '[Marketing Page] Error details:',
        error instanceof Error ? error.message : String(error)
      )
      // When in real data mode, show zeros instead of falling back to mock
      setMarketingData(mockData)
    } finally {
      setIsLoading(false)
      setLastUpdated(new Date())
      console.log('[Marketing Page] Fetch complete')
    }
  }, [getDateRange, mockData, useMockData])

  // Fetch data when date range changes or mock toggle changes
  useEffect(() => {
    if (mounted) {
      fetchMarketingData()
    }
  }, [
    selectedPeriod,
    customRange.from,
    customRange.to,
    useMockData,
    mounted,
    fetchMarketingData,
  ])

  const timeSeriesData = [
    // TODO: replace with live data from API
    { date: 'Week 1', google: 0, facebook: 0, direct: 0, other: 0 },
    { date: 'Week 2', google: 0, facebook: 0, direct: 0, other: 0 },
    { date: 'Week 3', google: 0, facebook: 0, direct: 0, other: 0 },
    { date: 'Week 4', google: 0, facebook: 0, direct: 0, other: 0 },
  ]

  // Use fetched data or fall back to mock data
  const data = marketingData || mockData

  const pieData = Object.entries(data.bySource).map(([key, sourceData]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: (sourceData as { revenue: number; color: string }).revenue,
    color: (sourceData as { revenue: number; color: string }).color,
  }))

  const refreshData = async () => {
    await fetchMarketingData()
  }

  // Fetch drilldown data for a specific source
  const fetchDrilldownData = useCallback(
    async (source: string) => {
      try {
        const { from, to } = getDateRange()
        const response = await fetch(
          `/api/marketing/summary?from=${from}&to=${to}&source=${source}`
        )
        if (response.ok) {
          const data = await response.json()
          setDrilldownData(data.campaigns || [])
          setDrilldownTimeSeries(data.timeSeries || [])
        } else {
          console.error('Failed to fetch drilldown data')
          // Fall back to mock data
          setDrilldownData(getMockDrilldownData())
          setDrilldownTimeSeries(getMockTimeSeriesData())
        }
      } catch (error) {
        console.error('Error fetching drilldown data:', error)
        // Fall back to mock data
        setDrilldownData(getMockDrilldownData())
        setDrilldownTimeSeries(getMockTimeSeriesData())
      }
    },
    [getDateRange]
  )

  // Mock drilldown data for demonstration
  const getMockDrilldownData = () => {
    // TODO: replace with live data from API
    return []
  }

  const getMockTimeSeriesData = () => {
    // TODO: replace with live data from API
    return [
      { date: 'Week 1', leads: 0 },
      { date: 'Week 2', leads: 0 },
      { date: 'Week 3', leads: 0 },
      { date: 'Week 4', leads: 0 },
    ]
  }

  // Generate sparkline data for each source
  const getSparklineData = () => {
    // TODO: replace with live data from API
    return []
  }

  // Handle source card click
  const handleSourceClick = async (source: string) => {
    setSelectedSource(source)
    setIsModalOpen(true)
    await fetchDrilldownData(source)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSource('')
    setDrilldownData([])
    setDrilldownTimeSeries([])
  }

  // Handle CSV export
  const handleExportCSV = () => {
    if (data) {
      const { from, to } = getDateRange()
      exportMarketingSummary(data.bySource, data.totals, { from, to })
    }
  }

  // Create conversion funnel steps (for ConversionFunnel component)
  const conversionFunnelSteps = useMemo(() => {
    if (!marketingData) return []

    const data = marketingData
    const totalAttempts = data.totals.leads + data.totals.quotes
    return [
      {
        label: 'Total Attempts',
        value: totalAttempts,
        color: '#3B82F6',
        width: '100%',
      },
      {
        label: 'Completed Quotes',
        value: data.totals.quotes,
        color: '#10B981',
        width:
          totalAttempts > 0
            ? `${((data.totals.quotes / totalAttempts) * 100).toFixed(1)}%`
            : '0%',
      },
      {
        label: 'Abandoned (Leads)',
        value: data.totals.leads,
        color: '#EF4444',
        width:
          totalAttempts > 0
            ? `${((data.totals.leads / totalAttempts) * 100).toFixed(1)}%`
            : '0%',
      },
    ]
  }, [marketingData])

  // Create customer journey funnel steps (for CustomerJourneyFunnel component)
  const customerJourneySteps = useMemo(() => {
    if (!marketingData) return []

    const data = marketingData
    const totalAttempts = data.totals.leads + data.totals.quotes
    return [
      {
        label: 'Website Visitors',
        value: Math.floor(totalAttempts * 15),
        color: '#3B82F6',
      },
      {
        label: 'Quote Attempts',
        value: totalAttempts,
        color: '#6366F1',
      },
      {
        label: 'Completed Quotes',
        value: data.totals.quotes,
        color: '#10B981',
      },
      {
        label: 'Orders Won',
        value: data.totals.orders,
        color: '#F59E0B',
      },
      {
        label: 'Revenue',
        value: data.totals.revenue,
        color: '#EF4444',
      },
    ]
  }, [marketingData])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Marketing Dashboard
        </h1>
        <p className="text-gray-600 mb-6">Attribution and performance metrics</p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-6">
              {/* Segmented Data Source Control */}
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setUseMockData(false)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    !useMockData
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Real Data
                </button>
                <button
                  onClick={() => setUseMockData(true)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    useMockData
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Test Data
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="12m">Last 12 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors group" 
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 group-hover:text-flowdoors-blue ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-flowdoors-blue hover:bg-flowdoors-blue-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {!useMockData && (
            <div className="px-4 py-2 bg-flowdoors-green-50 border-b border-flowdoors-green-200">
              <p className="text-xs text-flowdoors-green-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-flowdoors-green rounded-full"></span>
                Loading ONLY real data from Firestore
              </p>
            </div>
          )}
          {useMockData && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
              <p className="text-xs text-amber-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Showing mock/demo data for testing
              </p>
            </div>
          )}
        </div>
        
        {/* Custom Date Inputs */}
        {selectedPeriod === 'custom' && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customRange.from}
                onChange={(e) =>
                  setCustomRange({ ...customRange, from: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-flowdoors-blue focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) =>
                  setCustomRange({ ...customRange, to: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-flowdoors-blue focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mounted ? (
          <>
            <MetricCard
              title="Abandoned Leads"
              value={data.totals.leads}
              previousValue={data.totals.previousLeads}
              icon={Users}
            />
            <MetricCard
              title="Completed Quotes"
              value={data.totals.quotes}
              previousValue={data.totals.previousQuotes}
              icon={FileText}
            />
            <MetricCard
              title="Total Revenue"
              value={data.totals.revenue}
              previousValue={data.totals.previousRevenue}
              icon={DollarSign}
              format="currency"
            />
          </>
        ) : (
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        )}
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {mounted ? (
          <>
            <KpiCard
              title="Conversion Rate"
              value={
                data.totals.leads + data.totals.quotes > 0
                  ? `${((data.totals.quotes / (data.totals.leads + data.totals.quotes)) * 100).toFixed(1)}%`
                  : '0.0%'
              }
              icon={Target}
              colorClass="text-purple-600"
            />
            <KpiCard
              title="Avg Quote Value"
              value={
                data.totals.quotes > 0
                  ? `$${(data.totals.revenue / data.totals.quotes).toFixed(2)}`
                  : '$0.00'
              }
              icon={DollarSign}
              colorClass="text-green-600"
            />
            <KpiCard
              title="Cost Per Lead"
              value="--"
              icon={Users}
              colorClass="text-blue-600"
            />
            <KpiCard
              title="ROI"
              value="--"
              icon={RefreshCw}
              colorClass="text-orange-600"
            />
          </>
        ) : (
          <>
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {mounted ? (
          <>
            <RevenueBySourceChart data={pieData} />
            <LeadsOverTimeChart data={timeSeriesData} />
          </>
        ) : (
          <>
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </>
        )}
      </div>

      {/* Performance by Source */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Performance by Source
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(data.bySource).map(([source, sourceData]) =>
            mounted ? (
              <SourceCard
                key={source}
                source={source}
                data={
                  { ...sourceData, color: sourceData.color || '#6B7280' } as {
                    leads: number
                    quotes: number
                    revenue?: number
                    color: string
                  }
                }
                totalRevenue={data.totals.revenue}
                onClick={() => handleSourceClick(source)}
                sparklineData={getSparklineData()}
              />
            ) : (
              <Skeleton key={source} className="h-40 rounded-lg" />
            )
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      {mounted ? (
        <ConversionFunnel steps={conversionFunnelSteps} />
      ) : (
        <div className="bg-gray-100 rounded-lg h-40 animate-pulse" />
      )}

      {/* Customer Journey Funnel */}
      <div className="mt-8">
        {mounted ? (
          <CustomerJourneyFunnel
            steps={customerJourneySteps}
            dateRange={getDateRange()}
            onExport={() => {
              if (customerJourneySteps.length > 0) {
                const { from, to } = getDateRange()
                exportFunnelData(customerJourneySteps, { from, to })
              }
            }}
          />
        ) : (
          <div className="bg-gray-100 rounded-lg h-40 animate-pulse" />
        )}
      </div>

      {/* Drilldown Modal */}
      <DrilldownModal
        open={isModalOpen}
        onClose={handleCloseModal}
        source={selectedSource}
        data={drilldownData}
        timeSeriesData={drilldownTimeSeries}
        dateRange={getDateRange()}
      />
    </div>
  )
}
