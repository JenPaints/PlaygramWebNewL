import { motion } from "framer-motion";
import { useState } from "react";
import Footer from "./Footer";

interface ContactPageProps {
    onBack: () => void;
    setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'contact' | 'privacy' | 'terms' | 'cookies') => void;
}

const ContactPage = ({ onBack: _onBack, setCurrentView }: ContactPageProps) => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const interests = [
        'Football Coaching',
        'Basketball Coaching',
        'Tournament'
    ];

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section
                className="relative h-64 sm:h-80 lg:h-[393px] flex items-center justify-center px-4"
                style={{
                    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url("https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_203741374-scaled.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-full"
                >
                    <h1
                        className="text-white text-center text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto px-2"
                        style={{
                            fontFamily: 'Manrope',
                            fontWeight: 400,
                            lineHeight: '111.57%'
                        }}
                    >
                        Contact Us!
                        <br />
                        Let's Talk About <span style={{ fontWeight: 'bold' }}>Your Game</span>
                    </h1>
                </motion.div>
            </section>
            {/*
 Main Content Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-20 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8 sm:mb-12 lg:mb-16">
                        {/* Breadcrumb */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-center lg:justify-start text-black mb-6 sm:mb-8 text-sm sm:text-base"
                            style={{ fontFamily: 'Manrope', fontWeight: 400 }}
                        >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Get Started
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </motion.div>

                        {/* Title and Social Icons Row */}
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-0">
                            {/* Main Title */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="flex-1 text-center lg:text-left"
                            >
                                <h2
                                    className="text-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight max-w-full lg:max-w-2xl mx-auto lg:mx-0"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        lineHeight: '111.6%'
                                    }}
                                >
                                    Get in touch with us.<br />
                                    We're here to assist you.
                                </h2>
                            </motion.div>

                            {/* Social Media Icons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-center lg:justify-end gap-3 sm:gap-4"
                            >
                                {/* Facebook */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>

                                {/* Instagram */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>

                                {/* Twitter */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    {/* Content Section */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                        {/* Left Side - Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-[430px] h-64 sm:h-80 lg:h-[520px] rounded-2xl overflow-hidden flex-shrink-0 mx-auto lg:mx-0"
                        >
                            <img
                                src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_174203786.png"
                                alt="Football player"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Right Side - Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="flex-1 space-y-6 sm:space-y-8 w-full"
                        >
                            {/* Name Field */}
                            <div className="border-b border-gray-300 pb-4 sm:pb-6 lg:pb-8">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full text-base sm:text-lg text-black placeholder-black bg-transparent outline-none py-2"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        fontSize: 'clamp(16px, 4vw, 18px)',
                                        lineHeight: '36px'
                                    }}
                                />
                            </div>

                            {/* Email Field */}
                            <div className="border-b border-gray-300 pb-4 sm:pb-6 lg:pb-8">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full text-base sm:text-lg text-black placeholder-black bg-transparent outline-none py-2"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        fontSize: 'clamp(16px, 4vw, 18px)',
                                        lineHeight: '36px'
                                    }}
                                />
                            </div>

                            {/* Phone Field */}
                            <div className="border-b border-gray-300 pb-4 sm:pb-6 lg:pb-8">
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full text-base sm:text-lg text-black placeholder-black bg-transparent outline-none py-2"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        fontSize: 'clamp(16px, 4vw, 18px)',
                                        lineHeight: '36px'
                                    }}
                                />
                            </div>

                            {/* Interested In Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <h3
                                    className="text-black text-base sm:text-lg"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        fontSize: 'clamp(16px, 4vw, 18px)',
                                        lineHeight: '36px'
                                    }}
                                >
                                    Interested In
                                </h3>
                                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-7">
                                    {interests.map((interest) => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm sm:text-base ${selectedInterests.includes(interest)
                                                ? 'border-red-500 bg-red-50 text-red-600'
                                                : 'border-gray-400 text-gray-400 hover:border-gray-600'
                                                }`}
                                            style={{
                                                fontFamily: 'Manrope',
                                                fontWeight: 400,
                                                fontSize: 'clamp(14px, 3.5vw, 18px)',
                                                lineHeight: '36px',
                                                minHeight: '40px'
                                            }}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message Field */}
                            <div className="border-b border-gray-300 pb-12 sm:pb-16 lg:pb-24">
                                <textarea
                                    placeholder="Message"
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    rows={3}
                                    className="w-full text-base sm:text-lg text-black placeholder-black bg-transparent outline-none resize-none py-2"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        fontSize: 'clamp(16px, 4vw, 18px)',
                                        lineHeight: '36px'
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-medium w-full sm:w-auto text-sm sm:text-base"
                                style={{
                                    background: 'linear-gradient(94.28deg, #E11C41 0%, #86D5F0 122.48%)',
                                    fontFamily: 'Manrope',
                                    fontWeight: 500,
                                    minHeight: '48px'
                                }}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                                Send Message
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Info Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-20 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-0">
                        {/* Left Side - Header */}
                        <div className="flex-1 text-center lg:text-left">
                            {/* Breadcrumb */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-center lg:justify-start text-black mb-4 sm:mb-6 text-sm sm:text-base"
                                style={{ fontFamily: 'Manrope', fontWeight: 400 }}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Contact Info
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight max-w-full lg:max-w-2xl mx-auto lg:mx-0"
                                style={{
                                    fontFamily: 'Manrope',
                                    fontWeight: 400,
                                    lineHeight: '111.6%'
                                }}
                            >
                                We are always happy to assist you
                            </motion.h2>
                        </div>

                        {/* Right Side - Contact Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row gap-8 sm:gap-12 lg:gap-20 justify-center lg:justify-end"
                        >
                            {/* Email */}
                            <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
                                <div className="space-y-1 sm:space-y-2">
                                    <h3
                                        className="text-black text-lg sm:text-xl lg:text-2xl font-semibold"
                                        style={{
                                            fontFamily: 'Manrope',
                                            fontWeight: 600,
                                            lineHeight: '30px'
                                        }}
                                    >
                                        Email Address
                                    </h3>
                                    <div className="w-6 sm:w-7 h-0.5 sm:h-1 bg-red-500 mx-auto sm:mx-0"></div>
                                </div>
                                <p
                                    className="text-black text-lg sm:text-xl lg:text-2xl"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        lineHeight: '30px'
                                    }}
                                >
                                    support@playgram.app
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
                                <div className="space-y-1 sm:space-y-2">
                                    <h3
                                        className="text-black text-lg sm:text-xl lg:text-2xl font-semibold"
                                        style={{
                                            fontFamily: 'Manrope',
                                            fontWeight: 600,
                                            lineHeight: '30px'
                                        }}
                                    >
                                        Phone Number
                                    </h3>
                                    <div className="w-6 sm:w-7 h-0.5 sm:h-1 bg-red-500 mx-auto sm:mx-0"></div>
                                </div>
                                <p
                                    className="text-black text-lg sm:text-xl lg:text-2xl"
                                    style={{
                                        fontFamily: 'Manrope',
                                        fontWeight: 400,
                                        lineHeight: '30px'
                                    }}
                                >
                                    +91 7888388817
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="mt-8 sm:mt-12 lg:mt-16 w-full h-48 sm:h-64 lg:h-[311px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg"
                    >
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_203942885-scaled.png"
                            alt="Location Map"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <Footer setCurrentView={setCurrentView} />
        </div>
    );
};

export default ContactPage;