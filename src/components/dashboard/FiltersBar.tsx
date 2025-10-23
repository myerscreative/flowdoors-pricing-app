'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ------------------------------- Icons (SVG) ---------------------------- */
const Calendar = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const Users = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const Filter = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

export type MinimalUser = { id: string; name: string; role?: string }

export type FiltersBarProps = {
  selectedTimeRange: 'week' | 'month' | 'quarter' | 'year'
  onChangeTimeRange: (_value: 'week' | 'month' | 'quarter' | 'year') => void
  selectedRep: string
  onChangeRep: (_value: string) => void
  selectedRegion: string
  onChangeRegion: (_value: string) => void
  usersLoading: boolean
  users: MinimalUser[]
}

export default function FiltersBar({
  selectedTimeRange,
  onChangeTimeRange,
  selectedRep,
  onChangeRep,
  selectedRegion,
  onChangeRegion,
  usersLoading,
  users,
}: FiltersBarProps) {
  const currentRepLabel =
    selectedRep === 'all'
      ? 'All Reps'
      : (users.find((r) => r.id === selectedRep)?.name ?? selectedRep)

  return (
    <>
      <div className="mr-1 flex items-center gap-2 text-slate-700">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <Select
        value={selectedTimeRange}
        onValueChange={(val) =>
          onChangeTimeRange(val as FiltersBarProps['selectedTimeRange'])
        }
      >
        <SelectTrigger className="w-40">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Time range" />
        </SelectTrigger>
        <SelectContent className="z-50">
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedRep} onValueChange={(val) => onChangeRep(val)}>
        <SelectTrigger className="w-44">
          <Users className="mr-2 h-4 w-4" />
          <SelectValue placeholder={usersLoading ? 'Loading...' : 'Rep'}>
            {currentRepLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50">
          <SelectItem value="all">All Reps</SelectItem>
          {usersLoading ? (
            <SelectItem value="loading" disabled>
              Loading users...
            </SelectItem>
          ) : users.length > 0 ? (
            users.map((rep) => (
              <SelectItem key={rep.id} value={rep.id}>
                {rep.name} ({rep.role ?? 'Unknown'})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-users" disabled>
              No users found
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select
        value={selectedRegion}
        onValueChange={(val) => onChangeRegion(val)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent className="z-50">
          <SelectItem value="all">All Regions</SelectItem>
          <SelectItem value="West">West</SelectItem>
          <SelectItem value="East">East</SelectItem>
          <SelectItem value="Central">Central</SelectItem>
          <SelectItem value="International">International</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
