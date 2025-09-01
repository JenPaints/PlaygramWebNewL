import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  AlertTriangle,
  Save,
  X,
  Eye,
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';

interface MerchandiseItem {
  _id: Id<"merchandise">;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface MerchandiseFormData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
}

const MerchandiseManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchandiseItem | null>(null);
  const [formData, setFormData] = useState<MerchandiseFormData>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    sizes: [],
    colors: [],
    stockQuantity: 0,
    isActive: true,
    isFeatured: false,
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  // Queries
  const merchandise = useQuery(api.merchandise.getAllMerchandise) || [];
  const lowStockItems = useQuery(api.merchandise.getLowStockItems, { threshold: 10 }) || [];
  const categories = useQuery(api.merchandise.getCategories) || [];

  // Mutations
  const createMerchandise = useMutation(api.merchandise.createMerchandise);
  const updateMerchandise = useMutation(api.merchandise.updateMerchandise);
  const deleteMerchandise = useMutation(api.merchandise.deleteMerchandise);
  const updateStock = useMutation(api.merchandise.updateStock);
  const toggleFeatured = useMutation(api.merchandise.toggleFeatured);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      sizes: [],
      colors: [],
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
    });
    setNewSize('');
    setNewColor('');
  };

  const handleEdit = (item: MerchandiseItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      category: item.category,
      sizes: item.sizes,
      colors: item.colors,
      stockQuantity: item.stockQuantity,
      isActive: item.isActive,
      isFeatured: item.isFeatured || false,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateMerchandise({
          id: editingItem._id,
          ...formData,
        });
        toast.success('Merchandise updated successfully!');
      } else {
        await createMerchandise(formData);
        toast.success('Merchandise created successfully!');
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save merchandise');
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"merchandise">) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMerchandise({ id });
        toast.success('Merchandise deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete merchandise');
        console.error(error);
      }
    }
  };

  const handleStockUpdate = async (id: Id<"merchandise">, operation: 'add' | 'subtract' | 'set', quantity: number) => {
    try {
      await updateStock({ id, quantity, operation });
      toast.success('Stock updated successfully!');
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
    }
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const totalValue = merchandise.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);
  const totalItems = merchandise.reduce((sum, item) => sum + item.stockQuantity, 0);
  const featuredItems = merchandise.filter(item => item.isFeatured).length;

  const handleToggleFeatured = async (id: Id<"merchandise">, currentStatus: boolean) => {
    try {
      await toggleFeatured({ id, isFeatured: !currentStatus });
      toast.success(`Item ${!currentStatus ? 'added to' : 'removed from'} featured section!`);
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Merchandise Management</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {merchandise.length} Products
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              {totalItems} Total Stock
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              ₹{totalValue.toLocaleString()} Inventory Value
            </span>
            <span className="flex items-center gap-1 text-[#89D3EC]">
              <Eye className="w-4 h-4" />
              {featuredItems} Featured
            </span>
            {lowStockItems.length > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                {lowStockItems.length} Low Stock
              </span>
            )}
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
          Add Product
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map((item) => (
              <div key={item._id} className="text-sm text-gray-300">
                {item.name}: {item.stockQuantity} remaining
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Items Info */}
      {featuredItems > 0 && (
        <div className="bg-[#89D3EC]/10 border border-[#89D3EC]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-[#89D3EC]" />
            <h3 className="text-lg font-semibold text-[#89D3EC]">Featured in Student Dashboard</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            These items are currently displayed in the "Shop now" section of the student dashboard:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {merchandise.filter(item => item.isFeatured).map((item) => (
              <div key={item._id} className="text-sm text-gray-300 flex items-center justify-between">
                <span>{item.name}</span>
                <button
                  onClick={() => handleToggleFeatured(item._id, true)}
                  className="text-orange-400 hover:text-orange-300 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Product' : 'Add New Product'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    min="0"
                    required
                  />
                </div>
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

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sizes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add size (e.g., S, M, L, XL)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Colors</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color (e.g., Red, Blue, Black)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#89D3EC] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-3 py-2 bg-[#89D3EC] text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 text-[#89D3EC] bg-gray-800 border-gray-600 rounded focus:ring-[#89D3EC]"
                  />
                  <label htmlFor="isFeatured" className="text-sm text-gray-300">
                    Featured (show in student dashboard "Shop now" section)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Update Product' : 'Create Product'}
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merchandise.map((item) => (
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
                  <Package className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <div className="flex gap-1">
                  {!item.isActive && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                      Inactive
                    </span>
                  )}
                  {item.stockQuantity <= 10 && (
                    <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                      Low Stock
                    </span>
                  )}
                </div>
                {item.isFeatured && (
                  <span className="px-2 py-1 bg-[#89D3EC] text-white text-xs rounded flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Featured
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
                <span className="text-lg font-bold text-[#89D3EC]">₹{item.price}</span>
              </div>
              
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">
                  Stock: <span className={`font-semibold ${item.stockQuantity <= 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {item.stockQuantity}
                  </span>
                </span>
                <div className="flex gap-1">
                  {item.sizes.slice(0, 3).map((size) => (
                    <span key={size} className="px-1 py-0.5 bg-gray-700 text-xs text-white rounded">
                      {size}
                    </span>
                  ))}
                  {item.sizes.length > 3 && (
                    <span className="px-1 py-0.5 bg-gray-700 text-xs text-white rounded">
                      +{item.sizes.length - 3}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
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
                <button
                  onClick={() => handleToggleFeatured(item._id, item.isFeatured || false)}
                  className={`w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                    item.isFeatured 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {item.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {merchandise.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Products Yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first merchandise item</p>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingItem(null);
              resetForm();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default MerchandiseManagement;