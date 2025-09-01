import React, { useState, useEffect } from 'react';
import { Bell, X, MessageCircle, Calendar, CreditCard, Users, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  sentAt: number;
  actionUrl?: string;
  actionText?: string;
}

interface RealTimeNotificationCenterProps {
  className?: string;
}

const RealTimeNotificationCenter: React.FC<RealTimeNotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Real-time queries
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user?.phoneNumber ? { limit: 50 } : "skip"
  ) || [];

  const unreadCount = useQuery(
    api.notifications.getUnreadNotificationCount,
    user?.phoneNumber ? {} : "skip"
  ) || 0;

  // Mutations
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > lastNotificationCount && lastNotificationCount > 0) {
      const newNotifications = notifications.slice(0, notifications.length - lastNotificationCount);
      newNotifications.forEach(notification => {
        if (!notification.isRead) {
          const toastType = notification.type === 'error' ? 'error' : 
                           notification.type === 'warning' ? 'warning' : 
                           notification.type === 'success' ? 'success' : 'info';
          toast[toastType](notification.title, {
            description: notification.message,
            duration: 5000,
            action: notification.actionUrl ? {
              label: notification.actionText || 'View',
              onClick: () => {
                if (notification.actionUrl) {
                  window.location.href = notification.actionUrl;
                }
              }
            } : undefined
          });
        }
      });
    }
    setLastNotificationCount(notifications.length);
  }, [notifications.length, lastNotificationCount]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.phoneNumber) return;
    
    try {
      await markAsRead({
        userNotificationId: notificationId as any
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                        getNotificationBorderColor(notification.type)
                      } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        handleMarkAsRead(notification._id);
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.sentAt)}
                            </span>
                            {notification.actionText && (
                              <span className="text-xs text-blue-600 font-medium">
                                {notification.actionText}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Navigate to full notifications page
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RealTimeNotificationCenter;