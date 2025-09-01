import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight, CheckCircle, Pause, X, ArrowLeft, MessageCircle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DashboardView } from '../Dashboard';
import BatchChatModal from '../BatchChatModal';
import { formatTo12Hour } from '../../../utils/timeUtils';

interface BatchesViewProps {
  enrollments: any[];
  setCurrentView?: (view: DashboardView) => void;
  onBackNavigation?: () => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({ enrollments, setCurrentView, onBackNavigation }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [selectedSessionForPause, setSelectedSessionForPause] = useState<any>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  
  // Pause session mutation
  const pauseSessionMutation = useMutation(api.sessionSchedules.requestSessionPause);

  // Get user's active enrollments
  const userEnrollments = useQuery(
    api.userEnrollments.getUserEnrollmentsByPhone,
    user?.phoneNumber ? { phoneNumber: user.phoneNumber } : "skip"
  ) || [];
  
  const activeEnrollments = userEnrollments.filter(e => 
    e.enrollmentStatus === 'active' && 
    e.paymentStatus === 'paid' && 
    e.sessionsAttended < e.sessionsTotal &&
    e.batch && e.sport
  );

  // Get session schedules
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0).getTime();
  
  const sessionSchedules = useQuery(
    api.sessionSchedules.getSessionsForCalendar,
    user?.phoneNumber ? {
      phoneNumber: user.phoneNumber,
      startDate: startDate,
      endDate: endDate,
    } : "skip"
  ) || [];

  // Calculate statistics
  const totalSessions = sessionSchedules.length;
  const attendedSessions = sessionSchedules.filter(s => s.status === 'completed').length;
  const pausedSessions = sessionSchedules.filter(s => s.status === 'paused').length;
  const missedSessions = sessionSchedules.filter(s => s.status === 'missed').length;
  
  // Generate calendar data for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayData = {
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        sessions: sessionSchedules.filter(session => {
          const sessionDate = new Date(session.scheduledDate);
          return sessionDate.toDateString() === currentDay.toDateString();
        })
      };
      days.push(dayData);
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle pause session
  const handlePauseSession = async () => {
    if (!selectedSessionForPause || !selectedSessionForPause._id) return;
    
    try {
      const enrollment = activeEnrollments.find(e => e._id === selectedSessionForPause.enrollmentId);
      if (!enrollment) {
        toast.error('Enrollment not found');
        return;
      }
      
      await pauseSessionMutation({
        enrollmentId: selectedSessionForPause.enrollmentId,
        sessionScheduleId: selectedSessionForPause._id,
        reason: pauseReason || 'No reason provided'
      });
      
      toast.success('Session paused successfully!');
      setShowPauseModal(false);
      setSelectedSessionForPause(null);
      setPauseReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
            alt="Playgram Logo"
            className="h-8 w-8 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Training Calendar</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="space-y-4 mb-6">
        <div className="rounded-2xl p-4 shadow-sm border-2" style={{ borderColor: '#86D5F0', backgroundColor: '#F3FAFD' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#377C92' }}>
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-medium">Total Sessions</span>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#377C92', color: 'white' }}>
              <span className="font-bold text-lg">{totalSessions}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 shadow-sm border-2" style={{ borderColor: '#86D5F0', backgroundColor: '#F3FAFD' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#377C92' }}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-medium">Sessions Attended</span>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#377C92', color: 'white' }}>
              <span className="font-bold text-lg">{attendedSessions}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 shadow-sm border-2" style={{ borderColor: '#86D5F0', backgroundColor: '#F3FAFD' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#377C92' }}>
                <Pause className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-medium">Sessions Paused</span>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#377C92', color: 'white' }}>
              <span className="font-bold text-lg">{pausedSessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #E11C41 0%, #86D5F0 100%)' }}>
          <button 
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <h2 className="text-white font-semibold text-lg">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-xs font-medium text-gray-500">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const hasAttended = day.sessions.some(s => s.status === 'completed');
              const hasMissed = day.sessions.some(s => s.status === 'missed');
              const hasPaused = day.sessions.some(s => s.status === 'paused');
              const hasUpcoming = day.sessions.some(s => s.status === 'scheduled');
              
              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center text-sm relative ${
                    !day.isCurrentMonth 
                      ? 'text-gray-300' 
                      : day.isToday 
                        ? 'text-gray-700 font-bold' 
                        : 'text-gray-700'
                  }`}
                >
                  <span className={day.isToday ? 'font-bold' : ''}>{day.date.getDate()}</span>
                  
                  {/* Session Status Indicators */}
                  {day.isCurrentMonth && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      {hasAttended && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {hasMissed && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      {hasPaused && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                      {hasUpcoming && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#86D5F0' }}></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Attended Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Missed Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Paused Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#86D5F0' }}></div>
            <span className="text-sm text-gray-700">Upcoming Sessions</span>
          </div>
        </div>
      </div>

      {/* Pause Session Button */}
      <div className="mt-6">
        <button 
          onClick={() => setShowPauseModal(true)}
          className="w-full text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          style={{ background: '#E11C41' }}
        >
          <div className="flex items-center justify-center gap-2">
            <Pause className="w-5 h-5" />
            Pause Session
          </div>
        </button>
        
        <div className="text-center mt-2">
          <span className="text-sm" style={{ color: '#86D5F0' }}>{pausedSessions} pauses available</span>
        </div>
      </div>

      {/* Pause Session Modal */}
      <AnimatePresence>
        {showPauseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden relative"
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowPauseModal(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pause Session</h2>
                <p className="text-gray-600 mb-6">
                  Please select the date you would like to pause
                </p>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select date</label>
                  <div className="relative">
                    <select
                      value={selectedSessionForPause?._id || ''}
                      onChange={(e) => {
                        const session = sessionSchedules.find(s => s._id === e.target.value);
                        setSelectedSessionForPause(session || null);
                      }}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Choose a date</option>
                      {sessionSchedules
                        .filter(s => s.status === 'scheduled' && new Date(s.scheduledDate) > new Date())
                        .slice(0, 5)
                        .map((session) => {
                          const enrollment = activeEnrollments.find(e => e._id === session.enrollmentId);
                          return (
                            <option key={session._id} value={session._id}>
                              {new Date(session.scheduledDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {formatTo12Hour(session.scheduledStartTime)} - {enrollment?.sport?.name || 'Training'}
                            </option>
                          );
                        })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Reason Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for pausing *</label>
                  <textarea
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    placeholder="Please provide a reason for pausing this session."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Important Notes */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Sessions can only be paused at least 2 hours before start time</li>
                    <li>• Session will be rescheduled to next available slot</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowPauseModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePauseSession}
                  disabled={!selectedSessionForPause || !pauseReason.trim()}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Pause
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Icon */}
      {activeEnrollments.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // If only one batch, select it automatically
            if (activeEnrollments.length === 1) {
              setSelectedBatch(activeEnrollments[0].batch);
              setShowChatModal(true);
            } else {
              // For multiple batches, you could show a selection modal
              // For now, let's use the first batch
              setSelectedBatch(activeEnrollments[0].batch);
              setShowChatModal(true);
            }
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#377C92] hover:bg-[#2a5f73] text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Batch Chat Modal */}
      {showChatModal && selectedBatch && (
        <BatchChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedBatch(null);
          }}
          batch={selectedBatch}
        />
      )}
    </div>
  );
};