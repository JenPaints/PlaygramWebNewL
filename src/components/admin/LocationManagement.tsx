import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone,
  Save,
  X,
  Eye,
  Navigation,
  Building,
  Users,
  CheckCircle
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';

interface Location {
  _id: Id<"locations">;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  facilities: string[];
  contactPhone?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface LocationFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  facilities: string[];
  contactPhone: string;
  isActive: boolean;
}

const LocationManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    imageUrl: '',
    facilities: [],
    contactPhone: '',
    isActive: true,
  });
  const [newFacility, setNewFacility] = useState('');

  // Queries
  const locations = useQuery(api.locations.getAllLocations) || [];
  const cities = useQuery(api.locations.getCitiesWithLocations) || [];

  // Mutations
  const createLocation = useMutation(api.locations.createLocation);
  const updateLocation = useMutation(api.locations.updateLocation);
  const deleteLocation = useMutation(api.locations.deleteLocation);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      latitude: 0,
      longitude: 0,
      imageUrl: '',
      facilities: [],
      contactPhone: '',
      isActive: true,
    });
    setNewFacility('');
  };

  const handleEdit = (item: Location) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      latitude: item.latitude,
      longitude: item.longitude,
      imageUrl: item.imageUrl || '',
      facilities: item.facilities,
      contactPhone: item.contactPhone || '',
      isActive: item.isActive,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateLocation({
          id: editingItem._id,
          ...formData,
          imageUrl: formData.imageUrl || undefined,
          contactPhone: formData.contactPhone || undefined,
        });
        toast.success('Location updated successfully!');
      } else {
        await createLocation({
          ...formData,
          imageUrl: formData.imageUrl || undefined,
          contactPhone: formData.contactPhone || undefined,
        });
        toast.success('Location created successfully!');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save location');
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"locations">) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation({ id });
        toast.success('Location deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete location');
        console.error(error);
      }
    }
  };

  const addFacility = () => {
    if (newFacility && !formData.facilities.includes(newFacility)) {
      setFormData(prev => ({ ...prev, facilities: [...prev.facilities, newFacility] }));
      setNewFacility('');
    }
  };

  const removeFacility = (facility: string) => {
    setFormData(prev => ({ ...prev, facilities: prev.facilities.filter(f => f !== facility) }));
  };

  const getCoordinatesFromAddress = async () => {
    const address = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`;
    try {
      // This would typically use Google Geocoding API
      // For now, we'll just show a placeholder
      toast.info('Geocoding feature will be implemented with Google Maps API');
    } catch (error) {
      toast.error('Failed to get coordinates');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Location Management</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {locations.length} Total Locations
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {locations.filter(l => l.isActive).length} Active
            </span>
            <span className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              {cities.length} Cities
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
          Add Location
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
                {editingItem ? 'Edit Location' : 'Add New Location'}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCoordinatesFromAddress}
                  className="px-4 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Navigation className="w-4 h-4 inline mr-2" />
                  Get Coordinates
                </button>
                <span className="text-sm text-gray-400 flex items-center">
                  Auto-fill coordinates from address
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                  placeholder="https://example.com/location-image.jpg"
                />
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Facilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    placeholder="Add facility (e.g., Parking, Changing Rooms, Cafeteria)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                  />
                  <button
                    type="button"
                    onClick={addFacility}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => removeFacility(facility)}
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
                  Active (available for batch creation)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Update Location' : 'Create Location'}
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

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((item) => (
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
                  <Building className="w-12 h-12" />
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
                  <p className="text-sm text-gray-400">{item.city}, {item.state}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{item.address}</p>
              
              <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </span>
                {item.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {item.contactPhone}
                  </span>
                )}
              </div>
              
              {item.facilities.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {item.facilities.slice(0, 3).map((facility) => (
                      <span key={facility} className="px-1 py-0.5 bg-gray-700 text-xs text-white rounded">
                        {facility}
                      </span>
                    ))}
                    {item.facilities.length > 3 && (
                      <span className="px-1 py-0.5 bg-gray-700 text-xs text-white rounded">
                        +{item.facilities.length - 3}
                      </span>
                    )}
                  </div>
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

      {locations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Locations Yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first training location</p>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingItem(null);
              resetForm();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add First Location
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;