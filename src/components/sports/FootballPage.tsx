import { motion } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import EnrollmentModal from "../enrollment/EnrollmentModal";
import FreeTrialModal from "../trial/FreeTrialModal";
import { LoginModal } from "../auth/LoginModal";
import Footer from "../Footer";

interface FootballPageProps {
    onBack: () => void;
    setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'dashboard' | 'coaching' | 'privacy' | 'terms' | 'cookies') => void;
}

const FootballPage = ({ onBack: _onBack, setCurrentView }: FootballPageProps) => {
    const [selectedLocation, setSelectedLocation] = useState('Bangalore');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
    const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleLoginSuccess = () => {
        // Redirect to coaching view after successful login
        if (setCurrentView) {
            setCurrentView('coaching'); // This will navigate to coaching view
        }
        setIsLoginModalOpen(false);
    };

    const locations = [
        {
            id: 'bangalore',
            name: 'Bangalore',
            groundName: 'Bangalore',
            location: 'Playon E City, Bangalore',
            image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png',
            available: true
        },
        {
            id: 'mumbai',
            name: 'Mumbai',
            groundName: 'Mumbai Football Ground',
            location: 'Mumbai, Maharashtra',
            image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png',
            available: false
        },
        {
            id: 'delhi',
            name: 'Delhi',
            groundName: 'Delhi Football Ground',
            location: 'Delhi, India',
            image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png',
            available: false
        },
        {
            id: 'mysore',
            name: 'Mysore',
            groundName: 'Mysore Football Ground',
            location: 'Mysore, Karnataka',
            image: 'https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_185311591.png',
            available: false
        }
    ];

    const selectedLocationData = locations.find(loc => loc.name === selectedLocation) || locations[0];

    const pricingPlans = [
        {
            duration: "1 Month",
            price: "₹383",
            originalPrice: "₹450",
            totalPrice: "₹4599",
            priceDescription: "per month",
            sessions: "12 classes per month",
            features: [
                "Batches on Monday, Wednesday, Friday",
                "5pm to 6:30pm",
                "30 days pause sessions"
            ],
            popular: false
        },
        {
            duration: "3 Months",
            price: "₹364",
            originalPrice: "₹450",
            totalPrice: "₹13,107",
            priceDescription: "for 3 months",
            sessions: "36 classes in 3 months",
            features: [
                "Batches on Monday, Wednesday, Friday",
                "5pm to 6:30pm",
                "30 days pause sessions"
            ],
            popular: true,
            discount: "Most Popular"
        },
        {
            duration: "12 Months",
            price: "₹307",
            originalPrice: "₹450",
            totalPrice: "₹13,107",
            priceDescription: "for 3 months",
            sessions: "144 classes in 3 months",
            features: [
                "Batches on Monday, Wednesday, Friday",
                "5pm to 6:30pm",
                "30 days pause sessions"
            ],
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-cyan-100 to-blue-100 pt-28 sm:pt-32 lg:pt-44 pb-16 sm:pb-20 lg:pb-32 px-4 sm:px-6">
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
                                    <span className="text-black font-bold ">Football </span>
                                    <span className="text-black font-thin">Coaching</span>
                                    <br />
                                    <span className="text-black font-thin">That Matches Your</span>
                                    <br />
                                    <span className="font-bold text-white px-2 sm:px-3 py-1 sm:py-2 inline-block" style={{ backgroundColor: '#86d5f0' }}>
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
                                    className="flex items-center justify-center font-medium transition-all text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-[#86D5F0] bg-transparent text-sm sm:text-base"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 500,
                                        lineHeight: '100%'
                                    }}
                                >
                                    Book a Free Trial
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="flex items-center justify-center font-medium transition-all text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-red-500 bg-transparent text-sm sm:text-base gap-2"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 500,
                                        lineHeight: '100%'
                                    }}
                                >
                                    <span>Enroll Now</span>
                                    <img
                                        src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                                        alt="Logo"
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                    />
                                </motion.button>
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
                                    src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_8126.mp4"
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
                                className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6 text-sm sm:text-base"
                                style={{ fontFamily: 'Manrope', fontWeight: 400, lineHeight: '112%' }}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-black">Price Packages</span>
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
                                    className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden"
                                    style={{ width: '350px' }}
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
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
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
                                                <div className="text-gray-600 text-xs mt-1 flex items-center">
                                                    <MapPin className="w-3 h-3 text-blue-500 mr-1" />
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
                        {/* Football Court Image */}
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
                            {selectedLocationData?.available ? (
                                pricingPlans.map((plan, index) => (
                                    <motion.div
                                        key={plan.duration}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className={`relative bg-white rounded-2xl p-4 sm:p-6 transition-all hover:shadow-lg ${
                                            plan.popular
                                                ? 'border-2 border-red-500'
                                                : 'border border-gray-200'
                                            }`}
                                >
                                    {/* Most Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute top-0 right-0 z-10 overflow-hidden rounded-tr-2xl">
                                            <img
                                                src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-17_072722638.png"
                                                alt="Most Popular"
                                                className="w-24 h-24 object-cover"
                                                style={{
                                                    transform: 'translate(8px, -8px)'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Duration */}
                                        <h3 className="text-xl font-semibold text-gray-900">{plan.duration}</h3>

                                        {/* Price */}
                                        <div className="text-left">
                                            <div className="flex items-baseline space-x-2 mb-1">
                                                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                                <span className="text-lg text-gray-400 line-through">{plan.originalPrice}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">{plan.totalPrice} {plan.priceDescription}</div>
                                        </div>

                                        {/* Sessions */}
                                        <div className="flex items-center space-x-2">
                                            {plan.popular ? (
                                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            )}
                                            <span className="text-sm text-gray-700">{plan.sessions}</span>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center space-x-2">
                                                    {plan.popular ? (
                                                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                                    )}
                                                    <span className="text-gray-700 text-sm">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Enroll Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setIsLoginModalOpen(true)}
                                            className="font-medium transition-all flex items-center justify-center mt-6 relative overflow-hidden"
                                            style={plan.popular ? {
                                                width: '128px',
                                                height: '39px',
                                                borderRadius: '30px',
                                                background: 'linear-gradient(106.75deg, #E11C41 0%, #86D5F0 125.74%)',
                                                padding: '2px'
                                            } : {
                                                width: '128px',
                                                height: '39px',
                                                borderRadius: '30px',
                                                background: 'linear-gradient(106.75deg, #E11C41 0%, #86D5F0 125.74%)',
                                                padding: '2px'
                                            }}
                                        >
                                            <div
                                                className="flex items-center justify-center w-full h-full bg-white rounded-full"
                                                style={{ gap: '10px' }}
                                            >
                                                <span style={{ color: 'black' }}>Enroll Now</span>
                                                <img
                                                    src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                                                    alt="Logo"
                                                    className="w-4 h-4"
                                                />
                                            </div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                            ) : (
                                // Slots Unavailable Section for non-Bangalore locations
                                <div className="col-span-full flex items-center justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        viewport={{ once: true }}
                                        className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200 shadow-lg max-w-md mx-auto"
                                    >
                                        <div className="mb-6">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Slots Unavailable</h3>
                                            <p className="text-gray-600 text-lg">
                                                We're currently not available in {selectedLocation}.
                                            </p>
                                        </div>
                                        <div className="space-y-3 text-sm text-gray-500">
                                            <p>• Training sessions coming soon</p>
                                            <p>• Join our waitlist for updates</p>
                                            <p>• Be the first to know when we launch</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="mt-6 w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-full font-medium transition-all cursor-not-allowed"
                                            disabled
                                        >
                                            Coming Soon
                                        </motion.button>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Football, the Playgram Way Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    {/* Navigation breadcrumb - centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center mb-6 sm:mb-8 text-sm sm:text-base"
                        style={{ fontFamily: 'Manrope', fontWeight: 400 }}
                    >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-black">Why Choose Us</span>
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
                            Football, the Playgram Way
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
                                alt="Football coaching session"
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
                                alt="Football training drills"
                                className="w-full h-full object-cover"
                            />
                            {/* Training cones overlay */}
                            <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2">
                                <svg width="60" height="40" viewBox="0 0 80 50" className="text-yellow-400 sm:w-[80px] sm:h-[50px]">
                                    <path d="M15 45 L20 10 L25 45 Z M35 45 L40 10 L45 45 Z M55 45 L60 10 L65 45 Z"
                                        fill="currentColor" stroke="#333" strokeWidth="1" />
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





            {/* PFC Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                        {/* Left Side - Text Content and Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            {/* Text Content */}
                            <div>
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6 font-manrope">
                                    Train with us.
                                    <br />
                                    Play for us.
                                </h2>
                                <p className="text-gray-600 text-lg leading-relaxed font-manrope font-thin">
                                    Get a chance to represent
                                    <br />
                                    <span
                                        className="font-medium"
                                        style={{
                                            background: 'linear-gradient(90deg, #EF4444 0%, #3B82F6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        Playgram FC Bangalore.
                                    </span>
                                </p>
                            </div>

                            {/* PFC Logo Section */}
                            <div className="flex items-center space-x-6">
                                <img
                                    src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-17_071136164.png"
                                    alt="PFC Logo"
                                    className="h-32 w-auto"
                                />
                                <div className="text-6xl font-bold text-gray-200 tracking-wider">

                                </div>
                            </div>
                        </motion.div>

                        {/* Right Side - Images Layout */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-6"
                        >
                            {/* Left Image - Training Session */}
                            <div className="rounded-2xl overflow-hidden">
                                <img
                                    src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-17_071257820.png"
                                    alt="Football training session"
                                    className="w-full h-80 object-cover"
                                />
                            </div>

                            {/* Right Side - Tournament Image and Text */}
                            <div className="space-y-4">
                                {/* Tournament Image */}
                                <div className="rounded-2xl overflow-hidden">
                                    <img
                                        src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-17_071325302.png"
                                        alt="Tournament match"
                                        className="w-full h-48 object-cover"
                                    />
                                </div>

                                {/* Tournament Text */}
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                        <span className="text-red-500 font-medium text-sm">Tournaments</span>
                                    </div>
                                    <p className="text-gray-800 text-sm leading-relaxed">
                                        The best players from all Playgram centres across Bangalore will be selected to represent the city and compete against other cities in their respective age categories.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer setCurrentView={setCurrentView} />

            {/* Enrollment Modal */}
            <EnrollmentModal
                isOpen={isEnrollmentModalOpen}
                onClose={() => setIsEnrollmentModalOpen(false)}
                sport="football"
            />

            {/* Free Trial Modal */}
            <FreeTrialModal
                isOpen={isFreeTrialModalOpen}
                onClose={() => setIsFreeTrialModalOpen(false)}
                initialSport="football"
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default FootballPage;