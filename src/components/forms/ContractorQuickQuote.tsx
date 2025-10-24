'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contractorFormSchema, type ContractorFormData } from '@/lib/validation/contractor-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trackConversion } from '@/lib/analytics/googleAds'
import { getStoredAttribution } from '@/lib/marketing/attribution'
import { Building2, Clock, Ruler, Phone, Mail, MapPin, Briefcase } from 'lucide-react'
import Image from 'next/image'

export function ContractorQuickQuote() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContractorFormData>({
    resolver: zodResolver(contractorFormSchema),
    mode: 'onBlur',
    defaultValues: {
      projectType: 'residential',
      timeline: 'planning',
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: ContractorFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'contractor',
          source: 'contractor-quote-form',
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      // Track conversion
      const attribution = getStoredAttribution()
      trackConversion('contractor_quote_submission', 0, attribution?.gclid, data.email).catch(
        console.warn
      )

      // Redirect to thank you page
      window.location.href = '/thank-you?type=contractor'
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Something went wrong. Please try again or call us at (619) 555-0123.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-flowdoors-charcoal-800 via-flowdoors-charcoal to-slate-900 py-12 px-[5vw]">
      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <Image
            src="/brand/flowdoors-logo.png"
            alt="FlowDoors Logo"
            width={200}
            height={60}
            className="mx-auto mb-4 brightness-200"
          />
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Trade Professional Portal 🔨
          </h1>
          <p className="text-slate-300 text-lg">
            Fast, detailed quotes for contractors • Same-day response • Volume pricing available
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Benefits */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-flowdoors-blue-900/30 backdrop-blur border border-flowdoors-blue-500/20 p-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">
                Why Contractors Choose Us
              </h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-flowdoors-green">✓</span>
                  <span><strong>Same-Day Quotes:</strong> Get pricing within hours, not days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flowdoors-green">✓</span>
                  <span><strong>Volume Discounts:</strong> Special pricing for contractors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flowdoors-green">✓</span>
                  <span><strong>Technical Support:</strong> Dedicated installer drawings & specs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flowdoors-green">✓</span>
                  <span><strong>Fast Delivery:</strong> Priority scheduling for your timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-flowdoors-green">✓</span>
                  <span><strong>Dedicated Rep:</strong> One point of contact for all projects</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-flowdoors-green-900/30 backdrop-blur border border-flowdoors-green-500/20 p-6">
              <h3 className="font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-sm text-slate-300 mb-3">
                Our contractor support team is here for you:
              </p>
              <div className="space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-flowdoors-green" />
                  <span>(619) 555-0123</span>
                                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-flowdoors-green" />
                  <span>contractors@flowdoors.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="text-2xl font-display font-bold text-flowdoors-charcoal mb-6">
                Get Your Contractor Quote
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-flowdoors-charcoal flex items-center gap-2 border-b pb-2">
                    <Briefcase className="h-5 w-5 text-flowdoors-blue" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="John Smith"
                        className="mt-1"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        {...register('companyName')}
                        placeholder="Smith Construction"
                        className="mt-1"
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="john@smithconstruction.com"
                        className="mt-1"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="(555) 123-4567"
                        className="mt-1"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License # (optional)</Label>
                      <Input
                        id="licenseNumber"
                        {...register('licenseNumber')}
                        placeholder="e.g., CA-123456"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tradeType">Trade Type (optional)</Label>
                      <Input
                        id="tradeType"
                        {...register('tradeType')}
                        placeholder="e.g., General Contractor"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-flowdoors-charcoal flex items-center gap-2 border-b pb-2">
                    <Building2 className="h-5 w-5 text-flowdoors-blue" />
                    Project Details
                  </h3>

                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select
                      onValueChange={(value) => setValue('projectType', value as any)}
                      value={watchedValues.projectType}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="multi-unit">Multi-Unit/Apartment</SelectItem>
                        <SelectItem value="custom">Custom/High-End</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.projectType && (
                      <p className="mt-1 text-sm text-red-600">{errors.projectType.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Project Location *
                      </Label>
                      <Input
                        id="location"
                        {...register('location')}
                        placeholder="e.g., San Diego, CA"
                        className="mt-1"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        {...register('zipCode')}
                        placeholder="92101"
                        className="mt-1"
                        maxLength={5}
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Door Specifications Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-flowdoors-charcoal flex items-center gap-2 border-b pb-2">
                    <Ruler className="h-5 w-5 text-flowdoors-blue" />
                    Door Specifications
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="doorCount">Number of Doors *</Label>
                      <Input
                        id="doorCount"
                        type="number"
                        {...register('doorCount')}
                        placeholder="e.g., 4"
                        className="mt-1"
                        min="1"
                      />
                      {errors.doorCount && (
                        <p className="mt-1 text-sm text-red-600">{errors.doorCount.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="doorWidth">Width (inches)</Label>
                      <Input
                        id="doorWidth"
                        {...register('doorWidth')}
                        placeholder="e.g., 36"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="doorHeight">Height (inches)</Label>
                      <Input
                        id="doorHeight"
                        {...register('doorHeight')}
                        placeholder="e.g., 96"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeline" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Project Timeline *
                      </Label>
                      <Select
                        onValueChange={(value) => setValue('timeline', value)}
                        value={watchedValues.timeline}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning Phase (3+ months)</SelectItem>
                          <SelectItem value="soon">Starting Soon (1-3 months)</SelectItem>
                          <SelectItem value="urgent">Urgent (Within 1 month)</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.timeline && (
                        <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="budget">Budget Range (optional)</Label>
                      <Select
                        onValueChange={(value) => setValue('budget', value)}
                        value={watchedValues.budget}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-10k">Under $10,000</SelectItem>
                          <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k-plus">$50,000+</SelectItem>
                          <SelectItem value="not-sure">TBD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Details or Special Requirements</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Specs, installation notes, or any other important details..."
                    className="mt-1 min-h-24"
                  />
                  <p className="mt-1 text-sm text-slate-500">
                    Include any technical specifications, job site details, or special requirements
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="h-12 w-full bg-flowdoors-blue hover:bg-flowdoors-blue-600 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Contractor Quote 🚀'}
                  </Button>
                  <p className="mt-3 text-center text-sm text-slate-500">
                    🔒 Your information is confidential • Same-day response guaranteed
                  </p>
                </div>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-flowdoors-green">&lt; 4hrs</div>
                <div className="text-xs text-slate-300">Avg. Response Time</div>
              </div>
              <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-flowdoors-green">15-30%</div>
                <div className="text-xs text-slate-300">Contractor Discount</div>
              </div>
              <div className="rounded-lg bg-white/10 backdrop-blur p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-flowdoors-green">200+</div>
                <div className="text-xs text-slate-300">Partner Contractors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

