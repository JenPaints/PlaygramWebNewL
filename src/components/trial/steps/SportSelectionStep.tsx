import React from 'react';
import { motion } from 'framer-motion';
import { TrialStepProps, TrialSport } from '../types';

const SportSelectionStep: React.FC<TrialStepProps> = ({
    onNext,
    trialState,
    updateState
}) => {
    const sports = [
        {
            id: 'football' as TrialSport,
            name: 'Football',
            icon: '⚽',
            description: 'Learn football fundamentals with professional coaching',
            image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png',
            features: ['Professional Coaching', 'Premium Ground', 'Age-appropriate Training']
        },
        {
            id: 'basketball' as TrialSport,
            name: 'Basketball',
            icon: '🏀',
            description: 'Master basketball skills with expert guidance',
            image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png',
            features: ['Expert Coaching', 'Indoor Court', 'Skill Development']
        }
    ];

    const handleSportSelect = (sport: TrialSport) => {
        updateState({
            selectedSport: sport,
            errors: { ...trialState.errors, sport: '' }
        });
        onNext();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Choose Your Sport
                </h3>
                <p className="text-lg text-gray-600">
                    Select the sport you'd like to try in your free trial session
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sports.map((sport, index) => (
                    <motion.div
                        key={sport.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`
                            relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                            ${trialState.selectedSport === sport.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                        `}
                        onClick={() => handleSportSelect(sport.id)}
                    >
                        {/* Sport Image */}
                        <div className="aspect-video rounded-xl overflow-hidden mb-4">
                            <img
                                src={sport.image}
                                alt={sport.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Sport Info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">{sport.icon}</span>
                                <h4 className="text-2xl font-bold text-gray-900">{sport.name}</h4>
                            </div>

                            <p className="text-gray-600">{sport.description}</p>

                            {/* Features */}
                            <div className="space-y-2">
                                {sport.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Select Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300
                                    ${trialState.selectedSport === sport.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSportSelect(sport.id);
                                }}
                            >
                                {trialState.selectedSport === sport.id ? 'Selected' : 'Select Sport'}
                            </motion.button>
                        </div>

                        {/* Selection Indicator */}
                        {trialState.selectedSport === sport.id && (
                            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Error Message */}
            {trialState.errors.sport && (
                <div className="mt-4 text-center text-red-600 text-sm">
                    {trialState.errors.sport}
                </div>
            )}

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <div className="text-blue-600 text-xl">ℹ️</div>
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Free Trial Details</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• One-time free trial per phone number</li>
                            <li>• Available only on Sundays</li>
                            <li>• 90-minute session with professional coach</li>
                            <li>• All equipment provided</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SportSelectionStep;