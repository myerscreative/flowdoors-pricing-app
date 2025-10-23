'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

// Types for referral analytics
type ReferralStat = {
  code: string
  count: number
  quotes: number
  orders?: number
}

type ReferralQuote = {
  id: string
  quoteNumber: string
  createdAt: string
  customerName: string
  totalAmount: number
  status: string
  referralCode: string
  productType: string
  salesRep: string
}

export default function ReferralAnalyticsPage() {
  const [stats, setStats] = useState<ReferralStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scope, setScope] = useState<'customer' | 'salesperson'>('customer')
  const [days, setDays] = useState('90')
  const [prefix, setPrefix] = useState('')
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null)
  const [referralQuotes, setReferralQuotes] = useState<ReferralQuote[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)

  // Fetch referral statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // For now, we'll use mock data to avoid SSR issues
        // In production, this would call your analytics service
        const mockStats: ReferralStat[] = [
          { code: 'FRIEND2024', count: 15, quotes: 15, orders: 8 },
          { code: 'SOCIAL50', count: 12, quotes: 12, orders: 6 },
          { code: 'EMAIL100', count: 8, quotes: 8, orders: 4 },
          { code: 'REFERRAL25', count: 6, quotes: 6, orders: 3 },
        ]

        setStats(mockStats)
      } catch (err) {
        console.error('Error fetching referral stats:', err)
        setError('Failed to load referral statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [scope, days, prefix])

  // Fetch quotes for a specific referral code
  const fetchReferralQuotes = async (referralCode: string) => {
    try {
      setIsLoadingQuotes(true)
      setSelectedReferral(referralCode)

      // Mock data for now - replace with actual API call
      const mockQuotes: ReferralQuote[] = [
        {
          id: '1',
          quoteNumber: 'ABCD-1042',
          createdAt: '2024-01-15',
          customerName: 'John Smith',
          totalAmount: 2500,
          status: 'Active',
          referralCode: referralCode,
          productType: 'Bi-fold Door',
          salesRep: 'Mike Johnson',
        },
        {
          id: '2',
          quoteNumber: 'ABCD-1043',
          createdAt: '2024-01-16',
          customerName: 'Sarah Wilson',
          totalAmount: 3200,
          status: 'Active',
          referralCode: referralCode,
          productType: 'Slide Stack',
          salesRep: 'Mike Johnson',
        },
      ]

      setReferralQuotes(mockQuotes)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Error fetching referral quotes:', err)
    } finally {
      setIsLoadingQuotes(false)
    }
  }

  const totalQuotes = stats.reduce((sum, stat) => sum + stat.quotes, 0)
  const totalOrders = stats.reduce((sum, stat) => sum + (stat.orders || 0), 0)
  const conversionRate =
    totalQuotes > 0 ? ((totalOrders / totalQuotes) * 100).toFixed(1) : '0'

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Referral Analytics</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referral Analytics</h1>
        <div className="flex items-center gap-4">
          <Select
            value={scope}
            onValueChange={(value: 'customer' | 'salesperson') =>
              setScope(value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="salesperson">Salesperson</SelectItem>
            </SelectContent>
          </Select>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
            <p className="text-xs text-muted-foreground">
              Active referral codes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">From referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Quotes to orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search referral codes..."
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => setPrefix('')}>
              Clear
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.code}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {stat.code}
                      </Badge>
                    </TableCell>
                    <TableCell>{stat.quotes}</TableCell>
                    <TableCell>{stat.orders || 0}</TableCell>
                    <TableCell>
                      {stat.quotes > 0
                        ? `${(((stat.orders || 0) / stat.quotes) * 100).toFixed(1)}%`
                        : '0%'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchReferralQuotes(stat.code)}
                        disabled={isLoadingQuotes}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Quotes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Referral Quotes Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Quotes for Referral Code: {selectedReferral}
            </DialogTitle>
          </DialogHeader>

          {isLoadingQuotes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Sales Rep</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono">
                      {quote.quoteNumber}
                    </TableCell>
                    <TableCell>{quote.customerName}</TableCell>
                    <TableCell>${quote.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{quote.status}</Badge>
                    </TableCell>
                    <TableCell>{quote.productType}</TableCell>
                    <TableCell>{quote.salesRep}</TableCell>
                    <TableCell>
                      <Link href={`/admin/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
