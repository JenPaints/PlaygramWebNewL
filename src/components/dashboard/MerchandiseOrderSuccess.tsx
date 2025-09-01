import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface MerchandiseOrderSuccessProps {
  orderNumber: string;
  onClose: () => void;
}

const MerchandiseOrderSuccess: React.FC<MerchandiseOrderSuccessProps> = ({
  orderNumber,
  onClose
}) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto p-6 text-center min-h-screen flex flex-col justify-center items-center bg-white w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <img 
            src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png" 
            alt="Playgram Logo" 
            className="w-32 h-32 mx-auto object-contain"
          />
        </motion.div>

        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-48 h-48 mx-auto">
            <DotLottieReact
              src="https://lottie.host/1858f20a-3dc6-4739-ab09-405ae35cea45/K5uBIyXRyF.lottie"
              loop
              autoplay
            />
          </div>
        </motion.div>

        {/* Order Complete Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold text-gray-900">
            Order Complete!
          </h2>
          <p className="text-gray-600 text-lg">
            Your order #{orderNumber} has been successfully placed.
          </p>
          <p className="text-gray-500 text-base">
            Items will be available for collection at your next session.
          </p>
          
          {/* Auto-close countdown */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-sm text-gray-500 mt-4"
          >
            This page will close automatically in a few seconds...
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MerchandiseOrderSuccess;