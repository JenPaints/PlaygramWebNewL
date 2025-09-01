import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import BookingModal from "./BookingModal";
import { Zap, Waves, CircleDot, Activity } from "lucide-react";

// Mock sports data for build/fallback
const mockSports = [
  {
    _id: "1",
    name: "Football",
    description: "Master the beautiful game with professional coaching and advanced techniques. Develop your skills in passing, shooting, and tactical awareness.",
    features: ["Professional Coaching", "Tactical Training", "Fitness Development", "Match Play"],
    price: 2999,
    imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500"
  },
  {
    _id: "2", 
    name: "Basketball",
    description: "Elevate your basketball game with expert training in shooting, dribbling, and team strategies. Perfect for all skill levels.",
    features: ["Shooting Techniques", "Ball Handling", "Team Strategy", "Physical Conditioning"],
    price: 2799,
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500"
  },
  {
    _id: "3",
    name: "Badminton", 
    description: "Learn precision and agility in badminton with world-class coaching. Master smashes, drops, and court positioning.",
    features: ["Technique Mastery", "Footwork Training", "Strategy Development", "Mental Toughness"],
    price: 2499,
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500"
  },
  {
    _id: "4",
    name: "Swimming",
    description: "Dive into excellence with comprehensive swimming training. Perfect your strokes and build endurance in our state-of-the-art facilities.",
    features: ["Stroke Perfection", "Endurance Building", "Racing Techniques", "Water Safety"],
    price: 3299,
    imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500"
  }
];

const SportsStackEnhanced = () => {
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [bookingType, setBookingType] = useState<'trial' | 'enrollment'>('trial');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use mock data for now to ensure build succeeds
  const sports = mockSports;

  const handleBooking = (sport: any, type: 'trial' | 'enrollment') => {
    setSelectedSport(sport);
    setBookingType(type);
    setIsModalOpen(true);
  };

  const getSportIcon = (sportName: string) => {
    switch (sportName) {
      case 'Football': return <CircleDot className="w-8 h-8" />;
      case 'Basketball': return <Activity className="w-8 h-8" />;
      case 'Badminton': return <Zap className="w-8 h-8" />;
      case 'Swimming': return <Waves className="w-8 h-8" />;
      default: return <CircleDot className="w-8 h-8" />;
    }
  };

  const getSportGradient = (sportName: string) => {
    switch (sportName) {
      case 'Football': return 'from-[#D7243F] to-red-600';
      case 'Basketball': return 'from-orange-500 to-[#D7243F]';
      case 'Badminton': return 'from-[#89D3EC] to-blue-500';
      case 'Swimming': return 'from-blue-400 to-[#89D3EC]';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  if (!isMounted || sports.length === 0) {
    return (
      <section className="py-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-[#89D3EC] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading sports programs...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <SportsCarousel
        sports={sports}
        handleBooking={handleBooking}
        getSportIcon={getSportIcon}
        getSportGradient={getSportGradient}
      />

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sport={selectedSport}
        bookingType={bookingType}
      />
    </>
  );
};

// Beautiful carousel component with navigation and indicators
const SportsCarousel = ({ sports, handleBooking, getSportIcon, getSportGradient }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sports.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sports.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sports.length) % sports.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sports.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative py-20 overflow-hidden" style={{
      background: 'radial-gradient(ellipse at center top, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom center, rgba(137, 211, 236, 0.08) 0%, transparent 60%), linear-gradient(135deg, #000000 0%, #0a0a0a 100%)'
    }}>
      {/* Header */}
      <div className="text-center mb-16">
        <motion.h2
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-[#D7243F] via-[#89D3EC] to-[#D7243F] bg-clip-text text-transparent">
            Our Sports
          </span>
          <span className="text-white"> Programs</span>
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover world-class training programs designed to elevate your athletic performance
        </motion.p>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="relative h-[600px] overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-3xl"></div>
                <div className="relative h-full p-8 md:p-12 flex items-center">
                  <div className="grid md:grid-cols-2 gap-12 items-center w-full">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="text-white">{getSportIcon(sports[currentIndex]?.name)}</div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white">
                          {sports[currentIndex]?.name}
                        </h3>
                      </div>

                      <p className="text-gray-300 text-xl mb-8 leading-relaxed">
                        {sports[currentIndex]?.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {sports[currentIndex]?.features.slice(0, 4).map((feature: string, idx: number) => (
                          <motion.div
                            key={idx}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                          >
                            <div className="w-3 h-3 bg-[#89D3EC] rounded-full"></div>
                            <span className="text-gray-300">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(215, 36, 63, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBooking(sports[currentIndex], 'trial')}
                          className="px-8 py-4 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
                        >
                          Book Free Trial
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBooking(sports[currentIndex], 'enrollment')}
                          className="px-8 py-4 border-2 border-[#89D3EC] text-[#89D3EC] rounded-full font-bold text-lg hover:bg-[#89D3EC] hover:text-gray-900 transition-all"
                        >
                          Enroll Now - ₹{sports[currentIndex]?.price}/month
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className="aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden relative shadow-2xl">
                        {sports[currentIndex]?.imageUrl ? (
                          <img
                            src={sports[currentIndex].imageUrl}
                            alt={sports[currentIndex].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-white opacity-60 flex items-center justify-center">
                            <div className="w-32 h-32">{getSportIcon(sports[currentIndex]?.name)}</div>
                          </div>
                        )}

                        {/* Animated overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>

                      {/* Floating elements */}
                      <motion.div
                        className="absolute -top-6 -right-6 w-12 h-12 bg-[#D7243F] rounded-full"
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute -bottom-6 -left-6 w-8 h-8 bg-[#89D3EC] rounded-full"
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-white/30 transition-all group shadow-xl"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-white/30 transition-all group shadow-xl"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="flex justify-center space-x-3 mt-8">
          {sports.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 border ${index === currentIndex
                  ? 'bg-gradient-to-r from-[#D7243F] to-[#89D3EC] scale-125 border-white/20 shadow-lg'
                  : 'bg-white/20 hover:bg-white/40 border-white/10 hover:border-white/30'
                }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="h-1 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D7243F] via-[#89D3EC] to-[#D7243F] shadow-sm"
              initial={{ width: "0%" }}
              animate={{ width: isAutoPlaying ? "100%" : "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              key={currentIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportsStackEnhanced;
