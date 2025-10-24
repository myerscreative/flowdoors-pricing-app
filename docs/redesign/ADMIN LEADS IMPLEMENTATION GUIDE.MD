# 🎨 FlowDoors Admin Leads Page - Redesign Implementation Guide

## 📊 [View Redesigned Page →](computer:///mnt/user-data/outputs/FlowDoors_Admin_Leads_Redesign.html)

---

## 🎯 What Changed (Before → After)

### 1. **Stats Cards**

**Before:** Plain white cards with small numbers
**After:**

- ✅ Huge numbers (48px, bold)
- ✅ Gradient top borders (blue, green, yellow, gray)
- ✅ Contextual icons with matching gradient backgrounds
- ✅ Trend indicators ("No change this week", "Needs attention")
- ✅ Hover effects (lift + shadow)

### 2. **Branding**

**Before:** Generic blue (#3b82f6)
**After:**

- ✅ FlowDoors Blue (#00aeef) everywhere
- ✅ FlowDoors Green (#8dc63f) for success
- ✅ FlowDoors Charcoal (#2e2e2e) for text
- ✅ Consistent gradient usage

### 3. **Filters**

**Before:** Plain dropdowns in a row
**After:**

- ✅ White card with subtle shadow
- ✅ Icons for each filter type (🔎 🚊 📍 📅)
- ✅ Better labels and spacing
- ✅ "Show only non-converted" as checkbox in gray box
- ✅ "Clear All Filters" button

### 4. **Table**

**Before:** Basic table with delete button
**After:**

- ✅ Checkbox column for bulk selection
- ✅ Better formatted contact info (clickable email/phone)
- ✅ Role badge (🏡 Homeowner)
- ✅ Beautiful status badges with icons
- ✅ 4 action buttons (View, Edit, Email, Delete)
- ✅ Hover effect on rows
- ✅ Tooltips on action buttons

### 5. **Mobile Responsive**

**Before:** Table breaks on mobile
**After:**

- ✅ Card-based layout on mobile (<768px)
- ✅ All info visible in card format
- ✅ Touch-friendly buttons
- ✅ Stacked filters

### 6. **Header**

**Before:** Simple text
**After:**

- ✅ Large icon (👥 in blue gradient box)
- ✅ Title + subtitle
- ✅ Export + Add Lead buttons
- ✅ Professional layout

---

## 📁 Files to Create/Update

### **1. Page Component**

`src/app/admin/leads/page.tsx`

### **2. Sub-Components**

- `src/components/admin/LeadStatsCards.tsx` - Stats grid
- `src/components/admin/LeadFilters.tsx` - Filter section
- `src/components/admin/LeadsTable.tsx` - Desktop table
- `src/components/admin/LeadCard.tsx` - Mobile card
- `src/components/admin/BulkActions.tsx` - Bulk action bar

### **3. Types**

`src/types/lead.ts` - TypeScript interfaces

### **4. Utilities**

`src/lib/formatters.ts` - Phone number formatting, date formatting

---

## 🚀 Implementation Steps

### **Step 1: Create Type Definitions**

`src/types/lead.ts`:

```typescript
export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  role: 'homeowner' | 'contractor' | 'business'
  location: string
  zipCode: string
  timeline: string
  source: 'web' | 'phone' | 'referral' | 'social'
  status: 'new' | 'contacted' | 'quoted' | 'cold'
  hasQuote: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LeadStats {
  total: number
  withoutQuotes: number
  withQuotes: number
  newThisWeek: number
}

export interface LeadFilters {
  search: string
  status: string
  source: string
  timeline: string
  showOnlyNonConverted: boolean
}
```

---

### **Step 2: Create Stats Cards Component**

`src/components/admin/LeadStatsCards.tsx`:

```typescript
'use client';

import { LeadStats } from '@/types/lead';

interface Props {
  stats: LeadStats;
}

export function LeadStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Leads */}
      <StatCard
        label="Total Leads"
        value={stats.total}
        icon="👥"
        trend="No change this week"
        trendType="neutral"
        variant="primary"
      />

      {/* Without Quotes */}
      <StatCard
        label="Without Quotes"
        value={stats.withoutQuotes}
        icon="⚠️"
        trend="Needs attention"
        trendType="warning"
        variant="warning"
      />

      {/* With Quotes */}
      <StatCard
        label="With Quotes"
        value={stats.withQuotes}
        icon="✅"
        trend={`${stats.total > 0 ? Math.round((stats.withQuotes / stats.total) * 100) : 0}% conversion`}
        trendType="neutral"
        variant="success"
      />

      {/* New This Week */}
      <StatCard
        label="New This Week"
        value={stats.newThisWeek}
        icon="📅"
        trend="Track weekly trends"
        trendType="neutral"
        variant="default"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
  trendType,
  variant
}: {
  label: string;
  value: number;
  icon: string;
  trend: string;
  trendType: 'positive' | 'neutral' | 'negative' | 'warning';
  variant: 'primary' | 'success' | 'warning' | 'default';
}) {
  const variantStyles = {
    primary: 'before:bg-gradient-to-r before:from-flowdoors-blue before:to-flowdoors-blue-600',
    success: 'before:bg-gradient-to-r before:from-flowdoors-green before:to-flowdoors-green-600',
    warning: 'before:bg-gradient-to-r before:from-amber-500 before:to-orange-600',
    default: 'before:bg-gradient-to-r before:from-gray-300 before:to-gray-300',
  };

  const iconStyles = {
    primary: 'bg-gradient-to-br from-flowdoors-blue/10 to-flowdoors-blue/5 text-flowdoors-blue',
    success: 'bg-gradient-to-br from-flowdoors-green/10 to-flowdoors-green/5 text-flowdoors-green',
    warning: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600',
    default: 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600',
  };

  const trendStyles = {
    positive: 'text-flowdoors-green',
    neutral: 'text-gray-600',
    negative: 'text-red-500',
    warning: 'text-amber-600',
  };

  return (
    <div className={`
      relative bg-white rounded-2xl p-6 border border-gray-200
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      before:absolute before:top-0 before:left-0 before:right-0 before:h-1
      before:rounded-t-2xl ${variantStyles[variant]}
    `}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconStyles[variant]}`}>
          {icon}
        </div>
      </div>

      <div className="text-5xl font-bold text-flowdoors-charcoal mb-2">
        {value}
      </div>

      <div className={`flex items-center gap-2 text-sm font-semibold ${trendStyles[trendType]}`}>
        <span>{getTrendIcon(trendType)}</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}

function getTrendIcon(type: string) {
  switch (type) {
    case 'positive': return '↑';
    case 'negative': return '↓';
    case 'warning': return '⚡';
    default: return '→';
  }
}
```

---

### **Step 3: Create Filters Component**

`src/components/admin/LeadFilters.tsx`:

```typescript
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
        <div className="flex items-center gap-2 text-lg font-bold text-flowdoors-charcoal">
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue transition-all"
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue transition-all"
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue transition-all"
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue transition-all"
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
          className="w-5 h-5 text-flowdoors-blue focus:ring-flowdoors-blue/20 rounded cursor-pointer"
        />
        <label htmlFor="non-converted" className="text-sm font-medium text-flowdoors-charcoal cursor-pointer">
          Show only non-converted leads
        </label>
      </div>
    </div>
  );
}
```

---

### **Step 4: Create Table Component**

`src/components/admin/LeadsTable.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import { formatPhone, formatDate } from '@/lib/formatters';

