import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';
import EnrollmentModal from '../EnrollmentModal';
import { motion } from 'framer-motion';
import { DashboardView } from '../Dashboard';
import { formatTimeRange } from '../../../utils/timeUtils';

interface CoachingViewProps {
  enrollments: any[];
  trialBookings: any[];
  setCurrentView?: (view: DashboardView) => void;
}

export const CoachingView: React.FC<CoachingViewProps> = ({ setCurrentView }) => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Auto-refresh every 30 seconds to catch new enrollments
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Get active sports programs
  const sportsPrograms = useQuery(api.sportsPrograms.getActiveSportsPrograms) || [];
  

  
  // Get user's active enrollments (refreshKey in dependency will cause re-fetch)
  const userEnrollments = useQuery(
    api.userEnrollments.getUserEnrollmentsByPhone,
    user?.phoneNumber ? { phoneNumber: user.phoneNumber } : "skip"
  ) || [];
  

  

  
  // Force re-fetch when refreshKey changes
  React.useEffect(() => {
    // The refreshKey change will cause the component to re-render and re-fetch the query
  }, [refreshKey]);
  
  // Get session schedules to show upcoming sessions
  const today = new Date();
  const extendedStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
  const extendedEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0).getTime();
  
  const sessionSchedules = useQuery(
    api.sessionSchedules.getSessionsForCalendar,
    user?.phoneNumber ? {
      phoneNumber: user.phoneNumber,
      startDate: extendedStartDate,
      endDate: extendedEndDate,
    } : "skip"
  ) || [];
  
  const activeEnrollments = userEnrollments.filter(e => {
    if (e.enrollmentStatus !== 'active' || e.paymentStatus !== 'paid') {
      return false;
    }
    
    // Check if program is completed based on actual session schedules
    const enrollmentSessions = sessionSchedules.filter(session => session.enrollmentId === e._id);
    const completedSessions = enrollmentSessions.filter(session => session.status === 'completed').length;
    const totalScheduledSessions = enrollmentSessions.length;
    
    // Show enrollment if:
    // 1. It has no sessions yet (needs session generation), OR
    // 2. It has scheduled sessions and not all are completed
    return totalScheduledSessions === 0 || (totalScheduledSessions > 0 && completedSessions < totalScheduledSessions);
  });
  


  // Get actual session counts for each enrollment
  const getSessionCounts = (enrollmentId: string) => {
    const enrollment = userEnrollments.find(e => e._id === enrollmentId);
    const enrollmentSessions = sessionSchedules.filter(session => session.enrollmentId === enrollmentId);
    const completedSessions = enrollmentSessions.filter(session => session.status === 'completed').length;
    const totalScheduledSessions = enrollmentSessions.length;
    
    // If no sessions are scheduled yet, show the enrollment's total sessions
    // Otherwise, show actual scheduled sessions
    const displayTotal = totalScheduledSessions > 0 ? totalScheduledSessions : (enrollment?.sessionsTotal || 0);
    
    return { completed: completedSessions, total: displayTotal };
  };

  const handleEnrollClick = (sport: any) => {
    setSelectedSport(sport);
    setShowEnrollmentModal(true);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
            alt="Playgram Logo"
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Batches</h1>
        </div>
      </div>





      {/* Current Enrollments - Simple Card Layout */}
      {activeEnrollments.length > 0 && (
        <div className="mb-8 space-y-4">
          {activeEnrollments.map((enrollment) => (
            <motion.div 
              key={enrollment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => setCurrentView && setCurrentView('batches')}
            >
              <div className="flex">
                {/* Image */}
                <div className="w-20 h-20 flex-shrink-0">
                  {enrollment.location?.imageUrl ? (
                    <img 
                      className="w-full h-full object-cover" 
                      src={enrollment.location.imageUrl} 
                      alt={enrollment.location?.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {enrollment.sport?.name || 'Sports Program'} Coaching
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {enrollment.packageDuration} • {enrollment.batch?.coachName || 'Coach TBD'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {enrollment.batch?.schedule && enrollment.batch.schedule.length > 0 ? (
                          formatTimeRange(enrollment.batch.schedule[0].startTime, enrollment.batch.schedule[0].endTime)
                        ) : (
                          'Time TBD'
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {enrollment.batch?.schedule && enrollment.batch.schedule.length > 0 ? (
                          enrollment.batch.schedule.map((s: any) => s.day).join(', ')
                        ) : (
                          'Days TBD'
                        )}
                      </div>
                      {(() => {
                        const sessionCounts = getSessionCounts(enrollment._id);
                        const remaining = sessionCounts.total - sessionCounts.completed;
                        return (
                          <div className="text-xs text-gray-500 mt-1">
                            Sessions {remaining}/{sessionCounts.total}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        Active
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Explore More Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
            alt="Playgram Logo"
            className="h-6 w-6 object-contain"
          />
          <h2 className="text-lg font-bold text-gray-900">Pick & Play</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured Football Coaching Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => sportsPrograms.length > 0 && handleEnrollClick(sportsPrograms.find(s => s.name.toLowerCase().includes('football')) || sportsPrograms[0])}
          >
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-27_024846286.png"
              alt="Football Coaching"
              className="w-full h-auto object-cover"
            />
          </motion.div>

          {/* Featured Basketball Coaching Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => sportsPrograms.length > 0 && handleEnrollClick(sportsPrograms.find(s => s.name.toLowerCase().includes('basketball')) || sportsPrograms[1] || sportsPrograms[0])}
          >
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-27_024931339.png"
              alt="Basketball Coaching"
              className="w-full h-auto object-cover"
            />
          </motion.div>

          {/* Additional Sport Card - Placeholder for future sports */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer opacity-50"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/3] flex items-center justify-center">
              <span className="text-gray-500 font-medium">More Sports Coming Soon</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedSport && (
        <EnrollmentModal
          sport={selectedSport}
          onClose={() => {
            setShowEnrollmentModal(false);
            setSelectedSport(null);
          }}
        />
      )}
    </div>
  );
};