'use client'

import { Lead } from '@/types/lead'
import { formatPhone } from '@/lib/formatters'
import { X, Mail, Phone, MapPin, Clock, Calendar, User, Building2, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'

interface ViewLeadModalProps {
  lead: Lead
  onClose: () => void
  onEdit?: (lead: Lead) => void
  onEmail?: (lead: Lead) => void
}

export function ViewLeadModal({ lead, onClose, onEdit, onEmail }: ViewLeadModalProps) {
  // Format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(d)
  }

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-gradient-to-r from-flowdoors-green to-flowdoors-green-600 text-white',
      contacted: 'bg-blue-100 text-blue-900',
      quoted: 'bg-amber-100 text-amber-900',
      cold: 'bg-gray-100 text-gray-600',
    }
    
    const icons = {
      new: '✨',
      contacted: '📞',
      quoted: '📄',
      cold: '❄️',
    }

    return {
      style: styles[status as keyof typeof styles] || styles.new,
      icon: icons[status as keyof typeof icons] || icons.new,
    }
  }

  const statusBadge = getStatusBadge(lead.status)

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'homeowner':
        return '🏡'
      case 'contractor':
        return '🔨'
      case 'business':
        return '🏢'
      default:
        return '👤'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-flowdoors-blue to-[#0097d1] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl">
              {getRoleIcon(lead.role)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{lead.name}</h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusBadge.style}`}>
                  <span>{statusBadge.icon}</span>
                  <span className="capitalize">{lead.status} Lead</span>
                </span>
                <span className="text-white/80 text-sm capitalize">
                  {lead.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6">
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-flowdoors-charcoal mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-flowdoors-blue" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-flowdoors-blue-50 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-flowdoors-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Email
                    </div>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-flowdoors-blue hover:underline font-medium truncate block"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-flowdoors-green-50 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-flowdoors-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Phone
                    </div>
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-flowdoors-green hover:underline font-medium"
                    >
                      {formatPhone(lead.phone)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-flowdoors-charcoal mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-flowdoors-blue" />
              Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mt-0.5">
                    <MapPin className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Location
                    </div>
                    <div className="text-flowdoors-charcoal font-medium">
                      {lead.zipCode}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      San Diego County
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mt-0.5">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Timeline
                    </div>
                    <div className="text-flowdoors-charcoal font-medium">
                      {lead.timeline}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Project start timeframe
                    </div>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mt-0.5">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Source
                    </div>
                    <div className="text-flowdoors-charcoal font-medium capitalize">
                      {lead.source}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      How they found us
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Status */}
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mt-0.5 ${
                    lead.hasQuote ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {lead.hasQuote ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Quote Status
                    </div>
                    <div className={`font-medium ${
                      lead.hasQuote ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lead.hasQuote ? 'Quote Sent' : 'No Quote'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {lead.hasQuote ? 'Quote has been provided' : 'Needs quote'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-flowdoors-charcoal mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-flowdoors-blue" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Created */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Lead Created
                </div>
                <div className="text-flowdoors-charcoal font-semibold">
                  {lead.createdAt ? formatDate(lead.createdAt) : 'Unknown'}
                </div>
              </div>

              {/* Updated */}
              {lead.updatedAt && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                    Last Updated
                  </div>
                  <div className="text-flowdoors-charcoal font-semibold">
                    {formatDate(lead.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-flowdoors-blue mb-1">
                  {lead.hasQuote ? '1' : '0'}
                </div>
                <div className="text-xs text-gray-600">Quotes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-flowdoors-green mb-1">
                  {getRoleIcon(lead.role)}
                </div>
                <div className="text-xs text-gray-600 capitalize">{lead.role}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-flowdoors-charcoal mb-1">
                  {statusBadge.icon}
                </div>
                <div className="text-xs text-gray-600 capitalize">{lead.status}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            {onEmail && (
              <button
                onClick={() => onEmail(lead)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-flowdoors-blue to-[#0097d1] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-flowdoors-blue/30 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(lead)
                  onClose()
                }}
                className="flex-1 px-6 py-3 bg-flowdoors-green text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-flowdoors-green/30 transition-all flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                Edit Lead
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}