'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import type { ElementType } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import {
    Award,
    BadgeCheck,
    Lock,
    Phone,
    Shield,
    Trophy,
    Zap,
} from 'lucide-react'

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

// Export the type for use in other files
export type LeadIntakeValues = z.infer<typeof leadIntakeSchema>

// Props interface for the component
interface LeadIntakeFormProps {
  onSubmit?: (_data: LeadIntakeValues) => void | Promise<void>
}

const ValueProp = ({
  icon: Icon,
  text,
}: {
  icon: ElementType
  text: string
}) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
)

const TrustBadge = ({
  icon: Icon,
  text,
}: {
  icon: ElementType
  text: string
}) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
      <Icon className="h-6 w-6 text-green-600" />
    </div>
    <span className="text-sm font-medium text-muted-foreground">{text}</span>
  </div>
)

export function LeadIntakeForm({ onSubmit }: LeadIntakeFormProps) {
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

        // Track Google Ads conversion via GTM after successful lead submission
        // Note: GTM will handle the actual Google Ads tag firing
        const conversionLabel =
          process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ||
          'lead_form_submission' // Default label for GTM
        const attribution = getStoredAttribution()
        trackConversion(
          conversionLabel,
          0, // Lead value - set to 0 or configure as needed
          attribution?.gclid,
          formData.email // Use email as unique transaction ID
        ).catch((error) => {
          // Silently fail - don't block user flow
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

  // Autosave: debounce payload to /api/quote/leads (PUT upsert)
  // Only save when required fields (name, email, phone) are present
  const autosave = (values: LeadIntakeValues) => {
    // Validate required fields before saving
    const fullName = `${values.firstName} ${values.lastName}`.trim()
    const hasRequiredFields =
      fullName.length >= 2 &&
      values.email.trim().length > 0 &&
      values.phone.trim().length > 0

    // Don't save if required fields are missing
    if (!hasRequiredFields) {
      return
    }

    const payload = {
      // name is convenient for API; also send split for server's convenience
      name: fullName,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      zip: values.zipCode,
      timeline: values.timeline,
      role: values.customerType,
      referral: values.referralCode,
    } as const

    // Use sendBeacon when available for reliability on page unload
    const url = '/api/quote/leads'
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    })
    if (navigator && 'sendBeacon' in navigator) {
      ;(navigator as any).sendBeacon(url, blob)
      return
    }
    // Fallback to fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    })
      .catch(() => {
        // Silently fail - this is just autosave
      })
      .finally(() => {
        clearTimeout(timeoutId)
      })
  }

  // Debounced autosave on field changes - less aggressive
  let autosaveTimer: ReturnType<typeof setTimeout> | undefined
  const handleChange = () => {
    const currentValues = form.getValues()
    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      autosave(currentValues as LeadIntakeValues)
    }, 2000) // Increased from 600ms to 2s to reduce API calls
  }

  // Attach change listeners to all fields
  form.watch(() => handleChange())

  // Ensure data is sent on exit/navigation
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      const currentValues = form.getValues()
      autosave(currentValues as LeadIntakeValues)
    })
    window.addEventListener('pagehide', () => {
      const currentValues = form.getValues()
      autosave(currentValues as LeadIntakeValues)
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="rounded-t-2xl bg-slate-800 p-8 text-white">
        <div className="mb-4 flex justify-center">
          <Image
            src="/brand/flowdoors-logo.png"
            alt="FlowDoors Logo"
            width={200}
            height={0}
            className="object-contain"
            style={{ height: 'auto', width: 'auto' }}
          />
        </div>
        <p className="mb-8 text-center text-slate-300">
          Premium Window & Door Solutions
        </p>
        <div className="flex justify-around">
          <ValueProp icon={Award} text="Custom Design" />
          <ValueProp icon={Zap} text="24hr Quote" />
          <ValueProp icon={Shield} text="15 Year Warranty" />
        </div>
      </div>

      {/* Form */}
      <div className="rounded-b-2xl bg-card p-8 text-card-foreground shadow-2xl">
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-semibold text-primary">
            Step 1 of 5 - Contact Information
          </p>
          <div className="mb-4 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: '20%' }}
            />
          </div>
          <h2 className="text-3xl font-bold">Start Your Custom Quote</h2>
          <p className="mt-1 text-muted-foreground">
            Tell us about your project and we'll create a personalized solution
            for you.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.error('❌ Form validation failed:', errors)
            })}
            className="space-y-6"
          >
            {/* First/Last Name */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email/Phone */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Zip/Referral */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project ZIP Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="92078" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. FRIEND10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timeline/Customer Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Timeline *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMELINE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What best describes you? *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select one..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Heard Via */}
            <FormField
              control={form.control}
              name="heardVia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you hear about us? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HEARD_VIA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="h-12 w-full text-lg">
              Continue to Product Selection →
            </Button>
          </form>
        </Form>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
          <TrustBadge icon={Lock} text="Secure & Private" />
          <TrustBadge icon={Phone} text="No Pressure Sales" />
          <TrustBadge icon={Trophy} text="947 Projects Completed" />
          <TrustBadge icon={BadgeCheck} text="Licensed & Insured" />
        </div>
      </div>
    </div>
  )
}
