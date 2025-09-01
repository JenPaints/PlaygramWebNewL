import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginProps {
  onLogin: (isAuthenticated: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple authentication (in production, use proper auth)
    if (credentials.username === 'management@playgram.app' && credentials.password === 'Playgram@2025') {
      localStorage.setItem('adminAuthenticated', 'true');
      toast.success('Welcome to Playgram Admin Dashboard!');
      onLogin(true);
    } else {
      toast.error('Invalid credentials. Try admin/playgram2024');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Access Playgram Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
            <p className="text-gray-400 text-sm text-center">
              Demo Credentials:<br />
              <span className="text-[#89D3EC]">Username: management@playgram.app</span><br />
              <span className="text-[#89D3EC]">Password: Playgram@2025</span>
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('adminAuthenticated');
                toast.info('Admin localStorage cleared');
                window.location.reload();
              }}
              className="mt-2 w-full py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Admin Auth (Debug)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;