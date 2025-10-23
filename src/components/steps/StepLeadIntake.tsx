'use client'

import { StepContainer } from './StepContainer'
import { Button } from '../ui/button'

interface StepLeadIntakeProps {
  onNext: () => void
}

export function StepLeadIntake({ onNext }: StepLeadIntakeProps) {
  return (
    <StepContainer
      title="Contact Information"
      description="Your information has been saved from the previous step."
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center h-full">
        <p className="text-lg">You can now proceed to configure your items.</p>
        <Button onClick={onNext} className="mt-4" size="lg">
          Start Configuring
        </Button>
      </div>
    </StepContainer>
  )
}
