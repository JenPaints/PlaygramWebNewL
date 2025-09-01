import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  MapPin
} from 'lucide-react';
import { SessionSchedule, ConfirmationData } from '../types';

interface SessionScheduleViewProps {
  confirmationData: ConfirmationData;
  onSessionSelect?: (session: SessionSchedule) => void;
}

export const SessionScheduleView: React.FC<SessionScheduleViewProps> = ({
  confirmationData,
  onSessionSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<SessionSchedule | null>(null);

  // Get sessions for the current month
  const getSessionsForMonth = (date: Date) => {
    return confirmationData.schedule.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getMonth() === date.getMonth() && 
             sessionDate.getFullYear() === date.getFullYear();
    });
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const sessionsThisMonth = getSessionsForMonth(currentMonth);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const sessionsOnDate = sessionsThisMonth.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        sessions: sessionsOnDate,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Format time for display
  const formatTime = (time: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(`2000-01-01T${time}`));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Coach Details */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Coach Details
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Coach Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900">
                {confirmationData.coachDetails.name}
              </h4>
              <p className="text-gray-600 mb-2">Professional Football Coach</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>5+ Years Experience</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>UEFA Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">Contact Information</h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{confirmationData.coachDetails.contact}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">coach@playgram.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Specializations */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Specializations</h5>
          <div className="flex flex-wrap gap-2">
            {['Ball Control', 'Shooting Technique', 'Tactical Awareness', 'Physical Conditioning'].map((skill) => (
              <span 
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Session Schedule Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Session Schedule
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {monthName}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[80px] p-2 border border-gray-100 rounded-lg
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${day.isToday ? 'text-blue-600' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              {day.sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    onSessionSelect?.(session);
                  }}
                  className={`
                    text-xs p-1 rounded cursor-pointer mb-1
                    ${getStatusColor(session.status)}
                    hover:opacity-80 transition-opacity
                  `}
                >
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(session.startTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Session Management Interface */}
      {selectedSession && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Session Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p className="text-gray-600">
                    {new Date(selectedSession.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p className="text-gray-600">
                    {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Coach</p>
                  <p className="text-gray-600">{confirmationData.coachDetails.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full ${getStatusColor(selectedSession.status).replace('text-', 'bg-').split(' ')[0]}`}></div>
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-gray-600 capitalize">{selectedSession.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Actions */}
          {selectedSession.status === 'scheduled' && (
            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Join Session
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Reschedule
              </button>
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                Cancel Session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionScheduleView;