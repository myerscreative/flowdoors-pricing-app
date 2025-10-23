'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TrendingUp, Download } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { exportCampaignData } from '@/lib/exportUtils'

interface CampaignMetrics {
  campaign: string
  leads: number
  quotes: number
  revenue: number
  costPerLead?: number
}

interface DrilldownModalProps {
  open: boolean
  onClose: () => void
  source: string
  data: CampaignMetrics[]
  timeSeriesData?: Array<{ date: string; leads: number }>
  dateRange?: { from: string; to: string }
}

export default function DrilldownModal({
  open,
  onClose,
  source,
  data,
  timeSeriesData = [],
  dateRange,
}: DrilldownModalProps) {
  const totalLeads = data.reduce((sum, row) => sum + row.leads, 0)
  const totalQuotes = data.reduce((sum, row) => sum + row.quotes, 0)
  const totalRevenue = data.reduce((sum, row) => sum + row.revenue, 0)
  const overallConversionRate =
    totalLeads > 0 ? ((totalQuotes / totalLeads) * 100).toFixed(1) : '0'

  const handleExportCSV = () => {
    if (dateRange) {
      exportCampaignData(data, source, dateRange)
    } else {
      console.warn('Date range not available for export')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold capitalize text-gray-900">
                {source} Campaign Breakdown
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                Detailed performance metrics by campaign
              </p>
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalLeads.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {totalQuotes.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Quotes</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {overallConversionRate}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>

          {/* Campaign Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-900">
                      Campaign Name
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-900">
                      Leads
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-900">
                      Quotes
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-900">
                      Revenue
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-900">
                      Conv. Rate
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-900">
                      Avg Quote
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-900">
                      Cost/Lead
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((row, index) => {
                    const conversionRate =
                      row.leads > 0
                        ? ((row.quotes / row.leads) * 100).toFixed(1)
                        : '0'
                    const avgQuote =
                      row.quotes > 0
                        ? (row.revenue / row.quotes).toFixed(0)
                        : '0'
                    const costPerLead = row.costPerLead || 0

                    return (
                      <tr
                        key={row.campaign}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="p-4 font-medium text-gray-900">
                          {row.campaign}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          {row.leads.toLocaleString()}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          {row.quotes.toLocaleString()}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          ${row.revenue.toLocaleString()}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          {conversionRate}%
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          ${avgQuote}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          ${costPerLead.toFixed(0)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leads Over Time Chart */}
          {timeSeriesData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Leads Over Time
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        'Leads',
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
