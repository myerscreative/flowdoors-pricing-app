'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { Calendar, BarChart3, Users, Menu, ArrowLeft } from 'lucide-react'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      href: '/marketing',
      label: 'Summary',
      icon: BarChart3,
      description: 'Overview & metrics',
    },
    {
      href: '/marketing/cohorts',
      label: 'Cohorts',
      icon: Users,
      description: 'Cohort analysis',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Top navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button and back button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link
                href="/admin"
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Admin</span>
              </Link>
            </div>

            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Marketing
              </h1>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>{item.label}</span>
                      <span
                        className={`text-xs ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Date indicator - hidden on mobile */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Marketing Dashboard</span>
            </div>
          </div>
        </div>

        {/* Mobile navigation menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div>{item.label}</div>
                    <div
                      className={`text-sm ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Page content - scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  )
}
