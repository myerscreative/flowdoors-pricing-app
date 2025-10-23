'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { exportFunnelDrilldownData } from '@/lib/exportUtils'

interface CampaignMetrics {
  campaign: string
  source: string
  leads: number
  quotes: number
  orders: number
  revenue: number
  convRate: number
}

interface FunnelDrilldownModalProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  stage: 'visitors' | 'leads' | 'quotes' | 'orders' | 'revenue'
  data: CampaignMetrics[]
  loading?: boolean
}

export default function FunnelDrilldownModal({
  open,
  onOpenChange,
  stage,
  data,
  loading = false,
}: FunnelDrilldownModalProps) {
  const stageLabels = {
    visitors: 'Website Visitors',
    leads: 'Leads Generated',
    quotes: 'Quotes Requested',
    orders: 'Orders Won',
    revenue: 'Revenue',
  }

  const stageLabel = stageLabels[stage]

  // Prepare data for bar chart (top 10 campaigns by revenue)
  const chartData = data
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((item) => ({
      campaign:
        item.campaign.length > 20
          ? item.campaign.substring(0, 20) + '...'
          : item.campaign,
      fullCampaign: item.campaign,
      revenue: item.revenue,
      leads: item.leads,
      quotes: item.quotes,
      orders: item.orders,
      convRate: item.convRate,
    }))

  const handleExportCSV = () => {
    if (data.length > 0) {
      exportFunnelDrilldownData(data, stage)
    }
  }

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google':
        return '#F4B400'
      case 'facebook':
        return '#1877F2'
      case 'direct':
        return '#10B981'
      case 'other':
        return '#6B7280'
      default:
        return '#6B7280'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google':
        return '🔍'
      case 'facebook':
        return '📘'
      case 'direct':
        return '🌐'
      case 'other':
        return '📊'
      default:
        return '📊'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Stage Drilldown: {stageLabel}
            </DialogTitle>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              disabled={data.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {data
                  .reduce((sum, item) => sum + item.leads, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {data
                  .reduce((sum, item) => sum + item.quotes, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Quotes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {data
                  .reduce((sum, item) => sum + item.orders, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                $
                {data
                  .reduce((sum, item) => sum + item.revenue, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>

          {/* Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Top Campaigns by Revenue
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="campaign"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'revenue'
                          ? `$${Number(value).toLocaleString()}`
                          : value,
                        name === 'revenue' ? 'Revenue' : name,
                      ]}
                      labelFormatter={(label) => `Campaign: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Campaign Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">
                      Source
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">
                      Leads
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">
                      Quotes
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">
                      Conv. Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.campaign}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {getSourceIcon(item.source)}
                            </span>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{
                                backgroundColor: getSourceColor(item.source),
                              }}
                            >
                              {item.source.charAt(0).toUpperCase() +
                                item.source.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {item.leads.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {item.quotes.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {item.orders.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 font-medium">
                          ${item.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.convRate >= 15
                                ? 'bg-green-100 text-green-800'
                                : item.convRate >= 10
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.convRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No campaign data available for this stage
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
