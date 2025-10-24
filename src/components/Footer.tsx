'use client'

import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  
  // Hide footer on admin pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/marketing')) {
    return null
  }

  return (
    <footer className="mt-auto py-8 px-4 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} FlowDoors. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

