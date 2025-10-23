'use client'
import React from 'react'
import { QuoteProvider } from '@/context/QuoteContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QuoteProvider>{children}</QuoteProvider>
}
