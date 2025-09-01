import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { TrialStepProps, TrialUserDetails } from '../types';

const DetailsStep: React.FC<TrialStepProps> = ({
    onNext,
    onBack,
    trialState,
    updateState
}) => {
    const createTrialBooking = useMutation(api.trialBookings.createTrialBooking);
    const [formData, setFormData] = useState<TrialUserDetails>({
        name: trialState.userDetails?.name || '',
        age: trialState.userDetails?.age || 0,
        email: trialState.userDetails?.email || '',
        phoneNumber: trialState.userPhone
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Age validation
        if (!formData.age || formData.age < 5 || formData.age > 50) {
            newErrors.age = 'Age must be between 5 and 50 years';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof TrialUserDetails, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔄 Creating trial booking in Convex...');
            
            // Create trial booking in Convex
            const bookingId = await createTrialBooking({
                phoneNumber: trialState.userPhone,
                sport: trialState.selectedSport!,
                selectedDate: trialState.selectedDate!.getTime(),
                userDetails: formData,
                courtLocation: 'HSR Football Court, HSR Layout, Bangalore'
            });

            console.log('✅ Trial booking created successfully:', bookingId);

            updateState({ 
                userDetails: formData,
                bookingStatus: 'confirmed',
                actualBookingId: bookingId,
                errors: {}
            });
            onNext();
        } catch (error: any) {
            console.error('❌ Failed to create trial booking:', error);
            
            // Handle specific error messages
            let errorMessage = 'Failed to book trial. Please try again.';
            if (error.message?.includes('already booked')) {
                errorMessage = 'This phone number has already booked a free trial. Each number can only book one trial.';
            }
            
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return 'Not selected';
        
        // Ensure we have a proper Date object
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Complete Your Details
                </h3>
                <p className="text-lg text-gray-600">
                    We need a few details to complete your free trial booking
                </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Booking Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-blue-700 font-medium">Sport:</span>
                        <span className="ml-2 text-blue-900 capitalize">{trialState.selectedSport}</span>
                    </div>
                    <div>
                        <span className="text-blue-700 font-medium">Date:</span>
                        <span className="ml-2 text-blue-900">
                            {formatDate(trialState.selectedDate)}
                        </span>
                    </div>
                    <div>
                        <span className="text-blue-700 font-medium">Time:</span>
                        <span className="ml-2 text-blue-900">10:00 AM - 11:30 AM</span>
                    </div>
                    <div>
                        <span className="text-blue-700 font-medium">Phone:</span>
                        <span className="ml-2 text-blue-900">+91 {trialState.userPhone}</span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </motion.div>

                {/* Age */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                    </label>
                    <input
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        placeholder="Enter your age"
                        min="5"
                        max="50"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.age && (
                        <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                    )}
                </motion.div>

                {/* Email */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </motion.div>

                {/* Submit Error */}
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                            <div className="text-red-600">❌</div>
                            <p className="text-red-800 text-sm">{errors.submit}</p>
                        </div>
                    </div>
                )}

                {/* Important Notes */}
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                        <span className="mr-2">📝</span>
                        Important Notes
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-2">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Arrive 15 minutes before your session time</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Bring your own water bottle and towel</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Wear comfortable sports attire and shoes</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Contact us if you need to reschedule</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                    ← Back to Phone Verification
                </button>
                
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Booking Trial...</span>
                        </div>
                    ) : (
                        'Complete Booking'
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default DetailsStep;