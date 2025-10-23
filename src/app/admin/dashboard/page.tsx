'use client'

import { useToast } from '@/hooks/use-toast'
import {
  AlertCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ActivityItem {
  id: string | number
  text: string
  time: string
  color: string
}

interface DashboardData {
  totalLeads: number
  totalOrders: number
  totalQuotes: number
  totalRevenue: number
  pendingOrders: number
  conversionRate: number
  averageOrderVolume: number
  recentActivity: ActivityItem[]
}


export default function AdminDashboard() {
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

  const [loading, setLoading] = useState(true)
  const [realData, setRealData] = useState<DashboardData>({
    totalLeads: 0,
    totalOrders: 0,
    totalQuotes: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    conversionRate: 0,
    averageOrderVolume: 0,
    recentActivity: [],
  })
  const { toast } = useToast()
  const router = useRouter()

  // Persist toggle state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('useMockData', String(useMockData))
    } catch (error) {
      console.error('Failed to save mock data preference:', error)
    }
  }, [useMockData])

  // Mock data (placeholder/demo data)
  const mockData: DashboardData = {
    totalLeads: 1,
    totalOrders: 156,
    totalQuotes: 6,
    totalRevenue: 125000,
    pendingOrders: 12,
    conversionRate: 66.7,
    averageOrderVolume: 801.28,
    recentActivity: [
      {
        id: 1,
        text: 'New quote submitted',
        time: '2 minutes ago',
        color: 'bg-green-500',
      },
      {
        id: 2,
        text: 'Order #1234 completed',
        time: '15 minutes ago',
        color: 'bg-blue-500',
      },
      {
        id: 3,
        text: 'Payment pending for order #1235',
        time: '1 hour ago',
        color: 'bg-yellow-500',
      },
    ],
  }

  // Fetch real data from Firestore
  useEffect(() => {
    async function fetchRealData() {
      setLoading(true)
      try {
        // Dynamically import the services
        const { getQuotes } = await import('@/services/quoteService')
        const { orderService } = await import('@/services/orderService')
        const { getLeads } = await import('@/services/leadService')

        // Fetch data from Firestore
        const [quotes, orders, leads] = await Promise.all([
          getQuotes(),
          orderService.getOrders(),
          getLeads(),
        ])

        // Calculate metrics
        const totalLeads = leads.length
        const totalQuotes = quotes.length

        // Count orders by status
        const pendingOrders = orders.filter(
          (order) =>
            order.status === 'pending' || order.status === 'in_progress'
        ).length
        const totalOrders = orders.length

        // Calculate total revenue from orders (only actual orders count as revenue)
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = order.amount ?? order.orderAmount ?? 0
          return sum + (typeof amount === 'number' ? amount : 0)
        }, 0)

        // Calculate conversion rate (orders / quotes * 100)
        const conversionRate = totalQuotes > 0 ? (totalOrders / totalQuotes) * 100 : 0

        // Calculate average order volume (total revenue / total orders)
        const averageOrderVolume = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Generate recent activity from quotes
        const sortedQuotes = [...quotes].sort((a, b) => {
          const aTyped = a as {
            createdAt?: Date | string
            updatedAt?: Date | string
          }
          const bTyped = b as {
            createdAt?: Date | string
            updatedAt?: Date | string
          }
          const dateA = aTyped.createdAt ?? aTyped.updatedAt
          const dateB = bTyped.createdAt ?? bTyped.updatedAt
          const timeA = dateA ? new Date(dateA).getTime() : 0
          const timeB = dateB ? new Date(dateB).getTime() : 0
          return timeB - timeA
        })

        const recentActivity: ActivityItem[] = sortedQuotes
          .slice(0, 5)
          .map((quote, index) => {
            const quoteTyped = quote as {
              id?: string
              quote_number?: string
              quoteNumber?: string | number
              customer?: { firstName?: string; lastName?: string }
              firstName?: string
              lastName?: string
              status?: string
              createdAt?: Date | string
              updatedAt?: Date | string
            }

            const quoteNum =
              quoteTyped.quote_number ?? quoteTyped.quoteNumber ?? 'N/A'

            const customerName = quoteTyped.customer?.firstName
              ? `${quoteTyped.customer.firstName} ${quoteTyped.customer.lastName || ''}`
              : quoteTyped.firstName
                ? `${quoteTyped.firstName} ${quoteTyped.lastName || ''}`
                : 'Unknown Customer'

            const createdAt = quoteTyped.createdAt ?? quoteTyped.updatedAt
            const timeAgo = createdAt
              ? getTimeAgo(new Date(createdAt))
              : 'Recently'

            const statusColor =
              quoteTyped.status === 'New'
                ? 'bg-green-500'
                : quoteTyped.status === 'Hot'
                  ? 'bg-red-500'
                  : quoteTyped.status === 'Warm'
                    ? 'bg-orange-500'
                    : 'bg-blue-500'

            return {
              id: quoteTyped.id ?? index,
              text: `Quote ${quoteNum} created for ${customerName}`,
              time: timeAgo,
              color: statusColor,
            }
          })

        setRealData({
          totalLeads,
          totalOrders,
          totalQuotes,
          totalRevenue: Math.round(totalRevenue),
          pendingOrders,
          conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal place
          averageOrderVolume: Math.round(averageOrderVolume * 100) / 100, // Round to 2 decimal places
          recentActivity,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        toast({
          title: 'Error Loading Dashboard Data',
          description: errorMessage,
          variant: 'destructive',
        })
        // Keep zeros if fetch fails
      } finally {
        setLoading(false)
      }
    }

    fetchRealData()
  }, [toast])

  // Helper function to calculate time ago
  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) !== 1 ? 's' : ''} ago`
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) !== 1 ? 's' : ''} ago`
    if (seconds < 604800)
      return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Select data source based on toggle
  const data = useMockData ? mockData : realData

  // Quick action handlers
  const handleViewOrders = () => {
    router.push('/admin/orders')
  }

  const handleManageUsers = () => {
    router.push('/admin/users')
  }

  const handleGenerateReport = () => {
    try {
      // Create report data
      const reportData = {
        generatedAt: new Date().toLocaleString(),
        dataSource: useMockData ? 'Mock Data' : 'Real Data',
        metrics: {
          totalLeads: data.totalLeads,
          totalOrders: data.totalOrders,
          totalQuotes: data.totalQuotes,
          totalRevenue: data.totalRevenue,
          pendingOrders: data.pendingOrders,
          conversionRate: data.conversionRate,
          averageOrderVolume: data.averageOrderVolume,
        },
        recentActivity: data.recentActivity,
      }

      // Create CSV content
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Leads', data.totalLeads],
        ['Total Orders', data.totalOrders],
        ['Total Quotes', data.totalQuotes],
        ['Total Quote Value', `$${data.totalRevenue.toLocaleString()}`],
        ['Pending Orders', data.pendingOrders],
        ['Conversion Rate', `${data.conversionRate}%`],
        ['Average Order Volume', `$${data.averageOrderVolume.toLocaleString()}`],
        ['Data Source', useMockData ? 'Mock Data' : 'Real Data'],
        ['Generated At', new Date().toLocaleString()],
        [''],
        ['Recent Activity'],
        ['Activity', 'Time'],
        ...data.recentActivity.map((activity) => [
          activity.text,
          activity.time,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `admin-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Report Generated',
        description: 'Dashboard report has been downloaded successfully.',
      })

      // Log the report data for debugging
      console.warn('Dashboard Report Generated:', reportData)
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: 'Report Generation Failed',
        description:
          'There was an error generating the report. Please try again.',
        variant: 'destructive',
      })
    }
  }


  return (
    <div>
      {/* Header with Toggle */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-flowdoors-charcoal mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your business metrics and recent activity
          </p>
        </div>

        {/* Data Source Toggle */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-flowdoors-charcoal">
              Data Source:
            </span>
            <button
              onClick={() => setUseMockData(!useMockData)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useMockData ? 'bg-gray-400' : 'bg-flowdoors-blue'
              }`}
              aria-label={`Switch to ${useMockData ? 'real' : 'mock'} data`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useMockData ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${useMockData ? 'text-gray-500' : 'text-flowdoors-blue'}`}
            >
              {useMockData ? 'Mock Data' : 'Real Data'}
            </span>
          </div>
          {!useMockData && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-flowdoors-green" />
              <p className="text-xs font-medium text-flowdoors-green-700">
                Loading ONLY real data from Firestore
              </p>
            </div>
          )}
          {useMockData && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-amber-700">
                Showing mock/demo data for testing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Single unified grid for perfect alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Row 1: 4 Metric Cards */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  data.totalLeads
                )}
              </p>
            </div>
            <div className="bg-flowdoors-blue bg-opacity-10 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-flowdoors-blue" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Quotes</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  data.totalQuotes
                )}
              </p>
            </div>
            <div className="bg-flowdoors-green bg-opacity-10 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-flowdoors-green" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Quote Value</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  `$${data.totalRevenue.toLocaleString()}`
                )}
              </p>
            </div>
            <div className="bg-flowdoors-blue-600 bg-opacity-10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-flowdoors-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending Orders</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  data.pendingOrders
                )}
              </p>
            </div>
            <div className="bg-amber-500 bg-opacity-10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Row 2: 3 Metric Cards */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  data.totalOrders
                )}
              </p>
            </div>
            <div className="bg-flowdoors-charcoal bg-opacity-10 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-flowdoors-charcoal" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Conversion Rate</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  `${data.conversionRate}%`
                )}
              </p>
            </div>
            <div className="bg-flowdoors-green-600 bg-opacity-10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-flowdoors-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Average Order Volume</p>
              <p className="text-3xl font-bold text-flowdoors-charcoal">
                {loading && !useMockData ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  `$${data.averageOrderVolume.toLocaleString()}`
                )}
              </p>
            </div>
            <div className="bg-flowdoors-blue-700 bg-opacity-10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-flowdoors-blue-700" />
            </div>
          </div>
        </div>

        {/* Empty cell to maintain grid alignment */}
        <div></div>

        {/* Row 3: Content panels that span across columns */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-flowdoors-charcoal mb-4">
            Recent Activity
          </h2>
          {loading && !useMockData ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flowdoors-blue"></div>
              <p className="text-gray-500 mt-2">Loading activity...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div
                      className={`${activity.color} w-2 h-2 rounded-full mt-2`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-flowdoors-charcoal font-medium">
                        {activity.text}
                      </p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-flowdoors-charcoal mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleViewOrders}
              className="w-full bg-flowdoors-blue hover:bg-flowdoors-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              View All Orders
            </button>
            <button
              onClick={handleGenerateReport}
              className="w-full bg-flowdoors-green hover:bg-flowdoors-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </button>
            <button
              onClick={handleManageUsers}
              className="w-full bg-flowdoors-charcoal hover:bg-flowdoors-charcoal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Users className="w-4 h-4" />
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
