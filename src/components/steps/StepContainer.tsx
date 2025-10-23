'use client'

import type { ReactNode } from 'react'

interface StepContainerProps {
  title: string
  description: string
  children: ReactNode
}

export function StepContainer({
  title,
  description,
  children,
}: StepContainerProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-8 relative">
        <h2 className="text-3xl font-bold text-center font-headline">
          {title}
        </h2>
        <p className="text-muted-foreground text-center mt-2 max-w-xl mx-auto">
          {description}
        </p>
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  )
}
