/**
 * CSV Export Utilities for Marketing Dashboard
 */

import { format } from 'date-fns'

export interface ExportableData {
  [key: string]: string | number
}

export interface CampaignData {
  campaign: string
  leads: number
  quotes: number
  revenue: number
  costPerLead?: number
}

export interface SourceData {
  source: string
  leads: number
  quotes: number
  revenue: number
  conversionRate: number
  avgQuote: number
  costPerLead: number
  [key: string]: string | number
}

/**
 * Convert data array to CSV string
 */
export function arrayToCSV(data: ExportableData[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape values that contain commas or quotes
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(',')
    ),
  ].join('\n')

  downloadCSV(csvContent, filename)
}

/**
 * Export marketing dashboard summary data
 */
export function exportMarketingSummary(
  bySource: Record<string, { leads: number; quotes: number; revenue: number }>,
  totals: { leads: number; quotes: number; revenue: number },
  dateRange: { from: string; to: string }
): void {
  const sourceData: SourceData[] = Object.entries(bySource).map(
    ([source, data]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      leads: data.leads,
      quotes: data.quotes,
      revenue: data.revenue,
      conversionRate:
        data.leads > 0
          ? Number(((data.quotes / data.leads) * 100).toFixed(1))
          : 0,
      avgQuote:
        data.quotes > 0 ? Number((data.revenue / data.quotes).toFixed(2)) : 0,
      costPerLead: 45, // Mock cost per lead
    })
  )

  // Add totals row
  sourceData.push({
    source: 'TOTAL',
    leads: totals.leads,
    quotes: totals.quotes,
    revenue: totals.revenue,
    conversionRate:
      totals.leads > 0
        ? Number(((totals.quotes / totals.leads) * 100).toFixed(1))
        : 0,
    avgQuote:
      totals.quotes > 0
        ? Number((totals.revenue / totals.quotes).toFixed(2))
        : 0,
    costPerLead: 45,
  })

  const filename = `marketing-summary-${dateRange.from}-to-${dateRange.to}.csv`
  arrayToCSV(sourceData, filename)
}

/**
 * Export campaign drilldown data
 */
export function exportCampaignData(
  campaigns: CampaignData[],
  source: string,
  dateRange: { from: string; to: string }
): void {
  const campaignData = campaigns.map((campaign) => ({
    campaign: campaign.campaign,
    leads: campaign.leads,
    quotes: campaign.quotes,
    revenue: campaign.revenue,
    conversionRate:
      campaign.leads > 0
        ? Number(((campaign.quotes / campaign.leads) * 100).toFixed(1))
        : 0,
    avgQuote:
      campaign.quotes > 0
        ? Number((campaign.revenue / campaign.quotes).toFixed(2))
        : 0,
    costPerLead: campaign.costPerLead || 0,
  }))

  const filename = `${source}-campaigns-${dateRange.from}-to-${dateRange.to}.csv`
  arrayToCSV(campaignData, filename)
}

/**
 * Export cohort analysis data
 */
export function exportCohortData(
  cohorts: Array<{ cohort: string; [key: string]: string | number }>,
  dateRange: { from: string; to: string }
): void {
  const filename = `cohort-analysis-${dateRange.from}-to-${dateRange.to}.csv`
  arrayToCSV(cohorts, filename)
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Format currency for CSV export
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`
}

/**
 * Format percentage for CSV export
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export interface FunnelStep {
  label: string
  value: number
  color: string
  dropOff?: number
}

/**
 * Export funnel data to CSV
 */
export function exportFunnelData(
  steps: FunnelStep[],
  dateRange: { from: string; to: string }
): void {
  const exportData = steps.map((step, index) => {
    const previousValue = index > 0 ? steps[index - 1].value : step.value
    const dropOff =
      index > 0 && previousValue > 0
        ? ((previousValue - step.value) / previousValue) * 100
        : 0
    const conversionRate =
      index > 0 && previousValue > 0 ? (step.value / previousValue) * 100 : 100

    return {
      step: step.label,
      value: step.value,
      dropOff: index > 0 ? dropOff : 0,
      conversionRate: index > 0 ? conversionRate : 100,
      color: step.color,
    }
  })

  const filename = `funnel_report_${format(new Date(dateRange.from), 'yyyyMMdd')}_${format(
    new Date(dateRange.to),
    'yyyyMMdd'
  )}.csv`
  arrayToCSV(exportData, filename)
}

export interface FunnelDrilldownData {
  campaign: string
  source: string
  leads: number
  quotes: number
  orders: number
  revenue: number
  convRate: number
}

/**
 * Export funnel drilldown data to CSV
 */
export function exportFunnelDrilldownData(
  data: FunnelDrilldownData[],
  stage: 'visitors' | 'leads' | 'quotes' | 'orders' | 'revenue'
): void {
  const exportData = data.map((item) => ({
    campaign: item.campaign,
    source: item.source.charAt(0).toUpperCase() + item.source.slice(1),
    leads: item.leads,
    quotes: item.quotes,
    orders: item.orders,
    revenue: item.revenue,
    conversionRate: `${item.convRate.toFixed(1)}%`,
  }))

  const filename = `funnel_drilldown_${stage}_${format(new Date(), 'yyyyMMdd')}.csv`
  arrayToCSV(exportData, filename)
}
