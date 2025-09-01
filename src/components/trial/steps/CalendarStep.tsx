import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrialStepProps } from '../types';

const CalendarStep: React.FC<TrialStepProps> = ({
    onNext,
    onBack,
    trialState,
    updateState
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate available Sundays for the next 8 weeks
    const availableSundays = useMemo(() => {
        const sundays = [];
        const today = new Date();
        const startDate = new Date(today);

        // Find next Sunday
        const daysUntilSunday = (7 - startDate.getDay()) % 7;
        if (daysUntilSunday === 0 && startDate.getHours() >= 12) {
            // If it's Sunday and past noon, start from next Sunday
            startDate.setDate(startDate.getDate() + 7);
        } else {
            startDate.setDate(startDate.getDate() + daysUntilSunday);
        }

        // Generate next 8 Sundays - all available since there's no capacity limit
        for (let i = 0; i < 8; i++) {
            const sunday = new Date(startDate);
            sunday.setDate(startDate.getDate() + (i * 7));

            // All Sundays are available since there's no student limit
            sundays.push({
                date: sunday,
                available: true, // Always available
                timeSlot: '10:00 AM - 11:30 AM',
                maxCapacity: null, // No capacity limit
                currentBookings: Math.floor(Math.random() * 15) + 5 // Show some activity for urgency
            });
        }

        return sundays;
    }, []);

    const handleDateSelect = (date: Date) => {
        updateState({
            selectedDate: date,
            errors: { ...trialState.errors, date: '' }
        });
    };

    const handleContinue = () => {
        if (!trialState.selectedDate) {
            updateState({
                errors: { ...trialState.errors, date: 'Please select a date for your trial' }
            });
            return;
        }
        onNext();
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return 'Not selected';

        // Ensure we have a proper Date object
        const dateObj = date instanceof Date ? date : new Date(date);

        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }

        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isDateSelected = (date: Date) => {
        if (!trialState.selectedDate) return false;

        // Ensure we have a proper Date object for comparison
        const selectedDateObj = trialState.selectedDate instanceof Date
            ? trialState.selectedDate
            : new Date(trialState.selectedDate);

        // Check if the selected date is valid
        if (isNaN(selectedDateObj.getTime())) return false;

        return selectedDateObj.toDateString() === date.toDateString();
    };

    // Calendar navigation
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    // Get calendar days for current month
    const getCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const calendarDays = getCalendarDays();
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Select Your Trial Date
                </h3>
                <p className="text-lg text-gray-600 mb-2">
                    Choose from available Sundays for your {trialState.selectedSport} trial
                </p>
                <div className="inline-flex items-center bg-orange-50 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="mr-2">⚡</span>
                    Slots filling up fast - Book yours today!
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar View */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h4 className="text-lg font-semibold text-gray-900">{monthYear}</h4>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                            const isSunday = day.getDay() === 0;
                            const isPast = day < new Date();
                            const availableSlot = availableSundays.find(slot =>
                                slot.date.toDateString() === day.toDateString()
                            );
                            const isAvailable = isSunday && availableSlot && !isPast;
                            const isSelected = isDateSelected(day);

                            return (
                                <button
                                    key={index}
                                    onClick={() => isAvailable && handleDateSelect(day)}
                                    disabled={!isAvailable || isPast}
                                    className={`
                                        aspect-square p-2 text-sm rounded-lg transition-all duration-200
                                        ${!isCurrentMonth
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : isSunday && isAvailable
                                                ? isSelected
                                                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200'
                                                    : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                                : isPast
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-100 rounded"></div>
                            <span className="text-gray-600">Available Sunday</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-600 rounded"></div>
                            <span className="text-gray-600">Selected</span>
                        </div>
                    </div>
                </div>

                {/* Available Slots List */}
                <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Available Slots</h4>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {availableSundays.map((slot, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`
                                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                    ${isDateSelected(slot.date)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                    }
                                `}
                                onClick={() => handleDateSelect(slot.date)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {formatDate(slot.date)}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {slot.timeSlot}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {slot.currentBookings} students already registered
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>

                                        {isDateSelected(slot.date) && (
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected Date Display */}
            {trialState.selectedDate && (
                <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3">
                        <div className="text-green-600 text-2xl">✅</div>
                        <div>
                            <h4 className="font-semibold text-green-900">Selected Date</h4>
                            <p className="text-green-800">
                                {formatDate(trialState.selectedDate)} at 10:00 AM - 11:30 AM
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {trialState.errors.date && (
                <div className="mt-4 text-center text-red-600 text-sm">
                    {trialState.errors.date}
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                    ← Back to Sport Selection
                </button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinue}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                    Continue to Phone Verification
                </motion.button>
            </div>
        </div>
    );
};

export default CalendarStep;