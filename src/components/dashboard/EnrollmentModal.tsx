import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Clock, Calendar, CreditCard, CheckCircle, User, Navigation, Map, ArrowRight, ArrowLeft, Award, Gift } from 'lucide-react';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import LocationMapModal from './LocationMapModal';
import { googleMapsService } from '../../services/googleMaps';
import { useModalBackButton } from '../../hooks/useModalBackButton';
import { formatTimeRange } from '../../utils/timeUtils';

interface EnrollmentModalProps {
  sport: {
    _id: Id<"sportsPrograms">;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    ageGroups: string[];
    skillLevels: string[];
    equipment: string[];
    benefits: string[];
  };
  onClose: () => void;
}

interface Batch {
  _id: Id<"batches">;
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
  location?: {
    _id: Id<"locations">;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    distance?: number;
  };
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ sport, onClose }) => {
  const { user } = useAuth();
  const convex = useConvex();
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Id<"locations"> | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationsWithDistance, setLocationsWithDistance] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralValidation, setReferralValidation] = useState<{ valid: boolean; message?: string; referrer?: any } | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);

  // Hide mobile navigation when modal is open
  useEffect(() => {
    document.body.classList.add('enrollment-modal-open');
    return () => {
      document.body.classList.remove('enrollment-modal-open');
    };
  }, []);

  // Handle back button for modal
  useModalBackButton({ 
    isOpen: true, 
    onClose: () => {
      if (step > 1) {
        setStep(step - 1);
      } else {
        onClose();
      }
    }
  });

  // Touch/swipe handling for mobile
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize enrollment payment service with Convex client
  useEffect(() => {
    const initializePaymentService = async () => {
      const { enrollmentPaymentService } = await import('../../services/enrollmentPayment');
      enrollmentPaymentService.setConvexClient(convex);
    };
    initializePaymentService();
  }, [convex]);

  // Queries
  const locations = useQuery(api.locations.getActiveLocations) || [];
  const batches = useQuery(api.batches.getBatchesBySport,
    selectedLocation ? { sportId: sport._id } : "skip") || [];


  const createEnrollment = useMutation(api.userEnrollments.createUserEnrollment);
  const validateReferralCode = useQuery(api.referrals.validateReferralCode,
    referralCode.length >= 3 ? { referralCode, currentUserPhone: user?.phoneNumber } : "skip");
  const createReferral = useMutation(api.referrals.createReferral);
  const processReferralReward = useMutation(api.referrals.processReferralReward);
  const currentUser = useQuery(api.auth.getUserByPhone,
    user?.phoneNumber ? { phoneNumber: user.phoneNumber } : "skip");

  // Handle referral code validation
  useEffect(() => {
    if (validateReferralCode) {
      setReferralValidation(validateReferralCode);
      setIsValidatingReferral(false);
    }
  }, [validateReferralCode]);

  const handleReferralCodeChange = (code: string) => {
    setReferralCode(code);
    setReferralValidation(null);
    if (code.length >= 3) {
      setIsValidatingReferral(true);
    }
  };

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return; // Only on mobile
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return; // Only on mobile
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (deltaX > 10 || deltaY > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return; // Only on mobile
    if (isDragging) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && step > 1) {
        // Swipe right - go back
        // Add haptic feedback for iOS
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
        setStep(step - 1);
      } else if (deltaX < 0 && step < 4 && canProceed()) {
        // Swipe left - go forward
        // Add haptic feedback for iOS
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
        setStep(step + 1);
      }
    }
  };

  // Calculate distances when user location is available
  useEffect(() => {
    if (userLocation && locations.length > 0) {
      const locationsWithCalcDistance = locations.map(location => {
        const distance = googleMapsService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        );
        return { ...location, distance };
      }).sort((a, b) => a.distance - b.distance);

      setLocationsWithDistance(locationsWithCalcDistance);
    } else if (locations.length > 0) {
      setLocationsWithDistance(locations);
    }
  }, [userLocation, locations.length]); // Use locations.length instead of locations to prevent infinite loop

  // Get user's current location using Google Maps service
  const getUserLocation = async () => {
    setIsGettingLocation(true);
    try {
      const isInitialized = await googleMapsService.initialize();
      if (!isInitialized) {
        throw new Error('Google Maps service failed to initialize');
      }

      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      console.log('🔍 Attempting to get user location...');
      const location = await googleMapsService.getCurrentLocation();
      console.log('✅ Location obtained:', location);
      setUserLocation(location);
      toast.success('📍 Location detected! Showing nearest centers.');
    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      let errorMessage = 'Could not get your location.';
      if (error.message.includes('denied')) {
        errorMessage = 'Location access was denied. Please allow location access and try again.';
      } else if (error.message.includes('unavailable')) {
        errorMessage = 'Location information is currently unavailable. Please try again later.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (error.message.includes('not supported')) {
        errorMessage = 'Your browser does not support location services.';
      }
      toast.error(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location._id);
    setIsMapModalOpen(false);
    toast.success(`✅ Selected ${location.name}`);
  };

  const openMapModal = () => {
    setIsMapModalOpen(true);
  };

  const filteredBatches = batches.filter(batch =>
    selectedLocation ? batch.locationId === selectedLocation : true
  );

  const displayLocations = locationsWithDistance;

  const handleEnrollment = async () => {
    if (!user?.phoneNumber || !selectedBatch || !selectedPackage) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!currentUser) {
      toast.error('User authentication required. Please log in again.');
      return;
    }

    toast.info('🔄 Redirecting to payment gateway...');

    try {
      const { enrollmentPaymentService } = await import('../../services/enrollmentPayment');

      const paymentResult = await enrollmentPaymentService.processEnrollmentPayment(
        sport._id,
        selectedBatch._id,
        {
          duration: selectedPackage.duration,
          price: selectedPackage.price,
          sessions: selectedPackage.sessions
        },
        currentUser.fullName || currentUser.name || 'Student',
        user.phoneNumber
      );

      if (!paymentResult.success) {
        throw new Error('Payment failed or was cancelled');
      }

      const existingEnrollments = await convex.query(api.userEnrollments.getUserEnrollmentsByPhone, {
        phoneNumber: user.phoneNumber
      });

      const isAlreadyEnrolled = existingEnrollments?.some((enrollment: any) =>
        enrollment.batchId === selectedBatch._id &&
        (enrollment.enrollmentStatus === 'active' || enrollment.enrollmentStatus === 'paused')
      );

      const startDate = Date.now();
      const endDate = new Date();
      if (selectedPackage.duration === '1 month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (selectedPackage.duration === '3 months') {
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (selectedPackage.duration === '6 months') {
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (selectedPackage.duration === '12 months') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      let enrollmentId;

      if (isAlreadyEnrolled) {
        const existingEnrollment = existingEnrollments.find((enrollment: any) =>
          enrollment.batchId === selectedBatch._id &&
          (enrollment.enrollmentStatus === 'active' || enrollment.enrollmentStatus === 'paused')
        );

        if (existingEnrollment) {
          await convex.mutation(api.userEnrollments.addSessionsToEnrollment, {
            enrollmentId: existingEnrollment._id,
            additionalSessions: selectedPackage.sessions,
            additionalPaymentAmount: selectedPackage.price,
            paymentStatus: 'paid',
            razorpayOrderId: paymentResult.orderId || `order_${Date.now()}`,
            razorpayPaymentId: paymentResult.paymentId || `payment_${Date.now()}`
          });
          enrollmentId = existingEnrollment._id;
        }

        toast.success(`💫 Payment successful! ${selectedPackage.sessions} additional sessions have been added to your existing enrollment.`);
      } else {
        enrollmentId = await createEnrollment({
          userId: currentUser._id,
          batchId: selectedBatch._id,
          packageType: selectedPackage.duration,
          packageDuration: selectedPackage.duration,
          sessionsTotal: selectedPackage.sessions,
          startDate,
          endDate: endDate.getTime(),
          paymentAmount: selectedPackage.price,
          paymentStatus: 'paid',
          enrollmentStatus: 'active',
          razorpayOrderId: paymentResult.orderId || `order_${Date.now()}`,
          razorpayPaymentId: paymentResult.paymentId || `payment_${Date.now()}`,
          notes: `Payment ID: ${paymentResult.paymentId} - Enrolled in ${sport.name} - ${selectedBatch.name}`
        });

        toast.success('🎉 Enrollment successful! Welcome to your coaching program.');
        console.log('✅ Enrollment created with automatic session schedule generation:', enrollmentId);
      }

      await convex.mutation(api.paymentTracking.createPaymentRecord, {
        type: 'enrollment',
        userId: user.phoneNumber,
        amount: selectedPackage.price,
        currency: 'INR',
        status: 'completed',
        details: {
          enrollmentId: enrollmentId,
          sport: sport.name,
          planId: selectedPackage.duration,
          orderId: paymentResult.orderId || `order_${Date.now()}`,
          paymentId: paymentResult.paymentId || `payment_${Date.now()}`,
          sessionStartDate: startDate,
          courtLocation: selectedBatch.location?.name || 'Unknown Location'
        },
        metadata: { source: 'EnrollmentModal.coaching_view' }
      });

      // Create referral record if referral code was used
      if (referralCode && referralValidation?.valid && user?.phoneNumber && enrollmentId) {
        try {
          await createReferral({
            referralCode,
            referredPhone: user.phoneNumber,
          });

          // Process referral reward after successful enrollment
          await processReferralReward({
            enrollmentId: enrollmentId,
            referredPhone: user.phoneNumber,
            packageDuration: selectedPackage.duration === '1 month' ? '1-month' :
              selectedPackage.duration === '3 months' ? '3-months' :
                selectedPackage.duration === '6 months' ? '6-months' :
                  selectedPackage.duration === '12 months' ? '12-months' :
                    selectedPackage.duration,
          });

          toast.success('🎉 Referral bonus applied! Your referrer will receive free sessions.');
        } catch (error) {
          console.error('Failed to process referral:', error);
        }
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
      console.error(error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedLocation;
      case 2: return selectedBatch;
      case 3: return selectedPackage;
      case 4: return true;
      default: return false;
    }
  };

  const stepTitles = ['Location', 'Training', 'Package', 'Payment'];

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-out bg-cyan-400"
              style={{
                width: `${(step / 4) * 100}%`
              }}
            />
          </div>
        </div>
        <span className="ml-4 text-sm font-medium text-gray-600">{step}/4</span>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
            alt="Playgram Logo"
            className="h-6 w-6 object-contain"
          />
          <h2 className="text-2xl font-bold text-gray-900">Choose your Training Location</h2>
        </div>
        <p className="text-gray-500 text-base">Select the centre most convenient for you</p>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={getUserLocation}
          disabled={isGettingLocation}
          className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shadow-sm"
        >
          <Navigation className={`w-5 h-5 mr-2 flex-shrink-0 ${isGettingLocation ? 'animate-spin' : ''}`} />
          <span>{isGettingLocation ? 'Finding...' : 'Find Nearest Location'}</span>
        </button>
        <button
          onClick={openMapModal}
          className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors whitespace-nowrap shadow-sm"
        >
          <Map className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>View on Map</span>
        </button>
      </div>

      <div className="space-y-4">
        {displayLocations.map((location, index) => (
          <motion.div
            key={location._id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedLocation(location._id)}
            className={`relative rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedLocation === location._id
              ? 'border border-cyan-400 bg-cyan-50 shadow-md'
              : 'hover:shadow-sm'
              }`}
          >
            {/* Location Image with Navigation Arrows */}
            <div className="relative">
              <img
                src={(location as any).imageUrl || 'https://jenpaints.art/wp-content/uploads/2025/08/PHOTO-2025-08-17-11-01-50.jpg'}
                alt={location.name}
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/3B82F6/white?text=Sports+Center';
                }}
              />

              {/* Navigation Arrows */}
              <button className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-md hover:bg-opacity-100 transition-all">
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-md hover:bg-opacity-100 transition-all">
                <ArrowRight className="w-4 h-4 text-gray-700" />
              </button>

              {/* Selection indicator */}
              {selectedLocation === location._id && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Location Details */}
            <div className="p-4 space-y-3">
              {/* Location Name and Address */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-500">{location.address}, {location.city}</p>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>

              {/* Starting Price */}
              <div>
                <p className="text-sm text-gray-900">
                  Starting from <span className="text-sm font-semibold" style={{ 
                    background: 'linear-gradient(135deg, #DF1D40 0%, #86D5F0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>₹{(location as any).startingPrice || '4599'}</span>
                </p>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-300">
                  Parking
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-300">
                  Washrooms
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-300">
                  Gym
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-300">
                  +1
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


    </motion.div>
  );

  const renderBatchStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select your Training Group</h2>
        <p className="text-gray-500 text-base">Choose the batch that matches your skill level</p>
      </div>

      <div className="space-y-4">
        {filteredBatches.map((batch, index) => (
          <motion.div
            key={batch._id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedBatch(batch as Batch)}
            className={`relative p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedBatch?._id === batch._id
              ? 'border-cyan-400 bg-cyan-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            {/* Selection indicator */}
            {selectedBatch?._id === batch._id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Batch Title */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{batch.name}</h3>
            </div>

            {/* Batch Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Coach */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <User className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Coach:</p>
                  <p className="text-sm text-gray-600">{batch.coachName}</p>
                </div>
              </div>

              {/* Slots Available */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Slots Available:</p>
                  <p className="text-sm text-gray-600">{batch.currentEnrollments}/{batch.maxCapacity}</p>
                </div>
              </div>

              {/* Age */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <User className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Age:</p>
                  <p className="text-sm text-gray-600">{batch.ageGroup}</p>
                </div>
              </div>

              {/* Level */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Award className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Level:</p>
                  <p className="text-sm text-gray-600">{batch.skillLevel}</p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            {batch.schedule.length > 0 && (
              <div className="mb-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sessions:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {batch.schedule.map((schedule, idx) => (
                        <span key={idx} className="text-sm text-gray-600">
                          {schedule.day}{idx < batch.schedule.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timings */}
            {batch.schedule.length > 0 && (
              <div className="mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Timings:</p>
                    <p className="text-sm text-gray-600">
                      {formatTimeRange(batch.schedule[0]?.startTime, batch.schedule[0]?.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {batch.currentEnrollments >= batch.maxCapacity && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">This batch is currently full</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No batches available</h3>
          <p className="text-gray-600">No training groups found for the selected location.</p>
        </div>
      )}


    </motion.div>
  );

  const renderPackageStep = () => {
    // Calculate savings for marketing
    const calculateSavings = (pkg: any) => {
      const singleSessionPrice = 600; // Assume single session price
      const totalRegularPrice = pkg.sessions * singleSessionPrice;
      const savings = totalRegularPrice - pkg.price;
      const savingsPercentage = Math.round((savings / totalRegularPrice) * 100);
      return { savings, savingsPercentage };
    };

    // Determine most popular package (usually 3 months)
    const getMostPopular = (pkg: any) => {
      return pkg.duration === '3 months' || pkg.sessions >= 24;
    };

    // Get best value package (highest savings percentage)
    const getBestValue = (packages: any[]) => {
      return packages.reduce((best, current) => {
        const currentSavings = calculateSavings(current);
        const bestSavings = calculateSavings(best);
        return currentSavings.savingsPercentage > bestSavings.savingsPercentage ? current : best;
      });
    };

    const bestValuePackage = selectedBatch?.packages ? getBestValue(selectedBatch.packages) : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your Package</h2>
          <p className="text-gray-500 text-base">Select the plan that fits your fitness journey</p>
        </div>

        <div className="space-y-4">
          {selectedBatch?.packages.map((pkg, index) => {
            const { savings, savingsPercentage } = calculateSavings(pkg);
            const isPopular = getMostPopular(pkg);
            const isBestValue = bestValuePackage === pkg;
            const costPerSession = Math.round(pkg.price / pkg.sessions);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPackage === pkg
                    ? 'border-cyan-400 bg-cyan-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular/Best Value Badge */}
                {(isPopular || isBestValue) && (
                  <div className="absolute -top-3 left-6">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      isBestValue ? 'bg-green-500' : 'bg-orange-500'
                    }`}>
                      {isBestValue ? '🏆 BEST VALUE' : '🔥 MOST POPULAR'}
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedPackage === pkg && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Left Side - Package Info */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{pkg.duration}</h3>
                      <span className="text-sm text-gray-500">{pkg.sessions} sessions</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">₹{pkg.price.toLocaleString()}</span>
                      {savingsPercentage > 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          Save {savingsPercentage}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">₹{costPerSession}</span> per session
                      </p>
                      {savingsPercentage > 0 && (
                        <p className="text-xs text-green-600">
                          You save ₹{savings.toLocaleString()} vs individual sessions
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Quick Benefits */}
                  <div className="text-right">
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>✓ Professional coaching</div>
                      <div>✓ Equipment included</div>
                      <div>✓ Progress tracking</div>
                      {pkg.duration === '3 months' && (
                        <>
                          <div>✓ Nutrition guidance</div>
                          <div>✓ Performance analysis</div>
                        </>
                      )}
                      {pkg.duration === '6 months' && (
                        <>
                          <div>✓ Personal training</div>
                          <div>✓ Diet consultation</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Value Proposition */}
                {pkg.duration === '1 month' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">Perfect for trying out our coaching</p>
                  </div>
                )}
                {pkg.duration === '3 months' && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">Ideal for building consistent habits & seeing results</p>
                  </div>
                )}
                {pkg.duration === '6 months' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">Complete transformation with maximum savings</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>↩️</span>
              <span>Easy Refunds</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>⭐</span>
              <span>4.8/5 Rating</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your Enrolment</h2>
        <p className="text-gray-500 text-base">Review your selection and proceed to payment</p>
      </div>

      {/* Enrollment Summary Card */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 space-y-6">
        {/* Enrollment Summary Header */}
        <h3 className="text-lg font-semibold text-gray-900">Enrolment Summary</h3>

        {/* Summary Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Coaching</span>
            <span className="font-medium text-gray-900">{sport.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Location</span>
            <span className="font-medium text-gray-900">{displayLocations.find(loc => loc._id === selectedLocation)?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Training group</span>
            <span className="font-medium text-gray-900">{selectedBatch?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Package</span>
            <span className="font-medium text-gray-900">{selectedPackage?.duration}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Sessions</span>
            <span className="font-medium text-gray-900">{selectedPackage?.sessions} Sessions</span>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="space-y-3 pt-4 border-t border-cyan-200">
          <h4 className="text-base font-semibold text-gray-900">Have a referral code?</h4>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => handleReferralCodeChange(e.target.value.toUpperCase())}
            placeholder="Enter referral code (e.g.,PLYG001ABC)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base bg-white"
          />
          {isValidatingReferral && (
            <p className="text-sm text-gray-500">Validating referral code...</p>
          )}
          {referralValidation && (
            <div className={`p-3 rounded-lg text-sm ${referralValidation.valid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {referralValidation.valid ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Valid referral code! Referred by {referralValidation.referrer?.fullName}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <X className="w-4 h-4" />
                  <span>{referralValidation.message}</span>
                </div>
              )}
            </div>
          )}
          {referralValidation?.valid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-700">
                <Gift className="w-4 h-4" />
                <span className="font-medium">Referral Bonus</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Your referrer will receive free sessions when you complete this enrollment!
              </p>
            </div>
          )}
        </div>

        {/* Total Amount */}
        <div className="pt-4 border-t border-cyan-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">₹{selectedPackage?.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderLocationStep();
      case 2: return renderBatchStep();
      case 3: return renderPackageStep();
      case 4: return renderPaymentStep();
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 md:flex md:items-center md:justify-center md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{
            scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.95,
            opacity: 0,
            y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.95,
            opacity: 0,
            y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          className="bg-white w-full h-full md:rounded-xl md:shadow-xl md:w-full md:max-w-2xl md:max-h-[90vh] md:h-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 md:px-6 py-4 md:py-4 border-b border-gray-100 bg-white relative">
            {/* Mobile pull indicator */}
            <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Enrol in {sport.name}</h1>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="px-4 md:px-6 py-4 bg-white">
            {renderProgressBar()}
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto px-4 md:px-6 bg-white"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons Footer */}
          <div className="bg-white border-t border-gray-100 px-4 md:px-6 py-4">
            <div className="flex space-x-3">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
                className="flex-1 inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (step < 4) {
                    setStep(step + 1);
                  } else {
                    handleEnrollment();
                  }
                }}
                disabled={!canProceed()}
                className={`flex-1 inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  step === 4
                    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                    : 'bg-black hover:bg-gray-800 focus:ring-black'
                }`}
              >
                {step === 4 ? 'Pay Now' : 'Continue'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Location Map Modal */}
        <LocationMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          locations={displayLocations.map(loc => ({
            _id: loc._id,
            name: loc.name,
            address: loc.address,
            city: loc.city,
            latitude: loc.latitude,
            longitude: loc.longitude,
            distance: (loc as any).distance,
            contactPhone: (loc as any).contactPhone,
            state: (loc as any).state,
            pincode: (loc as any).pincode,
            imageUrl: (loc as any).imageUrl,
            facilities: (loc as any).facilities || []
          }))}
          userLocation={userLocation || undefined}
          onLocationSelect={handleLocationSelect}
          selectedLocationId={selectedLocation || undefined}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default EnrollmentModal;

