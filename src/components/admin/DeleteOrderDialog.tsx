'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orderNumber: string
  isLoading?: boolean
}

export function DeleteOrderDialog({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}: DeleteOrderDialogProps) {
  const [confirmationText, setConfirmationText] = useState('')

  const expectedText = `Delete Order#${orderNumber}`
  const isConfirmationValid = confirmationText === expectedText

  const handleConfirm = () => {
    if (isConfirmationValid) {
      onConfirm()
      setConfirmationText('') // Reset for next time
    }
  }

  const handleClose = () => {
    setConfirmationText('') // Reset when closing
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Order</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the order
            and remove it from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm deletion, type{' '}
              <span className="font-mono font-semibold text-red-600">
                {expectedText}
              </span>{' '}
              in the box below:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedText}
              className="font-mono"
              disabled={isLoading}
            />
          </div>

          {confirmationText && !isConfirmationValid && (
            <p className="text-sm text-red-600">
              Text does not match. Please type exactly: {expectedText}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
