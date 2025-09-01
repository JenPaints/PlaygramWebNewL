import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Image,
  Video,
  DollarSign,
  MessageSquare,
  LogOut,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  Activity,
  Globe,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '../../contexts/ContentContext';
import { useAdminDashboard } from '../../hooks/useRealTimeData';
import { analytics } from '../../services/analytics';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { content, updateContent, resetContent } = useContent();
  const [tempData, setTempData] = useState<any>(null);

  // Real-time data hooks
  const { metrics, users, activities, isLoading, actions } = useAdminDashboard();

  // Track admin page view
  useEffect(() => {
    analytics.trackPageView('Admin Dashboard', 'Admin Dashboard');
  }, []);

  // Track tab changes
  useEffect(() => {
    analytics.trackEvent('admin_tab_change', {
      tab: activeTab,
      timestamp: Date.now()
    });
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'hero', label: 'Hero Section', icon: <FileText className="w-5 h-5" /> },
    { id: 'sportsStack', label: 'Sports Stack', icon: <Video className="w-5 h-5" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'coachingVideos', label: 'Coaching Videos', icon: <Video className="w-5 h-5" /> },
    { id: 'benefits', label: 'Benefits', icon: <Settings className="w-5 h-5" /> },
    { id: 'footer', label: 'Footer', icon: <FileText className="w-5 h-5" /> },
    { id: 'media', label: 'Media', icon: <Image className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setTempData(JSON.parse(JSON.stringify(content[section as keyof typeof content])));

    // Track analytics
    analytics.trackAdminAction('edit_start', section);
  };

  const handleSave = (section: string) => {
    updateContent(section as keyof typeof content, tempData);
    setEditingSection(null);
    setTempData(null);
    toast.success(`${section} section updated successfully!`);

    // Track analytics
    analytics.trackAdminAction('content_update', section, {
      section: section,
      timestamp: Date.now()
    });

    // Add activity log
    actions.addActivity({
      type: 'content_updated',
      message: `${section} section content updated`,
      status: 'success'
    });
  };

  const handleCancel = () => {
    setEditingSection(null);
    setTempData(null);

    // Track analytics
    analytics.trackAdminAction('edit_cancel', editingSection || 'unknown');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const renderOverview = () => (
    <div>
      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <p className="text-3xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">+{metrics.growthRate}% this month</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Users</p>
              <p className="text-3xl font-bold">{metrics.activeUsers}</p>
              <p className="text-green-200 text-sm">Live now</p>
            </div>
            <Activity className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.revenue)}</p>
              <p className="text-purple-200 text-sm">This month</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Page Views</p>
              <p className="text-3xl font-bold">{metrics.pageViews.toLocaleString()}</p>
              <p className="text-orange-200 text-sm">{metrics.conversionRate}% conversion</p>
            </div>
            <Globe className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Live Analytics</h3>
            <button
              onClick={actions.refreshMetrics}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1 bg-[#89D3EC] text-white rounded-lg hover:bg-[#89D3EC]/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Sessions</span>
              <span className="text-white font-bold">{metrics.activeSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Bounce Rate</span>
              <span className="text-white font-bold">{metrics.bounceRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avg. Session Duration</span>
              <span className="text-white font-bold">{Math.floor(metrics.avgSessionDuration / 60)}m {metrics.avgSessionDuration % 60}s</span>
            </div>
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
                    <span>{item.count} ({percentage.toFixed(1)}%)</span>
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

      {/* Real-time Activity Feed */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Live Activity Feed</h3>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-400' :
                activity.status === 'info' ? 'bg-blue-400' :
                  activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              <span className="text-gray-300 flex-1">{activity.message}</span>
              <span className="text-gray-500 text-sm">{formatTimeAgo(activity.timestamp)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHeroEditor = () => (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Hero Section</h2>
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
            />
          ) : (
            <p className="text-white text-lg">{content.hero.title}</p>
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
            />
          ) : (
            <p className="text-white text-lg">{content.hero.subtitle}</p>
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
            />
          ) : (
            <p className="text-gray-300">{content.hero.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsersManager = () => (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              const newUser = {
                name: 'New User',
                email: `user${Date.now()}@example.com`,
                sport: 'Football',
                status: 'Pending' as const,
                joinDate: new Date().toISOString().split('T')[0],
                plan: 'Basic Plan'
              };
              actions.addUser(newUser);
              toast.success('New user added');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:bg-[#89D3EC]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-300 py-3">Name</th>
              <th className="text-left text-gray-300 py-3">Email</th>
              <th className="text-left text-gray-300 py-3">Sport</th>
              <th className="text-left text-gray-300 py-3">Plan</th>
              <th className="text-left text-gray-300 py-3">Status</th>
              <th className="text-left text-gray-300 py-3">Last Active</th>
              <th className="text-left text-gray-300 py-3">Actions</th>
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
                <td className="py-3 text-white font-medium">{user.name}</td>
                <td className="py-3 text-gray-300">{user.email}</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-[#D7243F]/20 text-[#D7243F] rounded-full text-xs">
                    {user.sport}
                  </span>
                </td>
                <td className="py-3 text-gray-300">{user.plan}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-600/20 text-green-400' :
                    user.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 text-gray-400 text-sm">{user.lastActive}</td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
                        actions.updateUser(user.id, { status: newStatus });
                        toast.success(`User ${newStatus.toLowerCase()}`);
                      }}
                      className="text-[#89D3EC] hover:text-white text-sm"
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        actions.deleteUser(user.id);
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
      case 'settings':
        return (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
            <div className="space-y-6">
              <div className="bg-gray-800/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Google Analytics</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Measurement ID</label>
                    <input
                      type="text"
                      value="G-ETJFCXYJWY"
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Stream ID</label>
                    <input
                      type="text"
                      value="11508273791"
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Stream URL</label>
                    <input
                      type="text"
                      value="https://playgram.app"
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white">Analytics: Connected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white">Real-time: Active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white">Database: Healthy</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all content to defaults?')) {
                    resetContent();
                    toast.success('Content reset to defaults');
                  }
                }}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">{activeTab} Management</h2>
            <p className="text-gray-300">This section is under development. Real-time updates coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Playgram Admin</h1>
              <p className="text-gray-400 text-sm">Real-time Content Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
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
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white'
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

export default AdminDashboard;