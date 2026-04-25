'use client'
import React from 'react'
import { QuoteProvider } from '@/context/QuoteContext'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QuoteProvider>{children}</QuoteProvider>
    </ThemeProvider>
  )
}
