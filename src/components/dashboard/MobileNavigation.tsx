import React, { useState } from 'react';
import {
  Bell,
  User,
  X,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth/AuthContext';
import {
  HomeIcon,
  CoachingIcon,
  StoreIcon,
  MoreIcon,
  TransactionIcon,
  SettingsIcon,
  ReferIcon,
  SupportIcon,
  RateIcon,
  LogoutIcon
} from '../ui/CustomIcons';
import { DashboardView } from './Dashboard';
import { useDynamicMobileLayout } from '../../hooks/useDynamicMobileLayout';

const LocationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Bangalore');

  const locations = [
    {
      name: 'Bangalore',
      available: true,
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133706174.png'
    },
    {
      name: 'Mumbai',
      available: false,
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133802425.png'
    },
    {
      name: 'Delhi',
      available: false,
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133812708.png'
    },
    {
      name: 'Mysore',
      available: false,
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133747991.png'
    },
    {
      name: 'Mangalore',
      available: false,
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-27_015527092.png'
    }
  ];

  const handleLocationSelect = (location: string) => {
    if (locations.find(l => l.name === location)?.available) {
      setSelectedLocation(location);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-1 py-1 hover:bg-gray-50 active:scale-95 transition-all duration-200 rounded-md"
      >
        <span className="text-sm font-medium text-gray-900">{selectedLocation}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 py-2 z-50 lg:hidden"
            >
              {locations.map((location) => (
                <button
                  key={location.name}
                  onClick={() => handleLocationSelect(location.name)}
                  disabled={!location.available}
                  className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2.5 whitespace-nowrap ${!location.available ? 'opacity-60 cursor-not-allowed' : ''} ${selectedLocation === location.name ? 'bg-white' : ''}`}
                >
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-5 h-5 object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black">
                      {location.name}
                    </div>
                    {!location.available && (
                      <div className="text-xs text-gray-400 leading-tight">coming soon</div>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface User {
  phoneNumber?: string;
  profileImage?: string;
  name?: string;
  fullName?: string;
  uid?: string;
  userType?: string;
}

interface MobileNavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  user?: User | null;
  onNavigateHome?: () => void;
  navigationHistory?: DashboardView[];
  onBackNavigation?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onViewChange,
  user,
  onNavigateHome,
  navigationHistory = ['overview'],
  onBackNavigation
}) => {
  const { logout } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);

  // Use dynamic mobile layout hook
  const {
    styles,
    isInitialized,
    getButtonSize
  } = useDynamicMobileLayout();

  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, {}) || 0;



  React.useEffect(() => {
    if (user?.phoneNumber) {
      const savedImage = localStorage.getItem(`profileImage_${user.phoneNumber}`);
      setLocalProfileImage(savedImage);
    }
  }, [user?.phoneNumber]);

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `profileImage_${user?.phoneNumber}`) {
        setLocalProfileImage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.phoneNumber]);

  const handleMoreClick = () => {
    setShowMoreMenu(true);
  };

  const handleMoreItemClick = (view: DashboardView) => {
    onViewChange(view);
    setShowMoreMenu(false);
  };

  const handleBottomNavClick = (view: DashboardView) => {
    if (showMoreMenu && ['overview', 'coaching', 'merchandise'].includes(view)) {
      setShowMoreMenu(false);
    }
    onViewChange(view);
  };

  const handleBackNavigation = () => {
    if (onBackNavigation) {
      onBackNavigation();
    } else if (navigationHistory.length > 1) {
      const previousView = navigationHistory[navigationHistory.length - 2];
      onViewChange(previousView);
    } else {
      onViewChange('overview');
    }
  };

  const handleNotificationClick = () => {
    if (currentView === 'notifications') {
      handleBackNavigation();
    } else {
      onViewChange('notifications');
    }
  };

  const handleLogout = () => {
    logout();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const bottomNavItems = [
    {
      id: 'overview' as DashboardView,
      label: 'Home',
      icon: HomeIcon,
      active: currentView === 'overview'
    },
    {
      id: 'coaching' as DashboardView,
      label: 'Coaching',
      icon: CoachingIcon,
      active: currentView === 'coaching'
    },
    {
      id: 'merchandise' as DashboardView,
      label: 'Store',
      icon: StoreIcon,
      active: currentView === 'merchandise' && !showMoreMenu
    },
    {
      id: 'more' as any,
      label: 'More',
      icon: MoreIcon,
      active: showMoreMenu || ['settings', 'notifications', 'support', 'referrals', 'orders', 'profile'].includes(currentView),
      onClick: handleMoreClick
    }
  ];

  // Don't render until layout is initialized
  if (!isInitialized) {
    return null;
  }

  const buttonSizes = getButtonSize();

  return (
    <>
      {/* Dynamic Top Bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-[52] bg-white border-b border-gray-200 transition-all duration-300"
        style={styles.header}
      >
        <div className="flex items-center justify-between min-h-[44px]">
          <div className="flex items-center gap-2 flex-1">
            {currentView !== 'overview' && navigationHistory.length > 1 && (
              <button
                onClick={handleBackNavigation}
                className="dynamic-touch-button hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <LocationDropdown />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNotificationClick}
              className="relative dynamic-touch-button hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => onViewChange('settings')}
              className="dynamic-touch-button hover:bg-gray-100"
            >
              {localProfileImage || user?.profileImage ? (
                <img
                  src={localProfileImage || user?.profileImage || ''}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#86D5F0' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Bottom Navigation */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[52] bg-white shadow-lg transition-all duration-300"
        style={styles.footer}
      >
        <div className="dynamic-nav-grid">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick || (() => handleBottomNavClick(item.id))}
                className="dynamic-nav-item"
                style={{ padding: `${styles.navigation.itemPadding}px` }}
              >
                <div
                  className={`dynamic-nav-icon transition-all duration-200 ${item.active ? 'bg-[#EAF1F4]' : ''
                    }`}
                  style={{
                    width: `${buttonSizes.width}px`,
                    height: `${buttonSizes.height}px`
                  }}
                >
                  <Icon
                    className={`transition-all duration-200 ${item.active ? 'text-[#377C92]' : 'text-gray-500'}`}
                    width={buttonSizes.icon}
                    height={buttonSizes.icon}
                  />
                </div>
                {styles.navigation.showLabels && (
                  <span className="dynamic-nav-text transition-all duration-200 text-black">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* More Menu - With Bottom Navigation */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-0 z-[51] bg-white"
            style={{
              paddingTop: `var(--header-total-height, ${styles.header.paddingTop + 56}px)`,
              paddingBottom: `var(--footer-total-height, ${styles.footer.paddingBottom + 80}px)`
            }}
          >
            <div className="p-4 sm:p-6 h-full overflow-y-auto">
              {/* Profile Section */}
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  {localProfileImage || user?.profileImage ? (
                    <img
                      src={localProfileImage || user?.profileImage || ''}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#86D5F0' }}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{user?.name || user?.fullName || 'User'}</h2>
                    <button
                      onClick={() => handleMoreItemClick('profile')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onClick={() => handleMoreItemClick('orders')}
                  className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <TransactionIcon width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-black font-semibold text-base">Transaction Details</p>
                    <p className="text-sm text-gray-500 mt-0.5">View Subscriptions & Receipts</p>
                  </div>
                </button>

                <button
                  onClick={() => handleMoreItemClick('settings')}
                  className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <SettingsIcon width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-black font-semibold text-base">Settings</p>
                    <p className="text-sm text-gray-500 mt-0.5">Locations, Notifications & Delete Account</p>
                  </div>
                </button>

                <button
                  onClick={() => handleMoreItemClick('referrals')}
                  className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <ReferIcon width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-black font-semibold text-base">Refer & Earn</p>
                  </div>
                </button>

                <button
                  onClick={() => handleMoreItemClick('support')}
                  className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <SupportIcon width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-black font-semibold text-base">Help & Support</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    const isAndroid = /Android/.test(navigator.userAgent);

                    if (isIOS) {
                      window.open('https://apps.apple.com/app/id6738049391', '_blank');
                    } else if (isAndroid) {
                      window.open('https://play.google.com/store/apps/details?id=com.playgram.app', '_blank');
                    } else {
                      alert('Thank you for wanting to rate our app! Please visit the App Store or Google Play Store to rate Playgram.');
                    }
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <RateIcon width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-black font-semibold text-base">Rate Our App</p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <LogoutIcon width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-black font-semibold text-base">Logout</p>
                  </div>
                </button>
              </div>

              <div className="px-4 py-6 border-t border-gray-100 bg-white mt-8">
                <div className="text-center">
                  <img
                    src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-23_034441494.png"
                    alt="Powered by Bricstal Group"
                    className="h-6 mx-auto"
                  />
                  <p className="text-xs text-gray-400 mt-2">Version 1.0</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};