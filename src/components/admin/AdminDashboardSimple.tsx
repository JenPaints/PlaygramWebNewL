import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Edit3,
  Save,
  X,
  Activity,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '../../contexts/ContentContext';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboardSimple: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { content, updateContent } = useContent();
  const [tempData, setTempData] = useState<any>(null);

  // Mock data for now
  const mockMetrics = {
    totalUsers: 1234,
    activeUsers: 89,
    revenue: 245678,
    pageViews: 5432,
    conversionRate: 8.5
  };

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', sport: 'Football', status: 'Active', plan: 'Pro Plan' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', sport: 'Swimming', status: 'Active', plan: 'Elite Plan' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', sport: 'Basketball', status: 'Pending', plan: 'Basic Plan' }
  ];

  const mockActivities = [
    { id: 1, message: 'New user registered: john@example.com', timestamp: Date.now() - 120000, status: 'success' },
    { id: 2, message: 'Content updated: Hero section', timestamp: Date.now() - 300000, status: 'info' },
    { id: 3, message: 'Payment received: ₹4,999', timestamp: Date.now() - 600000, status: 'success' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'hero', label: 'Hero Section', icon: <FileText className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setTempData(JSON.parse(JSON.stringify(content[section as keyof typeof content])));
  };

  const handleSave = (section: string) => {
    updateContent(section as keyof typeof content, tempData);
    setEditingSection(null);
    setTempData(null);
    toast.success(`${section} section updated successfully!`);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setTempData(null);
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
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(diff / 86400000);
    return `${days} days ago`;
  };

  const renderOverview = () => (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Real-Time Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <p className="text-3xl font-bold">{mockMetrics.totalUsers.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">+12.5% this month</p>
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
              <p className="text-3xl font-bold">{mockMetrics.activeUsers}</p>
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
              <p className="text-3xl font-bold">{formatCurrency(mockMetrics.revenue)}</p>
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
              <p className="text-3xl font-bold">{mockMetrics.pageViews.toLocaleString()}</p>
              <p className="text-orange-200 text-sm">{mockMetrics.conversionRate}% conversion</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Live Activity Feed</h3>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl"
            >
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-400' : 'bg-blue-400'
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

  const renderUsers = () => (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-300 py-3">Name</th>
              <th className="text-left text-gray-300 py-3">Email</th>
              <th className="text-left text-gray-300 py-3">Sport</th>
              <th className="text-left text-gray-300 py-3">Status</th>
              <th className="text-left text-gray-300 py-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-800">
                <td className="py-3 text-white">{user.name}</td>
                <td className="py-3 text-gray-300">{user.email}</td>
                <td className="py-3 text-gray-300">{user.sport}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'Active' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 text-gray-300">{user.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
        return renderUsers();
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
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-white">Select a tab</div>;
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
              <h1 className="text-xl font-bold text-white">Playgram Admin Dashboard</h1>
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

export default AdminDashboardSimple;