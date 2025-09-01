import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  Users,
  Calendar,
  Save,
  X,
  Eye,
  Activity,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';

interface SportsProgram {
  _id: Id<"sportsPrograms">;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  ageGroups: string[];
  skillLevels: string[];
  equipment: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface SportsFormData {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  ageGroups: string[];
  skillLevels: string[];
  equipment: string[];
  benefits: string[];
  isActive: boolean;
}

const SportsManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SportsProgram | null>(null);
  const [formData, setFormData] = useState<SportsFormData>({
    name: '',
    description: '',
    imageUrl: '',
    category: '',
    ageGroups: [],
    skillLevels: [],
    equipment: [],
    benefits: [],
    isActive: true,
  });
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  // Queries
  const sportsPrograms = useQuery(api.sportsPrograms.getAllSportsPrograms) || [];
  const sportsProgramsWithStats = useQuery(api.sportsPrograms.getSportsProgramsWithBatchCount) || [];
  const categories = useQuery(api.sportsPrograms.getSportsCategories) || [];

  // Mutations
  const createSportsProgram = useMutation(api.sportsPrograms.createSportsProgram);
  const updateSportsProgram = useMutation(api.sportsPrograms.updateSportsProgram);
  const deleteSportsProgram = useMutation(api.sportsPrograms.deleteSportsProgram);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      category: '',
      ageGroups: [],
      skillLevels: [],
      equipment: [],
      benefits: [],
      isActive: true,
    });
    setNewAgeGroup('');
    setNewSkillLevel('');
    setNewEquipment('');
    setNewBenefit('');
  };

  const handleEdit = (item: SportsProgram) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
      ageGroups: item.ageGroups,
      skillLevels: item.skillLevels,
      equipment: item.equipment,
      benefits: item.benefits,
      isActive: item.isActive,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateSportsProgram({
          id: editingItem._id,
          ...formData,
        });
        toast.success('Sports program updated successfully!');
      } else {
        await createSportsProgram(formData);
        toast.success('Sports program created successfully!');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save sports program');
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"sportsPrograms">) => {
    if (window.confirm('Are you sure you want to delete this sports program?')) {
      try {
        await deleteSportsProgram({ id });
        toast.success('Sports program deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete sports program');
        console.error(error);
      }
    }
  };

  const addAgeGroup = () => {
    if (newAgeGroup && !formData.ageGroups.includes(newAgeGroup)) {
      setFormData(prev => ({ ...prev, ageGroups: [...prev.ageGroups, newAgeGroup] }));
      setNewAgeGroup('');
    }
  };

  const removeAgeGroup = (ageGroup: string) => {
    setFormData(prev => ({ ...prev, ageGroups: prev.ageGroups.filter(ag => ag !== ageGroup) }));
  };

  const addSkillLevel = () => {
    if (newSkillLevel && !formData.skillLevels.includes(newSkillLevel)) {
      setFormData(prev => ({ ...prev, skillLevels: [...prev.skillLevels, newSkillLevel] }));
      setNewSkillLevel('');
    }
  };

  const removeSkillLevel = (skillLevel: string) => {
    setFormData(prev => ({ ...prev, skillLevels: prev.skillLevels.filter(sl => sl !== skillLevel) }));
  };

  const addEquipment = () => {
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      setFormData(prev => ({ ...prev, equipment: [...prev.equipment, newEquipment] }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({ ...prev, equipment: prev.equipment.filter(eq => eq !== equipment) }));
  };

  const addBenefit = () => {
    if (newBenefit && !formData.benefits.includes(newBenefit)) {
      setFormData(prev => ({ ...prev, benefits: [...prev.benefits, newBenefit] }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
  };

  const totalBatches = sportsProgramsWithStats.reduce((sum, sport) => sum + sport.batchCount, 0);
  const totalCapacity = sportsProgramsWithStats.reduce((sum, sport) => sum + sport.totalCapacity, 0);
  const totalEnrollments = sportsProgramsWithStats.reduce((sum, sport) => sum + sport.totalEnrollments, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sports Programs Management</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {sportsPrograms.length} Sports Programs
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {totalBatches} Total Batches
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalEnrollments}/{totalCapacity} Enrolled
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {totalCapacity > 0 ? Math.round((totalEnrollments / totalCapacity) * 100) : 0}% Utilization
            </span>
          </div>
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
          Add Sports Program
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Sports Program' : 'Add New Sports Program'}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  required
                />
              </div>

              {/* Age Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Groups</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAgeGroup}
                    onChange={(e) => setNewAgeGroup(e.target.value)}
                    placeholder="Add age group (e.g., 6-10 years, 11-15 years)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAgeGroup())}
                  />
                  <button
                    type="button"
                    onClick={addAgeGroup}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ageGroups.map((ageGroup) => (
                    <span
                      key={ageGroup}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {ageGroup}
                      <button
                        type="button"
                        onClick={() => removeAgeGroup(ageGroup)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skill Levels */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skill Levels</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    placeholder="Add skill level (e.g., Beginner, Intermediate, Advanced)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillLevel())}
                  />
                  <button
                    type="button"
                    onClick={addSkillLevel}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skillLevels.map((skillLevel) => (
                    <span
                      key={skillLevel}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {skillLevel}
                      <button
                        type="button"
                        onClick={() => removeSkillLevel(skillLevel)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Equipment Required</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="Add equipment (e.g., Football boots, Gloves)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                  />
                  <button
                    type="button"
                    onClick={addEquipment}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.equipment.map((equipment) => (
                    <span
                      key={equipment}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {equipment}
                      <button
                        type="button"
                        onClick={() => removeEquipment(equipment)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Benefits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add benefit (e.g., Improves fitness, Builds teamwork)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
                  Active (visible to students)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Update Program' : 'Create Program'}
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

      {/* Sports Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sportsProgramsWithStats.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden"
          >
            <div className="aspect-video bg-gray-800 relative">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Activity className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {!item.isActive && (
                  <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.category}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="text-center">
                  <div className="text-[#89D3EC] font-semibold">{item.batchCount}</div>
                  <div className="text-gray-400">Batches</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-semibold">{item.totalEnrollments}</div>
                  <div className="text-gray-400">Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-semibold">{item.totalCapacity}</div>
                  <div className="text-gray-400">Capacity</div>
                </div>
              </div>
              
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

      {sportsPrograms.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Sports Programs Yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first sports program</p>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingItem(null);
              resetForm();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add First Sports Program
          </button>
        </div>
      )}
    </div>
  );
};

export default SportsManagement;