'use client';

import {
  Book,
  Bug,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  Video
} from 'lucide-react';
import React, { useState } from 'react';

interface QuickLink {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'red' | 'teal' | 'green';
  link: string;
}

interface FAQ {
  category: string;
  questions: Array<{
    q: string;
    a: string;
  }>;
}

interface Tutorial {
  title: string;
  duration: string;
  views: string;
}

export default function HelpAndSupport() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const tabs = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'tutorials', label: 'Video Tutorials' },
    { id: 'contact', label: 'Contact Support' },
    { id: 'resources', label: 'Resources' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const quickLinks: QuickLink[] = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of FlowDoors admin panel',
      icon: Book,
      color: 'blue',
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      color: 'red',
      link: '#'
    },
    {
      title: 'Documentation',
      description: 'Complete system documentation',
      icon: FileText,
      color: 'teal',
      link: '#'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: MessageSquare,
      color: 'green',
      link: '#contact'
    }
  ];

  const faqs: FAQ[] = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create a new quote?',
          a: 'Navigate to the Quotes section from the sidebar, click "New Quote" button, fill in customer details, add items, set pricing, and click Save. The quote will be automatically assigned a unique quote number.'
        },
        {
          q: 'How do I add a new user to the system?',
          a: 'Go to Users section, click "Add User", enter their information including name, email, role, and assigned territories. They will receive an email invitation to set up their account.'
        },
        {
          q: 'What are the different user roles?',
          a: 'Admin: Full system access. Manager: Can manage quotes, leads, and team members. Sales Person: Can create quotes and manage leads. Marketing: Can view reports and manage campaigns.'
        }
      ]
    },
    {
      category: 'Quote Management',
      questions: [
        {
          q: 'How long are quotes valid for?',
          a: 'By default, quotes are valid for 30 days. You can change this in Admin Settings > Quote Settings. Each quote can also have a custom expiration date.'
        },
        {
          q: 'Can I recover a deleted quote?',
          a: 'Yes! Deleted quotes are kept for 30 days (configurable in settings) before permanent deletion. Go to Quotes > Archived to restore deleted quotes.'
        },
        {
          q: 'How do I apply discounts?',
          a: 'When creating or editing a quote, click the "Add Discount" button. You can apply percentage or fixed amount discounts. Discounts over 10% require manager approval.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          q: 'What browsers are supported?',
          a: 'FlowDoors works best on Chrome, Firefox, Safari, and Edge (latest versions). Make sure JavaScript is enabled and cookies are allowed.'
        },
        {
          q: 'Why am I getting logged out frequently?',
          a: 'For security, sessions expire after 30 minutes of inactivity. You can change this in Admin Settings > Security if you have admin permissions.'
        },
        {
          q: 'How do I export data?',
          a: 'Most pages have an "Export CSV" button in the top right. You can also schedule automated reports in Settings > Data & Backup.'
        }
      ]
    }
  ];

  const tutorials: Tutorial[] = [
    { title: 'Creating Your First Quote', duration: '5 min', views: '1.2k' },
    { title: 'Managing Customer Leads', duration: '8 min', views: '980' },
    { title: 'Using the Dashboard', duration: '6 min', views: '1.5k' },
    { title: 'User Permissions Setup', duration: '10 min', views: '756' },
    { title: 'Generating Reports', duration: '7 min', views: '890' }
  ];

  const handleTicketSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  const colorMap: Record<'blue' | 'red' | 'teal' | 'green', string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
    green: 'bg-green-50 text-green-600 border-green-200'
  };

  return (
    <div className="w-full">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">We&apos;re here to help you get the most out of FlowDoors</p>
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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all mb-1 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200">
              
              {/* Getting Started Tab */}
              {activeTab === 'getting-started' && (
                <div className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h2>
                    <p className="text-sm text-gray-600">Quick links to help you navigate FlowDoors</p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for help articles, tutorials, or FAQs..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>

                  {/* Quick Links Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.title}
                          onClick={() => {
                            if (link.title === 'Video Tutorials') setActiveTab('tutorials');
                            else if (link.title === 'Contact Support') setActiveTab('contact');
                            else if (link.title === 'Documentation') setActiveTab('resources');
                          }}
                          className={`p-5 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg text-left ${colorMap[link.color]}`}
                        >
                          <Icon className="w-7 h-7 mb-2" />
                          <h3 className="font-bold text-gray-900 mb-1">{link.title}</h3>
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Common First Steps</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Create Your First Quote</h4>
                          <p className="text-sm text-gray-600">Navigate to Quotes and click &quot;New Quote&quot; to get started</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Manage Customer Leads</h4>
                          <p className="text-sm text-gray-600">View and organize leads from the Leads section</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Review Dashboard Analytics</h4>
                          <p className="text-sm text-gray-600">Check your performance metrics on the Dashboard</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQs Tab */}
              {activeTab === 'faqs' && (
                <div className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-6 h-6 text-teal-600" />
                      Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-gray-600">Find answers to common questions</p>
                  </div>

                  {faqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.questions.map((faq, faqIndex) => {
                          const key = `${categoryIndex}-${faqIndex}`;
                          const isExpanded = expandedFaq === key;
                          return (
                            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => setExpandedFaq(isExpanded ? null : key)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className="font-medium text-gray-900">{faq.q}</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                )}
                              </button>
                              {isExpanded && (
                                <div className="px-4 pb-4 text-gray-700 bg-gray-50">
                                  {faq.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Tutorials Tab */}
              {activeTab === 'tutorials' && (
                <div className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Video className="w-6 h-6 text-teal-600" />
                      Video Tutorials
                    </h2>
                    <p className="text-sm text-gray-600">Watch step-by-step guides to master FlowDoors</p>
                  </div>

                  <div className="space-y-3">
                    {tutorials.map((tutorial, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Video className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900 group-hover:text-teal-600">
                              {tutorial.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {tutorial.duration} • {tutorial.views} views
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-teal-200 p-6 text-center">
                    <Video className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">More Tutorials Coming Soon</h3>
                    <p className="text-sm text-gray-600">
                      We&apos;re constantly adding new video tutorials. Subscribe to get notified!
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Support Tab */}
              {activeTab === 'contact' && (
                <div className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-teal-600" />
                      Contact Support
                    </h2>
                    <p className="text-sm text-gray-600">Get help from our support team</p>
                  </div>

                  {/* Contact Form */}
                  {ticketSubmitted ? (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                        <CheckCircle className="w-6 h-6" />
                        Ticket Submitted Successfully!
                      </div>
                      <p className="text-sm text-green-700 mb-4">
                        We&apos;ve received your message and will respond within 24 hours. Check your email for a confirmation.
                      </p>
                      <button
                        onClick={() => setTicketSubmitted(false)}
                        className="text-sm text-green-700 font-medium underline hover:no-underline"
                      >
                        Submit another ticket
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                          <option>Technical Issue</option>
                          <option>Feature Request</option>
                          <option>Bug Report</option>
                          <option>Account Question</option>
                          <option>Billing Question</option>
                          <option>Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input 
                          type="text"
                          placeholder="Brief description of your issue"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea 
                          rows={6}
                          placeholder="Please provide details about your issue..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Submit Ticket
                      </button>
                    </form>
                  )}

                  {/* Contact Information */}
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Other Ways to Reach Us</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                        <p className="text-sm text-gray-600">support@flowdoors.com</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Phone className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 mb-1">Phone</p>
                        <p className="text-sm text-gray-600">(555) 123-4567</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Clock className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 mb-1">Hours</p>
                        <p className="text-sm text-gray-600">Mon-Fri, 9am-6pm PT</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all">
                        <Bug className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">Report a Bug</span>
                      </button>
                      <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all">
                        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">Suggest Feature</span>
                      </button>
                      <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                        <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">User Guide</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Resources & Documentation</h2>
                    <p className="text-sm text-gray-600">Access guides, documentation, and system information</p>
                  </div>

                  {/* Documentation Links */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-teal-600" />
                          <span className="font-medium text-gray-900">Complete Documentation</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Book className="w-5 h-5 text-teal-600" />
                          <span className="font-medium text-gray-900">API Reference</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-teal-600" />
                          <span className="font-medium text-gray-900">Download User Guide (PDF)</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-teal-600" />
                          <span className="font-medium text-gray-900">Community Forum</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                      </a>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">API Status</span>
                        <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Database</span>
                        <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Email Service</span>
                        <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">File Storage</span>
                        <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Operational
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Resources */}
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-teal-200 p-6">
                      <div className="flex items-start gap-4">
                        <Book className="w-10 h-10 text-teal-600 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">Need More Help?</h4>
                          <p className="text-sm text-gray-700 mb-4">
                            Check out our complete documentation for detailed guides, API references, and best practices.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <a
                              href="#"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
                            >
                              View Documentation
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                              href="#"
                              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-teal-500 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all text-sm"
                            >
                              Join Community
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}


