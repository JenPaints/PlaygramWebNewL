import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  Download,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Eye,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  RefreshCw,
  Wifi
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { useRealTimeUsers } from '../../hooks/useAutoRefresh';

interface User {
  _id: Id<"users">;
  studentId?: string;
  phone?: string;
  email?: string;
  name?: string;
  fullName?: string;
  userType?: string;
  status?: string;
  totalEnrollments?: number;
  totalSessions?: number;
  totalLoginSessions?: number;
  lastActivity?: number;
  lastLoginTime?: number;
  createdAt?: number;
  city?: string;
  registrationSource?: string;
}

interface UserFormData {
  phone: string;
  email: string;
  name: string;
  fullName: string;
  userType: string;
  status: string;
  city: string;
  state: string;
  pincode: string;
  dateOfBirth: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'studentId' | 'phone' | 'name' | 'email'>('all');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'parent' | 'coach' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<UserFormData>({
    phone: '',
    email: '',
    name: '',
    fullName: '',
    userType: 'student',
    status: 'active',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    gender: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  // Memoized query parameters to prevent infinite re-renders
  const allStudentsParams = useMemo(() => ({
    limit: 200,
    userType: filterType === 'all' ? undefined : filterType,
    status: filterStatus === 'all' ? undefined : filterStatus,
  }), [filterType, filterStatus]);

  const searchParams = useMemo(() => {
    if (searchTerm.length === 0) return "skip";
    return {
      searchTerm,
      searchType: searchType === 'all' ? undefined : searchType,
      limit: 50,
    };
  }, [searchTerm, searchType]);

  const loginStatsParams = useMemo(() => ({}), []);

  // Real-time data with auto-refresh
  const {
    data: realTimeUsers,
    lastUpdated,
    isRefreshing,
    forceRefresh
  } = useRealTimeUsers();
  
  // Fallback queries for search and stats
  const searchResults = useQuery(api.studentIdGenerator.searchStudents, searchParams) || [];
  const studentStats = useQuery(api.studentIdGenerator.getStudentIdStatistics);
  const loginStats = useQuery(api.loginSessions.getLoginStatistics, loginStatsParams);
  
  // Use real-time data or search results
  const allStudents = realTimeUsers || [];

  // Mutations
  const createUser = useMutation(api.auth.createUser);
  const updateUser = useMutation(api.auth.updateUser);
  const deleteUser = useMutation(api.auth.deleteUser);
  const assignStudentId = useMutation(api.studentIdGenerator.assignStudentId);
  const bulkAssignIds = useMutation(api.studentIdGenerator.bulkAssignStudentIds);
  const updateUserType = useMutation(api.users.updateUserType);
  const updateUserStatus = useMutation(api.users.updateUserStatus);

  const displayUsers = searchTerm.length > 0 ? searchResults : allStudents;

  // Filter users based on type and status
  const filteredUsers = useMemo(() => {
    return displayUsers.filter((u: User) => {
      if (filterType !== 'all' && u.userType !== filterType) return false;
      if (filterStatus !== 'all' && u.status !== filterStatus) return false;
      return true;
    });
  }, [displayUsers, filterType, filterStatus]);

  // Sort users by creation date, newest first
  const sortedUsers = useMemo(() => {
    return filteredUsers.sort((a: User, b: User) => {
      const aTime = a.createdAt || 0;
      const bTime = b.createdAt || 0;
      return bTime - aTime;
    });
  }, [filteredUsers]);

  const resetForm = () => {
    setFormData({
      phone: '',
      email: '',
      name: '',
      fullName: '',
      userType: 'student',
      status: 'active',
      city: '',
      state: '',
      pincode: '',
      dateOfBirth: '',
      gender: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      phone: user.phone || '',
      email: user.email || '',
      name: user.name || '',
      fullName: user.fullName || '',
      userType: user.userType || 'student',
      status: user.status || 'active',
      city: user.city || '',
      state: '',
      pincode: '',
      dateOfBirth: '',
      gender: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = {
        phone: formData.phone,
        email: formData.email || undefined,
        name: formData.name || undefined,
        fullName: formData.fullName || undefined,
        userType: formData.userType || undefined,
        status: formData.status || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        gender: formData.gender || undefined,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        } : undefined,
      };
      
      if (editingUser) {
        await updateUser({
          userId: editingUser._id,
          ...userData,
        });
        toast.success('User updated successfully!');
      } else {
        const result = await createUser(userData);
        toast.success('User created successfully!');
        
        // Assign student ID to new user
        if (result.userId) {
          await assignStudentId({ userId: result.userId, forceRegenerate: false });
        }
      }
      
      setShowAddForm(false);
      setEditingUser(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
      console.error(error);
    }
  };

  const handleDelete = async (userId: Id<"users">) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser({ userId });
        toast.success('User deleted successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user');
        console.error(error);
      }
    }
  };

