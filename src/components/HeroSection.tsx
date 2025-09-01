import { motion } from "framer-motion";
import { analytics } from "../services/analytics";

interface HeroSectionProps {
  setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin') => void;
}

const HeroSection = ({ setCurrentView }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-6 sm:pb-8 mb-0">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_7998.mov"
            type="video/mp4"
          />
          {/* Fallback for browsers that don't support video */}
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_7998.mov"
            alt="Children playing sports"
            className="w-full h-full object-cover object-center"
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 text-left px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-full sm:max-w-3xl lg:max-w-4xl mb-6 sm:mb-8">
          <motion.h1
            className="font-manrope text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-4 sm:mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <span className="text-white font-thin">Where </span>
            <span className="text-white font-bold">Passion</span>
            <span className="text-white font-thin"> Finds</span>
            <br />
            <span className="text-white font-thin">Its </span>
            <span className="text-white font-bold">Playground</span>
          </motion.h1>

          <motion.p
            className="font-manrope text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl leading-relaxed mb-4 sm:mb-6 md:mb-8 font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Step into a sport-first experience made for every age,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>every skill level, and every goal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                analytics.trackEvent('get_started_click', {
                  location: 'hero_section',
                  button_text: 'Get Started'
                });
                setCurrentView?.('football');
              }}
              className="group inline-flex items-center gap-2 px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-3 rounded-full font-medium font-manrope text-xs xs:text-sm sm:text-base transition-all duration-300 focus:outline-none hover:shadow-lg text-white bg-transparent border-2 border-red-500"
            >
              <span>Get Started</span>
              <span
                className="inline-flex items-center justify-center rounded-full w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 shrink-0 transform transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <img
                  src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                  alt=""
                  className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 object-contain"
                />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;