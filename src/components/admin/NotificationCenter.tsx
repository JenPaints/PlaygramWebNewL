import React, { useState } from 'react';
import { Send, Users, UserCheck, Shield, MapPin, Calendar, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';

interface NotificationFormData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  targetType: 'all_users' | 'all_students' | 'all_coaches' | 'all_admins' | 'specific_user' | 'batch_members' | 'location_users';
  targetId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  expiresAt?: string;
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    targetType: 'all_users',
    priority: 'medium',
    expiresAt: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log user object to understand the structure
  console.log('NotificationCenter - Current user object:', user);
  console.log('NotificationCenter - User type:', user?.userType);
  
  // Temporarily allow access for debugging - TODO: Re-enable admin check
  // if (!user || user.userType !== 'admin') {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center">
  //         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
  //         <p className="text-gray-600">You need admin privileges to access notification center.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Queries for dropdown options
  const batches = useQuery(api.batches.getAllBatches);
  const locations = useQuery(api.locations.getAllLocations);
  const users = useQuery(api.users.getAllUsers);
  const allNotifications = useQuery(api.notifications.getAllNotifications, { limit: 20 });

  // Mutations
  const sendNotification = useMutation(api.notifications.sendNotification);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        targetType: formData.targetType,
        targetId: formData.targetId,
        priority: formData.priority,
        actionUrl: formData.actionUrl?.trim() || undefined,
        actionText: formData.actionText?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).getTime() : undefined,
      });

      toast.success(`Notification sent to ${result.targetUsersCount} users!`);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetType: 'all_students',
        priority: 'medium',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await deleteNotification({ notificationId: notificationId as any });
      toast.success('Notification deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case 'all_users': return <Users className="w-4 h-4" />;
      case 'all_students': return <UserCheck className="w-4 h-4" />;
      case 'all_coaches': return <UserCheck className="w-4 h-4" />;
      case 'all_admins': return <Shield className="w-4 h-4" />;
      case 'batch_members': return <Calendar className="w-4 h-4" />;
      case 'location_users': return <MapPin className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'announcement': return <Bell className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Notification Center</h2>
          <p className="text-gray-300">Send targeted notifications to users</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Bell className="w-4 h-4" />
          <span>{allNotifications?.length || 0} Total Notifications</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Notification
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                placeholder="Notification title"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                placeholder="Notification message"
                rows={3}
                required
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Send To
              </label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any, targetId: undefined }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
              >
                <option value="all_users">All Users</option>
                <option value="all_students">All Students</option>
                <option value="all_coaches">All Coaches</option>
                <option value="all_admins">All Admins</option>
                <option value="specific_user">Specific User</option>
                <option value="batch_members">Batch Members</option>
                <option value="location_users">Location Users</option>
              </select>
            </div>

            {/* Target Selection */}
            {formData.targetType === 'specific_user' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select User
                </label>
                <select
                  value={formData.targetId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="">Select a user</option>
                  {users?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.phone} ({user.userType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.targetType === 'batch_members' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Batch
                </label>
                <select
                  value={formData.targetId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="">Select a batch</option>
                  {batches?.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.sport?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.targetType === 'location_users' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Location
                </label>
                <select
                  value={formData.targetId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                >
                  <option value="">Select a location</option>
                  {locations?.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.actionUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action Text (optional)
                </label>
                <input
                  type="text"
                  value={formData.actionText || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionText: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  placeholder="View Details"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#89D3EC] text-gray-900 rounded-lg hover:bg-[#7BC3D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* Recent Notifications */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notifications
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allNotifications?.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No notifications sent yet</p>
              </div>
            ) : (
              allNotifications?.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <h4 className="font-medium text-white">{notification.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {getTargetTypeIcon(notification.targetType)}
                        <span>{notification.targetType.replace('_', ' ')}</span>
                      </div>
                      <span>Sent: {formatDate(notification.sentAt)}</span>
                    </div>
                    
                    {notification.stats && (
                      <div className="flex items-center gap-2">
                        <span>📤 {notification.stats.delivered}</span>
                        <span>👁️ {notification.stats.read}</span>
                        <span>📊 {notification.stats.readRate}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;