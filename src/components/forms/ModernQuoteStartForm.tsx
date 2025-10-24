'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuote } from '@/context/QuoteContext'
import { trackConversion } from '@/lib/analytics/googleAds'
import {
  CUSTOMER_TYPE_OPTIONS,
  HEARD_VIA_OPTIONS,
  TIMELINE_OPTIONS,
  type SelectOption,
} from '@/lib/constants'
import { getStoredAttribution } from '@/lib/marketing/attribution'
import type { Customer, CustomerType, Timeline } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CheckCircle, Clock, Hammer, Home, Lock, Mail, MapPin, Shield, Store } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

/** Helpers: make string tuples for z.enum from {label,value} options */
const toValuesTuple = (opts: SelectOption[]) =>
  opts.map((o) => o.value) as unknown as [string, ...string[]]

const TIMELINE_VALUES = toValuesTuple(TIMELINE_OPTIONS)
const CUSTOMER_TYPE_VALUES = toValuesTuple(CUSTOMER_TYPE_OPTIONS)
const HEARD_VIA_VALUES = toValuesTuple(HEARD_VIA_OPTIONS)

/** Zod schema */
const leadIntakeSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .regex(
      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
      'Please enter a valid US phone number.'
    ),
  zipCode: z
    .string()
    .regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code.'),
  timeline: z.enum(TIMELINE_VALUES, {
    required_error: 'Please select a timeline',
  }),
  customerType: z.enum(CUSTOMER_TYPE_VALUES, {
    required_error: 'Please select a customer type',
  }),
  heardVia: z.enum(HEARD_VIA_VALUES, {
    required_error: 'Please tell us how you heard about us',
  }),
  referralCode: z.string().optional(),
})

export type LeadIntakeValues = z.infer<typeof leadIntakeSchema>

interface ModernQuoteStartFormProps {
  onSubmit?: (_data: LeadIntakeValues) => void | Promise<void>
}

const PROJECT_TYPE_CARDS = [
  {
    value: 'homeowner-updating',
    icon: Home,
    title: 'Updating My Home',
    description: 'Renovating or upgrading existing home',
  },
  {
    value: 'homeowner-building',
    icon: Building2,
    title: 'Building New Home',
    description: 'New construction or custom build',
  },
  {
    value: 'commercial',
    icon: Store,
    title: 'Commercial Project',
    description: 'Restaurant, office, or retail space',
  },
  {
    value: 'contractor',
    icon: Hammer,
    title: "I'm a Contractor",
    description: 'Getting quote for client project',
  },
]

