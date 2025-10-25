'use client';

import { LeadFilters } from '@/types/lead';

interface Props {
  filters: LeadFilters;
  onFilterChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
}

export function LeadFiltersSection({ filters, onFilterChange, onClearFilters }: Props) {
  const updateFilter = (key: keyof LeadFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2 text-lg font-bold text-[#2e2e2e]">
          <span>🔍</span>
          <span>Filters & Search</span>
        </div>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
            <span>🔎</span>
            <span>Search</span>
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search leads..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] transition-all"
          />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
            <span>📊</span>
            <span>Status</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] transition-all"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
            <span>📍</span>
            <span>Source</span>
          </label>
          <select
            value={filters.source}
            onChange={(e) => updateFilter('source', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] transition-all"
          >
            <option value="">All Sources</option>
            <option value="web">Web</option>
            <option value="phone">Phone</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
            <span>📅</span>
            <span>Timeline</span>
          </label>
          <select
            value={filters.timeline}
            onChange={(e) => updateFilter('timeline', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] transition-all"
          >
            <option value="">All Timelines</option>
            <option value="asap">ASAP (&lt; 1 month)</option>
            <option value="1-3">1-3 months</option>
            <option value="3-6">3-6 months</option>
            <option value="6+">6+ months</option>
          </select>
        </div>
      </div>

      {/* Show Only Non-Converted Checkbox */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="non-converted"
          checked={filters.showOnlyNonConverted}
          onChange={(e) => updateFilter('showOnlyNonConverted', e.target.checked)}
          className="w-5 h-5 text-[#00aeef] focus:ring-[#00aeef]/20 rounded cursor-pointer"
        />
        <label htmlFor="non-converted" className="text-sm font-medium text-[#2e2e2e] cursor-pointer">
          Show only non-converted leads
        </label>
      </div>
    </div>
  );
}
