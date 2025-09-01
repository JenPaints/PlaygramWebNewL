import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Hash, Edit3, Save, X, ChevronDown } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

interface User {
  phoneNumber?: string;
  profileImage?: string;
  name?: string;
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  pincode?: string;
}

interface ProfileViewProps {
  user?: User;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    pincode: ''
  });

  // Get user data from database
  const userData = useQuery(
    api.users.getUserByPhone,
    user?.phoneNumber ? { phone: user.phoneNumber } : "skip"
  );

  // Mutation for updating user data
  const updateUser = useMutation(api.auth.updateUser);

  // Load profile image from localStorage
  useEffect(() => {
    if (user?.phoneNumber) {
      const savedImage = localStorage.getItem(`profileImage_${user.phoneNumber}`);
      setLocalProfileImage(savedImage);
    }
  }, [user?.phoneNumber]);

  // Generate student ID based on user data
  const generateStudentId = (userData: any) => {
    if (userData?.studentId) {
      return userData.studentId;
    }
    
    // Generate student ID based on phone number and creation date
    const phone = userData?.phone || user?.phoneNumber || '';
    const createdAt = userData?._creationTime || Date.now();
    const date = new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const phoneLastFour = phone.slice(-4);
    
    return `ST${year}${phoneLastFour}`;
  };

  // Update form data when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phone || user?.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        city: userData.city || '',
        pincode: userData.pincode || ''
      });
    } else if (user) {
      // Fallback to prop user data
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        city: user.city || '',
        pincode: user.pincode || ''
      });
    }
  }, [userData, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!userData?._id) {
      toast.error('Unable to save profile. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      await updateUser({
        userId: userData._id,
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        gender: formData.gender,
        city: formData.city,
        pincode: formData.pincode
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userData) {
      setFormData({
        name: userData.name || userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phone || user?.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        city: userData.city || '',
        pincode: userData.pincode || ''
      });
    }
    setIsEditing(false);
  };

  const profileFields = [
    {
      key: 'name',
      label: 'Name',
      value: formData.name,
      icon: User,
      type: 'text',
      placeholder: 'Enter your name',
      editable: true
    },
    {
      key: 'email',
      label: 'Email',
      value: formData.email,
      icon: Mail,
      type: 'email',
      placeholder: 'Enter your email',
      editable: true
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      value: formData.phoneNumber,
      icon: Phone,
      type: 'tel',
      placeholder: 'Phone number',
      editable: false
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      value: formData.dateOfBirth,
      icon: Calendar,
      type: 'date',
      placeholder: 'Select date',
      editable: true
    },
    {
      key: 'gender',
      label: 'Gender',
      value: formData.gender,
      icon: User,
      type: 'select',
      placeholder: 'Select gender',
      editable: true,
      options: [
        { value: '', label: 'Select gender' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'city',
      label: 'City',
      value: formData.city,
      icon: MapPin,
      type: 'select',
      placeholder: 'Select city',
      editable: true,
      options: [
        { value: '', label: 'Select city' },
        { value: 'bangalore', label: 'Bangalore' },
        { value: 'mumbai', label: 'Mumbai' },
        { value: 'delhi', label: 'Delhi' },
        { value: 'mysore', label: 'Mysore' },
        { value: 'mangalore', label: 'Mangalore' }
      ]
    },
    {
      key: 'pincode',
      label: 'Pincode',
      value: formData.pincode,
      icon: Hash,
      type: 'text',
      placeholder: 'Enter pincode',
      editable: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {localProfileImage || user?.profileImage ? (
              <img
                src={localProfileImage || user?.profileImage || ''}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{formData.name || 'User'}</h1>
              <p className="text-sm text-gray-500">Student ID: {generateStudentId(userData)}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-white"
              style={{ backgroundColor: '#86D5F0' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6BC5E8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#86D5F0'}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 font-medium text-white"
                style={{ backgroundColor: '#86D5F0' }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#6BC5E8')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#86D5F0')}
                disabled={isLoading}
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Fields */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {profileFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    
                    {isEditing && field.editable ? (
                      field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={field.value}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent appearance-none bg-white pr-10"
                            style={{ '--tw-ring-color': '#86D5F0' } as React.CSSProperties}
                          >
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          style={{ '--tw-ring-color': '#86D5F0' } as React.CSSProperties}
                          disabled={!field.editable}
                        />
                      )
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <p className="text-base text-gray-900">
                          {field.value || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};