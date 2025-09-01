import { motion } from "framer-motion";

interface MobileAppSectionProps {
  setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'contact' | 'privacy' | 'terms' | 'cookies') => void;
}

const MobileAppSection = ({ setCurrentView }: MobileAppSectionProps) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url('https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_180042478.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(1.1) contrast(1.1) saturate(1.2)'
          }}
        >
          {/* Lighter overlay for better text readability while keeping background visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center p-6 sm:p-8 lg:p-12 xl:p-16">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left"
            >
              {/* Main Heading */}
              <h2 className="font-manrope text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-thin text-white leading-tight">
                Your Game, Always
                <br />
                in Your{" "}
                <span className="relative font-bold">
                  Pocket
                  <div className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-cyan-400 rounded"></div>
                </span>
              </h2>

              {/* Description */}
              <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-full lg:max-w-md mx-auto lg:mx-0">
                Book sessions, track your progress, and stay connected
                with Playgram anytime, anywhere. Download our app and
                make every day a game day.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block"
                >
                  <img
                    src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_175902584.png"
                    alt="Download on the App Store"
                    className="h-10 sm:h-12 lg:h-14 w-auto mx-auto xs:mx-0"
                  />
                </motion.a>

                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block"
                >
                  <img
                    src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_175955869.png"
                    alt="Get it on Google Play"
                    className="h-10 sm:h-12 lg:h-14 w-auto mx-auto xs:mx-0"
                  />
                </motion.a>
              </div>

              {/* Download CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView?.('waitlist')}
                className="group inline-flex items-center gap-2 px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-3 rounded-full font-medium font-manrope text-xs xs:text-sm sm:text-base transition-all duration-300 focus:outline-none hover:shadow-lg text-white bg-transparent border-2 border-red-500 mx-auto lg:mx-0"
              >
                <span>Download Now</span>
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

            {/* Right Side - Phone Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <img
                src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_180216959.png"
                alt="Playgram mobile app screens"
                className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;