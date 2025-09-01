import React, { useState, useMemo } from 'react';
import { BarChart3, Users, TrendingUp, Calendar, Clock, MapPin, Activity, Eye, MessageCircle, CreditCard, Award, Filter, Download, RefreshCw } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserAnalyticsDashboardProps {
  className?: string;
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'enrollments' | 'revenue' | 'activity'>('users');
  const [isLoading, setIsLoading] = useState(false);

  // Data queries
  const allUsers = useQuery(api.users.getAllUsers) || [];
  const enrollmentStats = useQuery(api.userEnrollments.getEnrollmentStatistics) || {
    totalRevenue: 0,
    activeEnrollments: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    cancelledEnrollments: 0,
    paidEnrollments: 0,
    averageSessionsAttended: 0
  };
  const recentActivities = useQuery(api.userActivities.getRecentActivities, { limit: 100 }) || [];
  const allBatches = useQuery(api.batches.getAllBatches) || [];
  const allSports = useQuery(api.sports.getAllSports) || [];
  const allLocations = useQuery(api.locations.getAllLocations) || [];

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = Date.now();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }[timeRange];
    const startTime = now - timeRangeMs;

    // Filter data by time range
    const recentUsers = allUsers.filter(user => 
      user.createdAt && user.createdAt >= startTime
    );
    const recentActivitiesFiltered = recentActivities.filter(activity => 
      activity.timestamp >= startTime
    );

    // User metrics
    const totalUsers = allUsers.length;
    const newUsers = recentUsers.length;
    const activeUsers = allUsers.filter(user => user.status === 'active').length;
    const userGrowthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100) : 0;

    // Enrollment metrics
    const totalEnrollments = enrollmentStats.totalEnrollments;
    const activeEnrollments = enrollmentStats.activeEnrollments;
    const completionRate = totalEnrollments > 0 ? 
      ((enrollmentStats.completedEnrollments / totalEnrollments) * 100) : 0;

    // Revenue metrics
    const totalRevenue = enrollmentStats.totalRevenue;
    const averageRevenuePerUser = totalUsers > 0 ? (totalRevenue / totalUsers) : 0;

    // Activity metrics
    const totalActivities = recentActivitiesFiltered.length;
    const averageActivitiesPerUser = activeUsers > 0 ? (totalActivities / activeUsers) : 0;

    // User type distribution
    const userTypeDistribution = allUsers.reduce((acc, user) => {
      const type = user.userType || 'student';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sport popularity
    const sportPopularity = allBatches.reduce((acc, batch) => {
      const sportName = batch.sport?.name || 'Unknown';
      acc[sportName] = (acc[sportName] || 0) + (batch.currentEnrollments || 0);
      return acc;
    }, {} as Record<string, number>);

    // Location distribution
    const locationDistribution = allBatches.reduce((acc, batch) => {
      const locationName = batch.location?.name || 'Unknown';
      acc[locationName] = (acc[locationName] || 0) + (batch.currentEnrollments || 0);
      return acc;
    }, {} as Record<string, number>);

    // Daily activity trend (last 30 days)
    const dailyActivityTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      
      const dayActivities = recentActivities.filter(activity => 
        activity.timestamp >= dayStart && activity.timestamp < dayEnd
      ).length;
      
      const dayUsers = allUsers.filter(user => 
        user.createdAt && user.createdAt >= dayStart && user.createdAt < dayEnd
      ).length;

      dailyActivityTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activities: dayActivities,
        newUsers: dayUsers,
        timestamp: dayStart
      });
    }

    return {
      totalUsers,
      newUsers,
      activeUsers,
      userGrowthRate,
      totalEnrollments,
      activeEnrollments,
      completionRate,
      totalRevenue,
      averageRevenuePerUser,
      totalActivities,
      averageActivitiesPerUser,
      userTypeDistribution,
      sportPopularity,
      locationDistribution,
      dailyActivityTrend
    };
  }, [allUsers, enrollmentStats, recentActivities, allBatches, timeRange]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    // Export analytics data as CSV
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', analyticsData.totalUsers],
      ['New Users', analyticsData.newUsers],
      ['Active Users', analyticsData.activeUsers],
      ['User Growth Rate', `${analyticsData.userGrowthRate.toFixed(2)}%`],
      ['Total Enrollments', analyticsData.totalEnrollments],
      ['Active Enrollments', analyticsData.activeEnrollments],
      ['Completion Rate', `${analyticsData.completionRate.toFixed(2)}%`],
      ['Total Revenue', `₹${analyticsData.totalRevenue}`],
      ['Average Revenue Per User', `₹${analyticsData.averageRevenuePerUser.toFixed(2)}`],
      ['Total Activities', analyticsData.totalActivities],
      ['Average Activities Per User', analyticsData.averageActivitiesPerUser.toFixed(2)]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playgram-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: analyticsData.totalUsers.toLocaleString(),
      change: `+${analyticsData.newUsers} this ${timeRange}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Enrollments',
      value: analyticsData.activeEnrollments.toLocaleString(),
      change: `${analyticsData.completionRate.toFixed(1)}% completion rate`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Revenue',
      value: `₹${analyticsData.totalRevenue.toLocaleString()}`,
      change: `₹${analyticsData.averageRevenuePerUser.toFixed(0)} avg per user`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'User Activities',
      value: analyticsData.totalActivities.toLocaleString(),
      change: `${analyticsData.averageActivitiesPerUser.toFixed(1)} avg per user`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const userTypeChartData = Object.entries(analyticsData.userTypeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    percentage: ((count / analyticsData.totalUsers) * 100).toFixed(1)
  }));

  const sportChartData = Object.entries(analyticsData.sportPopularity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([sport, enrollments]) => ({
      name: sport,
      enrollments
    }));

  const locationChartData = Object.entries(analyticsData.locationDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([location, enrollments]) => ({
      name: location,
      enrollments
    }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Analytics Dashboard</h2>
          <p className="text-gray-300">Comprehensive insights into user behavior and platform performance</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#89D3EC] text-gray-900 rounded-lg hover:bg-[#7BC3D9] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Activity Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.dailyActivityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="activities" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                name="Activities"
              />
              <Area 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Type Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {userTypeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sport Popularity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Sport Popularity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sportChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="enrollments" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="enrollments" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent User Activities
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Activity</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Details</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.slice(0, 10).map((activity, index) => (
                <tr key={activity._id || index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-white">
                    {activity.studentId || 'Unknown User'}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {activity.activityType}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {activity.activityDetails?.description || 'No details'}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;