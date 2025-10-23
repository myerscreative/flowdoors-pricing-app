'use client'

import { kanbanService } from '@/services/kanbanService'
import { backfillDeletedExpires } from '@/services/quoteService'
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Database,
  DollarSign,
  FileText,
  Mail,
  Percent,
  Save,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Tab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [days, setDays] = useState<number>(30)
  const [saving, setSaving] = useState(false)

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'quotes', label: 'Quote Settings', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'User Defaults', icon: Users },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ]

  useEffect(() => {
    ;(async () => {
      const d = await kanbanService.getDeletedRetentionDays()
      setDays(d)
    })()
  }, [])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false)
  }

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Admin Settings
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Manage your system configuration
        </p>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
        >
          <span className="font-semibold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {mobileMenuOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 text-left ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">General Settings</h2>
                  <p className="text-sm text-gray-600">Basic system configuration</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input 
                        type="text" 
                        defaultValue="FlowDoors"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        defaultValue="admin@flowdoors.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input 
                        type="tel" 
                        defaultValue="(555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input 
                        type="url" 
                        defaultValue="https://flowdoors.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900">Regional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>Pacific Time (PT)</option>
                        <option>Eastern Time (ET)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Settings */}
            {activeTab === 'quotes' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Settings</h2>
                  <p className="text-sm text-gray-600">Configure quote management</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    Quote Lifecycle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Validity (days)</label>
                      <input 
                        type="number" 
                        defaultValue="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deleted Quotes Retention (days)</label>
                      <input 
                        type="number" 
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value || '30', 10))}
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Days to keep deleted quotes before permanent purge
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quote Prefix</label>
                      <input 
                        type="text" 
                        defaultValue="QUOTE-"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        defaultValue="8.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-teal-600" />
                    Pricing & Discounts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount (%)
                      </label>
                      <input 
                        type="number" 
                        defaultValue="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <input 
                      type="checkbox" 
                      id="require-approval"
                      className="w-4 h-4 text-teal-600 rounded" 
                      defaultChecked 
                    />
                    <label htmlFor="require-approval" className="text-sm font-medium text-gray-900">
                      Require manager approval for discounts above 10%
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Notifications</h2>
                  <p className="text-sm text-gray-600">Manage your notification preferences</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-teal-600" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'new-quote', label: 'New quote created', checked: true },
                      { id: 'quote-accepted', label: 'Quote accepted', checked: true },
                      { id: 'quote-expiring', label: 'Quote expiring soon', checked: true },
                      { id: 'new-lead', label: 'New lead assigned', checked: true }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <label htmlFor={item.id} className="text-sm font-medium text-gray-900">{item.label}</label>
                        <input 
                          type="checkbox" 
                          id={item.id}
                          defaultChecked={item.checked}
                          className="w-4 h-4 text-teal-600 rounded" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Defaults */}
            {activeTab === 'users' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">User Defaults</h2>
                  <p className="text-sm text-gray-600">Default settings for new users</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    New User Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Role</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>Sales Person</option>
                        <option>Manager</option>
                        <option>Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Location</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>San Diego (SD)</option>
                        <option>Los Angeles (LA)</option>
                        <option>San Francisco (SF)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <input type="checkbox" id="notify-manager" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
                      <label htmlFor="notify-manager" className="text-sm font-medium text-gray-900">
                        Notify manager when new user is created
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <input type="checkbox" id="email-verify" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
                      <label htmlFor="email-verify" className="text-sm font-medium text-gray-900">
                        Require email verification for new users
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Billing & Payments</h2>
                  <p className="text-sm text-gray-600">Configure payment methods and billing options</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'cash', label: 'Accept Cash', checked: true },
                      { id: 'check', label: 'Accept Check', checked: true },
                      { id: 'card', label: 'Accept Credit/Debit Card', checked: true },
                      { id: 'financing', label: 'Offer Financing Options', checked: true }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <label htmlFor={item.id} className="text-sm font-medium text-gray-900">{item.label}</label>
                        <input 
                          type="checkbox" 
                          id={item.id}
                          defaultChecked={item.checked}
                          className="w-4 h-4 text-teal-600 rounded" 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>Net 30</option>
                        <option>Net 15</option>
                        <option>Due on Receipt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        defaultValue="1.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Security Settings</h2>
                  <p className="text-sm text-gray-600">Manage security and access controls</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Password Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                      <input 
                        type="number" 
                        defaultValue="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry (days)</label>
                      <input 
                        type="number" 
                        defaultValue="90"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {[
                      { id: 'uppercase', label: 'Require uppercase letters', checked: true },
                      { id: 'numbers', label: 'Require numbers', checked: true },
                      { id: 'special', label: 'Require special characters', checked: true }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <input 
                          type="checkbox" 
                          id={item.id}
                          defaultChecked={item.checked}
                          className="w-4 h-4 text-teal-600 rounded" 
                        />
                        <label htmlFor={item.id} className="text-sm font-medium text-gray-900">{item.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <input type="checkbox" id="2fa" className="w-4 h-4 text-teal-600 rounded" />
                      <label htmlFor="2fa" className="text-sm font-medium text-gray-900">
                        Enable two-factor authentication (2FA)
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <input type="checkbox" id="auto-logout" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
                      <label htmlFor="auto-logout" className="text-sm font-medium text-gray-900">
                        Auto-logout after 30 minutes of inactivity
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Backup */}
            {activeTab === 'data' && (
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Data & Backup</h2>
                  <p className="text-sm text-gray-600">Manage data retention and backup settings</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-teal-600" />
                    Automatic Backups
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <input type="checkbox" id="enable-backup" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
                      <label htmlFor="enable-backup" className="text-sm font-medium text-gray-900">
                        Enable automatic daily backups
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option>7 days</option>
                        <option defaultValue="">30 days</option>
                        <option>90 days</option>
                        <option>1 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium hover:opacity-90">
                      <Database className="w-4 h-4" />
                      Download Backup
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                      <Database className="w-4 h-4" />
                      Restore Backup
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700 mb-4">These actions are permanent and cannot be undone.</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm">
                      <Trash2 className="w-4 h-4" />
                      Purge Deleted Quotes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="border-t p-4 md:p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <div>
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <Check className="w-4 h-4" />
                      Changes saved successfully
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-white">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}
