'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  FileText,
  DollarSign,
  Target,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react'

import MetricCard from '@/components/marketing/MetricCard'
import KpiCard from '@/components/marketing/KpiCard'
import SourceCard from '@/components/marketing/SourceCard'
import RevenueBySourceChart from '@/components/marketing/RevenueBySourceChart'
import LeadsOverTimeChart from '@/components/marketing/LeadsOverTimeChart'
import ConversionFunnel from '@/components/marketing/ConversionFunnel'
import DrilldownModal from '@/components/marketing/DrilldownModal'
import { Skeleton } from '@/components/ui/skeleton'
import { exportMarketingSummary, exportFunnelData } from '@/lib/exportUtils'
import CustomerJourneyFunnel from '@/components/marketing/CustomerJourneyFunnel'
import { dataCache, createCacheKey } from '@/lib/dataCache'

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

  // Create customer journey funnel steps
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
        value: data.totals.amount,
        color: '#EF4444',
      },
    ]
  }, [marketingData])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Marketing Dashboard
          </h1>
          <p className="text-gray-600">Attribution and performance metrics</p>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-gray-500">
              Last updated: {mounted ? lastUpdated.toLocaleString() : ''}
            </p>
            {(isFetchingFresh || showStaleDataIndicator) && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {isFetchingFresh ? 'Updating...' : 'Cached data'}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center space-x-4">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customRange.from}
                onChange={(e) =>
                  setCustomRange({ ...customRange, from: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-2 py-2"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) =>
                  setCustomRange({ ...customRange, to: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-2 py-2"
              />
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
              <Skeleton key={source} className="h-40 rounded-lg" />
            )
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      {mounted && !isLoading ? (
        <ConversionFunnel steps={conversionFunnelSteps} />
      ) : (
        <div className="bg-gray-100 rounded-lg h-40 animate-pulse" />
      )}

      {/* Customer Journey Funnel */}
      <div className="mt-8">
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
          <div className="bg-gray-100 rounded-lg h-40 animate-pulse" />
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
