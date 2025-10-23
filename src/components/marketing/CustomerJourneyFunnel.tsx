'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useCallback, useState } from 'react'
import FunnelDrilldownModal from './FunnelDrilldownModal'

interface FunnelStep {
  label: string
  value: number
  color: string
  dropOff?: number // Percentage drop-off from previous step
}

interface CampaignMetrics {
  campaign: string
  source: string
  leads: number
  quotes: number
  orders: number
  revenue: number
  convRate: number
}

interface CustomerJourneyFunnelProps {
  steps: FunnelStep[]
  onExport?: () => void
  dateRange?: { from: string; to: string }
}

export default function CustomerJourneyFunnel({
  steps,
  onExport,
  dateRange,
}: CustomerJourneyFunnelProps) {
  const maxValue = Math.max(...steps.map((s) => s.value))

  // Drilldown modal state
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<
    'visitors' | 'leads' | 'quotes' | 'orders' | 'revenue'
  >('leads')
  const [drilldownData, setDrilldownData] = useState<CampaignMetrics[]>([])
  const [drilldownLoading, setDrilldownLoading] = useState(false)

  // Map step labels to stage keys
  const getStageKey = (
    label: string
  ): 'visitors' | 'leads' | 'quotes' | 'orders' | 'revenue' => {
    if (label.includes('Visitors')) return 'visitors'
    if (label.includes('Leads')) return 'leads'
    if (label.includes('Quotes')) return 'quotes'
    if (label.includes('Orders')) return 'orders'
    if (label.includes('Revenue')) return 'revenue'
    return 'leads'
  }

  // Fetch drilldown data for a specific stage
  const fetchDrilldownData = useCallback(
    async (stage: 'visitors' | 'leads' | 'quotes' | 'orders' | 'revenue') => {
      setDrilldownLoading(true)
      try {
        const params = new URLSearchParams({ stage })
        if (dateRange?.from) params.set('from', dateRange.from)
        if (dateRange?.to) params.set('to', dateRange.to)

        const response = await fetch(`/api/marketing/funnel?${params}`)
        if (response.ok) {
          const data = await response.json()
          setDrilldownData(data)
        } else {
          console.error('Failed to fetch drilldown data')
          setDrilldownData([])
        }
      } catch (error) {
        console.error('Error fetching drilldown data:', error)
        setDrilldownData([])
      } finally {
        setDrilldownLoading(false)
      }
    },
    [dateRange]
  )

  // Handle stage click
  const handleStageClick = async (
    stage: 'visitors' | 'leads' | 'quotes' | 'orders' | 'revenue'
  ) => {
    setSelectedStage(stage)
    setIsDrilldownOpen(true)
    await fetchDrilldownData(stage)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-flowdoors-charcoal-800">
            Customer Journey Funnel
          </h3>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Track conversion rates through each stage of the customer journey
          </p>
        </div>
        {onExport && (
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 border-flowdoors-blue-300 text-flowdoors-blue-600 hover:bg-flowdoors-blue-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => {
          const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0
          const previousValue = i > 0 ? steps[i - 1].value : step.value
          const dropOff =
            i > 0 && previousValue > 0
              ? ((previousValue - step.value) / previousValue) * 100
              : 0

          const stageKey = getStageKey(step.label)

          return (
            <div key={i} className="relative">
              {/* Step header */}
              <button
                onClick={() => handleStageClick(stageKey)}
                className="w-full flex items-center justify-between mb-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-flowdoors-blue-50 hover:to-flowdoors-green-50 transition-all duration-300 group border border-transparent hover:border-flowdoors-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="font-semibold text-flowdoors-charcoal-800">
                    {step.label}
                  </span>
                  {i > 0 && dropOff > 0 && (
                    <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold">
                      -{dropOff.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className="text-xl font-bold"
                    style={{ color: step.color }}
                  >
                    {step.value.toLocaleString()}
                  </div>
                  {i > 0 && (
                    <div className="text-xs text-gray-500 font-medium">
                      {((step.value / steps[0].value) * 100).toFixed(1)}% of
                      visitors
                    </div>
                  )}
                </div>
              </button>

              {/* Progress bar */}
              <div className="relative mb-2">
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{
                      backgroundColor: step.color,
                      width: `${Math.max(percentage, 2)}%`, // Minimum 2% width for visibility
                    }}
                  />
                </div>

                {/* Percentage label on bar */}
                {percentage > 10 && (
                  <div
                    className="absolute top-0.5 left-3 text-xs font-bold text-white"
                    style={{ lineHeight: '14px' }}
                  >
                    {percentage.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Conversion rate */}
              {i > 0 && (
                <div className="text-xs text-gray-600 font-medium mb-1">
                  {((step.value / previousValue) * 100).toFixed(1)}% conversion
                  from {steps[i - 1].label}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-gradient-to-br from-flowdoors-blue-50 to-flowdoors-blue-100">
            <div className="text-2xl font-bold text-flowdoors-blue-600">
              {steps.length > 0 ? steps[0].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-flowdoors-blue-700 font-medium uppercase tracking-wide mt-1">Total Visitors</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-2xl font-bold text-purple-600">
              {steps.length > 1 ? steps[1].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-purple-700 font-medium uppercase tracking-wide mt-1">Leads Generated</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-flowdoors-green-50 to-flowdoors-green-100">
            <div className="text-2xl font-bold text-flowdoors-green-600">
              {steps.length > 2 ? steps[2].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-flowdoors-green-700 font-medium uppercase tracking-wide mt-1">Quotes Requested</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="text-2xl font-bold text-orange-600">
              {steps.length > 3 ? steps[3].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-orange-700 font-medium uppercase tracking-wide mt-1">Orders Won</div>
          </div>
        </div>
      </div>

      {/* Drilldown Modal */}
      <FunnelDrilldownModal
        open={isDrilldownOpen}
        onOpenChange={setIsDrilldownOpen}
        stage={selectedStage}
        data={drilldownData}
        loading={drilldownLoading}
      />
    </div>
  )
}
