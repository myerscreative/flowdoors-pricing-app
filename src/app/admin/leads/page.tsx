'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format, formatDistanceToNow } from 'date-fns'
import {
    Calendar,
    Clock,
    Download,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Search,
    User,
    Users
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  zip: string
  timeline: string
  role: string
  status: string
  source: string
  createdAt: Date | null
  referral?: string
  userAgent?: string
  referer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  gclid?: string
  fbclid?: string
  hasQuote: boolean
  assignedTo?: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [timelineFilter, setTimelineFilter] = useState<string>('all')
  const [assignedFilter, setAssignedFilter] = useState<string>('all')
  const [showWithoutQuotes, setShowWithoutQuotes] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Fetch leads data
  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const url = showWithoutQuotes
        ? '/api/leads?withoutQuotes=true'
        : '/api/leads'

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch leads:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch leads')
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leads'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [showWithoutQuotes, toast])

  // Delete lead
  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Are you sure you want to delete the lead for ${leadName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Lead deleted successfully',
        })
        fetchLeads()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete lead'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchTerm) ||
          lead.zip.includes(searchTerm)

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false
      }

      // Source filter
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) {
        return false
      }

      // Timeline filter
      if (timelineFilter !== 'all' && lead.timeline !== timelineFilter) {
        return false
      }

      // Assigned filter
      if (assignedFilter === 'unassigned' && lead.assignedTo) {
        return false
      }
      if (assignedFilter !== 'all' && assignedFilter !== 'unassigned' && lead.assignedTo !== assignedFilter) {
        return false
      }

      return true
    })
  }, [leads, searchTerm, statusFilter, sourceFilter, timelineFilter, assignedFilter])

  // Get unique values for filters
  const uniqueSources = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.source))).filter(Boolean)
  }, [leads])

  const uniqueTimelines = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.timeline))).filter(
      Boolean
    )
  }, [leads])

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.status))).filter(Boolean)
  }, [leads])

  const uniqueAssigned = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.assignedTo).filter((v): v is string => Boolean(v))))
  }, [leads])

  // Stats calculations
  const stats = useMemo(() => {
    const withoutQuotes = leads.filter((lead) => !lead.hasQuote).length
    const withQuotes = leads.filter((lead) => lead.hasQuote).length
    const newThisWeek = leads.filter((lead) => {
      if (!lead.createdAt) return false
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return lead.createdAt >= weekAgo
    }).length
    const unassigned = leads.filter((lead) => !lead.assignedTo).length

    return {
      total: leads.length,
      withoutQuotes,
      withQuotes,
      newThisWeek,
      unassigned,
    }
  }, [leads])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)))
    } else {
      setSelectedLeads(new Set())
    }
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads)
    if (checked) {
      newSelected.add(leadId)
    } else {
      newSelected.delete(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleBulkAssign = () => {
    toast({
      title: 'Coming Soon',
      description: 'Bulk assignment feature will be available soon',
    })
  }

  const handleBulkEmail = () => {
    toast({
      title: 'Coming Soon',
      description: 'Bulk email feature will be available soon',
    })
  }

  const handleBulkDelete = () => {
    toast({
      title: 'Coming Soon',
      description: 'Bulk delete feature will be available soon',
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSourceFilter('all')
    setTimelineFilter('all')
    setAssignedFilter('all')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00aeef] to-[#0097d1] rounded-xl flex items-center justify-center text-white text-2xl">
            👥
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage customer inquiries</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-[#00aeef] to-[#0097d1] hover:from-[#0097d1] hover:to-[#0086ba] shadow-lg shadow-[#00aeef]/30 hover:shadow-[#00aeef]/40">
            +
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Leads */}
        <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-[#00aeef] to-[#0097d1]"></div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Leads</span>
              <div className="w-10 h-10 bg-gradient-to-br from-[#00aeef]/10 to-[#0097d1]/5 rounded-lg flex items-center justify-center text-[#00aeef] text-lg">
                👥
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.total}</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>→</span>
              <span>No change this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Without Quotes */}
        <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706]"></div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Without Quotes</span>
              <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b]/10 to-[#f59e0b]/5 rounded-lg flex items-center justify-center text-[#f59e0b] text-lg">
                ⚠️
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.withoutQuotes}</div>
            <div className="flex items-center gap-2 text-sm text-[#f59e0b] font-semibold">
              <span>⚡</span>
              <span>Needs attention</span>
            </div>
          </CardContent>
        </Card>

        {/* With Quotes */}
        <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-[#8dc63f] to-[#7ab82f]"></div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">With Quotes</span>
              <div className="w-10 h-10 bg-gradient-to-br from-[#8dc63f]/10 to-[#8dc63f]/5 rounded-lg flex items-center justify-center text-[#8dc63f] text-lg">
                ✅
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.withQuotes}</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📊</span>
              <span>{stats.total > 0 ? Math.round((stats.withQuotes / stats.total) * 100) : 0}% conversion</span>
            </div>
          </CardContent>
        </Card>

        {/* New This Week */}
        <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="h-1 bg-gray-200"></div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New This Week</span>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">
                📅
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.newThisWeek}</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📈</span>
              <span>Track weekly trends</span>
            </div>
          </CardContent>
        </Card>

        {/* Unassigned */}
        <Card className="border-2 border-[#f59e0b] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706]"></div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unassigned</span>
              <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b]/10 to-[#f59e0b]/5 rounded-lg flex items-center justify-center text-[#f59e0b] text-lg">
                👤
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.unassigned}</div>
            <div className="flex items-center gap-2 text-sm text-[#f59e0b] font-semibold">
              <span>⚠️</span>
              <span>Need assignment</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>🔍</span>
              Filters & Search
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-2">
                <Search className="h-3 w-3" />
                Search
              </label>
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-2">
                📊 Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-2">
                📍 Source
              </label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-2">
                📅 Timeline
              </label>
              <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Timelines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timelines</SelectItem>
                  {uniqueTimelines.map((timeline) => (
                    <SelectItem key={timeline} value={timeline}>
                      {timeline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned To Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-2">
                👤 Assigned To
              </label>
              <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {uniqueAssigned.map((assigned) => (
                    <SelectItem key={assigned} value={assigned || ''}>
                      {assigned}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show Non-Converted Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="non-converted"
              checked={showWithoutQuotes}
              onChange={(e) => setShowWithoutQuotes(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="non-converted" className="text-sm font-medium text-gray-900 cursor-pointer">
              Show only non-converted leads
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-0 shadow-sm">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            📋 {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''}
          </h3>
          <Button variant="outline" size="sm" onClick={fetchLeads} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLeads.size > 0 && (
          <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-900">
              {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
            </span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#8dc63f] to-[#7ab82f] hover:from-[#7ab82f] hover:to-[#6ba526] text-white gap-2"
              onClick={handleBulkAssign}
            >
              <span>👤</span>
              Assign
            </Button>
            <Button
              size="sm"
              className="bg-[#00aeef] hover:bg-[#0097d1] text-white gap-2"
              onClick={handleBulkEmail}
            >
              <span>📧</span>
              Email
            </Button>
            <Button
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-0 gap-2"
              onClick={handleBulkDelete}
            >
              <span>🗑️</span>
              Delete
            </Button>
          </div>
        )}

        <CardContent className="p-0">
          {filteredLeads.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No leads found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or add a new lead</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-10 px-5 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Contact</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Location</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Assigned To</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Quote</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Created</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-5 py-5">
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-5">
                          <div className="font-semibold text-gray-900">{lead.name || 'N/A'}</div>
                          {lead.role && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              {lead.role}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="space-y-1">
                            {lead.zip && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                {lead.zip}
                              </div>
                            )}
                            {lead.timeline && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-3 w-3" />
                                {lead.timeline}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            {lead.assignedTo || 'Unassigned'}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <Badge
                            className={
                              lead.status === 'new'
                                ? 'bg-gradient-to-r from-[#8dc63f] to-[#7ab82f] text-white border-0 flex items-center gap-1.5'
                                : lead.status === 'contacted'
                                  ? 'bg-blue-100 text-blue-800 border-0 flex items-center gap-1.5'
                                  : lead.status === 'quoted'
                                    ? 'bg-yellow-100 text-yellow-800 border-0 flex items-center gap-1.5'
                                    : 'bg-gray-100 text-gray-600 border-0 flex items-center gap-1.5'
                            }
                          >
                            <span>{lead.status === 'new' ? '✨' : lead.status === 'contacted' ? '📞' : lead.status === 'quoted' ? '💵' : '❄️'}</span>
                            <span className="capitalize">{lead.status}</span>
                          </Badge>
                        </td>
                        <td className="px-5 py-5">
                          <Badge
                            className={
                              lead.hasQuote
                                ? 'bg-green-100 text-green-800 border-0 flex items-center gap-1'
                                : 'bg-red-100 text-red-600 border-0 flex items-center gap-1'
                            }
                          >
                            <span>{lead.hasQuote ? '✅' : '❌'}</span>
                            <span>{lead.hasQuote ? 'Yes' : 'No'}</span>
                          </Badge>
                        </td>
                        <td className="px-5 py-5">
                          {lead.createdAt && (
                            <div className="text-sm text-gray-600">
                              <div>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</div>
                              <div className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-[#00aeef] hover:text-[#0097d1] hover:bg-blue-50 border border-gray-200 hover:border-[#00aeef]"
                              title="View Details"
                            >
                              👁️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-[#8dc63f] hover:text-[#7ab82f] hover:bg-green-50 border border-gray-200 hover:border-[#8dc63f]"
                              title="Edit Lead"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-400"
                              title="Send Email"
                            >
                              📧
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-500"
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              title="Delete"
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-bold text-lg text-gray-900">{lead.name || 'N/A'}</div>
                        {lead.role && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {lead.role}
                          </div>
                        )}
                      </div>
                      <Badge
                        className={
                          lead.status === 'new'
                            ? 'bg-gradient-to-r from-[#8dc63f] to-[#7ab82f] text-white border-0 flex items-center gap-1.5'
                            : lead.status === 'contacted'
                              ? 'bg-blue-100 text-blue-800 border-0 flex items-center gap-1.5'
                              : lead.status === 'quoted'
                                ? 'bg-yellow-100 text-yellow-800 border-0 flex items-center gap-1.5'
                                : 'bg-gray-100 text-gray-600 border-0 flex items-center gap-1.5'
                        }
                      >
                        <span>{lead.status === 'new' ? '✨' : lead.status === 'contacted' ? '📞' : lead.status === 'quoted' ? '💵' : '❄️'}</span>
                        <span className="capitalize">{lead.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {lead.email}
                          </a>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      {lead.zip && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {lead.zip}
                        </div>
                      )}
                      {lead.timeline && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {lead.timeline}
                        </div>
                      )}
                      {lead.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Quote:</span>
                        <Badge
                          className={
                            lead.hasQuote
                              ? 'bg-green-100 text-green-800 border-0 flex items-center gap-1'
                              : 'bg-red-100 text-red-600 border-0 flex items-center gap-1'
                          }
                        >
                          <span>{lead.hasQuote ? '✅' : '❌'}</span>
                          <span>{lead.hasQuote ? 'Yes' : 'No'}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-[#00aeef] hover:text-[#0097d1] hover:bg-blue-50 border border-gray-200"
                      >
                        <span className="mr-2">👁️</span>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-[#8dc63f] hover:text-[#7ab82f] hover:bg-green-50 border border-gray-200"
                      >
                        <span className="mr-2">✏️</span>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"
                      >
                        <span className="mr-2">📧</span>
                        Email
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-gray-200"
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                      >
                        <span className="mr-2">🗑️</span>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
