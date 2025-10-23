// src/components/summary/EmailConfirmDialog.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (_open: boolean) => void
}

export default function EmailConfirmDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Email</DialogTitle>
        </DialogHeader>
        <div className="p-6 text-gray-500 text-sm text-center">
          {/* TODO: Replace with email input + send button */}
          Email confirm dialog placeholder
        </div>
      </DialogContent>
    </Dialog>
  )
}
