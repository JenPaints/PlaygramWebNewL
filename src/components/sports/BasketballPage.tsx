import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import FreeTrialModal from "../trial/FreeTrialModal";

interface BasketballPageProps {
  onBack: () => void;
  setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'privacy' | 'terms' | 'cookies') => void;
}

const BasketballPage = ({ onBack: _onBack, setCurrentView }: BasketballPageProps) => {
  const [selectedLocation, setSelectedLocation] = useState('HSR Layout');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);

  const locations = [
    {
      id: 'hsr',
      name: 'HSR Layout',
      groundName: 'HSR Basketball Court',
      location: 'HSR Layout, Bangalore',
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png'
    },
    {
      id: 'Coming-soon',
      name: 'Coming Soon',
      groundName: 'Coming Soon',
      location: 'Coming Soon',
      image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png'
    }

  ];

  const selectedLocationData = locations.find(loc => loc.name === selectedLocation) || locations[0];

  const pricingPlans = [
    {
      duration: "1 Month",
      price: "₹400",
      originalPrice: "₹470",
      totalPrice: "₹4,800",
      priceDescription: "per month",
      sessions: "12 classes per month",
      features: [
        "Batches on Tuesday, Thursday, Saturday",
        "6pm to 7:30pm",
        "30 days pause sessions"
      ],
      popular: false
    },
    {
      duration: "3 Months",
      price: "₹380",
      originalPrice: "₹470",
      totalPrice: "₹13,680",
      priceDescription: "for 3 months",
      sessions: "36 classes in 3 months",
      features: [
        "Batches on Tuesday, Thursday, Saturday",
        "6pm to 7:30pm",
        "30 days pause sessions"
      ],
      popular: true,
      discount: "Most Popular"
    },
    {
      duration: "12 Months",
      price: "₹320",
      originalPrice: "₹470",
      totalPrice: "₹46,080",
      priceDescription: "for 12 months",
      sessions: "144 classes in 12 months",
      features: [
        "Batches on Tuesday, Thursday, Saturday",
        "6pm to 7:30pm",
        "30 days pause sessions"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-100 to-red-100 py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl leading-tight mb-6 sm:mb-8">
                  <span className="text-black font-bold ">Basketball </span>
                  <span className="text-black font-thin">Coaching</span>
                  <br />
                  <span className="text-black font-thin">That Matches Your</span>
                  <br />
                  <span className="font-bold text-white px-2 sm:px-3 py-1 sm:py-2 inline-block" style={{ backgroundColor: '#ff6b35' }}>
                    Goals
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-gray-800 leading-relaxed max-w-full lg:max-w-lg mb-6 sm:mb-8 mx-auto lg:mx-0">
                  Age appropriate training by certified coaches at<br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>premium facilities.
                </p>
              </div>

              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFreeTrialModalOpen(true)}
                  className="flex items-center justify-center font-medium transition-all text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-[#ff6b35] bg-transparent text-sm sm:text-base"
                  style={{
                    fontFamily: 'Manrope',
                    fontWeight: 500,
                    lineHeight: '100%'
                  }}
                >
                  Book a Free Trial
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer rounded-full p-0.5 sm:p-[2px]"
                  style={{
                    background: 'linear-gradient(106.75deg, #E11C41 0%, #ff6b35 125.74%)'
                  }}
                >
                  <div
                    className="flex items-center justify-center font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white text-black gap-2"
                    style={{
                      fontFamily: 'Manrope',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '100%'
                    }}
                  >
                    <span>Enroll Now</span>
                    <img
                      src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                      alt="Logo"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Video */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl">
                <video
                  src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_8135.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-0 mb-8 sm:mb-12 lg:mb-16">
            {/* Left Side - Title */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center justify-center lg:justify-start text-black mb-4 sm:mb-6 text-sm sm:text-base"
                style={{ fontFamily: 'Manrope', fontWeight: 400, lineHeight: '112%' }}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Price Packages
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-black mb-4 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight"
                style={{ fontFamily: 'Manrope', fontWeight: 400, lineHeight: '112%' }}
              >
                Choose Your <span style={{ fontFamily: 'Manrope', fontWeight: 800, lineHeight: '112%' }}>Game Plan</span>
              </motion.h2>
            </div>

            {/* Right Side - Location Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center lg:text-right relative"
            >
              <div className="text-xs sm:text-sm text-gray-600 mb-2">Pick your Location</div>
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="inline-flex items-center justify-between bg-white border border-gray-400 rounded-full px-4 sm:px-5 py-3 sm:py-4 hover:border-gray-500 transition-all w-full sm:w-auto max-w-xs sm:max-w-none"
                style={{
                  minWidth: '250px',
                  maxWidth: '301px',
                  height: '48px',
                  borderRadius: '30px',
                  border: '1px solid #6C6C6C'
                }}
              >
                <span className="text-gray-700 font-medium text-sm sm:text-base">{selectedLocation}</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Location Dropdown */}
              {showLocationDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 lg:right-0 lg:left-auto bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden w-full max-w-sm lg:max-w-none"
                  style={{ minWidth: '300px', maxWidth: '350px' }}
                >
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedLocation(location.name);
                        setShowLocationDropdown(false);
                      }}
                      className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-all text-left"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={location.image}
                          alt={location.groundName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          {location.groundName}
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          {location.location}
                        </div>
                      </div>
                      {selectedLocation === location.name && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Pricing Layout */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* Basketball Court Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-full lg:w-80 mx-auto lg:mx-0"
            >
              <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 lg:h-96">
                <img
                  src={selectedLocationData.image}
                  alt={selectedLocationData.groundName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black bg-opacity-60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md">
                  {selectedLocationData.groundName}
                </div>
                {/* Navigation arrows */}
                <button className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full hover:bg-opacity-100 transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full hover:bg-opacity-100 transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.duration}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 transition-all hover:shadow-lg"
                >
                  {/* Most Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full transform rotate-12">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Duration */}
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{plan.duration}</h3>

                    {/* Price */}
                    <div className="text-left">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-base sm:text-lg text-gray-400 line-through">{plan.originalPrice}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{plan.totalPrice} {plan.priceDescription}</div>
                    </div>

                    {/* Sessions */}
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-700">{plan.sessions}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Enroll Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentView?.('waitlist')}
                      className="font-medium transition-all flex items-center justify-center mt-6 relative overflow-hidden w-full sm:w-auto"
                      style={{
                        minWidth: '128px',
                        height: '39px',
                        borderRadius: '30px',
                        background: 'linear-gradient(106.75deg, #E11C41 0%, #ff6b35 125.74%)',
                        padding: '2px'
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-full h-full bg-white rounded-full"
                        style={{ gap: '10px' }}
                      >
                        <span style={{ color: 'black' }} className="text-sm">Enroll Now</span>
                        <img
                          src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                          alt="Logo"
                          className="w-3 h-3 sm:w-4 sm:h-4"
                        />
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Basketball, the Playgram Way Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Navigation breadcrumb - centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base"
            style={{ fontFamily: 'Manrope', fontWeight: 400 }}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Why Choose Us
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>

          {/* Main Title - centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Basketball, the Playgram Way
            </h2>
          </motion.div>

          {/* Mobile: Vertical Stack, Desktop: Horizontal Layout */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-6 sm:gap-8">
            {/* 1. IMAGE */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full sm:w-80 lg:w-72 h-64 sm:h-80 lg:h-80 rounded-2xl overflow-hidden shadow-lg mx-auto lg:mx-0"
            >
              <img
                src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_174203786.png"
                alt="Basketball coaching session"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* 2. CARD - Coaches & Student Ratio */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg w-full sm:w-80 lg:w-80 h-auto sm:h-80 flex flex-col justify-center mx-auto lg:mx-0"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Coaches & Student Ratio
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                We ensure optimal learning by maintaining a balanced coach-to-student ratio. This allows every player to get personalized attention, proper guidance, and maximum playtime during each session.
              </p>
            </motion.div>

            {/* 3. IMAGE */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="w-full sm:w-80 lg:w-72 h-64 sm:h-80 lg:h-80 rounded-2xl overflow-hidden shadow-lg relative mx-auto lg:mx-0"
            >
              <img
                src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_195926639.png"
                alt="Basketball training drills"
                className="w-full h-full object-cover"
              />
              {/* Basketball overlay */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2">
                <svg width="40" height="40" viewBox="0 0 60 60" className="text-orange-500 sm:w-[60px] sm:h-[60px]">
                  <circle cx="30" cy="30" r="25" fill="currentColor" stroke="#333" strokeWidth="2" />
                  <path d="M5 30 L55 30 M30 5 L30 55 M15 15 L45 45 M45 15 L15 45"
                    stroke="#333" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </motion.div>

            {/* 4. CARD - Tracking Progress Made Easy */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="rounded-2xl p-4 sm:p-6 shadow-lg w-full sm:w-80 lg:w-80 h-auto sm:h-80 flex flex-col justify-center text-black mx-auto lg:mx-0"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black">
                Tracking Progress Made Easy
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Your growth matters to us. Our progress tracking system visually showcases skill improvement, helping players and parents see the journey from the first session to achieving key milestones.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Train Smarter With the Playgram App Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl p-8 border border-orange-200"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Dominate the Court?
            </h3>
            <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
              Join our basketball program and develop the skills, strategy, and mindset needed to excel at every level of the game.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-bold text-lg shadow-lg"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-full font-bold text-lg hover:bg-orange-500 hover:text-white transition-all"
              >
                Contact Coach
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Free Trial Modal */}
      <FreeTrialModal
        isOpen={isFreeTrialModalOpen}
        onClose={() => setIsFreeTrialModalOpen(false)}
        initialSport="basketball"
      />
    </div>
  );
};

export default BasketballPage;