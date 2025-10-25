'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { formatDate, formatPhone, getRelativeTime } from '@/lib/formatters'
import { Lead } from '@/types/lead'
import { Calendar, Edit, Mail, X } from 'lucide-react'

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

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'homeowner':
        return '🏡'
      case 'contractor':
        return '🔨'
      case 'architect':
        return '📐'
      case 'builder':
        return '🏗️'
      default:
        return '👤'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        {/* GRADIENT HEADER */}
        <div className="bg-gradient-to-r from-[#00aeef] to-[#0097d1] p-8 text-white relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6">
            <div className="text-6xl">
              {getRoleIcon(lead.role)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{lead.name}</h2>
              <div className="flex items-center gap-3">
                <StatusBadge status={lead.status} />
                <QuoteBadge hasQuote={lead.hasQuote} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* CONTACT INFORMATION SECTION */}
          <div>
            <h3 className="text-xl font-bold text-[#2e2e2e] mb-6 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon="📧"
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                label="Email"
                value={lead.email}
                href={`mailto:${lead.email}`}
                linkColor="text-blue-600 hover:text-blue-700"
              />
              <InfoCard
                icon="📞"
                iconBg="bg-green-100"
                iconColor="text-green-600"
                label="Phone"
                value={formatPhone(lead.phone)}
                href={`tel:${lead.phone}`}
                linkColor="text-green-600 hover:text-green-700"
              />
            </div>
          </div>

          {/* PROJECT DETAILS SECTION */}
          <div>
            <h3 className="text-xl font-bold text-[#2e2e2e] mb-6 flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                icon="📍"
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                label="Location"
                value={`${lead.location}, ${lead.zipCode}`}
              />
              <InfoCard
                icon="⏱️"
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                label="Timeline"
                value={lead.timeline}
              />
              <InfoCard
                icon="📈"
                iconBg="bg-indigo-100"
                iconColor="text-indigo-600"
                label="Source"
                value={lead.source}
              />
              <InfoCard
                icon={lead.hasQuote ? "✓" : "✗"}
                iconBg={lead.hasQuote ? "bg-green-100" : "bg-red-100"}
                iconColor={lead.hasQuote ? "text-green-600" : "text-red-600"}
                label="Quote Status"
                value={lead.hasQuote ? "Has Quote" : "No Quote"}
              />
            </div>
          </div>

          {/* TIMELINE SECTION */}
          <div>
            <h3 className="text-xl font-bold text-[#2e2e2e] mb-6 flex items-center gap-3">
              <span className="text-2xl">📅</span>
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-[#00aeef] to-[#0097d1] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wide">Created</span>
                </div>
                <div className="text-lg font-semibold">{formatDate(lead.createdAt)}</div>
                <div className="text-sm opacity-90">{getRelativeTime(lead.createdAt)}</div>
              </div>
              <div className="bg-gradient-to-r from-[#8dc63f] to-[#7bb03a] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wide">Updated</span>
                </div>
                <div className="text-lg font-semibold">{formatDate(lead.updatedAt)}</div>
                <div className="text-sm opacity-90">{getRelativeTime(lead.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleEmail}
              className="bg-gradient-to-r from-[#00aeef] to-[#0097d1] hover:from-[#0097d1] hover:to-[#0080b3] text-white px-6 py-2 rounded-lg font-semibold"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            {onEdit && (
              <Button
                onClick={handleEdit}
                className="bg-[#8dc63f] hover:bg-[#7bb03a] text-white px-6 py-2 rounded-lg font-semibold"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Lead
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ 
  icon, 
  iconBg, 
  iconColor, 
  label, 
  value, 
  href, 
  linkColor 
}: {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  value: string
  href?: string
  linkColor?: string
}) {
  const baseClasses = "bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
  
  const content = (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center text-lg`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
        <p className={`font-semibold text-[#2e2e2e] ${linkColor || ''}`}>
          {value}
        </p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className={`block ${baseClasses}`}>
        {content}
      </a>
    )
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
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
