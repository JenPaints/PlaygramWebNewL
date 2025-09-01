import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Clock, Activity, Eye, MousePointer } from 'lucide-react';

interface UserActivity {
  id: string;
  user: string;
  action: string;
  page: string;
  location: string;
  timestamp: number;
  duration: number;
  status: 'active' | 'idle' | 'offline';
}

const LiveUserActivity = () => {
  const [activities, setActivities] = useState<UserActivity[]>([
    {
      id: '1',
      user: 'Rahul Sharma',
      action: 'Viewing',
      page: 'Football Training',
      location: 'Mumbai, India',
      timestamp: Date.now() - 120000,
      duration: 245,
      status: 'active'
    },
    {
      id: '2',
      user: 'Priya Patel',
      action: 'Booking',
      page: 'Swimming Lessons',
      location: 'Delhi, India',
      timestamp: Date.now() - 300000,
      duration: 180,
      status: 'active'
    },
    {
      id: '3',
      user: 'Arjun Kumar',
      action: 'Reading',
      page: 'Basketball Guide',
      location: 'Bangalore, India',
      timestamp: Date.now() - 600000,
      duration: 320,
      status: 'idle'
    }
  ]);

  const [totalActiveUsers, setTotalActiveUsers] = useState(89);

  // Simulate real-time activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update existing activities
      setActivities(prev => prev.map(activity => ({
        ...activity,
        duration: activity.status === 'active' ? activity.duration + 5 : activity.duration,
        status: Math.random() > 0.8 ? 
          (activity.status === 'active' ? 'idle' : 'active') : 
          activity.status
      })));

      // Occasionally add new activity
      if (Math.random() < 0.3) {
        const users = ['Sneha Reddy', 'Vikram Singh', 'Anita Gupta', 'Rohit Mehta', 'Kavya Nair'];
        const actions = ['Viewing', 'Booking', 'Reading', 'Downloading', 'Sharing'];
        const pages = ['Football Training', 'Swimming Lessons', 'Basketball Guide', 'Badminton Tips', 'Pricing Plans'];
        const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India', 'Pune, India'];

        const newActivity: UserActivity = {
          id: Date.now().toString(),
          user: users[Math.floor(Math.random() * users.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          page: pages[Math.floor(Math.random() * pages.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          timestamp: Date.now(),
          duration: Math.floor(Math.random() * 60) + 10,
          status: 'active'
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }

      // Update total active users
      setTotalActiveUsers(prev => Math.max(50, prev + Math.floor(Math.random() * 10 - 5)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'idle':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'offline':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Viewing':
        return <Eye className="w-4 h-4" />;
      case 'Booking':
        return <MousePointer className="w-4 h-4" />;
      case 'Reading':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const activeCount = activities.filter(a => a.status === 'active').length;
  const idleCount = activities.filter(a => a.status === 'idle').length;

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Live User Activity</h3>
          <p className="text-gray-400 text-sm">Real-time user interactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{totalActiveUsers}</p>
            <p className="text-gray-400 text-xs">Online Now</p>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          <p className="text-gray-400 text-sm">Active</p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{idleCount}</p>
          <p className="text-gray-400 text-sm">Idle</p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#89D3EC]">
            {Math.floor(activities.reduce((acc, a) => acc + a.duration, 0) / activities.length)}s
          </p>
          <p className="text-gray-400 text-sm">Avg Time</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">{activity.user}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                      {getActionIcon(activity.action)}
                      <span>{activity.action} {activity.page}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(activity.duration)} • {formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Real-time Activity Pulse */}
      <div className="mt-6 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-4 h-4 bg-green-400 rounded-full"
        />
        <span className="ml-2 text-gray-400 text-sm">
          {activities.filter(a => a.status === 'active').length} users actively browsing
        </span>
      </div>
    </div>
  );
};

export default LiveUserActivity;