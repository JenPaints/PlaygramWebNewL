import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "./auth/AuthContext";

interface NavbarProps {
  currentView: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'contact' | 'dashboard' | 'coaching';
  setCurrentView: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'contact' | 'dashboard' | 'coaching') => void;
}

const Navbar = ({ setCurrentView }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCoachingDropdownOpen, setIsCoachingDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <div className="flex items-center">
              <img
                src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_6671-removebg-preview.png"
                alt="Playgram Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentView('home')}
              className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
            >
              Home
            </motion.button>

            {/* Coaching Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCoachingDropdownOpen(true)}
              onMouseLeave={() => setIsCoachingDropdownOpen(false)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors font-medium text-sm"
              >
                <span>Coaching</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCoachingDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isCoachingDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg border border-gray-700"
                    style={{
                      background: 'rgba(0, 0, 0, 0.95)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="py-2">
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        onClick={() => {
                          setCurrentView('football');
                          setIsCoachingDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-white hover:text-gray-300 transition-colors text-sm"
                      >
                        Football
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        onClick={() => {
                          setCurrentView('basketball');
                          setIsCoachingDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-white hover:text-gray-300 transition-colors text-sm"
                      >
                        Basketball
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentView('contact')}
              className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
            >
              Contact Us
            </motion.button>

            {/* Location with City Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCityDropdownOpen(true)}
              onMouseLeave={() => setIsCityDropdownOpen(false)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-1 text-white text-sm cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>{selectedCity}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.div>

              {/* City Dropdown Menu */}
              <AnimatePresence>
                {isCityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md shadow-lg border border-gray-700 overflow-hidden"
                    style={{
                      background: 'rgba(20, 20, 20, 0.98)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="py-2">
                      {/* Bangalore */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => {
                          setSelectedCity('Bangalore');
                          setIsCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors"
                      >
                        <img
                          src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133706174.png"
                          alt="Bangalore"
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-cyan-400 font-medium text-sm">Bangalore</span>
                      </motion.button>

                      {/* Mumbai */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => {
                          setSelectedCity('Mumbai');
                          setIsCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors"
                      >
                        <img
                          src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133802425.png"
                          alt="Mumbai"
                          className="w-4 h-4 object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-300 text-sm">Mumbai</span>
                          <span className="text-gray-500" style={{ fontSize: '10px' }}>(Coming Soon)</span>
                        </div>
                      </motion.button>

                      {/* Delhi */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => {
                          setSelectedCity('Delhi');
                          setIsCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors"
                      >
                        <img
                          src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133812708.png"
                          alt="Delhi"
                          className="w-4 h-4 object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-300 text-sm">Delhi</span>
                          <span className="text-gray-500" style={{ fontSize: '10px' }}>(Coming Soon)</span>
                        </div>
                      </motion.button>

                      {/* Mysore */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => {
                          setSelectedCity('Mysore');
                          setIsCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors"
                      >
                        <img
                          src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-16_133747991.png"
                          alt="Mysore"
                          className="w-4 h-4 object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-300 text-sm">Mysore</span>
                          <span className="text-gray-500" style={{ fontSize: '10px' }}>(Coming Soon)</span>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('waitlist')}
                className="px-6 py-2 rounded-full text-white font-medium text-sm hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #E11C41 0%, #86D5F0 100%)'
                }}
              >
                Download the App
              </motion.button>

              {/* User Authentication Section */}
              {isAuthenticated ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 text-white cursor-pointer bg-white/10 px-3 py-2 rounded-full"
                  >
                    <User size={16} />
                    <span className="text-sm font-medium">
                      {user?.name || user?.fullName || user?.phoneNumber?.slice(-4) || 'User'}
                    </span>
                    <ChevronDown size={14} />
                  </motion.div>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-white/10 py-2"
                      >
                        <button
                          onClick={() => setCurrentView('dashboard')}
                          className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                        >
                          <User size={16} />
                          <span>Dashboard</span>
                        </button>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors flex items-center space-x-2"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 bg-transparent border-2 border-blue-400 text-white hover:bg-blue-400/10"
                >
                  <img
                    src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                    alt="PlayGram Logo"
                    className="w-4 h-4 object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 1px #E11C41)'
                    }}
                  />
                  <span>Login to Playgram</span>
                </motion.button>
              )}
            </div>
          </div>



          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setIsOpen(false);
                }}
                className="block text-white hover:text-gray-300 transition-colors font-medium"
              >
                Home
              </button>

              {/* Mobile Coaching Section */}
              <div className="space-y-2">
                <div className="text-white font-medium">Coaching</div>
                <div className="pl-4 space-y-2">
                  <button
                    onClick={() => {
                      setCurrentView('football');
                      setIsOpen(false);
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Football
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('basketball');
                      setIsOpen(false);
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Basketball
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentView('contact');
                  setIsOpen(false);
                }}
                className="block text-white hover:text-gray-300 transition-colors font-medium"
              >
                Contact Us
              </button>

              {/* Mobile Location */}
              <div className="flex items-center space-x-2 text-white text-sm py-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedCity}</span>
              </div>



              {/* Mobile Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentView('waitlist');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-full text-white font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #E11C41 0%, #86D5F0 100%)'
                  }}
                >
                  Download the App
                </motion.button>

                {/* Mobile User Authentication */}
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2 w-full">
                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 text-white hover:text-gray-300 transition-colors font-medium bg-white/10 px-4 py-3 rounded-full"
                    >
                      <User size={16} />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 text-red-400 hover:text-red-300 transition-colors font-medium px-4 py-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentView('dashboard');
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-full font-medium transition-all duration-300 bg-transparent border-2 border-blue-400 text-white hover:bg-blue-400/10"
                  >
                    <img
                      src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                      alt="PlayGram Logo"
                      className="w-4 h-4 object-contain"
                      style={{
                        filter: 'drop-shadow(0 0 1px #E11C41)'
                      }}
                    />
                    <span>Login to Playgram</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
