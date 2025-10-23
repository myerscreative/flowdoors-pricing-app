// src/app/summary/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuote } from '@/context/QuoteContext'
import { useToast } from '@/hooks/use-toast'

// Stub components (already created)
import ItemsTable from '@/components/summary/ItemsTable'
import ItemsCards from '@/components/summary/ItemsCards'
import ServicesSection from '@/components/summary/ServicesSection'
import TotalsSidebar from '@/components/summary/TotalsSidebar'
import PreviewDialog from '@/components/summary/PreviewDialog'
import EmailConfirmDialog from '@/components/summary/EmailConfirmDialog'
import NewQuoteDialog from '@/components/summary/NewQuoteDialog'
import CustomerDialog from '@/components/summary/CustomerDialog'

export default function SummaryPage() {
  const router = useRouter()
  const { state } = useQuote()
  const { toast } = useToast()

  // Local state only for controlling modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEmailConfirmOpen, setIsEmailConfirmOpen] = useState(false)
  const [isConfirmStartOpen, setIsConfirmStartOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  const items = state.items || []

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                toast({ title: 'Add Products clicked' })
                router.push('/configure')
              }}
              className="shrink-0 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Add Products
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-semibold text-gray-900">
                Your Quote Summary
              </h1>
              <p className="text-gray-600">
                Review your selections and finalize your order
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast({ title: 'Save Quote clicked' })}
                className="shrink-0 bg-white text-gray-700 py-2 px-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Save Quote
              </button>
              <button
                onClick={() => setIsConfirmStartOpen(true)}
                className="shrink-0 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Start New Quote
              </button>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Selected Items ({items.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="mx-auto max-w-5xl">
                {/* Desktop */}
                <div className="hidden md:block">
                  <ItemsTable />
                </div>
                {/* Mobile */}
                <div className="md:hidden">
                  <ItemsCards />
                </div>
              </div>
            </div>
          </div>

          {/* Services + Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ServicesSection />
            </div>
            <TotalsSidebar
              onDownloadPdf={() => router.push('/pdf-preview')}
              onEmailQuote={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <PreviewDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
      <EmailConfirmDialog
        open={isEmailConfirmOpen}
        onOpenChange={setIsEmailConfirmOpen}
      />
      <NewQuoteDialog
        open={isConfirmStartOpen}
        onOpenChange={setIsConfirmStartOpen}
      />
      <CustomerDialog
        open={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
      />
    </div>
  )
}
