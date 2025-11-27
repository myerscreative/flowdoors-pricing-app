'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import type { MoodStats } from '@/types'

interface HeroSectionProps {
  user: any
  stats: MoodStats | null
}

const encouragementMessages = [
  "God's grace is bigger than the toughest moment you'll face today.",
  'You are fully loved, fully accepted, and fully favored in Christ.',
  "His strength is made perfect in your weakness—lean on Him today.",
  'You are not alone. God walks with you in every step and every decision.',
  'Peace flows when your heart is anchored in His goodness.',
  "God's supply for you today is greater than any need you'll have.",
  'You have a sound mind, a strong spirit, and a steady heart.',
  "God's wisdom is available to you the moment you ask.",
  'You can cast your cares on Him because He cares deeply for you.',
  'His joy is your strength — let it rise in you today.',
]

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user }) => {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '')

  const greeting = useMemo(() => {
    if (name) {
      const timeOfDay = getTimeOfDay()
      return `Good ${timeOfDay}, ${name} 👋`
    }
    return 'Welcome back 👋'
  }, [name])

  const dailyMessage = useMemo(() => {
    const today = new Date()
    const index = today.getDate() % encouragementMessages.length
    return encouragementMessages[index]
  }, [])

  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-md shadow-purple-900/5 border border-white/70 bg-gradient-to-br from-orange-50 via-white to-indigo-50 px-6 py-8 md:px-8 md:py-10">
        {/* Soft gradient wash using VibePoint palette */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(249, 115, 22, 0.18), transparent 55%), radial-gradient(circle at 90% 10%, rgba(139, 92, 246, 0.2), transparent 55%)',
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Text + encouragement */}
          <div className="space-y-3 md:max-w-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600/80">
              Today&apos;s check-in
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">{greeting}</h1>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dailyMessage}
            </p>
          </div>

          {/* CTA column */}
          <div className="w-full md:max-w-xs space-y-3">
            {/* Primary CTA */}
            <Link
              href="/mood"
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-lg font-medium text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all duration-200 md:w-auto"
            >
              Log New Mood
            </Link>

            {/* Secondary / My Recipes toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/recipes"
                className="inline-flex items-center rounded-full border border-pink-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-pink-600 shadow-sm hover:bg-pink-50 hover:border-pink-200 transition-colors"
              >
                <span>My Recipes</span>
                <span className="ml-2 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pink-500">
                  Pro
                </span>
              </Link>

              <Link
                href="/history"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                View history
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection


