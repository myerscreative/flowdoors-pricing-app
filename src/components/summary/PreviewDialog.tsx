// src/components/summary/PreviewDialog.tsx
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

export default function PreviewDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>
        <div className="p-6 text-gray-500 text-sm text-center">
          {/* TODO: Render FlowDoorsQuoteLayout with props */}
          PDF preview placeholder
        </div>
      </DialogContent>
    </Dialog>
  )
}
