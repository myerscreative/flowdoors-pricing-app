'use client'

import { LeadFiltersSection } from '@/components/admin/LeadFilters'
import { LeadsTable } from '@/components/admin/LeadsTable'
import { LeadStatsCards } from '@/components/admin/LeadStatsCards'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Lead, LeadFilters, LeadStats } from '@/types/lead'
import { Download, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Using Lead interface from @/types/lead

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: '',
    source: '',
    timeline: '',
    showOnlyNonConverted: true
  })
  const { toast } = useToast()

  // Fetch leads data
  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const url = filters.showOnlyNonConverted
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
  }, [filters.showOnlyNonConverted, toast])

  const handleDeleteLead = async (lead: Lead) => {
    if (!confirm(`Are you sure you want to delete the lead for ${lead.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
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
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(filters.search) ||
          lead.zipCode.includes(filters.search)

        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && lead.status !== filters.status) {
        return false
      }

      // Source filter
      if (filters.source && lead.source !== filters.source) {
        return false
      }

      // Timeline filter
      if (filters.timeline && lead.timeline !== filters.timeline) {
        return false
      }

      return true
    })
  }, [leads, filters])

  // Get unique values for filters (keeping for potential future use)
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

  // Stats calculations
  const stats: LeadStats = useMemo(() => {
    const withoutQuotes = leads.filter((lead) => !lead.hasQuote).length
    const withQuotes = leads.filter((lead) => lead.hasQuote).length
    const unassigned = leads.filter((lead) => !lead.assignedTo).length
    const newThisWeek = leads.filter((lead) => {
      if (!lead.createdAt) return false
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return lead.createdAt >= weekAgo
    }).length

    return {
      total: leads.length,
      withoutQuotes,
      withQuotes,
      newThisWeek,
      unassigned,
    }
  }, [leads])

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: '',
      timeline: '',
      showOnlyNonConverted: true
    })
  }

  const handleFilterChange = (newFilters: LeadFilters) => {
    setFilters(newFilters)
  }

  const handleEditLead = (lead: Lead) => {
    toast({
      title: 'Coming Soon',
      description: 'Edit lead feature will be available soon',
    })
  }

  const handleEmailLead = (lead: Lead) => {
    toast({
      title: 'Coming Soon',
      description: 'Email lead feature will be available soon',
    })
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
            <h1 className="text-3xl font-bold text-[#2e2e2e]">Lead Management</h1>
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

      {/* Stats Cards */}
      <LeadStatsCards stats={stats} />

      {/* Filters Section */}
      <LeadFiltersSection 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table Section */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-20 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#2e2e2e] mb-2">No leads found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or add a new lead</p>
        </div>
      ) : (
        <LeadsTable 
          leads={filteredLeads}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onEmail={handleEmailLead}
        />
      )}
    </div>
  )
}
