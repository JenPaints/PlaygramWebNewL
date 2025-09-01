import { useEffect } from 'react';
import { useAdminDashboard } from '../../hooks/useRealTimeData';
import { analytics } from '../../services/analytics';

const AdminTest = () => {
  const { metrics, users, activities } = useAdminDashboard();

  useEffect(() => {
    console.log('Admin Test Component Loaded');
    console.log('Metrics:', metrics);
    console.log('Users:', users);
    console.log('Activities:', activities);
  }, [metrics, users, activities]);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Metrics</h2>
          <p>Total Users: {metrics.totalUsers}</p>
          <p>Active Users: {metrics.activeUsers}</p>
          <p>Revenue: ₹{metrics.revenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
          {users.slice(0, 3).map(user => (
            <div key={user.id} className="mb-2">
              <p className="text-sm">{user.name} - {user.sport}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          {activities.slice(0, 3).map(activity => (
            <div key={activity.id} className="mb-2">
              <p className="text-sm">{activity.message}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          analytics.trackEvent('test_button_click', {
            test: true,
            timestamp: Date.now()
          });
          console.log('Test button clicked - Analytics event sent');
        }}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
      >
        Test Analytics
      </button>
    </div>
  );
};

export default AdminTest;