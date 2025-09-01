import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Phone,
  User,
  BookOpen,
  Target,
  Award,
  Bell,
  MessageCircle
} from 'lucide-react';
import CoachChatManagement from './CoachChatManagement';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';
import { Id } from '../../../convex/_generated/dataModel';

interface CoachDashboardProps {
  // Optional props for customization
}

type TabType = 'attendance' | 'chats' | 'overview';

const CoachDashboard: React.FC<CoachDashboardProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceView, setAttendanceView] = useState<'today' | 'history'>('today');

  const tabs = [
    { id: 'attendance' as TabType, label: 'Attendance', icon: CheckCircle },
    { id: 'chats' as TabType, label: 'Batch Chats', icon: MessageCircle },
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
  ];

  // Get current user's database record to get the proper ID
  const currentUserRecord = useQuery(
    api.users.getUserByPhone,
    user?.phoneNumber ? { phone: user.phoneNumber } : "skip"
  );

  // Get coach's assigned batches using the proper database ID
  const coachBatches = useQuery(
    api.coachManagement.getCoachBatches,
    currentUserRecord?._id ? { coachId: currentUserRecord._id } : "skip"
  ) || [];

  // Get attendance for selected batch and date
  const batchAttendance = useQuery(
    api.coachManagement.getBatchAttendance,
    selectedBatch && selectedDate
      ? {
          batchId: selectedBatch._id,
          sessionDate: new Date(selectedDate).getTime(),
        }
      : "skip"
  ) || [];

  // Get attendance history for selected batch
  const attendanceHistory = useQuery(
    api.coachManagement.getBatchAttendanceHistory,
    selectedBatch
      ? {
          batchId: selectedBatch._id,
          limit: 20,
        }
      : "skip"
  ) || [];

  // Mark attendance mutation
  const markAttendance = useMutation(api.coachManagement.markAttendance);

  // Handle attendance marking
  const handleMarkAttendance = async (
    enrollmentId: Id<"userEnrollments">,
    status: 'present' | 'absent' | 'late' | 'excused',
    notes?: string
  ) => {
    try {
      await markAttendance({
        enrollmentId,
        sessionDate: new Date(selectedDate).getTime(),
        status,
        notes,
        markedBy: user?.name || user?.fullName || 'Coach',
      });
      toast.success(`Attendance marked as ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    }
  };

  // Get today's date for comparison
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  if (!user || user.userType !== 'coach') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need coach privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name || user.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{coachBatches.length} Batches</p>
                <p className="text-xs text-gray-500">Assigned to you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render content based on active tab */}
        {activeTab === 'chats' && (
          <div className="h-[calc(100vh-12rem)]">
            <CoachChatManagement />
          </div>
        )}
        
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {coachBatches.reduce((total, batch) => total + batch.totalStudents, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Batches</p>
                    <p className="text-2xl font-bold text-gray-900">{coachBatches.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Today's Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {coachBatches.filter(batch => 
                        batch.schedule.some((s: any) => 
                          s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
                        )
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Unread Messages</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'attendance' && (
          <div>
            {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coachBatches.reduce((total, batch) => total + batch.totalStudents, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900">{coachBatches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coachBatches.filter(batch => 
                    batch.schedule.some((s: any) => 
                      s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
                    )
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Selection */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Batches</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coachBatches.map((batch) => (
                <motion.div
                  key={batch._id}
                  whileHover={{ scale: 1.02 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBatch?._id === batch._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBatch(batch)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {batch.sport?.name}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{batch.location?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{batch.totalStudents} students</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{batch.ageGroup} • {batch.skillLevel}</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Schedule:</p>
                    <div className="flex flex-wrap gap-1">
                      {batch.schedule.map((schedule: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {schedule.day.slice(0, 3)} {schedule.startTime}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Section */}
        {selectedBatch && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Attendance - {selectedBatch.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedBatch.sport?.name} • {selectedBatch.location?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setAttendanceView('today')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        attendanceView === 'today'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Mark Attendance
                    </button>
                    <button
                      onClick={() => setAttendanceView('history')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        attendanceView === 'history'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      View History
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {attendanceView === 'today' && (
                <div className="space-y-4">
                  {batchAttendance.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No students found for this batch and date.</p>
                    </div>
                  ) : (
                    batchAttendance.map((studentData) => (
                      <div
                        key={studentData.enrollment._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {studentData.student.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                ID: {studentData.student.studentId} • {studentData.student.phone}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  Sessions: {studentData.enrollment.sessionsAttended}/{studentData.enrollment.sessionsTotal}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Remaining: {studentData.remainingSessions}
                                </span>
                                {studentData.remainingSessions === 0 && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                                    <Award className="w-3 h-3 mr-1" />
                                    Completed
                                  </span>
                                )}
                                {studentData.remainingSessions <= 3 && studentData.remainingSessions > 0 && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                                    <Bell className="w-3 h-3 mr-1" />
                                    Low Sessions
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {studentData.attendance ? (
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${
                                  studentData.attendance.status === 'present' ? 'text-green-600' :
                                  studentData.attendance.status === 'absent' ? 'text-red-600' :
                                  studentData.attendance.status === 'late' ? 'text-yellow-600' :
                                  'text-blue-600'
                                }`}>
                                  {studentData.attendance.status.charAt(0).toUpperCase() + studentData.attendance.status.slice(1)}
                                </span>
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'present')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Mark Present"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'absent')}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Mark Absent"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'late')}
                                  className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                  title="Mark Late"
                                >
                                  <Clock className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'present')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'absent')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                                >
                                  Absent
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'late')}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                                >
                                  Late
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(studentData.enrollment._id, 'excused')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                >
                                  Excused
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{studentData.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${studentData.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {attendanceView === 'history' && (
                <div className="space-y-4">
                  {attendanceHistory.length > 0 ? (
                    attendanceHistory.map((session, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">
                              {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">{session.summary.present}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-600">{session.summary.absent}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-yellow-600">{session.summary.late}</span>
                            </span>
                            <span className="text-gray-500">Total: {session.summary.total}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                           {session.attendanceRecords.map((record: any, recordIndex: number) => (
                            <div key={recordIndex} className="bg-white rounded-md p-3 border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {record.student.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {record.student.studentId}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </div>
                              {record.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic">
                                  {record.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Attendance Rate */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Attendance Rate:</span>
                            <span className="font-semibold text-gray-900">
                              {session.summary.total > 0 
                                ? Math.round((session.summary.present / session.summary.total) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${session.summary.total > 0 
                                  ? (session.summary.present / session.summary.total) * 100 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance History</h3>
                      <p className="text-gray-500">
                        No attendance records found for this batch. Start marking attendance to see history here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        )}

        {/* No Batches State */}
        {coachBatches.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Assigned</h3>
            <p className="text-gray-600 mb-4">
              You haven't been assigned to any batches yet. Contact your administrator to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;