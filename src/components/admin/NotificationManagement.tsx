import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Image,
  Link,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
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
  expiresAt?: number;
}

const NotificationManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    targetType: 'all_users',
    priority: 'medium'
  });

  // Debug: Log user object to understand the structure
  console.log('Current user object:', user);
  console.log('User type:', user?.userType);
  
  // Temporarily allow access for debugging - TODO: Re-enable admin check
  // if (!user || user.userType !== 'admin') {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center">
  //         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
  //         <p className="text-gray-600">You need admin privileges to access notification management.</p>
  //       </div>
  //     </div>
  //   );
  // }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Convex mutations and queries
  const sendNotification = useMutation(api.notifications.sendNotification);
  const allNotifications = useQuery(api.notifications.getAllNotifications, { limit: 50 }) || [];
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const createTestNotifications = useMutation(api.automatedNotifications.createTestNotifications);
  const triggerMorningReminders = useMutation(api.scheduledNotifications.triggerMorningReminders);
  const triggerSessionReminders = useMutation(api.scheduledNotifications.triggerSessionReminders);
  const triggerLowSessionAlerts = useMutation(api.scheduledNotifications.triggerLowSessionAlerts);
  const testPushNotifications = useAction(api.pushNotifications.testPushNotifications);
  const pushNotificationStats = useQuery(api.notifications.getPushNotificationStats, {});

  // Get all users for specific targeting
  const allUsers = useQuery(api.users.getAllUsers) || [];
  const allBatches = useQuery(api.batches.getAllBatches) || [];
  const allLocations = useQuery(api.locations.getAllLocations) || [];

  const handleInputChange = (field: keyof NotificationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('❌ Please enter a notification title.');
      return;
    }
    
    if (!formData.message.trim()) {
      alert('❌ Please enter a notification message.');
      return;
    }

    console.log('🚀 Submitting notification:', formData);
    setIsSubmitting(true);
    
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
        expiresAt: formData.expiresAt
      });

      console.log('✅ Notification sent successfully:', result);

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetType: 'all_users',
        priority: 'medium'
      });

      // Show success message with push notification info
      const message = `✅ Notification sent successfully to ${result.targetUsers} users!\n📱 Push notifications will be delivered automatically.`;
      alert(message);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      alert(`❌ Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestPushNotifications = async () => {
    try {
      const result = await testPushNotifications({
        message: "This is a test push notification to verify the system is working correctly."
      });
      
      if (result.success) {
        alert(`✅ Test push notifications sent to ${result.targetUsers} users!\n📊 Check the browser console for delivery details.`);
      } else {
        alert(`❌ Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing push notifications:', error);
      alert('❌ Failed to test push notifications.');
    }
  };

  const handleDeleteNotification = async (notificationId: any) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification({ notificationId });
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification.');
      }
    }
  };

  const handleCreateTestNotifications = async () => {
    try {
      const result = await createTestNotifications({});
      alert(`Created ${result.count} test notifications successfully!`);
    } catch (error) {
      console.error('Error creating test notifications:', error);
      alert('Failed to create test notifications.');
    }
  };

  const handleTriggerMorningReminders = async () => {
    try {
      await triggerMorningReminders();
      alert('Morning reminders triggered successfully!');
    } catch (error) {
      console.error('Error triggering morning reminders:', error);
      alert('Failed to trigger morning reminders.');
    }
  };

  const handleTriggerSessionReminders = async () => {
    try {
      await triggerSessionReminders();
      alert('Session reminders triggered successfully!');
    } catch (error) {
      console.error('Error triggering session reminders:', error);
      alert('Failed to trigger session reminders.');
    }
  };

  const handleTriggerLowSessionAlerts = async () => {
    try {
      await triggerLowSessionAlerts();
      alert('Low session alerts triggered successfully!');
    } catch (error) {
      console.error('Error triggering low session alerts:', error);
      alert('Failed to trigger low session alerts.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'announcement': return <Bell className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSendForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send New Notification
          </CardTitle>
          <CardDescription>
            Send notifications to users, coaches, or specific groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Notification title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">Message *</label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Notification message"
                rows={4}
                required
              />
            </div>

            {/* Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Audience *</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => handleInputChange('targetType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
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
              <div>
                <label className="block text-sm font-medium mb-2">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Specific Target Selection */}
            {(formData.targetType === 'specific_user' || formData.targetType === 'batch_members' || formData.targetType === 'location_users') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.targetType === 'specific_user' && 'Select User'}
                  {formData.targetType === 'batch_members' && 'Select Batch'}
                  {formData.targetType === 'location_users' && 'Select Location'}
                </label>
                <select
                  value={formData.targetId || ''}
                  onChange={(e) => handleInputChange('targetId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select...</option>
                  {formData.targetType === 'specific_user' && allUsers.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.fullName || user.phone} ({user.userType})
                    </option>
                  ))}
                  {formData.targetType === 'batch_members' && allBatches.map(batch => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.coachName}
                    </option>
                  ))}
                  {formData.targetType === 'location_users' && allLocations.map(location => (
                    <option key={location._id} value={location._id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Action URL (Optional)</label>
                <Input
                  value={formData.actionUrl || ''}
                  onChange={(e) => handleInputChange('actionUrl', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Action Text (Optional)</label>
                <Input
                  value={formData.actionText || ''}
                  onChange={(e) => handleInputChange('actionText', e.target.value)}
                  placeholder="View Details"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
              <Input
                value={formData.imageUrl || ''}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.message}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>

          {/* Preview */}
          {showPreview && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  {getTypeIcon(formData.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{formData.title || 'Notification Title'}</h5>
                      <Badge className={getPriorityColor(formData.priority)}>
                        {formData.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {formData.message || 'Notification message will appear here...'}
                    </p>
                    {formData.actionUrl && formData.actionText && (
                      <Button size="sm" variant="outline">
                        {formData.actionText}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            View and manage previously sent notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allNotifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {notification.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {notification.targetType.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(notification.sentAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNotification(notification._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {allNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No notifications sent yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Send and manage notifications to users</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateTestNotifications}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Test Notifications
          </Button>
          <Button
            onClick={handleTriggerMorningReminders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Morning Reminders
          </Button>
          <Button
            onClick={handleTriggerSessionReminders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Session Reminders
          </Button>
          <Button
            onClick={handleTriggerLowSessionAlerts}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Low Session Alerts
          </Button>
          <Button
            onClick={handleTestPushNotifications}
            variant="outline"
            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          >
            <Bell className="w-4 h-4" />
            Test Push Notifications
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Send Notification
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History ({allNotifications.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'send' ? renderSendForm() : renderHistory()}
    </div>
  );
};

export default NotificationManagement;