import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, User, Phone, CheckCircle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { analytics } from "../services/analytics";

interface WaitlistPageProps {
  onBack: () => void;
}

const WaitlistPage = ({ onBack }: WaitlistPageProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sport: "football"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Track the waitlist signup
      analytics.trackEvent('waitlist_signup', {
        sport: formData.sport,
        source: 'download_app_button'
      });
      
      // Submit to Convex backend
      await addToWaitlist({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        sport: formData.sport,
        source: 'download_app_button'
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      if (error instanceof Error && error.message.includes("already registered")) {
        setErrors({ email: "This email is already registered in our waitlist" });
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{
        background: 'radial-gradient(ellipse at top left, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(137, 211, 236, 0.08) 0%, transparent 50%), linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">You're on the list!</h1>
          <p className="text-gray-300 mb-8 leading-relaxed text-sm sm:text-base">
            Thanks for joining our waitlist! We'll notify you as soon as the Playgram app is available for download.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-base touch-manipulation"
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 px-4 pb-8" style={{
      background: 'radial-gradient(ellipse at top left, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(137, 211, 236, 0.08) 0%, transparent 50%), linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
    }}>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6 sm:mb-8 p-2 -ml-2 touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Join the <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">Waitlist</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto px-2">
            Be the first to experience the future of sports coaching. Get notified when the Playgram app launches!
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-lg bg-white/5 border border-gray-700/30 rounded-2xl p-4 sm:p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#89D3EC] transition-colors text-base touch-manipulation`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#89D3EC] transition-colors text-base touch-manipulation`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-800/50 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#89D3EC] transition-colors text-base touch-manipulation`}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Sport Selection */}
            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                Primary Sport Interest
              </label>
              <select
                value={formData.sport}
                onChange={(e) => handleInputChange('sport', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#89D3EC] transition-colors text-base touch-manipulation appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="badminton">Badminton</option>
                <option value="swimming">Swimming</option>
                <option value="general">General Interest</option>
              </select>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base sm:text-lg touch-manipulation min-h-[48px]"
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Joining Waitlist...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Join Waitlist
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#89D3EC] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-white text-sm sm:text-base">Early Access</p>
                  <p className="text-xs sm:text-sm">Get the app before public launch</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#D7243F] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-white text-sm sm:text-base">Exclusive Updates</p>
                  <p className="text-xs sm:text-sm">Stay informed about new features</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WaitlistPage;