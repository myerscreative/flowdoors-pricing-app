'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'
import {
  getLeadRecipients,
  getQuoteRecipients,
  setAllNotificationRecipients,
} from '@/lib/notificationSettings'
import { Bell, Mail, Plus, Save, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

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
        <div className="text-lg text-gray-600">Loading...</div>
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
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-flowdoors-charcoal-800 mb-2">Notification Settings</h1>
        <p className="text-gray-600">Manage email notifications for leads and quotes</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Loading notification settings...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lead Notification Emails */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-flowdoors-charcoal-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-flowdoors-blue-600" />
                Lead Notification Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                These emails will receive notifications when a new lead is completed.
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={leadInputValue}
                    onChange={(e) => setLeadInputValue(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'lead')}
                    placeholder="Enter email address and press Enter or comma"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addEmail('lead')}
                    className="bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500 hover:from-flowdoors-blue-700 hover:to-flowdoors-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {leadEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-2 bg-flowdoors-blue-50 text-flowdoors-blue-700 hover:bg-flowdoors-blue-100 px-3 py-1"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        onClick={() => removeEmail(email, 'lead')}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Notification Emails */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-flowdoors-charcoal-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-flowdoors-green-600" />
                Quote Notification Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                These emails will receive notifications when a quote is completed.
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={quoteInputValue}
                    onChange={(e) => setQuoteInputValue(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'quote')}
                    placeholder="Enter email address and press Enter or comma"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addEmail('quote')}
                    className="bg-gradient-to-r from-flowdoors-green-600 to-flowdoors-green-500 hover:from-flowdoors-green-700 hover:to-flowdoors-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quoteEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-2 bg-flowdoors-green-50 text-flowdoors-green-700 hover:bg-flowdoors-green-100 px-3 py-1"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        onClick={() => removeEmail(email, 'quote')}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500 hover:from-flowdoors-blue-700 hover:to-flowdoors-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
