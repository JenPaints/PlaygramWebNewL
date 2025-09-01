import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  BookOpen,
  Activity,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import {
  useRealTimeUsers,
  useRealTimePayments,
  useRealTimeEnrollments,
  useRealTimeStats,
  useRealTimeNotifications
} from '../../hooks/useAutoRefresh';
import { toast } from 'sonner';

interface RealTimeIndicatorProps {
  isConnected: boolean;
  lastUpdated: Date;
  isRefreshing: boolean;
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  isConnected,
  lastUpdated,
  isRefreshing
}) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo(`${diff}s ago`);
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      
      <div className="flex items-center gap-1 text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{timeAgo}</span>
      </div>
      
      {isRefreshing && (
        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
  lastUpdated?: Date;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  isLoading,
  lastUpdated
}) => {
  return (
    <motion.div
      layout
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <motion.p
            key={value}
            initial={{ scale: 1.1, color: '#3B82F6' }}
            animate={{ scale: 1, color: '#111827' }}
            className="text-2xl font-bold text-gray-900 mt-1"
          >
            {value}
          </motion.p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      
      {lastUpdated && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <RealTimeIndicator
            isConnected={true}
            lastUpdated={lastUpdated}
            isRefreshing={isLoading || false}
          />
        </div>
      )}
    </motion.div>
  );
};

interface LiveActivityProps {
  activities: Array<{
    id: string;
    type: 'user' | 'payment' | 'enrollment';
    message: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
  }>;
}

const LiveActivity: React.FC<LiveActivityProps> = ({ activities }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
        <div className="flex items-center gap-1 text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm">Live</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {getStatusIcon(activity.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RealTimeAdminDashboard: React.FC = () => {
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: 'user' | 'payment' | 'enrollment';
    message: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
  }>>([]);

  // Real-time data hooks
  const {
    data: users,
    lastUpdated: usersLastUpdated,
    isRefreshing: usersRefreshing
  } = useRealTimeUsers();

  const {
    data: payments,
    lastUpdated: paymentsLastUpdated,
    isRefreshing: paymentsRefreshing
  } = useRealTimePayments();

  const {
    data: enrollments,
    lastUpdated: enrollmentsLastUpdated,
    isRefreshing: enrollmentsRefreshing
  } = useRealTimeEnrollments();

  const {
    data: stats,
    lastUpdated: statsLastUpdated,
    isRefreshing: statsRefreshing
  } = useRealTimeStats();

  const {
    data: notifications,
    lastUpdated: notificationsLastUpdated,
    isRefreshing: notificationsRefreshing
  } = useRealTimeNotifications();

  // Add activity when data updates
  useEffect(() => {
    if (users) {
      const newActivity = {
        id: `users-${Date.now()}`,
        type: 'user' as const,
        message: `User data updated - ${Array.isArray(users) ? users.length : 0} total users`,
        timestamp: new Date(),
        status: 'success' as const
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }
  }, [users]);

  useEffect(() => {
    if (payments) {
      const newActivity = {
        id: `payments-${Date.now()}`,
        type: 'payment' as const,
        message: `Payment data updated - ${Array.isArray(payments) ? payments.length : 0} total payments`,
        timestamp: new Date(),
        status: 'success' as const
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }
  }, [payments]);

  useEffect(() => {
    if (enrollments) {
      const newActivity = {
        id: `enrollments-${Date.now()}`,
        type: 'enrollment' as const,
        message: `Enrollment data updated - ${Array.isArray(enrollments) ? enrollments.length : 0} total enrollments`,
        timestamp: new Date(),
        status: 'success' as const
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }
  }, [enrollments]);

  // Show toast notifications for important updates
  useEffect(() => {
    if (notifications && Array.isArray(notifications) && notifications.length > 0) {
      const latestNotification = notifications[0];
      if (latestNotification) {
        toast.info(`New notification: ${latestNotification.title || 'Update available'}`);
      }
    }
  }, [notifications]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Live data updates automatically - no refresh needed!</p>
        </div>
        
        <div className="flex items-center gap-4">
          <RealTimeIndicator
            isConnected={true}
            lastUpdated={new Date()}
            isRefreshing={usersRefreshing || paymentsRefreshing || enrollmentsRefreshing}
          />
          
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Auto-Updates Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || Array.isArray(users) ? users.length : 0}
          change="+12.5%"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          isLoading={usersRefreshing}
          lastUpdated={usersLastUpdated}
        />
        
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          change="+8.2%"
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-green-500"
          isLoading={statsRefreshing}
          lastUpdated={statsLastUpdated}
        />
        
        <StatCard
          title="Total Payments"
          value={Array.isArray(payments) ? payments.length : 0}
          change="+15.3%"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
          isLoading={paymentsRefreshing}
          lastUpdated={paymentsLastUpdated}
        />
        
        <StatCard
          title="Enrollments"
          value={Array.isArray(enrollments) ? enrollments.length : 0}
          change="+6.7%"
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          isLoading={enrollmentsRefreshing}
          lastUpdated={enrollmentsLastUpdated}
        />
      </div>

      {/* Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveActivity activities={activities} />
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Refresh Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Users</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Every 15s</span>
                {usersRefreshing && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">Payments</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600">Every 10s</span>
                {paymentsRefreshing && <RefreshCw className="w-3 h-3 text-green-500 animate-spin" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-900">Enrollments</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-600">Every 20s</span>
                {enrollmentsRefreshing && <RefreshCw className="w-3 h-3 text-purple-500 animate-spin" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-900">Notifications</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-yellow-600">Every 5s</span>
                {notificationsRefreshing && <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>No manual refresh needed!</strong> All data updates automatically in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAdminDashboard;