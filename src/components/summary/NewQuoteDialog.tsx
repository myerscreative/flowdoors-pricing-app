// src/components/summary/NewQuoteDialog.tsx
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

export default function NewQuoteDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Quote</DialogTitle>
        </DialogHeader>
        <div className="p-6 text-gray-500 text-sm text-center">
          {/* TODO: Add confirm/cancel buttons */}
          New quote confirmation placeholder
        </div>
      </DialogContent>
    </Dialog>
  )
}
