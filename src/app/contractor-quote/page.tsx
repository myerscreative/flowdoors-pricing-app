import { ContractorQuickQuote } from '@/components/forms/ContractorQuickQuote'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contractor Quick Quote | FlowDoors San Diego',
  description: 'Fast, detailed quotes for trade professionals with same-day response. Volume pricing and contractor discounts available.',
  openGraph: {
    title: 'Contractor Quick Quote | FlowDoors San Diego',
    description: 'Fast, detailed quotes for trade professionals with same-day response',
  },
}

export default function ContractorQuotePage() {
  return <ContractorQuickQuote />
}

