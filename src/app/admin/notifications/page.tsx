'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'
import {
  getLeadRecipients,
  getQuoteRecipients,
  setAllNotificationRecipients,
} from '@/lib/notificationSettings'
import { toast } from '@/hooks/use-toast'

export default function NotificationsPage() {
  const { role, loading } = useCurrentUserRole()
  const [leadEmails, setLeadEmails] = useState<string[]>([])
  const [quoteEmails, setQuoteEmails] = useState<string[]>([])
  const [leadInputValue, setLeadInputValue] = useState('')
  const [quoteInputValue, setQuoteInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const isAdmin = role === 'admin'

  // Load notification recipients from Firestore
  const loadNotificationRecipients = useCallback(async () => {
    try {
      setIsLoading(true)
      const [leadRecipients, quoteRecipients] = await Promise.all([
        getLeadRecipients(),
        getQuoteRecipients(),
      ])
      setLeadEmails(leadRecipients)
      setQuoteEmails(quoteRecipients)
    } catch (error) {
      console.error('Error loading notification recipients:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadNotificationRecipients()
    }
  }, [isAdmin, loadNotificationRecipients])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const addEmail = (type: 'lead' | 'quote') => {
    const inputValue = type === 'lead' ? leadInputValue : quoteInputValue
    const emails = type === 'lead' ? leadEmails : quoteEmails
    const setEmails = type === 'lead' ? setLeadEmails : setQuoteEmails
    const setInputValue =
      type === 'lead' ? setLeadInputValue : setQuoteInputValue

    if (inputValue.trim() && validateEmail(inputValue.trim())) {
      const email = inputValue.trim().toLowerCase()
      if (!emails.includes(email)) {
        setEmails([...emails, email])
        setInputValue('')
      } else {
        toast({
          title: 'Error',
          description: 'Email already exists',
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
    }
  }

  const removeEmail = (emailToRemove: string, type: 'lead' | 'quote') => {
    const emails = type === 'lead' ? leadEmails : quoteEmails
    const setEmails = type === 'lead' ? setLeadEmails : setQuoteEmails
    setEmails(emails.filter((email) => email !== emailToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: 'lead' | 'quote') => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail(type)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await setAllNotificationRecipients(leadEmails, quoteEmails)
      toast({
        title: 'Success',
        description: 'Notification emails updated',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error saving notification recipients:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading notification settings...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lead Notification Emails */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Lead Notification Emails
            </h2>
            <p className="text-gray-600 mb-4">
              These emails will receive notifications when a new lead is
              completed.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={leadInputValue}
                  onChange={(e) => setLeadInputValue(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'lead')}
                  placeholder="Enter email address and press Enter or comma"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addEmail('lead')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {leadEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center bg-gray-200 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => removeEmail(email, 'lead')}
                      className="ml-2 text-xs text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quote Notification Emails */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Quote Notification Emails
            </h2>
            <p className="text-gray-600 mb-4">
              These emails will receive notifications when a quote is completed.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={quoteInputValue}
                  onChange={(e) => setQuoteInputValue(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'quote')}
                  placeholder="Enter email address and press Enter or comma"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addEmail('quote')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {quoteEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center bg-gray-200 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => removeEmail(email, 'quote')}
                      className="ml-2 text-xs text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
