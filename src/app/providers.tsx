'use client'
import React from 'react'
import { QuoteProvider } from '@/context/QuoteContext'
import { useAdminShortcut } from '@/hooks/useAdminShortcut'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Activate admin shortcut hook
  useAdminShortcut()

  return <QuoteProvider>{children}</QuoteProvider>
}
