'use client'
import { QuoteProvider } from '@/context/QuoteContext'
import { useAdminShortcut } from '@/hooks/useAdminShortcut'
import React from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Activate admin shortcut hook
  useAdminShortcut()

  return <QuoteProvider>{children}</QuoteProvider>
}
