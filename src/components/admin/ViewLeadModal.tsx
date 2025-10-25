'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lead } from '@/types/lead'
import { formatDate, formatPhone, getRelativeTime } from '@/lib/formatters'
import { Mail, Phone, MapPin, Calendar, User, Trash2, Edit, Eye } from 'lucide-react'

interface ViewLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onEdit?: (lead: Lead) => void
  onDelete?: (lead: Lead) => void
  onEmail?: (lead: Lead) => void
}

export function ViewLeadModal({ 
  open, 
  onOpenChange, 
  lead, 
  onEdit, 
  onDelete, 
  onEmail 
}: ViewLeadModalProps) {
  if (!lead) return null

  const handleEmail = () => {
    if (onEmail) {
      onEmail(lead)
    } else {
      // Fallback to mailto
      window.open(`mailto:${lead.email}`, '_blank')
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(lead)
    }
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(lead)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#2e2e2e] flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00aeef] to-[#0097d1] rounded-xl flex items-center justify-center text-white text-lg">
                👤
              </div>
              Lead Details
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Name & Status */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#2e2e2e]">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 capitalize">{lead.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={lead.status} />
              <QuoteBadge hasQuote={lead.hasQuote} />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#2e2e2e] mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#00aeef]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="text-[#00aeef] hover:underline font-medium"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a 
                    href={`tel:${lead.phone}`} 
                    className="text-[#00aeef] hover:underline font-medium"
                  >
                    {formatPhone(lead.phone)}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Timeline */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#2e2e2e] mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#00aeef]" />
              Location & Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-[#2e2e2e]">{lead.location}</p>
                  <p className="text-sm text-gray-500">ZIP: {lead.zipCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-medium text-[#2e2e2e] capitalize">{lead.timeline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#2e2e2e] mb-4">Lead Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Source</p>
                <p className="font-medium text-[#2e2e2e] capitalize">{lead.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned To</p>
                <p className="font-medium text-[#2e2e2e]">
                  {lead.assignedTo || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-[#2e2e2e]">{formatDate(lead.createdAt)}</p>
                <p className="text-xs text-gray-400">{getRelativeTime(lead.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-[#2e2e2e]">{formatDate(lead.updatedAt)}</p>
                <p className="text-xs text-gray-400">{getRelativeTime(lead.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleEmail}
              className="flex items-center gap-2 bg-[#00aeef] hover:bg-[#0097d1] text-white"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
            {onEdit && (
              <Button
                onClick={handleEdit}
                variant="outline"
                className="flex items-center gap-2 border-[#8dc63f] text-[#8dc63f] hover:bg-[#8dc63f]/10"
              >
                <Edit className="h-4 w-4" />
                Edit Lead
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Lead
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    new: 'bg-gradient-to-r from-[#8dc63f] to-[#7bb03a] text-white',
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

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
      <span>{icons[status as keyof typeof icons]}</span>
      <span className="capitalize">{status} Lead</span>
    </span>
  )
}

function QuoteBadge({ hasQuote }: { hasQuote: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
      hasQuote ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
    }`}>
      <span>{hasQuote ? '✅' : '❌'}</span>
      <span>{hasQuote ? 'Has Quote' : 'No Quote'}</span>
    </span>
  )
}
