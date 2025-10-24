'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [timelineFilter, setTimelineFilter] = useState<string>('all')
  const [showWithoutQuotes, setShowWithoutQuotes] = useState(true)
  const { toast } = useToast()

  // Fetch leads data
  const fetchLeads = async () => {
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
  }

  useEffect(() => {
    fetchLeads()
  }, [showWithoutQuotes, toast])

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

      return true
    })
  }, [leads, searchTerm, statusFilter, sourceFilter, timelineFilter])

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

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google':
        return 'bg-blue-100 text-blue-800'
      case 'facebook':
        return 'bg-indigo-100 text-indigo-800'
      case 'direct':
        return 'bg-green-100 text-green-800'
      case 'web':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimelineBadgeColor = (timeline: string) => {
    switch (timeline.toLowerCase()) {
      case 'asap':
        return 'bg-red-100 text-red-800'
      case '1-2 months':
        return 'bg-orange-100 text-orange-800'
      case '3-6 months':
        return 'bg-yellow-100 text-yellow-800'
      case 'just planning':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-green-100 text-green-800'
      case 'contacted':
        return 'bg-blue-100 text-blue-800'
      case 'qualified':
        return 'bg-purple-100 text-purple-800'
      case 'unqualified':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Leads
          </h1>
          <p className="text-gray-600 mt-1">
            {showWithoutQuotes
              ? 'Leads that have not converted to quotes'
              : 'All leads'}
          </p>
        </div>
        <Button
          onClick={() => setShowWithoutQuotes(!showWithoutQuotes)}
          variant={showWithoutQuotes ? 'default' : 'outline'}
        >
          {showWithoutQuotes ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Show Only Non-Converted
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show All Leads
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Without Quotes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter((lead) => !lead.hasQuote).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Quotes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter((lead) => lead.hasQuote).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                leads.filter((lead) => {
                  if (!lead.createdAt) return false
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return lead.createdAt >= weekAgo
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Timeline</label>
              <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                <SelectTrigger>
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
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setSourceFilter('all')
                  setTimelineFilter('all')
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''}
            {searchTerm ||
            statusFilter !== 'all' ||
            sourceFilter !== 'all' ||
            timelineFilter !== 'all'
              ? ' (filtered)'
              : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Timeline</th>
                    <th className="text-left p-3 font-medium">Source</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Has Quote</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{lead.name || 'N/A'}</div>
                        {lead.role && (
                          <div className="text-sm text-gray-500">
                            {lead.role}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-blue-600 hover:underline"
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
                                className="text-blue-600 hover:underline"
                              >
                                {lead.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {lead.zip && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {lead.zip}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {lead.timeline && (
                          <Badge
                            className={getTimelineBadgeColor(lead.timeline)}
                          >
                            {lead.timeline}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={getSourceBadgeColor(lead.source)}>
                          {lead.source}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusBadgeColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {lead.createdAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            lead.hasQuote
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {lead.hasQuote ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
