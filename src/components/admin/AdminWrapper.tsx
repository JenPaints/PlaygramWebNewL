import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import ProfessionalAdminDashboard from './ProfessionalAdminDashboard';
import AdminDebug from './AdminDebug';
import { useAuth } from '../auth/AuthContext';
import { canAccessAdminDashboard } from '../../utils/adminCheck';

// Debug logging
console.log('AdminWrapper loaded');

const AdminWrapper = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const { user, isAuthenticated: userAuthenticated } = useAuth();

  // Determine if user has admin access
  const hasAdminAccess = userAuthenticated && canAccessAdminDashboard(user);
  
  // Check for legacy admin authentication
  const [legacyAdminAuth, setLegacyAdminAuth] = useState(false);

  useEffect(() => {
    // Check for debug mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      setDebugMode(true);
    }
    
    // Check for legacy admin authentication
    const authStatus = localStorage.getItem('adminAuthenticated');
    console.log('AdminWrapper - localStorage adminAuthenticated:', authStatus);
    console.log('AdminWrapper - userAuthenticated:', userAuthenticated);
    console.log('AdminWrapper - user:', user);
    console.log('AdminWrapper - hasAdminAccess:', userAuthenticated && canAccessAdminDashboard(user));
    
    setLegacyAdminAuth(authStatus === 'true');
    
    setIsLoading(false);
  }, [userAuthenticated, user]);

  const handleLogin = (authenticated: boolean) => {
    setLegacyAdminAuth(authenticated);
    if (authenticated) {
      localStorage.setItem('adminAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setLegacyAdminAuth(false);
  };

  // Determine if user is authenticated for admin access
  const isAuthenticated = hasAdminAccess || legacyAdminAuth;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#89D3EC]"></div>
      </div>
    );
  }

  console.log('AdminWrapper render - isAuthenticated:', isAuthenticated, 'debugMode:', debugMode);
  console.log('AdminWrapper render - hasAdminAccess:', hasAdminAccess, 'legacyAdminAuth:', legacyAdminAuth);

  // Debug mode - show debug panel
  if (debugMode) {
    return <AdminDebug />;
  }

  // Check if user is logged in but not admin
  if (userAuthenticated && !canAccessAdminDashboard(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md text-center">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            You don't have permission to access the admin dashboard. 
            Only administrators can access this area.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Your account type: <span className="text-blue-400">{user?.userType || 'Unknown'}</span>
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <ProfessionalAdminDashboard onLogout={handleLogout} />
      )}
    </>
  );
};

export default AdminWrapper;