export function ModernQuoteStartForm({ onSubmit }: ModernQuoteStartFormProps) {
  const { dispatch } = useQuote()

  const form = useForm<LeadIntakeValues>({
    resolver: zodResolver(leadIntakeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      zipCode: '',
      timeline: '' as unknown as (typeof TIMELINE_VALUES)[number],
      customerType: '' as unknown as (typeof CUSTOMER_TYPE_VALUES)[number],
      heardVia: '' as unknown as (typeof HEARD_VIA_VALUES)[number],
      referralCode: '',
    },
    mode: 'onBlur',
  })

  const selectedCustomerType = form.watch('customerType')

  const handleSubmit = async (formData: LeadIntakeValues) => {
    console.info('✅ Form validation passed, submitting...', formData)

    const updatedData: Partial<Customer> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      zipCode: formData.zipCode,
      timeline: formData.timeline as Timeline,
      customerType: formData.customerType as CustomerType,
      heardVia: [formData.heardVia],
      referralCode: formData.referralCode || undefined,
    }

    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: updatedData })

    // Send final lead to backend and trigger notification emails (non-blocking)
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    const payload = {
      name: fullName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      zip: formData.zipCode,
      timeline: formData.timeline,
      role: formData.customerType,
      referral: formData.referralCode,
    }

    // Fire and forget - don't wait for this to complete
    fetch('/api/quote/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(() => {
        console.info(
          '📧 Lead submitted and notification triggered for:',
          formData.email
        )

        // Track Google Ads conversion
        const conversionLabel =
          process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ||
          'lead_form_submission'
        const attribution = getStoredAttribution()
        trackConversion(
          conversionLabel,
          0,
          attribution?.gclid,
          formData.email
        ).catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              '[GTM] Conversion tracking failed (check dataLayer):',
              error
            )
          }
        })
      })
      .catch((error) => {
        console.warn('Failed to submit lead (continuing anyway):', error)
      })

    // Call onSubmit immediately - don't wait for API
    if (onSubmit) {
      onSubmit(formData)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-16 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Form Container */}
        <div className="relative rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
          {/* Subtle accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-flowdoors-blue via-flowdoors-green to-flowdoors-blue" />
          
          {/* Hero Section */}
          <div className="pt-12 pb-10 px-6 md:px-16 text-center">
            <div className="inline-flex items-center justify-center mb-8">
              <Image
                src="https://cdn.prod.website-files.com/68eb23d6b164de93ccd62c6c/68eb3750e48df95bf88053dc_FlowDoors%20Logo%202D%20alpha.png"
                alt="FlowDoors Logo"
                width={180}
                height={60}
                className="h-auto"
                priority
              />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-bold text-flowdoors-charcoal mb-3 leading-tight">
              Design Your Perfect Door System
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Tell us about your project and we'll help you create something beautiful. No pressure, just possibilities.
            </p>

            {/* Trust indicators - less rigid layout */}
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-flowdoors-green" />
                <span className="font-medium">Free consultation</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-flowdoors-green" />
                <span className="font-medium">24-hour response</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-flowdoors-green" />
                <span className="font-medium">San Diego based</span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-6 py-10 md:px-16 md:py-12">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-16">
              {/* Step 1: About Yourself */}
              <div>
                <div className="flex items-start gap-5 mb-7">
                  <div className="relative mt-1">
                    <div className="w-10 h-10 rounded-lg bg-flowdoors-blue/10 flex items-center justify-center text-flowdoors-blue text-lg font-bold border-2 border-flowdoors-blue/20">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-flowdoors-charcoal mb-1">
                      Tell us about yourself
                    </h3>
                    <p className="text-slate-500 text-sm md:text-base">
                      So we can send you your personalized quote
                    </p>
                  </div>
                </div>

                <div className="ml-0 md:ml-15 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 mb-1.5 block">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      placeholder="John"
                      className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue"
                    />
                    {form.formState.errors.firstName && (
                      <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      placeholder="Smith"
                      className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue"
                    />
                    {form.formState.errors.lastName && (
                      <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="john@example.com"
                      className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      placeholder="(619) 555-1234"
                      className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue"
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-500">For scheduling your free consultation</p>
                  </div>
                </div>
              </div>

              {/* Subtle divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
              </div>

              {/* Step 2: Your Project */}
              <div>
                <div className="flex items-start gap-5 mb-7">
                  <div className="relative mt-1">
                    <div className="w-10 h-10 rounded-lg bg-flowdoors-green/10 flex items-center justify-center text-flowdoors-green text-lg font-bold border-2 border-flowdoors-green/20">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-flowdoors-charcoal mb-1">
                      About your project
                    </h3>
                    <p className="text-slate-500 text-sm md:text-base">
                      Help us understand what you're building
                    </p>
                  </div>
                </div>

                <div className="ml-0 md:ml-15 space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      What type of project? <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {PROJECT_TYPE_CARDS.map((type) => {
                        const Icon = type.icon
                        const isSelected = selectedCustomerType === type.value
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => form.setValue('customerType', type.value as any)}
                            className={`relative p-5 rounded-xl border transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-flowdoors-blue bg-flowdoors-blue/5 shadow-[0_0_0_3px_rgba(0,174,239,0.15)]'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`mb-3 inline-flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                              isSelected 
                                ? 'bg-flowdoors-blue/10 text-flowdoors-blue' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div className={`font-semibold text-sm mb-1 ${
                              isSelected ? 'text-flowdoors-blue' : 'text-slate-900'
                            }`}>
                              {type.title}
                            </div>
                            <div className="text-xs text-slate-500 leading-snug">
                              {type.description}
                            </div>
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 rounded-full bg-flowdoors-blue flex items-center justify-center">
                                  <CheckCircle className="w-3.5 h-3.5 text-white" fill="white" />
                                </div>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {form.formState.errors.customerType && (
                      <p className="mt-2 text-sm text-red-600">{form.formState.errors.customerType.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Project location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        {...form.register('zipCode')}
                        placeholder="e.g., 92101"
                        className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue"
                      />
                      {form.formState.errors.zipCode && (
                        <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.zipCode.message}</p>
                      )}
                      <p className="mt-1.5 text-xs text-slate-500">ZIP code helps us provide accurate pricing</p>
                    </div>

                    <div>
                      <Label htmlFor="timeline" className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Project timeline <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) => form.setValue('timeline', value as any)}
                        value={form.watch('timeline')}
                      >
                        <SelectTrigger className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue">
                          <SelectValue placeholder="When do you need this?" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMELINE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.timeline && (
                        <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.timeline.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
              </div>

              {/* Step 3: How did you hear */}
              <div>
                <div className="flex items-start gap-5 mb-7">
                  <div className="relative mt-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-bold border-2 border-slate-200">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-flowdoors-charcoal mb-1">
                      One last thing
                    </h3>
                    <p className="text-slate-500 text-sm md:text-base">
                      Optional — helps us serve you better
                    </p>
                  </div>
                </div>

                <div className="ml-0 md:ml-15 space-y-5 max-w-lg">
                  <div>
                    <Label htmlFor="heardVia" className="text-sm font-medium text-slate-700 mb-1.5 block">
                      How did you find us?
                    </Label>
                    <Select
                      onValueChange={(value) => form.setValue('heardVia', value as any)}
                      value={form.watch('heardVia')}
                    >
                      <SelectTrigger className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue">
                        <SelectValue placeholder="Select an option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HEARD_VIA_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.heardVia && (
                      <p className="mt-1.5 text-sm text-red-600">{form.formState.errors.heardVia.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="referralCode" className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Referral code
                    </Label>
                    <Input
                      id="referralCode"
                      {...form.register('referralCode')}
                      placeholder="e.g., FRIEND10"
                      className="h-11 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue/20 focus:border-flowdoors-blue"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Have a code? Enter it for special savings</p>
                  </div>

                  <div className="pt-2">
                    <Link 
                      href="/admin/login" 
                      className="text-sm text-slate-600 hover:text-flowdoors-blue transition-colors"
                    >
                      Admin Login
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* CTA Section - More natural, less "perfect" */}
          <div className="relative bg-gradient-to-br from-flowdoors-blue via-flowdoors-blue to-blue-700 px-6 py-12 md:px-16 md:py-16">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            </div>
            
            <div className="relative text-center text-white">
              <h3 className="text-2xl md:text-4xl font-display font-bold mb-3 max-w-2xl mx-auto leading-tight">
                Ready to see what's possible?
              </h3>
              <p className="text-base md:text-lg mb-10 opacity-90 max-w-xl mx-auto">
                Let's start designing your custom door system
              </p>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={form.formState.isSubmitting}
                className="h-14 px-10 bg-white text-flowdoors-blue hover:bg-slate-50 text-base font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                {form.formState.isSubmitting ? 'Submitting...' : 'Continue to Product Selection'}
              </Button>

              <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Secure & private
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  No obligation
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  No spam
                </span>
              </div>
            </div>
          </div>

          {/* Social Proof - Simplified */}
          <div className="bg-slate-50 px-6 py-8 text-center border-t border-slate-100">
            <div className="flex justify-center gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-flowdoors-green text-xl">★</span>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-flowdoors-charcoal">4.9 out of 5 stars</span> from over 250 happy customers
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

