'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Download, Users, Calendar, TrendingUp } from 'lucide-react'
import SummaryStat from '@/components/marketing/cohorts/SummaryStat'
import CohortHeatmapTable from '@/components/marketing/cohorts/CohortHeatmapTable'
import { getAuth } from 'firebase/auth'
import { app } from '@/lib/firebaseClient'
import { Skeleton } from '@/components/ui/skeleton'

type CohortRow = {
  cohortLabel: string
  cohortStartISO: string
  totalLeads: number
  totalConversions: number
  rate: number
  [key: `week${number}`]: number
}

type CohortSummary = {
  meta: {
    from: string | null
    to: string | null
    weeks: number
    source: string
  }
  totals: {
    cohorts: number
    leads: number
    averageRate: number
  }
  rows: CohortRow[]
}

const PERIODS = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: '12m', label: 'Last 12 Months' },
  { key: 'custom', label: 'Custom Range' },
]

const SOURCES = ['all', 'google', 'facebook', 'direct', 'other'] as const

export default function CohortsPage() {
  const [period, setPeriod] = useState('30d')
  const [source, setSource] = useState<(typeof SOURCES)[number]>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [weeks, setWeeks] = useState(9)
  const [data, setData] = useState<CohortSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // compute default dates when not custom
  const computedRange = useMemo(() => {
    if (period === 'custom') return { from, to }
    const now = new Date()
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )
    const start = new Date(end)
    const map: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '12m': 365,
    }
    start.setUTCDate(start.getUTCDate() - (map[period] ?? 30))
    return { from: start.toISOString(), to: end.toISOString() }
  }, [period, from, to])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const auth = getAuth(app)
      const user = auth.currentUser

      let headers: HeadersInit = {}

      // Only add auth header if user is logged in and has a valid token
      if (user) {
        try {
          const idToken = await user.getIdToken()
          if (idToken) {
            headers = { Authorization: `Bearer ${idToken}` }
          }
        } catch (tokenError) {
          console.warn('Failed to get ID token:', tokenError)
          // Continue without auth header - API will return mock data
        }
      }

      const params = new URLSearchParams({
        source,
        weeks: String(weeks),
      })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)

      const res = await fetch(`/api/marketing/cohorts?${params}`, {
        headers,
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.warn('API request failed:', res.status, errorText)
        throw new Error(errorText)
      }

      const json: CohortSummary = await res.json()
      setData(json)
    } catch (e) {
      console.warn('Cohort fetch failed:', e)
      // Fallback to empty data instead of showing error
      setData({
        meta: {
          from: computedRange.from ?? null,
          to: computedRange.to ?? null,
          weeks,
          source,
        },
        totals: { cohorts: 0, leads: 0, averageRate: 0 },
        rows: [],
      })
    } finally {
      setLoading(false)
    }
  }, [computedRange.from, computedRange.to, source, weeks])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const exportCSV = () => {
    if (!data) return
    const header = [
      'Cohort',
      ...Array.from({ length: data.meta.weeks }, (_, i) => `Week ${i}`),
      'Total Leads',
      'Conversions',
      'Rate',
    ]
    const rows = data.rows.map((r) => [
      r.cohortLabel,
      ...Array.from({ length: data.meta.weeks }, (_, i) =>
        String(r[`week${i}`] ?? 0)
      ),
      String(r.totalLeads),
      String(r.totalConversions),
      `${(r.rate * 100).toFixed(1)}%`,
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cohorts_${data.meta.source}_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Header + controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cohort Analysis
            </h1>
            <p className="text-gray-600">
              Lead conversion patterns by acquisition cohort
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated:{' '}
              <span suppressHydrationWarning>
                {mounted ? new Date().toLocaleString() : ''}
              </span>
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          {period === 'custom' && (
            <>
              <input
                type="date"
                value={from?.slice(0, 10) || ''}
                onChange={(e) =>
                  setFrom(new Date(e.target.value).toISOString())
                }
                className="border rounded-lg px-3 py-2 bg-white"
              />
              <input
                type="date"
                value={to?.slice(0, 10) || ''}
                onChange={(e) => setTo(new Date(e.target.value).toISOString())}
                className="border rounded-lg px-3 py-2 bg-white"
              />
            </>
          )}
          <select
            value={source}
            onChange={(e) =>
              setSource(e.target.value as (typeof SOURCES)[number])
            }
            className="border rounded-lg px-3 py-2 bg-white"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            {[6, 7, 8, 9, 10, 11, 12].map((w) => (
              <option key={w} value={w}>
                {w} weeks
              </option>
            ))}
          </select>
        </div>

        {/* Summary Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryStat
              icon={<Users className="w-5 h-5" />}
              label="Total Cohorts"
              value={data.totals.cohorts.toString()}
              caption="Active acquisition periods"
            />
            <SummaryStat
              icon={<Calendar className="w-5 h-5" />}
              label="Total Leads"
              value={data.totals.leads.toLocaleString()}
              caption="Across all cohorts"
            />
            <SummaryStat
              icon={<TrendingUp className="w-5 h-5" />}
              label="Average Rate"
              value={`${(data.totals.averageRate * 100).toFixed(1)}%`}
              caption="Weighted by leads"
            />
          </div>
        )}

        {/* Cohort Table */}
        {data && data.rows.length > 0 ? (
          <CohortHeatmapTable rows={data.rows} weeks={data.meta.weeks} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500">
              No cohort data available for the selected period and filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
