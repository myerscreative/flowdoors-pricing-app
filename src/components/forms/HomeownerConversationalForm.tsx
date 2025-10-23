'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { homeownerFormSchema, type HomeownerFormData } from '@/lib/validation/homeowner-schema'
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
import { ArrowLeft, ArrowRight, Check, Home, Building2, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'

type Step = 1 | 2 | 3

export function HomeownerConversationalForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<HomeownerFormData>({
    resolver: zodResolver(homeownerFormSchema),
    mode: 'onBlur',
    defaultValues: {
      bestTimeToCall: 'anytime',
      projectType: 'home-update',
      timeline: 'planning',
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: HomeownerFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'homeowner',
          source: 'get-quote-form',
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      // Track conversion
      const attribution = getStoredAttribution()
      trackConversion('homeowner_quote_submission', 0, attribution?.gclid, data.email).catch(
        console.warn
      )

      // Redirect to thank you page or show success
      window.location.href = '/thank-you'
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Something went wrong. Please try again or call us at (619) 555-0123.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof HomeownerFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'bestTimeToCall']
    } else if (currentStep === 2) {
      fieldsToValidate = ['projectType', 'location', 'zipCode', 'timeline']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const renderProgressBar = () => {
    const progress = (currentStep / 3) * 100
    return (
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-slate-600">
          <span>Step {currentStep} of 3</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-flowdoors-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-flowdoors-charcoal mb-2">
          Let's Get Started! 👋
        </h2>
        <p className="text-slate-600">
          First, we'd love to know a bit about you. This helps us provide the most accurate quote.
        </p>
      </div>

      <div>
        <Label htmlFor="name" className="text-base font-medium">
          What's your name? *
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Sarah Johnson"
          className="mt-2 h-12 text-lg"
          autoFocus
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="text-base font-medium">
          Your email address *
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="sarah@example.com"
          className="mt-2 h-12 text-lg"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        <p className="mt-1 text-sm text-slate-500">We'll send your quote here within 24 hours</p>
      </div>

      <div>
        <Label htmlFor="phone" className="text-base font-medium">
          Phone number *
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="(555) 123-4567"
          className="mt-2 h-12 text-lg"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="bestTimeToCall" className="text-base font-medium">
          Best time to reach you? *
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: 'morning', label: '🌅 Morning', icon: '9am-12pm' },
            { value: 'afternoon', label: '☀️ Afternoon', icon: '12pm-5pm' },
            { value: 'evening', label: '🌙 Evening', icon: '5pm-8pm' },
            { value: 'anytime', label: '📞 Anytime', icon: 'Flexible' },
          ].map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() => setValue('bestTimeToCall', time.value as any)}
              className={`rounded-lg border-2 p-4 text-center transition-all ${
                watchedValues.bestTimeToCall === time.value
                  ? 'border-flowdoors-blue bg-flowdoors-blue-50 text-flowdoors-blue'
                  : 'border-slate-200 hover:border-flowdoors-blue-300'
              }`}
            >
              <div className="text-sm font-semibold">{time.label}</div>
              <div className="text-xs text-slate-500">{time.icon}</div>
            </button>
          ))}
        </div>
        {errors.bestTimeToCall && (
          <p className="mt-1 text-sm text-red-600">{errors.bestTimeToCall.message}</p>
        )}
      </div>

      <Button
        type="button"
        onClick={nextStep}
        className="h-12 w-full bg-flowdoors-blue hover:bg-flowdoors-blue-600 text-lg font-semibold"
      >
        Continue to Project Details
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <div className="text-center text-sm text-slate-500">
        🔒 Your information is secure and will never be shared
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-flowdoors-charcoal mb-2">
          Tell Us About Your Project 🏠
        </h2>
        <p className="text-slate-600">
          This helps us understand your needs and provide the perfect solution.
        </p>
      </div>

      <div>
        <Label htmlFor="projectType" className="text-base font-medium">
          What type of project is this? *
        </Label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { value: 'home-update', label: '🏡 Home Renovation', desc: 'Upgrading my home' },
            { value: 'new-build', label: '🏗️ New Construction', desc: 'Building new' },
            { value: 'commercial', label: '🏢 Commercial Project', desc: 'Business/office' },
            { value: 'contractor', label: '🔨 I\'m a Contractor', desc: 'Trade professional' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setValue('projectType', type.value as any)
                if (type.value === 'contractor') {
                  // Redirect to contractor form
                  window.location.href = '/contractor-quote'
                }
              }}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                watchedValues.projectType === type.value
                  ? 'border-flowdoors-blue bg-flowdoors-blue-50'
                  : 'border-slate-200 hover:border-flowdoors-blue-300'
              }`}
            >
              <div className="font-semibold text-lg">{type.label}</div>
              <div className="text-sm text-slate-500">{type.desc}</div>
            </button>
          ))}
        </div>
        {errors.projectType && (
          <p className="mt-1 text-sm text-red-600">{errors.projectType.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Project Location *
          </Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="e.g., San Diego"
            className="mt-2 h-12"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>

        <div>
          <Label htmlFor="zipCode" className="text-base font-medium">
            ZIP Code *
          </Label>
          <Input
            id="zipCode"
            {...register('zipCode')}
            placeholder="92101"
            className="mt-2 h-12"
            maxLength={5}
          />
          {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="timeline" className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Project Timeline *
        </Label>
        <Select onValueChange={(value) => setValue('timeline', value)} value={watchedValues.timeline}>
          <SelectTrigger className="mt-2 h-12">
            <SelectValue placeholder="When do you need this?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">📋 Just Planning (3+ months)</SelectItem>
            <SelectItem value="soon">📅 Soon (1-3 months)</SelectItem>
            <SelectItem value="urgent">⚡ ASAP (Within 1 month)</SelectItem>
            <SelectItem value="flexible">🤷 Flexible</SelectItem>
          </SelectContent>
        </Select>
        {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>}
      </div>

      <div>
        <Label htmlFor="projectDetails" className="text-base font-medium">
          Tell us more about your vision (optional)
        </Label>
        <Textarea
          id="projectDetails"
          {...register('projectDetails')}
          placeholder="e.g., I want to connect my living room to the patio with a 12-foot opening..."
          className="mt-2 min-h-24"
        />
        <p className="mt-1 text-sm text-slate-500">
          The more details you share, the more accurate your quote!
        </p>
      </div>

      <div>
        <Label htmlFor="budget" className="text-base font-medium">
          Approximate Budget (optional)
        </Label>
        <Select onValueChange={(value) => setValue('budget', value)} value={watchedValues.budget}>
          <SelectTrigger className="mt-2 h-12">
            <SelectValue placeholder="Select a range (helps us tailor options)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-5k">💵 Under $5,000</SelectItem>
            <SelectItem value="5k-10k">💰 $5,000 - $10,000</SelectItem>
            <SelectItem value="10k-20k">💎 $10,000 - $20,000</SelectItem>
            <SelectItem value="20k-plus">✨ $20,000+</SelectItem>
            <SelectItem value="not-sure">❓ Not Sure Yet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="h-12 flex-1"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          className="h-12 flex-1 bg-flowdoors-blue hover:bg-flowdoors-blue-600"
        >
          Almost Done!
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-flowdoors-charcoal mb-2">
          One Last Thing! 🎉
        </h2>
        <p className="text-slate-600">
          How did you hear about FlowDoors? This helps us serve you better.
        </p>
      </div>

      <div>
        <Label htmlFor="source" className="text-base font-medium">
          How did you find us? (optional)
        </Label>
        <Select onValueChange={(value) => setValue('source', value)} value={watchedValues.source}>
          <SelectTrigger className="mt-2 h-12">
            <SelectValue placeholder="Select one..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">🔍 Google Search</SelectItem>
            <SelectItem value="social">📱 Social Media</SelectItem>
            <SelectItem value="referral">👥 Friend/Family Referral</SelectItem>
            <SelectItem value="contractor">🔨 Contractor Referral</SelectItem>
            <SelectItem value="ad">📺 Advertisement</SelectItem>
            <SelectItem value="other">📋 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="referralCode" className="text-base font-medium">
          Referral Code (optional)
        </Label>
        <Input
          id="referralCode"
          {...register('referralCode')}
          placeholder="e.g., FRIEND2024"
          className="mt-2 h-12"
        />
        <p className="mt-1 text-sm text-slate-500">Have a code? Enter it for special savings!</p>
      </div>

      {/* Summary Card */}
      <div className="rounded-lg bg-slate-50 p-6 border border-slate-200">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-flowdoors-green" />
          Your Quote Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Name:</span>
            <span className="font-medium">{watchedValues.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Email:</span>
            <span className="font-medium">{watchedValues.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Location:</span>
            <span className="font-medium">{watchedValues.location}, {watchedValues.zipCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Timeline:</span>
            <span className="font-medium capitalize">{watchedValues.timeline}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-flowdoors-green-50 border border-flowdoors-green-200 p-4">
        <p className="text-sm text-flowdoors-green-800">
          ✨ <strong>What happens next?</strong> Our team will review your project and send you a
          detailed quote within 24 hours. We'll also reach out during your preferred time to answer
          any questions!
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="h-12 flex-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="submit"
          className="h-12 flex-1 bg-flowdoors-green hover:bg-flowdoors-green-600 text-white font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Get My Free Quote! 🎯'}
        </Button>
      </div>

      <div className="text-center text-sm text-slate-500">
        🔒 Your information is secure and will never be shared
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Image
            src="/brand/flowdoors-logo.png"
            alt="FlowDoors Logo"
            width={200}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-display font-bold text-flowdoors-charcoal mb-2">
            Get Your Free Custom Quote
          </h1>
          <p className="text-slate-600">Takes just 2 minutes • No obligation • Fast response</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {renderProgressBar()}

          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-sm font-semibold">4.9/5 Rating</div>
            <div className="text-xs text-slate-500">500+ Reviews</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm font-semibold">947 Projects</div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-semibold">Licensed</div>
            <div className="text-xs text-slate-500">& Insured</div>
          </div>
        </div>
      </div>
    </div>
  )
}

