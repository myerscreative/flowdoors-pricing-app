'use client'

import { useEffect } from 'react'
import { format } from 'date-fns'

interface DeleteConfirmModalProps {
  entryDate: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({ entryDate, onConfirm, onCancel }: DeleteConfirmModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const formattedDate = format(new Date(entryDate), 'MMM d, yyyy • h:mm a')

  return (
    <div 
      className="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div 
        className="modal-container relative z-10 w-full max-w-[500px] rounded-[28px] bg-gradient-to-b from-white to-[#fdf8ff] shadow-[0_25px_80px_rgba(0,0,0,0.3)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between border-b border-black/5 p-6 md:p-7">
          <h3 className="font-display text-xl md:text-2xl font-semibold text-text-primary">
            Delete Entry?
          </h3>
        </div>

        {/* Body */}
        <div className="modal-body p-6 md:p-7 space-y-4">
          <p className="delete-warning text-base text-text-primary">
            Are you sure you want to delete your mood entry from{' '}
            <strong className="font-semibold">{formattedDate}</strong>?
          </p>
          <p className="delete-subtext text-sm text-text-secondary">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="modal-actions flex gap-3 justify-end border-t border-black/5 p-6 md:p-7">
          <button
            className="btn-secondary rounded-2xl border border-black/10 bg-white/70 px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-white/90 hover:-translate-y-0.5"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn-danger rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
            }}
          >
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  )
}

