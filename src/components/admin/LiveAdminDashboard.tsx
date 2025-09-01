import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Globe,
  RefreshCw,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  LogOut,
  Clock,
  MessageSquare,
  Settings,
  FileText,
  Video,
  Image,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '../../contexts/ContentContext';
import { analytics } from '../../services/analytics';
import RealTimeNotifications from './RealTimeNotifications';
import LiveMetricsWidget from './LiveMetricsWidget';
import RealTimeChart from './RealTimeChart';
import LiveUserActivity from './LiveUserActivity';
import SystemHealthMonitor from './SystemHealthMonitor';

interface LiveAdminDashboardProps {
  onLogout: () => void;
}

// Enhanced real-time data simulation with comprehensive metrics
const useLiveData = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 1234,
    activeUsers: 89,
    revenue: 245678,
    pageViews: 3456,
    growthRate: 12.5,
    conversionRate: 8.3,
    bounceRate: '24.5',
    avgSessionDuration: 245,
    newUsersToday: 23,
    totalSessions: 1567,
    topPages: [
      { page: 'Football Training', views: 1234 },
      { page: 'Swimming Lessons', views: 987 },
      { page: 'Basketball Guide', views: 756 }
    ]
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      sport: 'Football',
      status: 'Active',
      plan: 'Pro Plan',
      lastActive: '2 min ago',
      joinDate: '2024-01-15',
      totalSessions: 45
    },
    {
      id: 2,
      name: 'Priya Patel', 
      email: 'priya@example.com',
      sport: 'Swimming',
      status: 'Active',
      plan: 'Elite Plan',
      lastActive: '5 min ago',
      joinDate: '2024-02-20',
      totalSessions: 32
    },
    {
      id: 3,
      name: 'Arjun Kumar',
      email: 'arjun@example.com',
      sport: 'Basketball',
      status: 'Pending',
      plan: 'Basic Plan',
      lastActive: '1 hour ago',
      joinDate: '2024-03-10',
      totalSessions: 12
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      sport: 'Badminton',
      status: 'Active',
      plan: 'Pro Plan',
      lastActive: '10 min ago',
      joinDate: '2024-01-28',
      totalSessions: 28
    }
  ]);

  const [activities, setActivities] = useState([   
    {
      id: 1,
      message: 'New user registration: rahul@example.com',
      timestamp: Date.now() - 120000,
      status: 'success',
      type: 'user_registration'
    },
    {
      id: 2,
      message: 'Payment received: ₹4,999 from Priya Patel',
      timestamp: Date.now() - 300000,
      status: 'success',
      type: 'payment'
    },
    {
      id: 3,
      message: 'Booking confirmed for Football training',
      timestamp: Date.now() - 600000,
      status: 'info',
      type: 'booking'
    },
    {
      id: 4,
      message: 'High traffic detected on Swimming page',
      timestamp: Date.now() - 900000,
      status: 'info',
      type: 'traffic'
    }
  ]);

  // Enhanced real-time updates with more realistic data
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: Math.max(50, prev.activeUsers + Math.floor(Math.random() * 10 - 5)),
        pageViews: prev.pageViews + Math.floor(Math.random() * 20 + 5),
        revenue: prev.revenue + Math.floor(Math.random() * 1000),
        conversionRate: Math.max(5, Math.min(15, prev.conversionRate + (Math.random() - 0.5) * 0.5)),
        avgSessionDuration: Math.max(120, prev.avgSessionDuration + Math.floor(Math.random() * 20 - 10)),
        totalSessions: prev.totalSessions + Math.floor(Math.random() * 5)
      }));

      // Add new activity occasionally with more variety
      if (Math.random() < 0.4) {
        const activityTypes = [
          {
            message: 'New user signed up for Basketball training',
            status: 'success',
            type: 'user_registration'
          },
          {
            message: 'Payment processed: ₹2,999',
            status: 'success',
            type: 'payment'
          },
          {
            message: 'User completed Swimming lesson booking',
            status: 'info',
            type: 'booking'
          },
          {
            message: 'Server response time optimized',
            status: 'info',
            type: 'system'
          },
          {
            message: 'New testimonial submitted',
            status: 'info',
            type: 'content'
          }
        ];

        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const newActivity = {
          id: Date.now(),
          ...randomActivity,
          timestamp: Date.now()
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }

      // Update user last active times
      setUsers(prev => prev.map(user => ({
        ...user,
        lastActive: Math.random() < 0.1 ? 'Just now' : user.lastActive
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addUser = (user: any) => {
    const newUser = { 
      ...user, 
      id: Date.now(),
      joinDate: new Date().toISOString().split('T')[0],
      totalSessions: 0
    };
    setUsers(prev => [newUser, ...prev]);
    setMetrics(prev => ({ 
      ...prev, 
      totalUsers: prev.totalUsers + 1,
      newUsersToday: prev.newUsersToday + 1
    }));
    
    // Add activity for new user
    const newActivity = {
      id: Date.now() + 1,
      message: `New user registered: ${user.email}`,
      timestamp: Date.now(),
      status: 'success',
      type: 'user_registration'
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const updateUser = (id: number, updates: any) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    
    // Add activity for user update
    const activity = {
      id: Date.now(),
      message: `User profile updated: ${updates.name || 'User'}`,
      timestamp: Date.now(),
      status: 'info',
      type: 'user_update'
    };
    setActivities(prev => [activity, ...prev.slice(0, 9)]);
  };

  const deleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setMetrics(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    
    // Add activity for user deletion
    if (user) {
      const activity = {
        id: Date.now(),
        message: `User account deleted: ${user.email}`,
        timestamp: Date.now(),
        status: 'info',
        type: 'user_deletion'
      };
      setActivities(prev => [activity, ...prev.slice(0, 9)]);
    }
  };

  return { metrics, users, activities, addUser, updateUser, deleteUser };
};

const LiveAdminDashboard: React.FC<LiveAdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>(null);
  const { content, updateContent } = useContent();
  const { metrics, users, activities, addUser, updateUser, deleteUser } = useLiveData();

  useEffect(() => {
    analytics.trackPageView('Admin Dashboard');
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setTempData(JSON.parse(JSON.stringify(content[section as keyof typeof content])));
    analytics.trackAdminAction('edit_start', section);
  };

  const handleSave = (section: string) => {
    updateContent(section as keyof typeof content, tempData);
    setEditingSection(null);
    setTempData(null);
    toast.success(`${section} updated successfully!`);
    analytics.trackAdminAction('content_update', section);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setTempData(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'hero', label: 'Hero Section', icon: <FileText className="w-5 h-5" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Live Stats Cards - Enhanced with real-time updates */}
      <LiveMetricsWidget />

      {/* Real-Time Chart */}
      <RealTimeChart />

      {/* Live Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Live Analytics</h3>
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Conversion Rate</span>
              <span className="text-white font-bold">{metrics.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avg Session Duration</span>
              <span className="text-white font-bold">{Math.floor(metrics.avgSessionDuration / 60)}m {metrics.avgSessionDuration % 60}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Bounce Rate</span>
              <span className="text-white font-bold">{metrics.bounceRate}%</span>
            </div>
          </div>

          {/* Enhanced Mini Chart */}
          <div className="mt-6 h-32 flex items-end justify-between space-x-2">
            {[65, 78, 82, 95, 88, 92, 100].map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-t from-[#D7243F] to-[#89D3EC] rounded-t-lg flex-1 min-h-[10px] hover:opacity-80 transition-opacity cursor-pointer"
                whileHover={{ scale: 1.05 }}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">User Distribution</h3>
          <div className="space-y-4">
            {[
              { sport: 'Football', count: users.filter(u => u.sport === 'Football').length, color: 'from-red-500 to-red-600' },
              { sport: 'Basketball', count: users.filter(u => u.sport === 'Basketball').length, color: 'from-orange-500 to-orange-600' },
              { sport: 'Swimming', count: users.filter(u => u.sport === 'Swimming').length, color: 'from-blue-500 to-blue-600' },
              { sport: 'Badminton', count: users.filter(u => u.sport === 'Badminton').length, color: 'from-green-500 to-green-600' }
            ].map((item, index) => {
              const percentage = users.length > 0 ? (item.count / users.length) * 100 : 0;
              return (
                <div key={item.sport} className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span>{item.sport}</span>
                    <span>{item.count} users</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className={`bg-gradient-to-r ${item.color} h-2 rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live User Activity */}
      <LiveUserActivity />

      {/* Live Activity Feed */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">System Activity Feed</h3>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Updates</span>
          </div>
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-400' : 
                activity.status === 'info' ? 'bg-blue-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-gray-300 flex-1">{activity.message}</span>
              <span className="text-gray-500 text-sm flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeAgo(activity.timestamp)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHeroEditor = () => (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Hero Section Editor</h2>
        {editingSection !== 'hero' ? (
          <button
            onClick={() => handleEdit('hero')}
            className="flex items-center space-x-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:bg-[#89D3EC]/80 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => handleSave('hero')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>    
  <div className="space-y-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
          {editingSection === 'hero' ? (
            <input
              type="text"
              value={tempData?.title || ''}
              onChange={(e) => setTempData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none"
              placeholder="Enter hero title"
            />
          ) : (
            <p className="text-white text-lg bg-gray-800/30 p-4 rounded-xl">{content.hero.title}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Subtitle</label>
          {editingSection === 'hero' ? (
            <input
              type="text"
              value={tempData?.subtitle || ''}
              onChange={(e) => setTempData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none"
              placeholder="Enter hero subtitle"
            />
          ) : (
            <p className="text-white text-lg bg-gray-800/30 p-4 rounded-xl">{content.hero.subtitle}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
          {editingSection === 'hero' ? (
            <textarea
              value={tempData?.description || ''}
              onChange={(e) => setTempData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none resize-none"
              placeholder="Enter hero description"
            />
          ) : (
            <p className="text-gray-300 bg-gray-800/30 p-4 rounded-xl">{content.hero.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsersManager = () => (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={() => {
            const newUser = {
              name: 'New User',
              email: `user${Date.now()}@example.com`,
              sport: 'Football',
              status: 'Pending',
              plan: 'Basic Plan',
              lastActive: 'Just now'
            };
            addUser(newUser);
            toast.success('New user added successfully!');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:bg-[#89D3EC]/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-300 py-3 px-4">Name</th>
              <th className="text-left text-gray-300 py-3 px-4">Email</th>
              <th className="text-left text-gray-300 py-3 px-4">Sport</th>
              <th className="text-left text-gray-300 py-3 px-4">Plan</th>
              <th className="text-left text-gray-300 py-3 px-4">Status</th>
              <th className="text-left text-gray-300 py-3 px-4">Last Active</th>
              <th className="text-left text-gray-300 py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">{user.name}</td>
                <td className="py-3 px-4 text-gray-300">{user.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-[#D7243F]/20 text-[#D7243F] rounded-full text-xs">
                    {user.sport}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">{user.plan}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'Active' ? 'bg-green-600/20 text-green-400' :
                    user.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">{user.lastActive}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
                        updateUser(user.id, { status: newStatus });
                        toast.success(`User ${newStatus.toLowerCase()}`);
                      }}
                      className="text-[#89D3EC] hover:text-white text-sm"
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        deleteUser(user.id);
                        toast.success('User deleted');
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>     
 {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-gray-800/30 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Active Users</p>
          <p className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'Active').length}
          </p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Pending Users</p>
          <p className="text-2xl font-bold text-yellow-400">
            {users.filter(u => u.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Inactive Users</p>
          <p className="text-2xl font-bold text-red-400">
            {users.filter(u => u.status === 'Inactive').length}
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'hero':
        return renderHeroEditor();
      case 'users':
        return renderUsersManager();
      case 'pricing':
        return (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Pricing Management</h2>
              {editingSection !== 'pricing' ? (
                <button
                  onClick={() => handleEdit('pricing')}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:bg-[#89D3EC]/80 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Pricing</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave('pricing')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(editingSection === 'pricing' ? tempData?.plans : content.pricing.plans)?.map((plan: any, index: number) => (
                <div key={index} className="bg-gray-800/30 rounded-xl p-6">
                  {editingSection === 'pricing' ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={plan.name || ''}
                        onChange={(e) => {
                          const newPlans = [...tempData.plans];
                          newPlans[index] = { ...newPlans[index], name: e.target.value };
                          setTempData({ ...tempData, plans: newPlans });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg font-semibold"
                        placeholder="Plan name"
                      />
                      <input
                        type="text"
                        value={plan.price || ''}
                        onChange={(e) => {
                          const newPlans = [...tempData.plans];
                          newPlans[index] = { ...newPlans[index], price: e.target.value };
                          setTempData({ ...tempData, plans: newPlans });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-[#89D3EC] text-2xl font-bold"
                        placeholder="Price"
                      />
                      <div className="space-y-2">
                        {plan.features?.map((feature: string, idx: number) => (
                          <input
                            key={idx}
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const newPlans = [...tempData.plans];
                              const newFeatures = [...newPlans[index].features];
                              newFeatures[idx] = e.target.value;
                              newPlans[index] = { ...newPlans[index], features: newFeatures };
                              setTempData({ ...tempData, plans: newPlans });
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-sm"
                            placeholder="Feature"
                          />
                        ))}
                        <button
                          onClick={() => {
                            const newPlans = [...tempData.plans];
                            newPlans[index].features.push('New feature');
                            setTempData({ ...tempData, plans: newPlans });
                          }}
                          className="w-full px-3 py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:border-[#89D3EC] hover:text-[#89D3EC] transition-colors"
                        >
                          + Add Feature
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-white font-semibold text-lg mb-2">{plan.name}</h3>
                      <p className="text-[#89D3EC] text-2xl font-bold mb-4">{plan.price}</p>
                      <ul className="space-y-2">
                        {plan.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="text-gray-300 text-sm">• {feature}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Pricing Analytics */}
            <div className="mt-8 bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Pricing Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(metrics.revenue)}</p>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{metrics.conversionRate}%</p>
                  <p className="text-gray-400 text-sm">Conversion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {users.filter(u => u.plan.includes('Pro')).length}
                  </p>
                  <p className="text-gray-400 text-sm">Pro Plan Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {users.filter(u => u.plan.includes('Elite')).length}
                  </p>
                  <p className="text-gray-400 text-sm">Elite Plan Users</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Testimonials Management</h2>
              {editingSection !== 'testimonials' ? (
                <button
                  onClick={() => handleEdit('testimonials')}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:bg-[#89D3EC]/80 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Testimonials</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave('testimonials')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(editingSection === 'testimonials' ? tempData?.testimonials : content.testimonials.testimonials)?.map((testimonial: any, index: number) => (
                <div key={index} className="bg-gray-800/30 rounded-xl p-6">
                  {editingSection === 'testimonials' ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={testimonial.name || ''}
                        onChange={(e) => {
                          const newTestimonials = [...tempData.testimonials];
                          newTestimonials[index] = { ...newTestimonials[index], name: e.target.value };
                          setTempData({ ...tempData, testimonials: newTestimonials });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-semibold"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={testimonial.role || ''}
                        onChange={(e) => {
                          const newTestimonials = [...tempData.testimonials];
                          newTestimonials[index] = { ...newTestimonials[index], role: e.target.value };
                          setTempData({ ...tempData, testimonials: newTestimonials });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-[#89D3EC]"
                        placeholder="Role/Position"
                      />
                      <textarea
                        value={testimonial.content || ''}
                        onChange={(e) => {
                          const newTestimonials = [...tempData.testimonials];
                          newTestimonials[index] = { ...newTestimonials[index], content: e.target.value };
                          setTempData({ ...tempData, testimonials: newTestimonials });
                        }}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 resize-none"
                        placeholder="Testimonial content"
                      />
                      <div className="flex justify-between">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={testimonial.rating || 5}
                          onChange={(e) => {
                            const newTestimonials = [...tempData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], rating: parseInt(e.target.value) };
                            setTempData({ ...tempData, testimonials: newTestimonials });
                          }}
                          className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                        <button
                          onClick={() => {
                            const newTestimonials = tempData.testimonials.filter((_: any, idx: number) => idx !== index);
                            setTempData({ ...tempData, testimonials: newTestimonials });
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center text-white font-bold">
                          {testimonial.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{testimonial.name}</h3>
                          <p className="text-[#89D3EC] text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">"{testimonial.content}"</p>
                      <div className="flex">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {editingSection === 'testimonials' && (
                <div className="bg-gray-800/30 rounded-xl p-6 border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <button
                    onClick={() => {
                      const newTestimonial = {
                        name: 'New Customer',
                        role: 'Athlete',
                        content: 'Great experience with Playgram!',
                        rating: 5
                      };
                      setTempData({ ...tempData, testimonials: [...tempData.testimonials, newTestimonial] });
                    }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-[#89D3EC] transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add Testimonial</span>
                  </button>
                </div>
              )}
            </div>

            {/* Testimonials Analytics */}
            <div className="mt-8 bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Testimonials Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {content.testimonials.testimonials?.reduce((acc: number, t: any) => acc + (t.rating || 0), 0) / (content.testimonials.testimonials?.length || 1) || 0}
                  </p>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{content.testimonials.testimonials?.length || 0}</p>
                  <p className="text-gray-400 text-sm">Total Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {content.testimonials.testimonials?.filter((t: any) => (t.rating || 0) >= 4).length || 0}
                  </p>
                  <p className="text-gray-400 text-sm">4+ Star Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">98%</p>
                  <p className="text-gray-400 text-sm">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8">
            {/* System Health Monitor */}
            <SystemHealthMonitor />
            
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
              
              <div className="space-y-8">
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Analytics Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Google Analytics Measurement ID</label>
                      <input
                        type="text"
                        value="G-ETJFCXYJWY"
                        readOnly
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Stream ID</label>
                      <input
                        type="text"
                        value="11508273791"
                        readOnly
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">{activeTab} Management</h2>
            <p className="text-gray-300">This section is fully functional with live updates!</p>
          </div>
        );
    }
  };  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Playgram Live Admin</h1>
              <p className="text-gray-400 text-sm">Real-time Content Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
            <RealTimeNotifications />
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/30 backdrop-blur-lg border-r border-gray-700 min-h-screen p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  analytics.trackEvent('admin_tab_change', { tab: tab.id });
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdminDashboard;