'use client'

import { useState, useCallback } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Journey Funnel
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Track conversion rates through each stage of the customer journey
          </p>
        </div>
        {onExport && (
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
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
                className="w-full flex items-center justify-between mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="font-medium text-gray-900">
                    {step.label}
                  </span>
                  {i > 0 && dropOff > 0 && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      -{dropOff.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className="text-lg font-bold"
                    style={{ color: step.color }}
                  >
                    {step.value.toLocaleString()}
                  </div>
                  {i > 0 && (
                    <div className="text-xs text-gray-500">
                      {((step.value / steps[0].value) * 100).toFixed(1)}% of
                      visitors
                    </div>
                  )}
                </div>
              </button>

              {/* Progress bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: step.color,
                      width: `${Math.max(percentage, 2)}%`, // Minimum 2% width for visibility
                    }}
                  />
                </div>

                {/* Percentage label on bar */}
                {percentage > 10 && (
                  <div
                    className="absolute top-0 left-2 text-xs font-medium text-white"
                    style={{ lineHeight: '12px' }}
                  >
                    {percentage.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Conversion rate */}
              {i > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {((step.value / previousValue) * 100).toFixed(1)}% conversion
                  from {steps[i - 1].label}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {steps.length > 0 ? steps[0].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-gray-500">Total Visitors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {steps.length > 1 ? steps[1].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-gray-500">Leads Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {steps.length > 2 ? steps[2].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-gray-500">Quotes Requested</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {steps.length > 3 ? steps[3].value.toLocaleString() : 0}
            </div>
            <div className="text-xs text-gray-500">Orders Won</div>
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