  const handleBulkAssignIds = async () => {
    try {
      const result = await bulkAssignIds({ limit: 50 });
      toast.success(`Assigned student IDs to ${result.successful} users`);
      if (result.failed > 0) {
        toast.warning(`Failed to assign IDs to ${result.failed} users`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to bulk assign student IDs');
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === sortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(sortedUsers.map((u: User) => u._id)));
    }
  };

  // Quick action to change user type
  const handleQuickChangeUserType = async (userId: Id<"users">, newUserType: 'student' | 'parent' | 'coach' | 'admin') => {
    try {
      // Find the user being updated to check if it's the current user
      const updatedUser = displayUsers.find((u: User) => u._id === userId);
      const isCurrentUser = currentUser && updatedUser && currentUser.phoneNumber === updatedUser.phone;
      
      // Don't update if the user type is already the same to prevent unnecessary calls
      if (updatedUser?.userType === newUserType) {
        return;
      }
      
      await updateUserType({ userId, userType: newUserType });
      toast.success(`User type changed to ${newUserType} successfully!`);
      
      // Refresh current user if they updated their own type
      if (isCurrentUser) {
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change user type');
    }
  };

  // Quick action to change user status
  const handleQuickChangeStatus = async (userId: Id<"users">, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      // Find the user being updated
      const updatedUser = displayUsers.find((u: User) => u._id === userId);
      
      // Don't update if the status is already the same to prevent unnecessary calls
      if (updatedUser?.status === newStatus) {
        return;
      }
      
      await updateUserStatus({ userId, status: newStatus });
      toast.success(`User status changed to ${newStatus} successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change user status');
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (userType?: string) => {
    switch (userType) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-purple-100 text-purple-800';
      case 'coach': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 text-green-400 rounded-lg text-sm">
              <Wifi className="w-4 h-4" />
              <span>Live Data</span>
              {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin" />}
            </div>
          </div>
          {studentStats && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {studentStats.totalUsers} Total Users
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {studentStats.usersWithStudentId} With Student ID
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {loginStats?.totalLogins || 0} Total Logins
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {loginStats?.activeSessions || 0} Active Sessions
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkAssignIds}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Assign IDs
          </button>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingUser(null);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#89D3EC] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
            >
              <option value="all">All Fields</option>
              <option value="studentId">Student ID</option>
              <option value="phone">Phone</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="student">Students</option>
              <option value="parent">Parents</option>
              <option value="coach">Coaches</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === sortedUsers.length && sortedUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#89D3EC] bg-gray-700 border-gray-600 rounded focus:ring-[#89D3EC]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User Info</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type & Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Activity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Stats</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedUsers.map((user: User) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="w-4 h-4 text-[#89D3EC] bg-gray-700 border-gray-600 rounded focus:ring-[#89D3EC]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-white">
                      {user.studentId || (
                        <span className="text-gray-500 italic">Not assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">
                        {user.fullName || user.name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Joined {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      )}
                      {user.city && (
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <MapPin className="w-3 h-3" />
                          {user.city}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.userType)}`}>
                        {user.userType || 'Unknown'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-300">
                      <div>Last: {formatDate(user.lastActivity)}</div>
                      <div className="text-xs text-gray-400">
                        {user.totalLoginSessions || 0} logins
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-300">
                      <div>{user.totalEnrollments || 0} enrollments</div>
                      <div className="text-xs text-gray-400">
                        {user.totalSessions || 0} sessions
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 items-center">
                      {/* Quick User Type Change */}
                      <select
                        value={user.userType || 'student'}
                        onChange={(e) => handleQuickChangeUserType(user._id, e.target.value as any)}
                        className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:border-[#89D3EC] focus:outline-none"
                        title="Change user type"
                      >
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                      
                      {/* Quick Status Change */}
                      <select
                        value={user.status || 'active'}
                        onChange={(e) => handleQuickChangeStatus(user._id, e.target.value as any)}
                        className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:border-[#89D3EC] focus:outline-none"
                        title="Change user status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-gray-400 hover:text-[#89D3EC] transition-colors"
                        title="Edit user"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {searchTerm ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first user'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User Type</label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-medium text-white mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Relation</label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                      placeholder="e.g., Parent, Guardian, Spouse"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-4 h-4" />
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;