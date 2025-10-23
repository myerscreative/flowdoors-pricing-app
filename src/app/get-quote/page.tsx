import { HomeownerConversationalForm } from '@/components/forms/HomeownerConversationalForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Your Free Quote | FlowDoors San Diego',
  description: 'Get a personalized quote for your slide-and-stack door system in under 24 hours. Free consultation, no pressure sales.',
  openGraph: {
    title: 'Get Your Free Quote | FlowDoors San Diego',
    description: 'Get a personalized quote for your slide-and-stack door system in under 24 hours',
  },
}

export default function GetQuotePage() {
  return <HomeownerConversationalForm />
}