interface Props {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
}

export function LeadsTable({ leads, onEdit, onDelete, onEmail }: Props) {
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
        <h2 className="text-lg font-bold text-flowdoors-charcoal">
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
          <button className="px-4 py-2 bg-flowdoors-blue text-white rounded-lg text-sm font-semibold hover:bg-flowdoors-blue-600 transition-colors flex items-center gap-2">
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
                  checked={selectedIds.size === leads.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-flowdoors-blue rounded cursor-pointer"
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

function LeadRow({ lead, isSelected, onToggleSelect, onEdit, onDelete, onEmail }: any) {
  return (
    <tr className="border-b border-gray-100 hover:bg-flowdoors-blue/[0.02] hover:shadow-[inset_0_0_0_1px_rgba(0,174,239,0.1)] transition-all">
      <td className="px-5 py-5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 text-flowdoors-blue rounded cursor-pointer"
        />
      </td>
      <td className="px-5 py-5">
        <div className="font-semibold text-flowdoors-charcoal">{lead.name}</div>
        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <span>🏡</span>
          <span className="capitalize">{lead.role}</span>
        </div>
      </td>
      <td className="px-5 py-5 text-sm">
        <div className="flex items-center gap-2 mb-1 text-gray-600">
          <span>📧</span>
          <a href={`mailto:${lead.email}`} className="text-flowdoors-blue hover:underline">
            {lead.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>📞</span>
          <a href={`tel:${lead.phone}`} className="text-flowdoors-blue hover:underline">
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
        <div className="text-xs text-gray-400 mt-1">2 days ago</div>
      </td>
      <td className="px-5 py-5">
        <div className="flex gap-2">
          <ActionButton icon="👁️" tooltip="View Details" onClick={() => {}} />
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
    new: 'bg-gradient-to-r from-flowdoors-green to-flowdoors-green-600 text-white',
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

function ActionButton({ icon, tooltip, onClick, variant = 'default' }: any) {
  const variants = {
    default: 'border-gray-200 text-gray-600 hover:bg-gray-50',
    success: 'border-gray-200 text-flowdoors-green hover:bg-flowdoors-green/10 hover:border-flowdoors-green',
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
```

---

### **Step 5: Create Formatters**

`src/lib/formatters.ts`:

```typescript
export function formatPhone(phone: string): string {
  // Input: "5556669988" or "555-666-9988"
  // Output: "(555) 666-9988"
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}
```

---

## 🎨 Cursor Prompts

### **Complete Implementation:**

```
Redesign the FlowDoors admin leads page based on the HTML mockup:

FILES TO CREATE:
- src/types/lead.ts (Lead, LeadStats, LeadFilters interfaces)
- src/components/admin/LeadStatsCards.tsx (4 stat cards with gradients)
- src/components/admin/LeadFilters.tsx (filter section with icons)
- src/components/admin/LeadsTable.tsx (table with bulk actions)
- src/lib/formatters.ts (formatPhone, formatDate utilities)

UPDATE:
- src/app/admin/leads/page.tsx (main page component)

REQUIREMENTS:
1. Use FlowDoors colors: #00aeef (blue), #8dc63f (green), #2e2e2e (charcoal)
2. Stat cards: huge numbers (48px), gradient top borders, hover lift effect
3. Table: 4 action buttons (View, Edit, Email, Delete), hover row effect
4. Bulk selection with checkbox column
5. Mobile: card-based layout below 768px
6. Format phone numbers: (555) 666-9988
7. Clickable email/phone (mailto:, tel:)
8. Status badges with icons and gradients
9. Tooltips on action buttons
10. Tailwind CSS, Next.js 15, TypeScript

Show me a plan first, then implement component by component.
```

### **Step-by-Step:**

**1. Stats Cards:**

```
Create LeadStatsCards component with:
- 4 stat cards (Total, Without Quotes, With Quotes, New This Week)
- 48px bold numbers
- Gradient top border (blue, yellow, green, gray)
- Icon in gradient circle
- Trend text with arrows
- Hover lift effect
- FlowDoors colors
```

**2. Filters:**

```
Create LeadFilters component with:
- White card with subtle shadow
- 4 filter dropdowns with icons (🔎 📊 📍 📅)
- Search input
- "Show only non-converted" checkbox in gray box
- "Clear All Filters" button
- Responsive grid (4 cols → 2 cols → 1 col)
```

**3. Table:**

```
Create LeadsTable component with:
- Checkbox column for bulk selection
- "Select all" checkbox in header
- 4 action buttons per row (View, Edit, Email, Delete) with tooltips
- Hover effect on rows (light blue bg, subtle shadow)
- Status badges with gradients and icons
- Formatted phone numbers (555) 666-9988
- Clickable email/phone links
- Bulk action bar when items selected
```

---

## ✅ Testing Checklist

- [ ] All FlowDoors colors applied (#00aeef, #8dc63f, #2e2e2e)
- [ ] Stat cards show correct numbers and trends
- [ ] Hover effects work on cards and table rows
- [ ] Filters update lead list
- [ ] Bulk selection works (select all, individual)
- [ ] Bulk action bar appears when items selected
- [ ] All 4 action buttons work (View, Edit, Email, Delete)
- [ ] Phone numbers formatted correctly
- [ ] Email/phone links work (mailto:, tel:)
- [ ] Status badges show with correct colors
- [ ] Tooltips appear on action buttons
- [ ] Mobile responsive (cards below 768px)
- [ ] Empty state shows when no leads
- [ ] Export button works
- [ ] Refresh button works

---

## 🎯 Summary

**The redesigned admin page:**

- ✅ Professional FlowDoors branding throughout
- ✅ Clear visual hierarchy (stats → filters → table)
- ✅ Improved usability (bulk actions, 4 action buttons)
- ✅ Better data presentation (formatted contact info, status badges)
- ✅ Mobile responsive (card layout)
- ✅ Modern, premium feel that matches customer-facing pages

**Implementation time:** 4-6 hours
**Impact:** Professional admin experience, faster workflow, better lead management

Ready to implement in Cursor using the prompts above! 🚀
