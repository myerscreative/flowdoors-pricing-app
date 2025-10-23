'use client';

import React, { useState } from 'react';
import { 
  Book, 
  MessageSquare, 
  Video, 
  Mail, 
  Phone, 
  FileText, 
  HelpCircle, 
  Search,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronRight,
  Send,
  Bug,
  Lightbulb,
  Clock,
  CheckCircle
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Help & Support</h1>
          <p className="text-lg text-gray-600">We&apos;re here to help you get the most out of FlowDoors</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles, tutorials, or FAQs..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.link}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${colorMap[link.color]}`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
                <div className="mt-4 flex items-center gap-2 font-medium">
                  Learn more <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - FAQs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-teal-600" />
                Frequently Asked Questions
              </h2>

              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
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

            {/* Video Tutorials */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-teal-600" />
                Video Tutorials
              </h2>
              <div className="space-y-3">
                {tutorials.map((tutorial, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-red-600" />
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
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Resources */}
          <div className="space-y-6">
            
            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Contact Support
              </h2>
              
              {ticketSubmitted ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Ticket Submitted!
                  </div>
                  <p className="text-sm text-green-700">
                    We&apos;ve received your message and will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form id="contact" onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                      <option>Technical Issue</option>
                      <option>Feature Request</option>
                      <option>Bug Report</option>
                      <option>Account Question</option>
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
                      rows={4}
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
              
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>support@flowdoors.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>Mon-Fri, 9am-6pm PT</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all">
                  <Bug className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Report a Bug</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Suggest a Feature</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Download User Guide</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">API Status</span>
                  <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Database</span>
                  <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email Service</span>
                  <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border-2 border-teal-200 p-8">
          <div className="text-center">
            <Book className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Need More Help?</h2>
            <p className="text-gray-700 mb-6">
              Check out our complete documentation for detailed guides and API references
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="#"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                View Documentation
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="px-6 py-3 border-2 border-teal-500 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all"
              >
                Join Community Forum
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

