'use client';

import { formatDate, formatPhone, getRelativeTime } from '@/lib/formatters';
import { Lead } from '@/types/lead';
import { useState } from 'react';

interface Props {
  leads: Lead[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
}

export function LeadsTable({ leads, onView, onEdit, onDelete, onEmail }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#2e2e2e]">
          📋 {leads.length} Lead{leads.length !== 1 ? 's' : ''}
        </h2>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-200 flex items-center gap-4">
          <span className="font-semibold text-blue-900">
            {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <button className="px-4 py-2 bg-[#00aeef] text-white rounded-lg text-sm font-semibold hover:bg-[#0099d4] transition-colors flex items-center gap-2">
            <span>📧</span>
            <span>Email</span>
          </button>
          <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors flex items-center gap-2">
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3.5 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-[#00aeef] rounded cursor-pointer"
                />
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Contact</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Location</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Quote</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Created</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                isSelected={selectedIds.has(lead.id)}
                onToggleSelect={() => toggleSelect(lead.id)}
                onView={() => onView(lead)}
                onEdit={() => onEdit(lead)}
                onDelete={() => onDelete(lead)}
                onEmail={() => onEmail(lead)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadRow({ lead, isSelected, onToggleSelect, onView, onEdit, onDelete, onEmail }: any) {
  return (
    <tr className="border-b border-gray-100 hover:bg-[#00aeef]/[0.02] hover:shadow-[inset_0_0_0_1px_rgba(0,174,239,0.1)] transition-all">
      <td className="px-5 py-5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 text-[#00aeef] rounded cursor-pointer"
        />
      </td>
      <td className="px-5 py-5">
        <div className="font-semibold text-[#2e2e2e]">{lead.name}</div>
        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <span>🏡</span>
          <span className="capitalize">{lead.role}</span>
        </div>
      </td>
      <td className="px-5 py-5 text-sm">
        <div className="flex items-center gap-2 mb-1 text-gray-600">
          <span>📧</span>
          <a href={`mailto:${lead.email}`} className="text-[#00aeef] hover:underline">
            {lead.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>📞</span>
          <a href={`tel:${lead.phone}`} className="text-[#00aeef] hover:underline">
            {formatPhone(lead.phone)}
          </a>
        </div>
      </td>
      <td className="px-5 py-5 text-sm">
        <div className="flex items-center gap-2 mb-1 text-gray-600">
          <span>📍</span>
          <span>{lead.zipCode}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>⏱️</span>
          <span>{lead.timeline}</span>
        </div>
      </td>
      <td className="px-5 py-5">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-5 py-5">
        <QuoteBadge hasQuote={lead.hasQuote} />
      </td>
      <td className="px-5 py-5 text-sm text-gray-600">
        <div>{formatDate(lead.createdAt)}</div>
        <div className="text-xs text-gray-400 mt-1">{getRelativeTime(lead.createdAt)}</div>
      </td>
      <td className="px-5 py-5">
        <div className="flex gap-2">
          <ActionButton icon="👁️" tooltip="View Details" onClick={onView} />
          <ActionButton icon="✏️" tooltip="Edit Lead" onClick={onEdit} variant="success" />
          <ActionButton icon="📧" tooltip="Send Email" onClick={onEmail} />
          <ActionButton icon="🗑️" tooltip="Delete" onClick={onDelete} variant="danger" />
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    new: 'bg-gradient-to-r from-[#8dc63f] to-[#7bb03a] text-white',
    contacted: 'bg-blue-100 text-blue-900',
    quoted: 'bg-amber-100 text-amber-900',
    cold: 'bg-gray-100 text-gray-600',
  };

  const icons = {
    new: '✨',
    contacted: '📞',
    quoted: '📄',
    cold: '❄️',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
      <span>{icons[status as keyof typeof icons]}</span>
      <span className="capitalize">{status} Lead</span>
    </span>
  );
}

function QuoteBadge({ hasQuote }: { hasQuote: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
      hasQuote ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
    }`}>
      <span>{hasQuote ? '✅' : '❌'}</span>
      <span>{hasQuote ? 'Yes' : 'No'}</span>
    </span>
  );
}

function ActionButton({ icon, tooltip, onClick, variant = 'default' }: {
  icon: string;
  tooltip: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger';
}) {
  const variants = {
    default: 'border-gray-200 text-gray-600 hover:bg-gray-50',
    success: 'border-gray-200 text-[#8dc63f] hover:bg-[#8dc63f]/10 hover:border-[#8dc63f]',
    danger: 'border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-500',
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${variants[variant]}`}
    >
      {icon}
    </button>
  );
}
