// src/app/demo-modals/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CustomerDialog from '@/components/summary/CustomerDialog'
import DealDetailsModal from '@/components/summary/DealDetailsModal'

export default function DemoModalsPage() {
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [dealDetailsOpen, setDealDetailsOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Modal Styling Demo</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Add New Contact Modal</h2>
            <p className="text-gray-600 mb-4">
              This modal demonstrates the clean, modern styling from the first image with:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Dark theme with proper contrast</li>
              <li>Organized sections with clear headings</li>
              <li>Rounded input fields with dark backgrounds</li>
              <li>Gradient action buttons</li>
              <li>Proper spacing and typography</li>
            </ul>
            <Button 
              onClick={() => setCustomerDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Open Add New Contact Modal
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Deal Details Modal</h2>
            <p className="text-gray-600 mb-4">
              This modal demonstrates the deal details styling from the second image with:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Deal name and status dropdown</li>
              <li>Deal value card with prominent display</li>
              <li>Contact information with icons</li>
              <li>Timeline section with key dates</li>
              <li>Deal information grid</li>
              <li>Action buttons at the bottom</li>
            </ul>
            <Button 
              onClick={() => setDealDetailsOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Open Deal Details Modal
            </Button>
          </div>
        </div>

        {/* Modals */}
        <CustomerDialog 
          open={customerDialogOpen} 
          onOpenChange={setCustomerDialogOpen} 
        />
        
        <DealDetailsModal 
          open={dealDetailsOpen} 
          onOpenChange={setDealDetailsOpen} 
        />
      </div>
    </main>
  )
}
