import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Users,
  MapPin,
  Clock,
  Save,
  X,
  Eye,
  Activity,
  TrendingUp,
  User,
  DollarSign
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { formatTimeRange } from '../../utils/timeUtils';

interface Batch {
  _id: Id<"batches">;
  sportId: Id<"sportsPrograms">;
  locationId: Id<"locations">;
  name: string;
  description?: string;
  coachName: string;
  coachImage?: string;
  ageGroup: string;
  skillLevel: string;
  maxCapacity: number;
  currentEnrollments: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  packages: {
    duration: string;
    price: number;
    sessions: number;
    features: string[];
  }[];
  startDate: number;
  endDate?: number;
  isActive: boolean;
  sport?: any;
  location?: any;
}

interface BatchFormData {
  sportId: string;
  locationId: string;
  name: string;
  description: string;
  coachName: string;
  coachImage: string;
  ageGroup: string;
  skillLevel: string;
  maxCapacity: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  packages: {
    duration: string;
    price: number;
    sessions: number;
    features: string[];
  }[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const BatchManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<BatchFormData>({
    sportId: '',
    locationId: '',
    name: '',
    description: '',
    coachName: '',
    coachImage: '',
    ageGroup: '',
    skillLevel: '',
    maxCapacity: 20,
    schedule: [],
    packages: [],
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [newScheduleDay, setNewScheduleDay] = useState('');
  const [newScheduleStart, setNewScheduleStart] = useState('');
  const [newScheduleEnd, setNewScheduleEnd] = useState('');
  const [newPackage, setNewPackage] = useState({
    duration: '',
    price: 0,
    sessions: 0,
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState('');

  // Queries
  const batches = useQuery(api.batches.getAllBatches) || [];
  const sportsPrograms = useQuery(api.sportsPrograms.getActiveSportsPrograms) || [];
  const locations = useQuery(api.locations.getActiveLocations) || [];
  const batchStats = useQuery(api.batches.getBatchStatistics);

  // Mutations
  const createBatch = useMutation(api.batches.createBatch);
  const updateBatch = useMutation(api.batches.updateBatch);
  const deleteBatch = useMutation(api.batches.deleteBatch);

  const resetForm = () => {
    setFormData({
      sportId: '',
      locationId: '',
      name: '',
      description: '',
      coachName: '',
      coachImage: '',
      ageGroup: '',
      skillLevel: '',
      maxCapacity: 20,
      schedule: [],
      packages: [],
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setNewScheduleDay('');
    setNewScheduleStart('');
    setNewScheduleEnd('');
    setNewPackage({ duration: '', price: 0, sessions: 0, features: [] });
    setNewFeature('');
  };

  const handleEdit = (item: Batch) => {
    setEditingItem(item);
    setFormData({
      sportId: item.sportId,
      locationId: item.locationId,
      name: item.name,
      description: item.description || '',
      coachName: item.coachName,
      coachImage: item.coachImage || '',
      ageGroup: item.ageGroup,
      skillLevel: item.skillLevel,
      maxCapacity: item.maxCapacity,
      schedule: item.schedule,
      packages: item.packages,
      startDate: new Date(item.startDate).toISOString().split('T')[0],
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      isActive: item.isActive,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        sportId: formData.sportId as Id<"sportsPrograms">,
        locationId: formData.locationId as Id<"locations">,
        startDate: new Date(formData.startDate).getTime(),
        endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
        coachImage: formData.coachImage || undefined,
      };
      
      if (editingItem) {
        await updateBatch({
          id: editingItem._id,
          ...submitData,
        });
        toast.success('Batch updated successfully!');
      } else {
        await createBatch(submitData);
        toast.success('Batch created successfully!');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save batch');
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"batches">) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteBatch({ id });
        toast.success('Batch deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete batch');
        console.error(error);
      }
    }
  };

  const addSchedule = () => {
    if (newScheduleDay && newScheduleStart && newScheduleEnd) {
      const newSchedule = {
        day: newScheduleDay,
        startTime: newScheduleStart,
        endTime: newScheduleEnd,
      };
      setFormData(prev => ({ ...prev, schedule: [...prev.schedule, newSchedule] }));
      setNewScheduleDay('');
      setNewScheduleStart('');
      setNewScheduleEnd('');
    }
  };

  const removeSchedule = (index: number) => {
    setFormData(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== index) }));
  };

  const addFeatureToPackage = () => {
    if (newFeature && !newPackage.features.includes(newFeature)) {
      setNewPackage(prev => ({ ...prev, features: [...prev.features, newFeature] }));
      setNewFeature('');
    }
  };

  const removeFeatureFromPackage = (feature: string) => {
    setNewPackage(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
  };

  const addPackage = () => {
    if (newPackage.duration && newPackage.price > 0 && newPackage.sessions > 0) {
      setFormData(prev => ({ ...prev, packages: [...prev.packages, newPackage] }));
      setNewPackage({ duration: '', price: 0, sessions: 0, features: [] });
    }
  };

  const removePackage = (index: number) => {
    setFormData(prev => ({ ...prev, packages: prev.packages.filter((_, i) => i !== index) }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const ageGroups = ['6-10 years', '11-15 years', '16-20 years', '21+ years'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Batch Management</h2>
          {batchStats && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {batchStats.totalBatches} Total Batches
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {batchStats.activeBatches} Active
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {batchStats.totalEnrollments}/{batchStats.totalCapacity} Enrolled
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {Math.round(batchStats.averageCapacityUtilization)}% Utilization
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingItem(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Batch
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Batch' : 'Add New Batch'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sports Program</label>
                  <select
                    value={formData.sportId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sportId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  >
                    <option value="">Select Sports Program</option>
                    {sportsPrograms.map((sport) => (
                      <option key={sport._id} value={sport._id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name} - {location.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Coach Name</label>
                  <input
                    type="text"
                    value={formData.coachName}
                    onChange={(e) => setFormData(prev => ({ ...prev, coachName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  >
                    <option value="">Select Age Group</option>
                    {ageGroups.map((age) => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Skill Level</label>
                  <select
                    value={formData.skillLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  >
                    <option value="">Select Skill Level</option>
                    {skillLevels.map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Coach Image URL</label>
                <input
                  type="url"
                  value={formData.coachImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coachImage: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  placeholder="https://example.com/coach-image.jpg"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <select
                    value={newScheduleDay}
                    onChange={(e) => setNewScheduleDay(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  >
                    <option value="">Select Day</option>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={newScheduleStart}
                    onChange={(e) => setNewScheduleStart(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    placeholder="Start Time"
                  />
                  <input
                    type="time"
                    value={newScheduleEnd}
                    onChange={(e) => setNewScheduleEnd(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    placeholder="End Time"
                  />
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.schedule.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <span className="text-white">
                        {schedule.day}: {formatTimeRange(schedule.startTime, schedule.endTime)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packages */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Packages</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {['1 month', '3 months', '6 months', '1 year'].map((duration) => {
                    const existingPackage = formData.packages.find(p => p.duration === duration);
                    return (
                      <div key={duration} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-3">{duration}</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Price (₹)</label>
                            <input
                              type="number"
                              value={existingPackage?.price || ''}
                              onChange={(e) => {
                                const price = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  packages: prev.packages.some(p => p.duration === duration)
                                    ? prev.packages.map(p => p.duration === duration ? { ...p, price } : p)
                                    : [...prev.packages, { duration, price, sessions: 0, features: [] }]
                                }));
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-[#89D3EC] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Sessions</label>
                            <input
                              type="number"
                              value={existingPackage?.sessions || ''}
                              onChange={(e) => {
                                const sessions = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  packages: prev.packages.some(p => p.duration === duration)
                                    ? prev.packages.map(p => p.duration === duration ? { ...p, sessions } : p)
                                    : [...prev.packages, { duration, price: 0, sessions, features: [] }]
                                }));
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-[#89D3EC] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Features (comma separated)</label>
                            <textarea
                              value={existingPackage?.features.join(', ') || ''}
                              onChange={(e) => {
                                const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                                setFormData(prev => ({
                                  ...prev,
                                  packages: prev.packages.some(p => p.duration === duration)
                                    ? prev.packages.map(p => p.duration === duration ? { ...p, features } : p)
                                    : [...prev.packages, { duration, price: 0, sessions: 0, features }]
                                }));
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:border-[#89D3EC] focus:outline-none"
                              rows={2}
                              placeholder="Feature 1, Feature 2"
                            />
                          </div>
                          {existingPackage && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  packages: prev.packages.filter(p => p.duration !== duration)
                                }));
                              }}
                              className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Remove Package
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Configure pricing for different duration packages. Students will be able to choose from these options during enrollment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-[#89D3EC] bg-gray-800 border-gray-600 rounded focus:ring-[#89D3EC]"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Active (available for enrollment)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Update Batch' : 'Create Batch'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
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

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.sport?.name}</p>
                  <p className="text-xs text-gray-500">{item.location?.name}</p>
                </div>
                <div className="flex gap-1">
                  {!item.isActive && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                      Inactive
                    </span>
                  )}
                  {item.currentEnrollments >= item.maxCapacity && (
                    <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                      Full
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  Coach: {item.coachName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="w-4 h-4" />
                  {item.currentEnrollments}/{item.maxCapacity} enrolled
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {item.ageGroup} • {item.skillLevel}
                </div>
              </div>
              
              {item.schedule.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Schedule:</h4>
                  <div className="space-y-1">
                    {item.schedule.slice(0, 2).map((schedule, idx) => (
                      <div key={idx} className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule.day}: {formatTimeRange(schedule.startTime, schedule.endTime)}
                      </div>
                    ))}
                    {item.schedule.length > 2 && (
                      <div className="text-xs text-gray-500">+{item.schedule.length - 2} more</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Packages */}
              {item.packages && item.packages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Pricing Packages:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {item.packages.slice(0, 4).map((pkg, idx) => (
                      <div key={idx} className="bg-gray-800 p-2 rounded border border-gray-600">
                        <div className="text-xs font-medium text-white">{pkg.duration}</div>
                        <div className="text-xs text-[#89D3EC] font-semibold">₹{pkg.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{pkg.sessions} sessions</div>
                      </div>
                    ))}
                  </div>
                  {item.packages.length === 0 && (
                    <div className="text-xs text-gray-500 italic">No packages configured</div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {batches.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Batches Yet</h3>
          <p className="text-gray-500 mb-4">Start by creating your first training batch</p>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingItem(null);
              resetForm();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add First Batch
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;