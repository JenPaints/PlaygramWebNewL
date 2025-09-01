import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  AlertCircle,
  X,
  UserPlus
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '../../../convex/_generated/dataModel';

interface CoachAssignmentsProps {
  // Optional props for customization
}

const CoachAssignments: React.FC<CoachAssignmentsProps> = () => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateCoachModal, setShowCreateCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Id<"users"> | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Id<"batches"> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState<Id<"batches"> | 'all'>('all');
  const [notes, setNotes] = useState('');
  
  // Coach creation form state
  const [newCoachData, setNewCoachData] = useState({
    name: '',
    email: '',
    phone: '',
    fullName: '',
    notes: ''
  });

  // Queries
  const coaches = useQuery(api.coachManagement.getAllCoaches) || [];
  const batches = useQuery(api.batches.getAllBatches) || [];
  const assignments = useQuery(api.coachManagement.getBatchAssignments, {
    batchId: filterBatch !== 'all' ? filterBatch : undefined
  }) || [];

  // Mutations
  const assignCoach = useMutation(api.coachManagement.assignCoachToBatch);
  const removeAssignment = useMutation(api.coachManagement.removeCoachAssignment);
  const createCoach = useMutation(api.users.createCoach);

  // Handle coach assignment
  const handleAssignCoach = async () => {
    if (!selectedCoach || !selectedBatch) {
      toast.error('Please select both coach and batch');
      return;
    }

    try {
      // For now, we'll use the first coach as assignedBy since we don't have current admin user context
      // In a real implementation, you'd get this from auth context
      const adminUser = coaches.find(c => c._id) || { _id: selectedCoach };
      
      await assignCoach({
        coachId: selectedCoach,
        batchId: selectedBatch,
        assignedBy: adminUser._id,
        notes,
      });
      
      toast.success('Coach assigned successfully!');
      setShowAssignModal(false);
      setSelectedCoach(null);
      setSelectedBatch(null);
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign coach');
    }
  };

  // Handle remove assignment
  const handleRemoveAssignment = async (assignmentId: Id<"coachAssignments">) => {
    if (!confirm('Are you sure you want to remove this coach assignment?')) {
      return;
    }

    try {
      await removeAssignment({ assignmentId });
      toast.success('Coach assignment removed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove assignment');
    }
  };

  // Handle create coach
  const handleCreateCoach = async () => {
    if (!newCoachData.name || !newCoachData.phone) {
      toast.error('Please fill in name and phone number');
      return;
    }

    try {
      await createCoach({
        name: newCoachData.name,
        email: newCoachData.email || undefined,
        phone: newCoachData.phone,
        fullName: newCoachData.fullName || newCoachData.name,
        notes: newCoachData.notes || undefined,
      });
      
      toast.success('Coach created successfully!');
      setShowCreateCoachModal(false);
      setNewCoachData({
        name: '',
        email: '',
        phone: '',
        fullName: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create coach');
    }
  };

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = searchTerm === '' || 
      assignment.coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.batch.sport?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get unassigned batches
  const assignedBatchIds = new Set(assignments.map(a => a.batchId));
  const unassignedBatches = batches.filter(batch => !assignedBatchIds.has(batch._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Management</h1>
          <p className="text-gray-600">Create coaches and manage batch assignments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateCoachModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create Coach
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Assign Coach
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{coaches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assigned Batches</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unassigned Batches</p>
              <p className="text-2xl font-bold text-gray-900">{unassignedBatches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.filter(a => a.isActive).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search coaches or batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value as Id<"batches"> | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Batches</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} - {batch.sport?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAssignments.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No coach assignments found.</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.coach.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {assignment.coach.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {assignment.coach.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {assignment.batch.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {assignment.batch.sport?.name} • {assignment.batch.location?.name}
                    </div>
                    <div className="flex items-center justify-center mt-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {assignment.batch.ageGroup} • {assignment.batch.skillLevel}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-2">
                      Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleRemoveAssignment(assignment._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {assignment.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {assignment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Unassigned Batches */}
      {unassignedBatches.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              Unassigned Batches ({unassignedBatches.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedBatches.map((batch) => (
                <div key={batch._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{batch.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      {batch.sport?.name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {batch.location?.name}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {batch.currentEnrollments}/{batch.maxCapacity} students
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBatch(batch._id);
                      setShowAssignModal(true);
                    }}
                    className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Coach
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Coach to Batch</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCoach(null);
                  setSelectedBatch(null);
                  setNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Coach
                </label>
                <select
                  value={selectedCoach || ''}
                  onChange={(e) => setSelectedCoach(e.target.value as Id<"users">)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a coach...</option>
                  {coaches.map((coach) => (
                    <option key={coach._id} value={coach._id}>
                      {coach.name} - {coach.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch
                </label>
                <select
                  value={selectedBatch || ''}
                  onChange={(e) => setSelectedBatch(e.target.value as Id<"batches">)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.sport?.name} ({batch.location?.name})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this assignment..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCoach(null);
                  setSelectedBatch(null);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCoach}
                disabled={!selectedCoach || !selectedBatch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Coach
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Coach Modal */}
      {showCreateCoachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Coach</h3>
              <button
                onClick={() => {
                  setShowCreateCoachModal(false);
                  setNewCoachData({
                    name: '',
                    email: '',
                    phone: '',
                    fullName: '',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCoachData.name}
                  onChange={(e) => setNewCoachData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter coach name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newCoachData.phone}
                  onChange={(e) => setNewCoachData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newCoachData.email}
                  onChange={(e) => setNewCoachData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={newCoachData.fullName}
                  onChange={(e) => setNewCoachData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newCoachData.notes}
                  onChange={(e) => setNewCoachData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any notes about this coach..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateCoachModal(false);
                  setNewCoachData({
                    name: '',
                    email: '',
                    phone: '',
                    fullName: '',
                    notes: ''
                  });
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCoach}
                disabled={!newCoachData.name || !newCoachData.phone}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Coach
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoachAssignments;