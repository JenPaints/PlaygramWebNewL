import React from 'react';
import { StepComponentProps, CourtDetails, TimeSlot } from '../types';
import { formatTimeRange } from '../../../utils/timeUtils';

// Football court data from FootballPage - using actual venue information
const footballCourtData: CourtDetails = {
  name: "HSR Football Court",
  location: "HSR Layout, Bangalore",
  facilities: [
    "Professional Football Ground",
    "Quality Training Equipment",
    "Changing Facilities",
    "Water Stations"
  ],
  amenities: [
    "Free Parking",
    "Restrooms",
    "Spectator Area",
    "Equipment Storage"
  ],
  specifications: {
    size: "Standard Football Field",
    surface: "Well-maintained Grass",
    lighting: "Adequate Lighting"
  },
  timeSlots: [
    {
      id: "evening-1",
      startTime: "17:00",
      endTime: "18:30",
      available: true,
      coachName: "Professional Coach",
      recommended: true
    }
  ],
  images: [
    "https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png"
  ]
};

const CourtDetailsStep: React.FC<StepComponentProps> = ({
  onNext,
  onBack,
  enrollmentState,
  updateState
}) => {
  const courtData = footballCourtData;

  const handleContinue = () => {
    // Update state with court selection and proceed to pricing
    updateState({
      enrollmentData: {
        ...enrollmentState.enrollmentData,
        courtLocation: courtData.location
      }
    });
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Training Facility Details
        </h2>
        <p className="text-gray-600">
          Quality football training at HSR Layout with professional coaching
        </p>
      </div>

      {/* Court Overview */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{courtData.name}</h3>
            <p className="text-gray-600 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {courtData.location}
            </p>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 w-16">Size:</span>
            <span className="text-gray-600">{courtData.specifications.size}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 w-16">Surface:</span>
            <span className="text-gray-600">{courtData.specifications.surface}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 w-16">Lighting:</span>
            <span className="text-gray-600">{courtData.specifications.lighting}</span>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Training Facilities */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Training Facilities
          </h4>
          <div className="space-y-2">
            {courtData.facilities.slice(0, 4).map((facility, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {facility}
              </div>
            ))}
          </div>
        </div>

        {/* Available Time Slots */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available Training Slots
          </h4>
          <div className="space-y-2">
            {courtData.timeSlots.filter(slot => slot.available).slice(0, 3).map((slot) => (
              <div key={slot.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {slot.coachName}
                  </div>
                </div>
                {slot.recommended && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={handleContinue}
          className="bg-transparent border-2 border-black font-semibold py-3 px-8 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
          style={{
            color: 'black'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'black';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'black';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'black';
            e.currentTarget.style.borderColor = 'black';
          }}
        >
          Continue to Pricing
        </button>
      </div>
    </div>
  );
};

export default CourtDetailsStep;