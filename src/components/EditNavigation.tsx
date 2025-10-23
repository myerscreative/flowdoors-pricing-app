'use client'

import { Button } from './ui/button'
import { Save, Check, Ban } from 'lucide-react'

interface EditNavigationProps {
  onReturnToSummary: () => void
  onSaveAndContinue: () => void
  onCancel: () => void
}

export const EditNavigation = ({
  onReturnToSummary,
  onSaveAndContinue,
  onCancel,
}: EditNavigationProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={onCancel} size="lg">
        <Ban className="mr-2 h-5 w-5" />
        Cancel Change
      </Button>
      <Button onClick={onSaveAndContinue} size="lg" variant="secondary">
        <Check className="mr-2 h-5 w-5" />
        Confirm & Next Step
      </Button>
      <Button onClick={onReturnToSummary} size="lg">
        <Save className="mr-2 h-5 w-5" />
        Confirm & Return to Summary
      </Button>
    </div>
  )
}
