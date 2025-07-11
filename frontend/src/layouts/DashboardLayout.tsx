import React, { useState } from 'react';
import { 
  Home, 
  Briefcase, 
  User, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { cn } from '@/utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  notifications?: number;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'applications', label: 'My Applications', icon: Briefcase },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'interviews', label: 'Interviews', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  activeTab = 'dashboard',
  onTabChange,
  onLogout,
  notifications = 0,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn('min-h-screen bg-gray-50 flex', className)}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="text-2xl font-bold">
              <span className="text-red-600">/</span>vermeg
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* User Info */}
          {user && (
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  <Badge variant="chip" size="small" color="primary" className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange?.(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors',
                    isActive 
                      ? 'bg-red-50 text-red-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className={cn('w-5 h-5 mr-3', isActive ? 'text-red-600' : 'text-gray-500')} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="outlined"
              onClick={onLogout}
              className="w-full flex items-center justify-center text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                {notifications > 0 && (
                  <Badge 
                    content={notifications > 99 ? '99+' : notifications}
                    color="error"
                    className="absolute -top-2 -right-2"
                  />
                )}
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
