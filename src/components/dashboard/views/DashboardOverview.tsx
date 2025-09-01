import React from 'react';
import { Calendar, MapPin, Trophy, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Carousel from '../../ui/Carousel';
import { StatsSkeleton, CardSkeleton, GridSkeleton, TextBlockSkeleton } from '../../ui/LoadingSkeleton';
import { DashboardView } from '../Dashboard';

interface DashboardOverviewProps {
  user: any;
  enrollments: any[];
  trialBookings: any[];
  setCurrentView?: (view: DashboardView) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ user, enrollments = [], trialBookings = [], setCurrentView }) => {
  
  const activeEnrollments = enrollments.filter(e => e.enrollmentStatus === 'active');
  const confirmedTrials = trialBookings.filter(t => t.status === 'confirmed');
  const completedTrials = trialBookings.filter(t => t.status === 'completed');
  const upcomingSessions = activeEnrollments.length + confirmedTrials.length;
  
  // Fetch featured merchandise data for Shop now section
  const merchandiseItems = useQuery(api.merchandise.getFeaturedMerchandise) || [];
  
  // Fetch carousel images
  const carouselImages = useQuery(api.carouselImages.getActiveCarouselImages) || [];
  
  // Calculate remaining sessions from active enrollments
  const totalRemainingSessions = activeEnrollments.reduce((total, enrollment) => {
    // Calculate remaining sessions as total sessions minus attended sessions
    const sessionsRemaining = Math.max(0, (enrollment.sessionsTotal || 0) - (enrollment.sessionsAttended || 0));
    return total + sessionsRemaining;
  }, 0);
  
  // Determine status color and message
  const getSessionStatus = (sessions: number) => {
    if (sessions > 20) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        message: 'Great! You have plenty of sessions',
        showButton: false
      };
    } else if (sessions > 5) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        message: 'Consider topping up soon',
        showButton: true
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        message: 'Time to enroll in more sessions!',
        showButton: true
      };
    }
  };
  
  const sessionStatus = getSessionStatus(totalRemainingSessions);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 hidden lg:block">Dashboard</h1>
            <p className="text-gray-600 mt-1 hidden lg:block">Welcome back to your sports journey!</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4 hidden lg:block">
            <p className="text-sm text-gray-500">Location</p>
            <div className="flex items-center text-gray-900">
              <MapPin size={16} className="mr-1" />
              <span>Bangalore</span>
            </div>
          </div>
        </div>
         {/* Carousel Section - Responsive for all devices */}
         <div className="mt-6">
           <Carousel 
             images={carouselImages}
             autoPlay={true}
             autoPlayInterval={5000}
             showDots={false}
             showArrows={true}
             height="h-48 sm:h-56 md:h-64 lg:h-80"
             className="w-full max-w-6xl shadow-2xl"
             imageClassName="rounded-lg lg:rounded-2xl"
           />
         </div>
      </div>

      {/* Quick Stats - Mobile App Style */}
      {carouselImages === undefined ? (
        <StatsSkeleton />
      ) : (
      <>
      {/* Statistics cards hidden as requested */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Active Enrollments</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{activeEnrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Upcoming Sessions</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{upcomingSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${sessionStatus.bgColor} rounded-xl flex items-center justify-center`}>
              <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${sessionStatus.iconColor}`} />
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Remaining Sessions</p>
            <p className={`text-2xl sm:text-3xl font-bold ${sessionStatus.color}`}>{totalRemainingSessions}</p>
            <p className={`text-xs sm:text-sm ${sessionStatus.color} font-semibold mt-1`}>{sessionStatus.message}</p>
          </div>
          {sessionStatus.showButton && (
            <button 
              onClick={() => setCurrentView?.('coaching')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div> */}
      </>
      )}

      {/* Free Trial Bookings - Mobile Optimized */}
      {trialBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Your Free Trial Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trialBookings.length > 0 ? trialBookings.map((trial, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-32 bg-gradient-to-r from-green-500 to-blue-500 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-lg capitalize">
                      {trial.sport} Free Trial
                    </h3>
                    <p className="text-white/80 text-sm">
                      {trial.status === 'confirmed' ? 'Upcoming' : 
                       trial.status === 'completed' ? 'Completed' : 
                       trial.status}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trial.status === 'confirmed' ? 'bg-green-400' :
                      trial.status === 'completed' ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`}>
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(trial.selectedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-medium text-gray-900">
                        {trial.courtLocation || 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        trial.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        trial.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trial.status.charAt(0).toUpperCase() + trial.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {trial.status === 'confirmed' && (
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      View Details
                    </button>
                  )}
                  {trial.status === 'completed' && (
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No trial bookings found</p>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Available Coaching - Mobile App Style */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
              alt="Playgram Logo"
              className="h-6 w-6 object-contain"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Coaching</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => setCurrentView?.('coaching')}>
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-27_010137194.png"
              alt="Football Coaching"
              className="w-full h-auto hover:scale-105 transition-transform duration-200"
            />
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => setCurrentView?.('coaching')}>
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-27_011243898.png"
              alt="Basketball Coaching"
              className="w-full h-auto hover:scale-105 transition-transform duration-200"
            />
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => setCurrentView?.('coaching')}>
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-27_013718642.png"
              alt="Badminton Coaching"
              className="w-full h-auto hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>
      </div>

      {/* Shop Now Section */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
              alt="Playgram Logo"
              className="h-6 w-6 object-contain"
            />
            <h2 className="text-xl font-bold text-gray-900">Shop Now</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {merchandiseItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square bg-gray-50 relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.stockQuantity <= 10 && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded font-medium">
                    Stock Out
                  </span>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-sm font-bold text-gray-900 mb-2">₹{item.price}</p>
                
                {/* Button Container - Flex Row with Gap */}
                <div className="flex flex-row items-center gap-1 w-full">
                  {/* Add to Cart Button - Outlined */}
                  <button 
                    onClick={() => setCurrentView?.('merchandise')}
                    className="flex-1 px-2 py-0.5 border border-[#E11C41] rounded bg-transparent hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-[9px] font-bold text-black whitespace-nowrap">
                      Add to Cart
                    </span>
                  </button>
                  
                  {/* Buy Now Button - Filled */}
                  <button 
                    onClick={() => setCurrentView?.('merchandise')}
                    className="flex-1 px-2 py-0.5 bg-[#E11C41] rounded hover:bg-[#c91635] transition-colors"
                  >
                    <span className="text-[9px] font-bold text-white whitespace-nowrap">
                      Buy Now
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View Store Button */}
        <div className="mt-4">
          <button
            onClick={() => setCurrentView?.('merchandise')}
            className="w-full bg-gradient-to-r from-[#E11C41] to-[#86D5F0] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            <span>View Store</span>
          </button>
        </div>
      </div>





      {/* Motivational Section - Mobile Optimized */}
      <div 
        className="rounded-xl relative overflow-hidden min-h-[600px] sm:min-h-[700px] lg:hidden"
        style={{
          backgroundImage: 'url(https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-18_214814386.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      </div>
      
      {/* Additional Image - Mobile Only */}
      <div className="mt-6 pb-8 lg:hidden flex justify-center">
        <img 
          src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-23_034441494.png" 
          alt="Playgram" 
          className="w-1/2 h-auto rounded-xl"
        />
      </div>
      
      {/* Desktop Motivational Section */}
      <div 
        className="rounded-xl relative overflow-hidden min-h-[300px] hidden lg:flex items-center"
        style={{
          backgroundImage: 'url(https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-18_160303074.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-2xl p-8 relative z-10">
          <h2 className="text-2xl font-bold mb-4 text-black">Guiding Passion Into Performance</h2>
          <p className="text-base text-gray-800 font-medium leading-relaxed">
            From beginners discovering the sport to champions chasing big dreams, 
            Playgram provides a structured journey that develops skills, builds discipline, 
            and unlocks potential through progressive coaching and professional support.
          </p>
        </div>
      </div>
    </div>
  );
};