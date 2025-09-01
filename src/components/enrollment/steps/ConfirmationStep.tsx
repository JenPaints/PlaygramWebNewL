import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, Phone, User, Clock } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { StepComponentProps } from '../types';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { formatTimeRange } from '../../../utils/timeUtils';

interface ConfirmationStepProps extends StepComponentProps {
  enrollmentId: string;
  userPhone: string;
  selectedPlan: any;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  enrollmentState,
  onNext,
  enrollmentId,
  userPhone,
  selectedPlan
}) => {
  // Fetch real enrollment data from backend
  const enrollment = useQuery(api.userEnrollments.getEnrollmentById, { id: enrollmentId as any });
  
  // Fetch session schedules for this enrollment
  const sessions = useQuery(api.sessionSchedules.getSessionSchedulesByEnrollment, { enrollmentId: enrollmentId as any });
  
  // Fetch batch details
  const batch = enrollment ? useQuery(api.batches.getBatchById, { id: enrollment.batchId }) : null;

  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onNext]);

  if (!enrollment) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your enrollment details...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto p-6 text-center min-h-screen flex flex-col justify-center items-center bg-white"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <img 
          src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png" 
          alt="Playgram Logo" 
          className="w-32 h-32 mx-auto object-contain"
        />
      </motion.div>

      {/* Lottie Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-48 h-48 mx-auto">
          <DotLottieReact
            src="https://lottie.host/1858f20a-3dc6-4739-ab09-405ae35cea45/K5uBIyXRyF.lottie"
            loop
            autoplay
          />
        </div>
      </motion.div>

      {/* Payment Complete Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-4xl font-bold text-gray-900">
          Payment Complete!
        </h2>
        <p className="text-gray-600 text-lg">
          Your enrollment has been successfully processed.
        </p>
        
        {/* Auto-close countdown */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-sm text-gray-500 mt-4"
        >
          This page will close automatically in a few seconds...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationStep;