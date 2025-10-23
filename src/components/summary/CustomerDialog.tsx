// src/components/summary/CustomerDialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuote } from '@/context/QuoteContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  User,
} from 'lucide-react'
import { Timeline, CustomerType, BudgetRange } from '@/lib/types'

type Props = {
  open: boolean
  onOpenChange: (_open: boolean) => void
}


export default function CustomerDialog({ open: _open, onOpenChange }: Props) {
  const { state, dispatch } = useQuote()
  const { toast } = useToast()
  const { customer } = state

  const [formData, setFormData] = useState({
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || '',
    email: customer.email || '',
    zipCode: customer.zipCode || '',
    timeline: customer.timeline || '',
    customerType: customer.customerType || '',
    referralCode: customer.referralCode || '',
    budget: customer.budget || '',
    heardVia: customer.heardVia || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (_open) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        zipCode: customer.zipCode || '',
        timeline: customer.timeline || '',
        customerType: customer.customerType || '',
        referralCode: customer.referralCode || '',
        budget: customer.budget || '',
        heardVia: customer.heardVia || [],
      })
      setErrors({})
    }
  }, [customer, _open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }


  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors below before saving.',
        variant: 'destructive',
      })
      return
    }

    dispatch({
      type: 'SET_CUSTOMER_DETAILS',
      payload: {
        ...formData,
        timeline: formData.timeline as Timeline,
        customerType: formData.customerType as CustomerType,
        budget: formData.budget as BudgetRange,
      },
    })

    toast({
      title: 'Customer Information Saved',
      description: 'Customer details have been updated successfully.',
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={_open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <div className="p-2 bg-blue-600 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            Add New Contact
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-2">Create a new contact for your CRM.</p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-slate-300 text-sm font-medium">Full Name *</Label>
                <Input
                  id="firstName"
                  value={`${formData.firstName} ${formData.lastName}`.trim()}
                  onChange={(e) => {
                    const names = e.target.value.split(' ')
                    handleInputChange('firstName', names[0] || '')
                    handleInputChange('lastName', names.slice(1).join(' ') || '')
                  }}
                  className={`bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 ${errors.firstName ? 'border-red-500' : 'focus:border-blue-500'}`}
                  placeholder="John Doe"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="status" className="text-slate-300 text-sm font-medium">Status</Label>
                <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3">
                  <span className="text-white bg-green-600 px-3 py-1 rounded-full text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 ${errors.email ? 'border-red-500' : 'focus:border-blue-500'}`}
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-300 text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 ${errors.phone ? 'border-red-500' : 'focus:border-blue-500'}`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-400 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="extension" className="text-slate-300 text-sm font-medium">Extension</Label>
              <Input
                id="extension"
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-blue-500"
                placeholder="e.g., 1234"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company" className="text-slate-300 text-sm font-medium">Company</Label>
                <Input
                  id="company"
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-blue-500"
                  placeholder="ACME Corporation"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle" className="text-slate-300 text-sm font-medium">Job Title</Label>
                <Input
                  id="jobTitle"
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-blue-500"
                  placeholder="CTO"
                />
              </div>
            </div>
          </div>

          {/* Notes & Follow-up */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Notes & Follow-up</h3>
            <div>
              <Label htmlFor="notes" className="text-slate-300 text-sm font-medium">Notes</Label>
              <textarea
                id="notes"
                className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Add any initial notes about this contact..."
              />
            </div>
            <div>
              <Label htmlFor="followUpDate" className="text-slate-300 text-sm font-medium">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-blue-500"
                defaultValue="2025-10-20"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-slate-700">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 rounded-xl px-6 py-3"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 font-medium"
          >
            <User className="mr-2 h-4 w-4" />
            + Create Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
