import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface UserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userData: any) => void;
  userId: Id<"users">;
  phoneNumber: string;
}

interface OnboardingFormData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userId,
  phoneNumber
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const convex = useConvex();
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.fullName.trim() !== '' && formData.email.trim() !== '';
      case 2:
        return formData.dateOfBirth !== '' && formData.gender !== '';
      case 3:
        return formData.city.trim() !== '' && formData.state.trim() !== '';
      case 4:
        return formData.emergencyContactName.trim() !== '' && 
               formData.emergencyContactPhone.trim() !== '' && 
               formData.emergencyContactRelation.trim() !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Update user with complete profile information
      await convex.mutation(api.auth.updateUser, {
        userId,
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        dateOfBirth: new Date(formData.dateOfBirth).getTime(),
        gender: formData.gender,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        }
      });

      // Get updated user data
      const updatedUser = await convex.query(api.auth.getUserByPhone, {
        phoneNumber
      });

      if (!updatedUser) {
        console.error('Failed to retrieve updated user data');
        // Create fallback user data with the form data
        const fallbackUserData = {
          phone: phoneNumber,
          fullName: formData.fullName,
          email: formData.email,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          dateOfBirth: new Date(formData.dateOfBirth).getTime(),
          gender: formData.gender,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relation: formData.emergencyContactRelation
          }
        };
        toast.success('Profile completed successfully!');
        onComplete(fallbackUserData);
      } else {
        toast.success('Profile completed successfully!');
        onComplete(updatedUser);
      }
      onClose();
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
              <p className="text-gray-600">Help us know you better</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
              <p className="text-gray-600">Where are you located?</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your state"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your pincode"
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Emergency Contact</h3>
              <p className="text-gray-600">Someone we can reach in case of emergency</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Relationship</option>
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep(4) || isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};