// src/components/summary/DealDetailsModal.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Star, Link, Folder, Trash2 } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (_open: boolean) => void
}

export default function DealDetailsModal({ open: _open, onOpenChange }: Props) {
  const [dealStatus, setDealStatus] = useState('warm')

  return (
    <Dialog open={_open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900 border-slate-700 text-white">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Deal Details
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Deal Name & Status */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Santee Home</h2>
            <div className="flex items-center gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  dealStatus === 'warm'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
                onClick={() =>
                  setDealStatus(dealStatus === 'warm' ? 'hot' : 'warm')
                }
              >
                {dealStatus}
                <svg
                  className="w-4 h-4 ml-1 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Deal Value Card */}
          <div className="bg-green-600 rounded-2xl p-6">
            <div className="text-4xl font-bold text-green-100">$10,824</div>
            <div className="text-green-200 text-sm mt-1">Deal Value</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Tags Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  + Add Tag
                </button>
              </div>

              {/* Timeline Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Expected Close Date:
                    </span>
                    <span className="text-white text-sm">10/23/2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Last Activity:
                    </span>
                    <span className="text-white text-sm">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Created:</span>
                    <span className="text-white text-sm">10/20/2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Last Updated:</span>
                    <span className="text-white text-sm">10/20/2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">
                      Contact Name
                    </div>
                    <div className="text-white text-sm">Not specified</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">
                      Email Address
                    </div>
                    <div className="text-blue-400 text-sm cursor-pointer hover:text-blue-300">
                      Not specified
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">
                      Phone Number
                    </div>
                    <div className="text-blue-400 text-sm cursor-pointer hover:text-blue-300">
                      Not specified
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Description
                </h3>
                <div className="text-gray-400 text-sm">
                  No description provided
                </div>
              </div>

              {/* Deal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Deal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">Priority</div>
                    <div className="text-white text-sm">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Link className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">Source</div>
                    <div className="text-white text-sm">Not set</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">Stage</div>
                    <div className="text-white text-sm">Unknown Stage</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1">Owner</div>
                    <div className="text-white text-sm">Unassigned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-3 font-medium">
            Edit Deal
          </Button>
          <div className="flex items-center gap-4">
            <button className="text-white hover:text-gray-300 transition-colors">
              Add Note
            </button>
            <button className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center transition-colors">
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
