import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/quote/start' },
  title: 'Design Your Perfect Door',
  description: 'Get your custom door quote in minutes.',
}

export default function QuoteStartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
