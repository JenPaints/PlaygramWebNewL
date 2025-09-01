import React from 'react';
import { motion } from 'framer-motion';
import { TrialStepProps, TrialConfirmationData } from '../types';

interface ConfirmationStepProps extends TrialStepProps {
    confirmationData: TrialConfirmationData;
    onNext: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
    confirmationData,
    trialState,
    onNext
}) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleWhatsAppContact = () => {
        const message = `Hi! I've booked a free trial for ${confirmationData.sport} on ${formatDate(confirmationData.date)}. Booking ID: ${confirmationData.bookingId}`;
        const whatsappUrl = `https://wa.me/917888388817?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleAddToCalendar = () => {
        const startDate = new Date(confirmationData.date);
        startDate.setHours(10, 0, 0); // 10:00 AM
        const endDate = new Date(confirmationData.date);
        endDate.setHours(11, 30, 0); // 11:30 AM

        const formatDateForCalendar = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`PlayGram ${confirmationData.sport.charAt(0).toUpperCase() + confirmationData.sport.slice(1)} Trial`)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(`Free trial session for ${confirmationData.sport} at PlayGram. Booking ID: ${confirmationData.bookingId}`)}&location=${encodeURIComponent(confirmationData.courtLocation)}`;
        
        window.open(calendarUrl, '_blank');
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            {/* Success Animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mb-8"
            >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        className="text-4xl text-green-600"
                    >
                        ✅
                    </motion.div>
                </div>
                
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-gray-900 mb-4"
                >
                    Trial Booked Successfully!
                </motion.h3>
                
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-600"
                >
                    Your free {confirmationData.sport} trial has been confirmed
                </motion.p>
            </motion.div>

            {/* Booking Details Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border-2 border-green-200 p-8 mb-8 shadow-lg"
            >
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-green-100 p-3 rounded-full">
                        <span className="text-2xl">
                            {confirmationData.sport === 'football' ? '⚽' : '🏀'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                            <div className="font-semibold text-gray-900">{confirmationData.bookingId}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Sport</div>
                            <div className="font-semibold text-gray-900 capitalize">{confirmationData.sport}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Date</div>
                            <div className="font-semibold text-gray-900">{formatDate(confirmationData.date)}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Time</div>
                            <div className="font-semibold text-gray-900">{confirmationData.time}</div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Location</div>
                        <div className="font-semibold text-gray-900">{confirmationData.courtLocation}</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Coach Details</div>
                        <div className="font-semibold text-gray-900">{confirmationData.coachDetails.name}</div>
                        <div className="text-sm text-gray-600">{confirmationData.coachDetails.contact}</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Student Details</div>
                        <div className="font-semibold text-gray-900">{trialState.userDetails?.name}</div>
                        <div className="text-sm text-gray-600">
                            Age: {trialState.userDetails?.age} | Phone: +91 {trialState.userPhone}
                        </div>
                        <div className="text-sm text-gray-600">{trialState.userDetails?.email}</div>
                    </div>
                </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8 text-left"
            >
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    What to Bring & Expect
                </h4>
                <ul className="space-y-2">
                    {confirmationData.instructions.map((instruction, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="flex items-start text-blue-800 text-sm"
                        >
                            <span className="mr-2 text-blue-600">•</span>
                            <span>{instruction}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCalendar}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                    <span>📅</span>
                    <span>Add to Calendar</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppContact}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                    <span>💬</span>
                    <span>Contact Coach</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        const bookingDetails = `
Booking Confirmation - PlayGram Free Trial

Booking ID: ${confirmationData.bookingId}
Sport: ${confirmationData.sport.charAt(0).toUpperCase() + confirmationData.sport.slice(1)}
Date: ${formatDate(confirmationData.date)}
Time: ${confirmationData.time}
Location: ${confirmationData.courtLocation}
Coach: ${confirmationData.coachDetails.name} (${confirmationData.coachDetails.contact})

Student: ${trialState.userDetails?.name}
Age: ${trialState.userDetails?.age}
Phone: +91 ${trialState.userPhone}
Email: ${trialState.userDetails?.email}

Instructions:
${confirmationData.instructions.map(instruction => `• ${instruction}`).join('\n')}
                        `.trim();

                        navigator.clipboard.writeText(bookingDetails);
                        // You could add a toast notification here
                    }}
                    className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                    <span>📋</span>
                    <span>Copy Details</span>
                </motion.button>
            </motion.div>

            {/* Close Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNext}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
                Done
            </motion.button>

            {/* Support Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-6 text-center text-sm text-gray-600"
            >
                <p>Need help? Contact us at <span className="font-semibold">+91 7888388817</span></p>
                <p>or email <span className="font-semibold">support@playgram.com</span></p>
            </motion.div>
        </div>
    );
};

export default ConfirmationStep;