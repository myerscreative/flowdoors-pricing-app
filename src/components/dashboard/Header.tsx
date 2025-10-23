'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import * as React from 'react'

/* ------------------------------- Icons (SVG) ---------------------------- */
const TrendingUp = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
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
const Download = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export type HeaderProps = {
  teamSize: number
  targetUsd: number
  manageUsersHref: string
  onExport: () => void
}

export default function Header({
  teamSize,
  targetUsd,
  manageUsersHref,
  onExport,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">
            Sales Command Center
          </h3>
          <p className="text-sm text-slate-600">
            Team of {teamSize} • H1 Target{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(targetUsd / 1000)}
            K
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={manageUsersHref}>
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
