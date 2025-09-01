import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Settings, CircleDot, Activity, Zap, Waves, Users, BookOpen } from "lucide-react";
import { useAuth } from './auth/AuthContext';
import CoachDashboard from './coach/CoachDashboard';
import CoachAssignments from './admin/CoachAssignments';

// Mock bookings data for demo
const mockBookings = [
  {
    _id: "1",
    _creationTime: Date.now() - 86400000, // 1 day ago
    type: "trial",
    status: "confirmed",
    guestName: "John Doe",
    guestEmail: "john@example.com",
    scheduledDate: Date.now() + 86400000, // 1 day from now
    sport: { name: "Football" }
  },
  {
    _id: "2", 
    _creationTime: Date.now() - 172800000, // 2 days ago
    type: "enrollment",
    status: "pending",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    scheduledDate: Date.now() + 172800000, // 2 days from now
    sport: { name: "Basketball" }
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'coach-assignments'>('bookings');
  const [allBookings, setAllBookings] = useState(mockBookings);
  
  // If user is a coach, show coach dashboard
  if (user?.userType === 'coach') {
    return <CoachDashboard />;
  }

  const handleCancelBooking = async (bookingId: string) => {
    // Simulate cancellation
    setAllBookings(prev => 
      prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: "cancelled" }
          : booking
      )
    );
    toast.success("Booking cancelled successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/20 border-green-400';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20 border-red-400';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-300 text-lg">View all training sessions and bookings</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-xl p-1">
          {[
             { id: 'bookings', label: 'All Bookings', icon: <Calendar className="w-5 h-5" /> },
             ...(user?.userType === 'admin' ? [{ id: 'coach-assignments', label: 'Coach Assignments', icon: <Users className="w-5 h-5" /> }] : []),
             { id: 'profile', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
           ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">All Training Sessions</h2>
              
              {allBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
                  <p className="text-gray-400 mb-6">No training sessions have been booked yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBookings.map((booking) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-[#89D3EC]/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">
                            {booking.sport?.name === 'Football' && <CircleDot className="w-8 h-8 text-white" />}
                            {booking.sport?.name === 'Basketball' && <Activity className="w-8 h-8 text-white" />}
                            {booking.sport?.name === 'Badminton' && <Zap className="w-8 h-8 text-white" />}
                            {booking.sport?.name === 'Swimming' && <Waves className="w-8 h-8 text-white" />}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {booking.sport?.name} - {booking.type === 'trial' ? 'Free Trial' : 'Full Program'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-1">
                              Guest: {booking.guestName || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm mb-1">
                              Email: {booking.guestEmail || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm mb-2">
                              Booked on {formatDate(booking._creationTime)}
                            </p>
                            {booking.scheduledDate && (
                              <p className="text-[#89D3EC] text-sm">
                                Scheduled: {formatDate(booking.scheduledDate)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          
                          {booking.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                            >
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Coach Assignments Tab */}
        {activeTab === 'coach-assignments' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CoachAssignments />
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">App Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    <Settings className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Application Settings</h3>
                    <p className="text-gray-400">Manage app preferences and configurations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Notification Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded bg-gray-700 border-gray-600" defaultChecked />
                        <span className="text-gray-300">Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded bg-gray-700 border-gray-600" defaultChecked />
                        <span className="text-gray-300">Push notifications</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                        <span className="text-gray-300">Push notifications</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Display Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Theme</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                          <option>Dark Mode</option>
                          <option>Light Mode</option>
                          <option>Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Language</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  Save Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
