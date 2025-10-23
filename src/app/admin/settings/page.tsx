'use client'

import React, { useEffect, useState } from 'react'
import {
  Save,
  Trash2,
  Bell,
  Shield,
  Mail,
  Database,
  DollarSign,
  FileText,
  Users,
  Settings as SettingsIcon,
  Clock,
  Building2,
  Percent,
  Check,
} from 'lucide-react'
import { kanbanService } from '@/services/kanbanService'
import { backfillDeletedExpires } from '@/services/quoteService'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [days, setDays] = useState<number>(30)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const d = await kanbanService.getDeletedRetentionDays()
      setDays(d)
    })()
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    setSaving(true)

    // Save deleted retention days when on quotes tab
    if (activeTab === 'quotes') {
      await kanbanService.setDeletedRetentionDays(days)
      await backfillDeletedExpires(days)
    }

    // Simulate saving for other tabs
    setTimeout(() => {
      setSaveStatus('saved')
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 2000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-flowdoors-charcoal-800">
            Admin Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your system configuration and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sticky top-6">
              {[
                { id: 'general', label: 'General', icon: SettingsIcon },
                { id: 'quotes', label: 'Quote Settings', icon: FileText },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'users', label: 'User Defaults', icon: Users },
                { id: 'billing', label: 'Billing', icon: DollarSign },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'data', label: 'Data & Backup', icon: Database },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
                      ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      General Settings
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Basic system configuration and company information
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-flowdoors-blue-600" />
                      Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          defaultValue="FlowDoors"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 focus:border-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Email
                        </label>
                        <input
                          type="email"
                          defaultValue="admin@flowdoors.com"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 focus:border-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          defaultValue="(555) 123-4567"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 focus:border-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          defaultValue="https://flowdoors.com"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 focus:border-flowdoors-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800">
                      Regional Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none bg-white">
                          <option>Pacific Time (PT)</option>
                          <option>Mountain Time (MT)</option>
                          <option>Central Time (CT)</option>
                          <option>Eastern Time (ET)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none bg-white">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none bg-white">
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Settings */}
              {activeTab === 'quotes' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      Quote Settings
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure quote generation and management
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-flowdoors-blue-600" />
                      Quote Lifecycle
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Quote Validity (days)
                        </label>
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deleted Quotes Retention (days)
                        </label>
                        <input
                          type="number"
                          value={days}
                          onChange={(e) =>
                            setDays(parseInt(e.target.value || '30', 10))
                          }
                          min={1}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Days to keep deleted quotes before permanent purge
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auto-Archive After (days)
                        </label>
                        <input
                          type="number"
                          defaultValue="90"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quote Number Prefix
                        </label>
                        <input
                          type="text"
                          defaultValue="QUOTE-"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-flowdoors-blue-600" />
                      Pricing & Discounts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue="8.5"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Discount (%)
                        </label>
                        <input
                          type="number"
                          defaultValue="20"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-flowdoors-blue-50 border border-flowdoors-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="require-approval"
                        className="w-4 h-4 text-flowdoors-blue-600 rounded"
                        defaultChecked
                      />
                      <label
                        htmlFor="require-approval"
                        className="text-sm font-medium text-flowdoors-charcoal-800"
                      >
                        Require manager approval for discounts above 10%
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      Notification Settings
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Manage email and in-app notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-flowdoors-blue-600" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          id: 'new-quote',
                          label: 'New quote created',
                          checked: true,
                        },
                        {
                          id: 'quote-accepted',
                          label: 'Quote accepted by customer',
                          checked: true,
                        },
                        {
                          id: 'quote-expiring',
                          label: 'Quote expiring soon (3 days)',
                          checked: true,
                        },
                        {
                          id: 'new-lead',
                          label: 'New lead assigned to me',
                          checked: true,
                        },
                        {
                          id: 'daily-summary',
                          label: 'Daily activity summary',
                          checked: false,
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <label
                            htmlFor={item.id}
                            className="text-sm font-medium text-flowdoors-charcoal-800"
                          >
                            {item.label}
                          </label>
                          <input
                            type="checkbox"
                            id={item.id}
                            className="w-4 h-4 text-flowdoors-blue-600 rounded"
                            defaultChecked={item.checked}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      User Defaults
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Default settings for new users
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-flowdoors-blue-600" />
                      New User Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Role
                        </label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none bg-white">
                          <option>Sales Person</option>
                          <option>Manager</option>
                          <option>Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Location
                        </label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none bg-white">
                          <option>San Diego (SD)</option>
                          <option>Los Angeles (LA)</option>
                          <option>San Francisco (SF)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing */}
              {activeTab === 'billing' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      Billing & Payment Settings
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure payment methods and billing options
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800">
                      Payment Methods
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 'cash', label: 'Accept Cash', checked: true },
                        { id: 'check', label: 'Accept Check', checked: true },
                        {
                          id: 'card',
                          label: 'Accept Credit/Debit Card',
                          checked: true,
                        },
                        {
                          id: 'financing',
                          label: 'Offer Financing Options',
                          checked: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <label
                            htmlFor={item.id}
                            className="text-sm font-medium text-flowdoors-charcoal-800"
                          >
                            {item.label}
                          </label>
                          <input
                            type="checkbox"
                            id={item.id}
                            className="w-4 h-4 text-flowdoors-blue-600 rounded"
                            defaultChecked={item.checked}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      Security Settings
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Manage security and access controls
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800">
                      Password Requirements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          defaultValue="8"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (days)
                        </label>
                        <input
                          type="number"
                          defaultValue="90"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      {[
                        {
                          id: 'uppercase',
                          label: 'Require uppercase letters',
                          checked: true,
                        },
                        {
                          id: 'numbers',
                          label: 'Require numbers',
                          checked: true,
                        },
                        {
                          id: 'special',
                          label: 'Require special characters',
                          checked: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            className="w-4 h-4 text-flowdoors-blue-600 rounded"
                            defaultChecked={item.checked}
                          />
                          <label
                            htmlFor={item.id}
                            className="text-sm font-medium text-flowdoors-charcoal-800"
                          >
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Backup */}
              {activeTab === 'data' && (
                <div className="p-6 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-flowdoors-charcoal-800 mb-4">
                      Data & Backup
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Manage data retention and backup settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-flowdoors-charcoal-800 flex items-center gap-2">
                      <Database className="w-5 h-5 text-flowdoors-blue-600" />
                      Automatic Backups
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-flowdoors-blue-50 border border-flowdoors-blue-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="enable-backup"
                          className="w-4 h-4 text-flowdoors-blue-600 rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="enable-backup"
                          className="text-sm font-medium text-flowdoors-charcoal-800"
                        >
                          Enable automatic daily backups
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Retention Period
                        </label>
                        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flowdoors-blue-500 outline-none bg-white">
                          <option>7 days</option>
                          <option>30 days</option>
                          <option>90 days</option>
                          <option>1 year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-red-600">
                      Danger Zone
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700 mb-4">
                        These actions are permanent and cannot be undone.
                      </p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm">
                        <Trash2 className="w-4 h-4" />
                        Purge Deleted Quotes Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    {saveStatus === 'saved' && (
                      <span className="flex items-center gap-2 text-sm text-flowdoors-green-600 font-medium">
                        <Check className="w-4 h-4" />
                        Changes saved successfully
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-white transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500 text-white rounded-lg font-semibold hover:from-flowdoors-blue-700 hover:to-flowdoors-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
