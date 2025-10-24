'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  
  // Hide footer on admin pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/marketing')) {
    return null
  }

  return (
    <footer className="mt-auto py-8 px-4 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} FlowDoors. All rights reserved.
        </div>
        <Link
          href="/admin"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors md:text-xs sm:text-[10px]"
        >
          <span className="hidden md:inline">Staff</span>
          <span className="md:hidden">•</span>
        </Link>
      </div>
    </footer>
  )
}

