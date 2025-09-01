import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CircleDot, Activity, Zap, Waves } from "lucide-react";
import { cn } from "../lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: {
    _id: string;
    name: string;
    price: number;
    trialPrice: number;
    features: string[];
  } | null;
  bookingType: 'trial' | 'enrollment';
}

// Hook to detect clicks outside of a component
const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: Function
) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};

const BookingModal = ({ isOpen, onClose, sport, bookingType }: BookingModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const modalRef = useRef<HTMLDivElement>(null);
  useOutsideClick(modalRef, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleBooking = async () => {
    if (!sport || !guestInfo.name || !guestInfo.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call for demo purposes
    setTimeout(() => {
      if (bookingType === 'trial') {
        toast.success("Free trial booked successfully! We'll contact you soon.");
      } else {
        toast.success("Enrollment successful! Welcome to the program.");
      }
      setGuestInfo({ name: '', email: '', phone: '' });
      onClose();
      setIsSubmitting(false);
    }, 1500);
  };

  if (!sport) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(10px)"
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)"
          }}
          className="fixed [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            ref={modalRef}
            className={cn(
              "min-h-[50%] max-h-[90%] max-w-2xl w-full bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-2xl relative z-50 flex flex-col overflow-hidden mx-4"
            )}
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: 40,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotateX: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 15,
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 group z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 hover:text-white h-5 w-5 group-hover:scale-125 group-hover:rotate-3 transition duration-200"
              >
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="flex flex-col flex-1 p-6 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-white">
                    {sport.name === 'Football' && <CircleDot className="w-6 h-6" />}
                    {sport.name === 'Basketball' && <Activity className="w-6 h-6" />}
                    {sport.name === 'Badminton' && <Zap className="w-6 h-6" />}
                    {sport.name === 'Swimming' && <Waves className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {bookingType === 'trial' ? 'Book Free Trial' : 'Enroll Now'}
                    </h2>
                    <p className="text-gray-400 text-sm">{sport.name} Training Program</p>
                  </div>
                </div>
              </div>

              {/* Guest Information Form */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-3">Your Information:</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">
                    {bookingType === 'trial' ? 'Trial Session' : 'Monthly Program'}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">
                      ₹{bookingType === 'trial' ? (sport.trialPrice || 0) : sport.price}
                    </span>
                    <span className="text-gray-400 text-xs">
                      /{bookingType === 'trial' ? 'session' : 'month'}
                    </span>
                  </div>
                </div>

                {bookingType === 'trial' && (sport.trialPrice === 0 || !sport.trialPrice) && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">Completely Free!</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-3">What's Included:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sport.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
                <h4 className="text-white font-medium mb-2 text-sm">Important Notes:</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Our team will contact you within 24 hours to schedule your session</li>
                  <li>• Please bring comfortable athletic wear and water bottle</li>
                  <li>• Sessions can be rescheduled with 24-hour notice</li>
                  {bookingType === 'trial' && (
                    <li>• No commitment required - try before you enroll</li>
                  )}
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 bg-gray-800/50 border-t border-gray-700">
              <div className="flex space-x-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 border-2 border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-500 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBooking}
                  disabled={isSubmitting || !guestInfo.name || !guestInfo.email}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Confirm ${bookingType === 'trial' ? 'Trial' : 'Enrollment'}`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
