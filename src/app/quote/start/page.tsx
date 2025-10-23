'use client'

import {
  LeadIntakeForm,
  type LeadIntakeValues,
} from '@/components/LeadIntakeForm'
import { postLead, type LeadPayload } from '@/lib/marketing/attribution'

export default function QuoteStartPage() {
  function handleLeadSubmit(data: LeadIntakeValues) {
    const fullName = `${data.firstName} ${data.lastName}`.trim()

    const payload: LeadPayload = {
      event_name: 'lead_submitted',
      user: {
        email: data.email,
        phone: data.phone,
        name: fullName,
      },
      lead: {
        lead_id: `lead_${Date.now()}`,
        form_name: 'quote_start_form',
        currency: 'USD',
      },
      // attribution is auto-populated inside postLead if omitted
    }

    // Track lead in background - don't wait for it
    postLead(payload)
      .then(() => {
        console.info('✅ Lead tracked:', {
          name: fullName,
          email: data.email,
          phone: data.phone,
        })
      })
      .catch((err) => {
        console.error('❌ Error tracking lead:', err)
      })

    // Navigate immediately - use window.location for reliable navigation
    console.info('🚀 Navigating to product selection...')
    window.location.href = '/select-product'
  }

  return <LeadIntakeForm onSubmit={handleLeadSubmit} />
}
