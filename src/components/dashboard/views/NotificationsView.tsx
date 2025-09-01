import React, { useState } from 'react';
import { Bell, Calendar, Trophy, ShoppingBag, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Get user notifications from database (auth disabled for testing)
  const userNotifications = useQuery(
    api.notifications.getUserNotifications,
    { limit: 50 }
  ) || [];
  
  // Get unread count (auth disabled for testing)
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, {}) || 0;
  
  // Mark notification as read
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return Bell;
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'announcement': return Bell;
      default: return Bell;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-orange-100 text-orange-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'announcement': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryFromTitle = (title: string) => {
    if (title.toLowerCase().includes('session') || title.toLowerCase().includes('training')) return 'Sessions';
    if (title.toLowerCase().includes('achievement') || title.toLowerCase().includes('congratulations')) return 'Achievements';
    if (title.toLowerCase().includes('order') || title.toLowerCase().includes('merchandise')) return 'Merchandise';
    if (title.toLowerCase().includes('reminder') || title.toLowerCase().includes('payment') || title.toLowerCase().includes('low session')) return 'Reminders';
    return 'All';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sessions': return Calendar;
      case 'Achievements': return Trophy;
      case 'Merchandise': return ShoppingBag;
      case 'Reminders': return Clock;
      default: return Bell;
    }
  };
  
  const handleMarkAsRead = async (userNotificationId: any) => {
    try {
      await markAsRead({ userNotificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };
  
  // Filter notifications based on selected filter
  const filteredNotifications = userNotifications.filter(notification => {
    if (filter === 'unread') {
      return notification.deliveryStatus !== 'read';
    }
    return true;
  });

  const notifications = filteredNotifications.map((userNotif: any) => {
    const category = getCategoryFromTitle(userNotif.title || 'Notification');
    const CategoryIcon = getCategoryIcon(category);
    
    return {
      id: userNotif._id,
      type: userNotif.type || 'info',
      icon: CategoryIcon,
      title: userNotif.title || 'Notification',
      message: userNotif.message || '',
      time: formatTimeAgo(userNotif.deliveredAt || userNotif.createdAt),
      read: userNotif.deliveryStatus === 'read',
      color: getTypeColor(userNotif.type || 'info'),
      actionUrl: userNotif.actionUrl,
      actionText: userNotif.actionText,
      priority: userNotif.priority || 'medium',
      userNotificationId: userNotif.userNotificationId,
      category: category
    };
  });

  const displayedNotifications = notifications;
  const currentUnreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1 text-sm font-medium">
              Stay updated with your training and activities
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all duration-200 whitespace-nowrap ${
                  filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all duration-200 whitespace-nowrap ${
                  filter === 'unread' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread ({currentUnreadCount})
              </button>
            </div>
            {currentUnreadCount > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-3 py-1.5 rounded-xl font-semibold shadow-lg">
                {currentUnreadCount}
              </span>
            )}
          </div>
        </div>
      </div>



      {/* Notifications List - Mobile App Style */}
      <div className="space-y-3 sm:space-y-4">
        {displayedNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.userNotificationId)}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all hover:shadow-lg active:scale-95 cursor-pointer duration-200 ${
                notification.read ? 'border-gray-100' : 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${notification.color} shadow-sm`}>
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 overflow-hidden">
                      <h3 className={`font-bold text-sm sm:text-base ${notification.read ? 'text-gray-900' : 'text-gray-900'} break-words`}>
                        {notification.title}
                      </h3>
                      <p className={`mt-1 text-sm ${notification.read ? 'text-gray-600' : 'text-gray-700'} leading-relaxed break-words`}>
                        {notification.message}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">{notification.time}</p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mt-1 shadow-sm flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State - Mobile Optimized */}
      {displayedNotifications.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Bell size={28} className="text-gray-400 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Notifications</h3>
          <p className="text-gray-600 text-sm sm:text-base font-medium">You're all caught up! Check back later for updates.</p>
        </div>
      )}
    </div>
  );
};