'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Mail, Phone, Calendar, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const isContractor = type === 'contractor'

  return (
    <div className="min-h-screen bg-gradient-to-br from-flowdoors-blue-50 via-white to-flowdoors-green-50 py-12 px-4">
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
        </div>

        {/* Success Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-flowdoors-green">
              <Check className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-center text-3xl font-display font-bold text-flowdoors-charcoal">
            {isContractor ? '🎉 Quote Request Received!' : '🎉 Thank You for Your Submission!'}
          </h1>

          <p className="mb-8 text-center text-lg text-slate-600">
            {isContractor
              ? "We've received your contractor quote request and our team is already reviewing it."
              : "We've received your quote request and we're excited to help bring your vision to life!"}
          </p>

          {/* What's Next Section */}
          <div className="mb-8 rounded-lg bg-flowdoors-blue-50 border border-flowdoors-blue-200 p-6">
            <h2 className="mb-4 text-xl font-semibold text-flowdoors-charcoal">
              What Happens Next? 📋
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-flowdoors-blue text-white font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-flowdoors-charcoal">
                    {isContractor ? 'Same-Day Review' : 'Email Confirmation'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isContractor
                      ? 'Our contractor team will review your specs and prepare a detailed quote within 4 hours.'
                      : 'Check your inbox! You should receive a confirmation email within a few minutes.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-flowdoors-blue text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-flowdoors-charcoal">
                    {isContractor ? 'Detailed Quote' : 'Personal Consultation'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isContractor
                      ? "We'll send you a comprehensive quote with specs, pricing, and installation details."
                      : "One of our door experts will call you during your preferred time to discuss your project."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-flowdoors-blue text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-flowdoors-charcoal">
                    {isContractor ? 'Quick Turnaround' : 'Custom Quote Delivered'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isContractor
                      ? 'Schedule installation or place your order with our dedicated contractor support.'
                      : "You'll receive your personalized quote within 24 hours, tailored to your exact needs."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-8 space-y-4">
            <h2 className="text-center text-lg font-semibold text-flowdoors-charcoal">
              Need to Reach Us Sooner?
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <a
                href="tel:+16195550123"
                className="flex items-center justify-center gap-3 rounded-lg border-2 border-flowdoors-blue-200 bg-flowdoors-blue-50 p-4 transition-all hover:border-flowdoors-blue hover:bg-flowdoors-blue-100"
              >
                <Phone className="h-5 w-5 text-flowdoors-blue" />
                <div className="text-left">
                  <div className="text-xs text-slate-600">Call Us</div>
                  <div className="font-semibold text-flowdoors-blue">(619) 555-0123</div>
                </div>
              </a>

              <a
                href={`mailto:${isContractor ? 'contractors' : 'info'}@flowdoors.com`}
                className="flex items-center justify-center gap-3 rounded-lg border-2 border-flowdoors-green-200 bg-flowdoors-green-50 p-4 transition-all hover:border-flowdoors-green hover:bg-flowdoors-green-100"
              >
                <Mail className="h-5 w-5 text-flowdoors-green" />
                <div className="text-left">
                  <div className="text-xs text-slate-600">Email Us</div>
                  <div className="font-semibold text-flowdoors-green">
                    {isContractor ? 'contractors' : 'info'}@flowdoors.com
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-flowdoors-blue hover:bg-flowdoors-blue-600 text-white font-semibold transition-all"
            >
              Return to Homepage
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            {!isContractor && (
              <Link
                href="/select-product"
                className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-flowdoors-blue text-flowdoors-blue hover:bg-flowdoors-blue-50 font-semibold transition-all"
              >
                Explore Our Products
              </Link>
            )}
          </div>
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
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-sm font-semibold">24hr Response</div>
            <div className="text-xs text-slate-500">Guaranteed</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}

