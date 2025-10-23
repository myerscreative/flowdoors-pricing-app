'use client'

import {
  Calendar,
  DollarSign,
  Download,
  FileText,
  RefreshCw,
  Target,
  Users,
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
import { createCacheKey, dataCache } from '@/lib/dataCache'
import { exportFunnelData, exportMarketingSummary } from '@/lib/exportUtils'

// Cache TTL: 1 hour (can be adjusted based on needs)
const CACHE_TTL = 60 * 60 * 1000

export default function MarketingPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingFresh, setIsFetchingFresh] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showStaleDataIndicator, setShowStaleDataIndicator] = useState(false)

  // Date range state
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [marketingData, setMarketingData] = useState<typeof mockData | null>(
    null
  )

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
  const [isDrilldownLoading, setIsDrilldownLoading] = useState(false)

  useEffect(() => setMounted(true), [])

  // Calculate date range based on selected period
  const getDateRange = useCallback(() => {
    const now = new Date()
    const to = now.toISOString().split('T')[0]

    if (selectedPeriod === 'custom') {
      return { from: customRange.from, to: customRange.to }
    }

    if (selectedPeriod === 'all') {
      // Return empty strings to indicate "all time"
      return { from: '', to: '' }
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
        leads: 145,
        quotes: 42,
        orders: 18,
        amount: 28500,
        previousLeads: 128,
        previousQuotes: 38,
        previousRevenue: 24200,
      },
      bySource: {
        google: { leads: 68, quotes: 22, revenue: 15800, color: '#F4B400' },
        facebook: { leads: 35, quotes: 12, revenue: 8200, color: '#1877F2' },
        direct: { leads: 28, quotes: 6, revenue: 3200, color: '#10B981' },
        other: { leads: 14, quotes: 2, revenue: 1300, color: '#6B7280' },
      },
    }),
    []
  )

  // Fetch marketing data with caching
  const fetchMarketingData = useCallback(
    async (forceRefresh = false) => {
      const { from, to } = getDateRange()
      const cacheKey = createCacheKey('marketing_summary', {
        from: from || 'all',
        to: to || 'all',
      })

      // Try to get cached data first (only if not force refresh)
      if (!forceRefresh) {
        const cachedData = dataCache.get<typeof mockData>(cacheKey, CACHE_TTL)
        if (cachedData) {
          console.warn('Marketing Dashboard: Using cached data')
          setMarketingData(cachedData)
          setShowStaleDataIndicator(true)
          // Fetch fresh data in background
          setIsFetchingFresh(true)
        } else {
          // No cache, show loading state
          setIsLoading(true)
        }
      } else {
        // Force refresh - show loading
        setIsLoading(true)
        setShowStaleDataIndicator(false)
      }

      try {
        const startTime = performance.now()
        console.warn('Marketing Dashboard: Fetching data for range:', {
          from,
          to,
        })

        const response = await fetch(
          `/api/marketing/summary?from=${from}&to=${to}`
        )

        const fetchTime = performance.now() - startTime
        console.warn(
          `Marketing Dashboard: API response in ${fetchTime.toFixed(0)}ms, status: ${response.status}`
        )

        if (response.ok) {
          const data = await response.json()
          console.warn('Marketing Dashboard: Received data:', data)

          // Cache the fresh data
          dataCache.set(cacheKey, data)
          setMarketingData(data)
          setLastUpdated(new Date())
          setShowStaleDataIndicator(false)
        } else {
          console.error(
            'Failed to fetch marketing data, status:',
            response.status
          )
          // If we have cached data, keep it; otherwise fall back to mock
          if (!marketingData) {
            setMarketingData(mockData)
          }
        }
      } catch (error) {
        console.error('Error fetching marketing data:', error)
        // If we have cached data, keep it; otherwise fall back to mock
        if (!marketingData) {
          setMarketingData(mockData)
        }
      } finally {
        setIsLoading(false)
        setIsFetchingFresh(false)
      }
    },
    [getDateRange, mockData, marketingData]
  )

  // Fetch data when date range changes
  useEffect(() => {
    if (mounted) {
      fetchMarketingData()
    }
  }, [
    selectedPeriod,
    customRange.from,
    customRange.to,
    mounted,
    fetchMarketingData,
  ])

  const timeSeriesData = [
    { date: 'Week 1', google: 12, facebook: 8, direct: 5, other: 2 },
    { date: 'Week 2', google: 18, facebook: 6, direct: 7, other: 4 },
    { date: 'Week 3', google: 15, facebook: 12, direct: 8, other: 3 },
    { date: 'Week 4', google: 23, facebook: 9, direct: 8, other: 5 },
  ]

  // Use fetched data or fall back to mock data
  const data = marketingData || mockData

  const pieData = Object.entries(data.bySource).map(([key, sourceData]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: (sourceData as { revenue: number; color: string }).revenue,
    color: (sourceData as { revenue: number; color: string }).color,
  }))

  const refreshData = async () => {
    await fetchMarketingData(true) // Force refresh
  }

  // OPTIMIZATION: Lazy load drilldown data only when modal is opened
  const fetchDrilldownData = useCallback(
    async (source: string) => {
      setIsDrilldownLoading(true)
      const { from, to } = getDateRange()
      const cacheKey = createCacheKey('marketing_drilldown', {
        source,
        from: from || 'all',
        to: to || 'all',
      })

      // Try cache first
      const cached = dataCache.get<{
        campaigns: typeof drilldownData
        timeSeries: typeof drilldownTimeSeries
      }>(cacheKey, CACHE_TTL)

      if (cached) {
        console.warn('Using cached drilldown data for', source)
        setDrilldownData(cached.campaigns || [])
        setDrilldownTimeSeries(cached.timeSeries || [])
        setIsDrilldownLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/marketing/summary?from=${from}&to=${to}&source=${source}`
        )
        if (response.ok) {
          const data = await response.json()
          const drilldown = {
            campaigns: data.campaigns || [],
            timeSeries: data.timeSeries || [],
          }

          // Cache drilldown data
          dataCache.set(cacheKey, drilldown)

          setDrilldownData(drilldown.campaigns)
          setDrilldownTimeSeries(drilldown.timeSeries)
        } else {
          console.error('Failed to fetch drilldown data')
          setDrilldownData(getMockDrilldownData())
          setDrilldownTimeSeries(getMockTimeSeriesData())
        }
      } catch (error) {
        console.error('Error fetching drilldown data:', error)
        setDrilldownData(getMockDrilldownData())
        setDrilldownTimeSeries(getMockTimeSeriesData())
      } finally {
        setIsDrilldownLoading(false)
      }
    },
    [getDateRange]
  )

  // Mock drilldown data for demonstration
  const getMockDrilldownData = () => {
    return []
  }

  const getMockTimeSeriesData = () => {
    return [
      { date: 'Week 1', leads: 0 },
      { date: 'Week 2', leads: 0 },
      { date: 'Week 3', leads: 0 },
      { date: 'Week 4', leads: 0 },
    ]
  }

  // Generate sparkline data for each source
  const getSparklineData = () => {
    return []
  }

  // Handle source card click
  const handleSourceClick = async (source: string) => {
    setSelectedSource(source)
    setIsModalOpen(true)
    // Lazy load drilldown data
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
      exportMarketingSummary(
        data.bySource,
        { ...data.totals, revenue: data.totals.amount },
        { from, to }
      )
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
        color: '#00aeef',
        width: '100%',
      },
      {
        label: 'Completed Quotes',
        value: data.totals.quotes,
        color: '#8dc63f',
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

  // Create customer journey funnel steps
  const customerJourneySteps = useMemo(() => {
    if (!marketingData) return []

    const data = marketingData
    const totalAttempts = data.totals.leads + data.totals.quotes
    return [
      {
        label: 'Website Visitors',
        value: Math.floor(totalAttempts * 15),
        color: '#00aeef',
      },
      {
        label: 'Quote Attempts',
        value: totalAttempts,
        color: '#6366F1',
      },
      {
        label: 'Completed Quotes',
        value: data.totals.quotes,
        color: '#8dc63f',
      },
      {
        label: 'Orders Won',
        value: data.totals.orders,
        color: '#F59E0B',
      },
      {
        label: 'Revenue',
        value: data.totals.amount,
        color: '#2e2e2e',
      },
    ]
  }, [marketingData])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500 rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Marketing Dashboard
            </h1>
            <p className="text-flowdoors-blue-100 mt-1">Attribution and performance metrics</p>
            <div className="flex items-center space-x-2 mt-3">
              <p className="text-sm text-flowdoors-blue-100">
                Last updated: {mounted ? lastUpdated.toLocaleString() : ''}
              </p>
              {(isFetchingFresh || showStaleDataIndicator) && (
                <span className="text-xs text-flowdoors-blue-900 bg-white/90 px-2 py-1 rounded-full font-medium">
                  {isFetchingFresh ? 'Updating...' : 'Cached data'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-white" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white border-none focus:ring-0 focus:outline-none cursor-pointer font-medium"
              >
                <option value="all" className="text-gray-900">All Time</option>
                <option value="7d" className="text-gray-900">Last 7 Days</option>
                <option value="30d" className="text-gray-900">Last 30 Days</option>
                <option value="90d" className="text-gray-900">Last 90 Days</option>
                <option value="12m" className="text-gray-900">Last 12 Months</option>
                <option value="custom" className="text-gray-900">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Inputs */}
            {selectedPeriod === 'custom' && (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <input
                  type="date"
                  value={customRange.from}
                  onChange={(e) =>
                    setCustomRange({ ...customRange, from: e.target.value })
                  }
                  className="bg-transparent text-white border-none focus:ring-0 focus:outline-none text-sm"
                />
                <span className="text-white">to</span>
                <input
                  type="date"
                  value={customRange.to}
                  onChange={(e) =>
                    setCustomRange({ ...customRange, to: e.target.value })
                  }
                  className="bg-transparent text-white border-none focus:ring-0 focus:outline-none text-sm"
                />
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all font-medium"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-flowdoors-green-500 text-white rounded-lg hover:bg-flowdoors-green-600 shadow-lg transition-all font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics - Enhanced loading states */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mounted && !isLoading ? (
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
              value={data.totals.amount}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {mounted && !isLoading ? (
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
                  ? `$${(data.totals.amount / data.totals.quotes).toFixed(2)}`
                  : '$0.00'
              }
              icon={DollarSign}
              colorClass="text-flowdoors-green-600"
            />
            <KpiCard
              title="Cost Per Lead"
              value="--"
              icon={Users}
              colorClass="text-flowdoors-blue-600"
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
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {mounted && !isLoading ? (
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
        <h3 className="text-2xl font-bold text-flowdoors-charcoal-800 mb-6">
          Performance by Source
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(data.bySource).map(([source, sourceData]) =>
            mounted && !isLoading ? (
              <SourceCard
                key={source}
                source={source}
                data={
                  { ...sourceData, color: sourceData.color || '#6B7280' } as {
                    leads: number
                    quotes: number
                    revenue?: number
                    amount?: number
                    color: string
                  }
                }
                totalRevenue={data.totals.amount}
                onClick={() => handleSourceClick(source)}
                sparklineData={getSparklineData()}
              />
            ) : (
              <Skeleton key={source} className="h-48 rounded-xl" />
            )
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="mb-8">
        {mounted && !isLoading ? (
          <ConversionFunnel steps={conversionFunnelSteps} />
        ) : (
          <Skeleton className="h-64 rounded-xl" />
        )}
      </div>

      {/* Customer Journey Funnel */}
      <div>
        {mounted && !isLoading ? (
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
          <Skeleton className="h-96 rounded-xl" />
        )}
      </div>

      {/* Drilldown Modal with lazy loading indicator */}
      <DrilldownModal
        open={isModalOpen}
        onClose={handleCloseModal}
        source={selectedSource}
        data={drilldownData}
        timeSeriesData={drilldownTimeSeries}
        dateRange={getDateRange()}
      />
      {isDrilldownLoading && isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </div>
      )}
    </div>
  )
}
