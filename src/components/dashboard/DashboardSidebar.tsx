import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ShoppingBag, 
  Bell, 
  Settings, 
  HelpCircle,
  LogOut,
  User,
  Menu,
  X,
  Gift
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { DashboardView } from './Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardSidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  user: any;
  onNavigateHome?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentView,
  onViewChange,
  user,
  onNavigateHome
}) => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuItemClick = (view: DashboardView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'overview' as DashboardView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coaching' as DashboardView, label: 'Coaching', icon: Users },
    { id: 'batches' as DashboardView, label: 'My Batches', icon: Calendar },
    { id: 'merchandise' as DashboardView, label: 'Merchandise', icon: ShoppingBag },
    { id: 'referrals' as DashboardView, label: 'Refer Friends', icon: Gift },
    { id: 'notifications' as DashboardView, label: 'Notifications', icon: Bell },
    { id: 'settings' as DashboardView, label: 'Settings', icon: Settings },
    { id: 'support' as DashboardView, label: 'Support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64">
        <div className="flex h-full flex-col bg-white shadow-sm border-r border-gray-100">
          {/* Desktop Sidebar Content */}
          <div className="flex items-center justify-between px-2 py-0">
            <div className="flex items-center space-x-2">
              <img 
                src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png" 
                alt="Playgram Logo" 
                className="w-32 h-32 lg:w-40 lg:h-40 object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-2 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#86D5F0' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.studentId ? `Student ID: ${user.studentId}` : 'No Student ID'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
                if (onNavigateHome) {
                  onNavigateHome();
                }
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div 
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : '-100%'
        }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-100"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png" 
              alt="Playgram Logo" 
              className="w-32 h-32 lg:w-40 lg:h-40 object-contain"
            />
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="px-4 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.studentId ? `Student ID: ${user.studentId}` : 'No Student ID'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            logout();
            setIsMobileMenuOpen(false);
            if (onNavigateHome) {
              onNavigateHome();
            }
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
    </>
  );
};