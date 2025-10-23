'use client'

import {
  Bell,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('salesRepId');
      localStorage.removeItem('userRole');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/admin/login');
    }
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      badge: null,
      description: 'Overview & analytics',
      path: '/admin'
    },
    { 
      name: 'Quotes', 
      icon: FileText, 
      badge: 3,
      badgeColor: 'bg-flowdoors-blue-500',
      description: 'Manage quotes',
      path: '/admin/quotes'
    },
    { 
      name: 'Leads', 
      icon: Users, 
      badge: 12,
      badgeColor: 'bg-flowdoors-green-500',
      description: 'Track prospects',
      path: '/admin/leads'
    },
    { 
      name: 'Orders', 
      icon: ShoppingCart, 
      badge: null,
      description: 'Order management',
      path: '/admin/orders'
    },
    { 
      name: 'Marketing', 
      icon: TrendingUp, 
      badge: null,
      description: 'Campaigns & analytics',
      path: '/admin/marketing'
    },
    { 
      name: 'Users', 
      icon: User, 
      badge: null,
      description: 'User management',
      path: '/admin/users'
    },
    { 
      name: 'Notifications', 
      icon: Bell, 
      badge: 5,
      badgeColor: 'bg-red-500',
      description: 'Activity & alerts',
      path: '/admin/notifications'
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex flex-col">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg h-full`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md p-2">
                  <Image 
                    src="/brand/flowdoors-logo.png" 
                    alt="FlowDoors Logo" 
                    width={32} 
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">FlowDoors</h2>
                  <p className="text-xs text-flowdoors-blue-100">Admin Panel</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path === '/admin' && pathname === '/admin/dashboard');
              
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-flowdoors-blue-600 to-flowdoors-blue-500 text-white shadow-lg shadow-flowdoors-blue-500/30' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-flowdoors-blue-600'} transition-colors`} />
                    {item.badge && (
                      <span className={`absolute -top-1 -right-1 ${item.badgeColor} text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-flowdoors-blue-100' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {!isCollapsed && item.badge && (
                    <span className={`${item.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          {!isCollapsed && (
            <div className="my-6 border-t border-gray-200"></div>
          )}

          {/* Secondary Actions */}
          <div className="space-y-1 mt-4">
            <button 
              onClick={() => router.push('/admin/settings')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                text-gray-700 hover:bg-gray-100
              `}
            >
              <Settings className="w-5 h-5 text-gray-500" />
              {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
            </button>
            
            <button 
              onClick={() => router.push('/admin/help')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                text-gray-700 hover:bg-gray-100
              `}
            >
              <HelpCircle className="w-5 h-5 text-gray-500" />
              {!isCollapsed && <span className="text-sm font-medium">Help & Support</span>}
            </button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                hover:bg-white hover:shadow-md
              `}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flowdoors-green-500 to-flowdoors-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                JD
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900">John Doe</div>
                    <div className="text-xs text-gray-500">john@flowdoors.com</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => {
                    router.push('/admin/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">View Profile</span>
                </button>
                <button 
                  onClick={() => {
                    router.push('/admin/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Account Settings</span>
                </button>
                <div className="border-t border-gray-200"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
