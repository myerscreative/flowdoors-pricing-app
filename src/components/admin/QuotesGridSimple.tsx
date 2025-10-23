'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
    Calendar,
    DollarSign,
    Eye,
    Filter,
    MapPin,
    Phone,
    Trash2,
    User,
    X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

// Simple type for the quotes data
type SimpleQuote = {
  id: string
  quoteNumber: string
  status: string
  quoteAmount: number
  lastName: string
  firstName: string
  company: string
  phone: string
  zip: string
  createdAt: Date
  salesRep: string
  numberOfItems: number
}

interface QuotesGridProps {
  quotes: SimpleQuote[]
  onDeleteQuote: (_id: string) => void
  onUpdateStatus: (_id: string, _status: string) => void
  onAssignSalesPerson?: (_id: string, _salesPerson: string) => void
}

// Filter interface
interface FilterState {
  status: string
  salesPerson: string
  type: string
  zipcode: string
  name: string
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
}

// Apple-style grid component with filters and sales person assignment
export const QuotesGridSimple = ({
  quotes,
  onDeleteQuote,
  onUpdateStatus,
  onAssignSalesPerson,
}: QuotesGridProps) => {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    salesPerson: 'all',
    type: 'all',
    zipcode: '',
    name: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  })

  const [showFilters, setShowFilters] = useState(false)
  const [salesPeople, setSalesPeople] = useState<
    Array<{ id: string; name: string; prefix: string }>
  >([])
  const [salesPeopleLoading, setSalesPeopleLoading] = useState(true)

  // Fetch sales people from the database
  useEffect(() => {
    const fetchSalesPeople = async () => {
      try {
        setSalesPeopleLoading(true)
        // Import and call getSalespeople dynamically to avoid SSR issues
        const { getSalespeople } = await import('@/services/salesService')
        const salespeople = await getSalespeople()
        setSalesPeople(
          salespeople.map((sp) => ({
            id: sp.id,
            name: sp.name,
            prefix: sp.prefix || '',
          }))
        )
      } catch (error) {
        console.error('Error fetching sales people:', error)
        setSalesPeople([])
      } finally {
        setSalesPeopleLoading(false)
      }
    }

    fetchSalesPeople()
  }, [])

  // Helper function to get salesperson prefix by name
  const getSalespersonPrefix = (salesRepName: string | undefined): string => {
    if (!salesRepName || salesRepName === 'unassigned') {
      return 'Quote'
    }
    const salesperson = salesPeople.find((sp) => sp.name === salesRepName)
    return salesperson?.prefix || 'Quote'
  }

  // Helper function to get clean quote number (remove existing prefix if present)
  const getCleanQuoteNumber = (quoteNumber: string): string => {
    // Remove common prefixes like "QUOTE-", "Quote-", etc.
    return quoteNumber.replace(/^(QUOTE|Quote|quote)-/i, '')
  }

  const getStatusOptions = () => {
    return [
      { value: 'New', label: 'New' },
      { value: 'Hot', label: 'Hot' },
      { value: 'Warm', label: 'Warm' },
      { value: 'Cold', label: 'Cold' },
      { value: 'Hold', label: 'Hold' },
      { value: 'Archived', label: 'Archived' },
    ]
  }

  const getStatusStyles = (status: string) => {
    // Normalize status to handle case variations
    const normalizedStatus = status?.toLowerCase() || 'new'

    const styles = {
      new: {
        dot: 'bg-emerald-500',
        pill: 'bg-emerald-500 text-white border-0 shadow-lg',
        border: 'border-emerald-400',
        text: 'text-emerald-600',
      },
      hot: {
        dot: 'bg-red-500',
        pill: 'bg-red-500 text-white border-0 shadow-lg',
        border: 'border-red-400',
        text: 'text-red-600',
      },
      warm: {
        dot: 'bg-amber-500',
        pill: 'bg-amber-500 text-white border-0 shadow-lg',
        border: 'border-amber-400',
        text: 'text-amber-600',
      },
      cold: {
        dot: 'bg-sky-400',
        pill: 'bg-sky-400 text-white border-0 shadow-lg',
        border: 'border-sky-400',
        text: 'text-sky-500',
      },
      hold: {
        dot: 'bg-gray-400',
        pill: 'bg-gray-400 text-white border-0 shadow-lg',
        border: 'border-gray-400',
        text: 'text-gray-500',
      },
      archived: {
        dot: 'bg-gray-500',
        pill: 'bg-gray-500 text-white border-0 shadow-lg',
        border: 'border-gray-400',
        text: 'text-gray-600',
      },
    }

    return styles[normalizedStatus as keyof typeof styles] || styles.new
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    onUpdateStatus(id, newStatus)
  }

  const handleSalesPersonChange = (id: string, newSalesPerson: string) => {
    if (onAssignSalesPerson) {
      onAssignSalesPerson(id, newSalesPerson)
    }
  }

  const fmtMoney = (n: number) =>
    n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })

  // Get unique values for filter options
  const uniqueSalesPeople = useMemo(
    () => salesPeople.map((sp) => sp.name),
    [salesPeople]
  )

  const uniqueTypes = useMemo(
    () => [
      ...new Set(quotes.map((q) => q.company || 'homeowner').filter(Boolean)),
    ],
    [quotes]
  )

  // Filter quotes based on current filters
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // Status filter
      if (
        filters.status !== 'all' &&
        quote.status.toLowerCase() !== filters.status.toLowerCase()
      )
        return false

      // Sales person filter
      if (
        filters.salesPerson !== 'all' &&
        quote.salesRep !== filters.salesPerson
      )
        return false

      // Type filter
      if (
        filters.type !== 'all' &&
        (quote.company || 'homeowner') !== filters.type
      )
        return false

      // Zipcode filter
      if (filters.zipcode && quote.zip && !quote.zip.includes(filters.zipcode))
        return false

      // Name filter
      if (filters.name) {
        const fullName = `${quote.firstName} ${quote.lastName}`.toLowerCase()
        if (!fullName.includes(filters.name.toLowerCase())) return false
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const quoteDate = new Date(quote.createdAt)
        if (filters.dateFrom && quoteDate < new Date(filters.dateFrom))
          return false
        if (filters.dateTo && quoteDate > new Date(filters.dateTo)) return false
      }

      // Amount range filter
      if (
        filters.amountMin &&
        quote.quoteAmount < parseFloat(filters.amountMin)
      )
        return false
      if (
        filters.amountMax &&
        quote.quoteAmount > parseFloat(filters.amountMax)
      )
        return false

      return true
    })
  }, [quotes, filters])

  const clearFilters = () => {
    setFilters({
      status: 'all',
      salesPerson: 'all',
      type: 'all',
      zipcode: '',
      name: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== 'all'
  )

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
            {hasActiveFilters && (
              <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full font-medium">
                {
                  Object.values(filters).filter((v) => v !== '' && v !== 'all')
                    .length
                }{' '}
                active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>
                    {filters.status === 'all' ? 'All Statuses' : filters.status}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {getStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sales Person Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Sales Person
              </label>
              <Select
                value={filters.salesPerson}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, salesPerson: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>
                    {filters.salesPerson === 'all'
                      ? 'All Sales People'
                      : filters.salesPerson}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales People</SelectItem>
                  {uniqueSalesPeople.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>
                    {filters.type === 'all' ? 'All Types' : filters.type}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zipcode Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Zipcode
              </label>
              <Input
                placeholder="Enter zipcode"
                value={filters.zipcode}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, zipcode: e.target.value }))
                }
                className="w-full"
              />
            </div>

            {/* Name Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Customer Name
              </label>
              <Input
                placeholder="Search by name"
                value={filters.name}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
              />
            </div>

            {/* Date Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Created From
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Created To
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="w-full"
              />
            </div>

            {/* Amount Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Min Amount
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.amountMin}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, amountMin: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Max Amount
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={filters.amountMax}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, amountMax: e.target.value }))
                }
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {filteredQuotes.length} of {quotes.length} quotes
          {hasActiveFilters && (
            <span className="ml-2 text-slate-400">(filtered)</span>
          )}
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotes.map((quote) => {
          const statusStyle = getStatusStyles(quote.status)

          return (
            <article
              key={quote.id}
              className={cn(
                'group relative rounded-2xl border-2 bg-white shadow-[0_1px_0_rgba(16,24,40,0.04),0_1px_2px_rgba(16,24,40,0.06)] transition-transform hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-sky-400',
                statusStyle.border
              )}
              aria-labelledby={`q-${quote.id}`}
            >
              {/* Header */}
              <header className="flex items-center justify-between gap-3 p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn('h-2.5 w-2.5 rounded-full', statusStyle.dot)}
                    aria-hidden
                  />
                  <h3
                    id={`q-${quote.id}`}
                    className="text-[15px] font-semibold tracking-tight text-slate-900"
                  >
                    {getSalespersonPrefix(quote.salesRep)}-
                    {getCleanQuoteNumber(quote.quoteNumber)}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={quote.status}
                    onValueChange={(newStatus) =>
                      handleStatusChange(quote.id, newStatus)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'rounded-full border-0 px-3 py-1 text-[10px] font-medium h-6 w-16 flex-shrink-0',
                        statusStyle.pill
                      )}
                    >
                      {quote.status}
                    </SelectTrigger>
                    <SelectContent className="min-w-[120px] [&_svg]:hidden">
                      {getStatusOptions().map((option) => {
                        const optionStyle = getStatusStyles(option.value)
                        return (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="py-2 px-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-3 h-3 rounded-full',
                                  optionStyle.dot
                                )}
                              />
                              <span className={optionStyle.text}>
                                {option.label}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <Select
                    value={quote.salesRep || 'unassigned'}
                    onValueChange={(newSalesPerson) =>
                      handleSalesPersonChange(quote.id, newSalesPerson)
                    }
                  >
                    <SelectTrigger className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium h-auto min-w-[100px] bg-slate-50 text-slate-700 border-slate-200">
                      {quote.salesRep || 'Unassigned'}
                    </SelectTrigger>
                    <SelectContent className="min-w-[120px]">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {salesPeopleLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : salesPeople.length > 0 ? (
                        salesPeople.map((person) => (
                          <SelectItem key={person.id} value={person.name}>
                            {person.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No sales people found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </header>

              {/* Body */}
              <div className="px-4 pb-4">
                {/* Customer */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {quote.firstName} {quote.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {quote.company || 'homeowner'}
                    </div>
                  </div>
                </div>

                {/* Contact row */}
                <div className="mt-1 grid grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{quote.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-start">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{quote.zip || '—'}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Created</span>
                    </div>
                    <span className="tabular-nums text-slate-900">
                      {format(quote.createdAt, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span>Amount</span>
                    </div>
                    <span className="tabular-nums text-lg font-semibold tracking-tight text-slate-900">
                      {fmtMoney(quote.quoteAmount)}
                    </span>
                  </div>
                  <div className="mt-1 text-right text-[11px] text-slate-500">
                    {quote.numberOfItems}{' '}
                    {quote.numberOfItems === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="flex items-center justify-between gap-3 border-t border-slate-200 p-3">
                <div className="flex gap-2 ml-auto">
                  <Button
                    asChild
                    className="
                      inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-900 border border-gray-300
                      transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-400 h-auto"
                  >
                    <Link href={`/admin/quotes/${quote.id}`}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteQuote(quote.id)}
                    className="
                      p-2 rounded-xl bg-slate-50 text-red-500 border border-slate-200 
                      hover:bg-red-50 hover:border-red-200 transition-all duration-200 h-auto w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </footer>
            </article>
          )
        })}
      </div>
    </div>
  )
}
