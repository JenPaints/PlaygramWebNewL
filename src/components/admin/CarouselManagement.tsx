import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  ExternalLink,
  Upload,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselImage {
  _id: Id<"carouselImages">;
  title?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  createdBy?: Id<"users">;
}

interface ImageFormData {
  title: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  description: string;
  order: number;
}

const CarouselManagementSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CarouselManagement: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [formData, setFormData] = useState<ImageFormData>({
    title: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    description: '',
    order: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const carouselImages = useQuery(api.carouselImages.getAllCarouselImages);
  
  // Mutations
  const addImage = useMutation(api.carouselImages.addCarouselImage);
  const updateImage = useMutation(api.carouselImages.updateCarouselImage);
  const deleteImage = useMutation(api.carouselImages.deleteCarouselImage);
  const toggleStatus = useMutation(api.carouselImages.toggleCarouselImageStatus);
  const reorderImages = useMutation(api.carouselImages.reorderCarouselImages);

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      mobileImageUrl: '',
      linkUrl: '',
      description: '',
      order: (carouselImages?.length || 0) + 1
    });
  };

  const handleAddImage = () => {
    resetForm();
    setEditingImage(null);
    setShowAddModal(true);
  };

  const handleEditImage = (image: CarouselImage) => {
    setFormData({
      title: image.title || '',
      imageUrl: image.imageUrl,
      mobileImageUrl: image.mobileImageUrl || '',
      linkUrl: image.linkUrl || '',
      description: image.description || '',
      order: image.order
    });
    setEditingImage(image);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingImage) {
        await updateImage({
          imageId: editingImage._id,
          title: formData.title || undefined,
          imageUrl: formData.imageUrl,
          mobileImageUrl: formData.mobileImageUrl || undefined,
          linkUrl: formData.linkUrl || undefined,
          description: formData.description || undefined,
          order: formData.order
        });
        toast.success('Carousel image updated successfully!');
      } else {
        await addImage({
          title: formData.title || undefined,
          imageUrl: formData.imageUrl,
          mobileImageUrl: formData.mobileImageUrl || undefined,
          linkUrl: formData.linkUrl || undefined,
          description: formData.description || undefined,
          order: formData.order
        });
        toast.success('Carousel image added successfully!');
      }
      
      setShowAddModal(false);
      resetForm();
      setEditingImage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save carousel image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: Id<"carouselImages">) => {
    if (!confirm('Are you sure you want to delete this carousel image?')) return;

    try {
      await deleteImage({ imageId });
      toast.success('Carousel image deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete carousel image');
    }
  };

  const handleToggleStatus = async (imageId: Id<"carouselImages">) => {
    try {
      const result = await toggleStatus({ imageId });
      toast.success(`Image ${result.newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle image status');
    }
  };

  if (carouselImages === undefined) {
    return <CarouselManagementSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carousel Management</h1>
          <p className="text-gray-600 mt-1">Manage images for the student dashboard carousel</p>
        </div>
        <button
          onClick={handleAddImage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {/* Images Grid */}
      {carouselImages.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No carousel images yet</h3>
          <p className="text-gray-500 mb-4">Add your first carousel image to get started</p>
          <button
            onClick={handleAddImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carouselImages.map((image) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    image.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {image.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    #{image.order}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{image.title || 'Untitled Image'}</h3>
                {image.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                )}
                {image.linkUrl && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{image.linkUrl}</span>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleStatus(image._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        image.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={image.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {image.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditImage(image)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingImage ? 'Edit Carousel Image' : 'Add Carousel Image'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter image title (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desktop Image URL *
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/desktop-image.jpg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.mobileImageUrl}
                    onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/mobile-image.jpg (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">If not provided, desktop image will be used for mobile</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingImage ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarouselManagement;