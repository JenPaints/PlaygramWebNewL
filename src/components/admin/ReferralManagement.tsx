import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Gift, 
  Settings, 
  Save, 
  Plus, 
  Edit3, 
  TrendingUp,
  Award,
  UserPlus,
  Target
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

interface ReferralSetting {
  _id: string;
  packageDuration: string;
  rewardSessions: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

const ReferralManagement: React.FC = () => {
  const [editingSettings, setEditingSettings] = useState<Record<string, number>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPackage, setNewPackage] = useState('');
  const [newReward, setNewReward] = useState(0);

  // Queries
  const referralSettings = useQuery(api.referrals.getAllReferralSettings) || [];
  const referralStats = useQuery(api.referrals.getReferralStats, {});

  // Mutations
  const createOrUpdateSetting = useMutation(api.referrals.createOrUpdateReferralSetting);

  const packageOptions = [
    { value: '1-month', label: '1 Month Package' },
    { value: '3-months', label: '3 Months Package' },
    { value: '6-months', label: '6 Months Package' },
    { value: '12-months', label: '12 Months Package' },
  ];

  const handleUpdateSetting = async (packageDuration: string, rewardSessions: number, isActive: boolean) => {
    try {
      await createOrUpdateSetting({
        packageDuration,
        rewardSessions,
        isActive,
      });
      toast.success('Referral setting updated successfully!');
      setEditingSettings(prev => {
        const updated = { ...prev };
        delete updated[packageDuration];
        return updated;
      });
    } catch (error) {
      toast.error('Failed to update referral setting');
      console.error(error);
    }
  };

  const handleAddNewSetting = async () => {
    if (!newPackage || newReward <= 0) {
      toast.error('Please select a package and enter a valid reward amount');
      return;
    }

    try {
      await createOrUpdateSetting({
        packageDuration: newPackage,
        rewardSessions: newReward,
        isActive: true,
      });
      toast.success('New referral setting added successfully!');
      setShowAddForm(false);
      setNewPackage('');
      setNewReward(0);
    } catch (error) {
      toast.error('Failed to add referral setting');
      console.error(error);
    }
  };

  const getPackageLabel = (duration: string) => {
    const option = packageOptions.find(opt => opt.value === duration);
    return option ? option.label : duration;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Referral Management</h1>
          <p className="text-gray-400">Configure referral rewards and track referral performance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Package Setting
        </button>
      </div>

      {/* Statistics Cards */}
      {referralStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{referralStats.stats.totalReferrals}</span>
            </div>
            <h3 className="text-gray-300 font-medium">Total Referrals</h3>
            <p className="text-sm text-gray-500">All time referrals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{referralStats.stats.pendingReferrals}</span>
            </div>
            <h3 className="text-gray-300 font-medium">Pending</h3>
            <p className="text-sm text-gray-500">Awaiting enrollment</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{referralStats.stats.completedReferrals}</span>
            </div>
            <h3 className="text-gray-300 font-medium">Completed</h3>
            <p className="text-sm text-gray-500">Successful referrals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{referralStats.stats.totalSessionsEarned}</span>
            </div>
            <h3 className="text-gray-300 font-medium">Sessions Rewarded</h3>
            <p className="text-sm text-gray-500">Total free sessions given</p>
          </motion.div>
        </div>
      )}

      {/* Add New Setting Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Package Setting
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Package Duration</label>
              <select
                value={newPackage}
                onChange={(e) => setNewPackage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
              >
                <option value="">Select Package</option>
                {packageOptions
                  .filter(option => !referralSettings.some(setting => setting.packageDuration === option.value))
                  .map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reward Sessions</label>
              <input
                type="number"
                min="0"
                value={newReward}
                onChange={(e) => setNewReward(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                placeholder="Number of free sessions"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={handleAddNewSetting}
                className="flex items-center gap-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPackage('');
                  setNewReward(0);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Referral Settings */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Package Referral Settings
          </h2>
          <p className="text-gray-400 mt-1">Configure how many free sessions referrers get for each package type</p>
        </div>
        
        <div className="p-6">
          {referralSettings.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Referral Settings</h3>
              <p className="text-gray-500 mb-4">Add your first package referral setting to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Setting
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {referralSettings.map((setting) => {
                const isEditing = editingSettings.hasOwnProperty(setting.packageDuration);
                const editValue = editingSettings[setting.packageDuration] ?? setting.rewardSessions;
                
                return (
                  <motion.div
                    key={setting._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-lg border transition-all ${
                      setting.isActive 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-gray-600 bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          setting.isActive ? 'bg-green-500/20' : 'bg-gray-600/20'
                        }`}>
                          <Gift className={`w-5 h-5 ${
                            setting.isActive ? 'text-green-400' : 'text-gray-400'
                          }`} />
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-white">{getPackageLabel(setting.packageDuration)}</h3>
                          <p className="text-sm text-gray-400">
                            {isEditing ? (
                              <span className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editValue}
                                  onChange={(e) => setEditingSettings(prev => ({
                                    ...prev,
                                    [setting.packageDuration]: parseInt(e.target.value) || 0
                                  }))}
                                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                />
                                free sessions per referral
                              </span>
                            ) : (
                              `${setting.rewardSessions} free sessions per referral`
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          setting.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {setting.isActive ? 'Active' : 'Inactive'}
                        </div>
                        
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateSetting(setting.packageDuration, editValue, setting.isActive)}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingSettings(prev => {
                                const updated = { ...prev };
                                delete updated[setting.packageDuration];
                                return updated;
                              })}
                              className="p-2 text-gray-400 hover:bg-gray-600/20 rounded-lg transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingSettings(prev => ({
                                ...prev,
                                [setting.packageDuration]: setting.rewardSessions
                              }))}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateSetting(setting.packageDuration, setting.rewardSessions, !setting.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                setting.isActive 
                                  ? 'text-red-400 hover:bg-red-500/20' 
                                  : 'text-green-400 hover:bg-green-500/20'
                              }`}
                            >
                              {setting.isActive ? '⏸' : '▶'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Referrals */}
      {referralStats && referralStats.referrals.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Referrals
            </h2>
            <p className="text-gray-400 mt-1">Latest referral activity</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {referralStats.referrals.slice(0, 10).map((referral) => (
                <div key={referral._id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      referral.status === 'completed' ? 'bg-green-500/20' :
                      referral.status === 'pending' ? 'bg-yellow-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      <UserPlus className={`w-4 h-4 ${
                        referral.status === 'completed' ? 'text-green-400' :
                        referral.status === 'pending' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{referral.referrerStudentId}</p>
                      <p className="text-sm text-gray-400">Referred: {referral.referredPhone}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {referral.status}
                    </div>
                    {referral.rewardSessions && (
                      <p className="text-sm text-gray-400 mt-1">
                        +{referral.rewardSessions} sessions
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;