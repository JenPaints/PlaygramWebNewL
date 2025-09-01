import { motion } from "framer-motion";

interface FooterProps {
  setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'privacy' | 'terms' | 'cookies') => void;
}

const Footer = ({ setCurrentView }: FooterProps) => {
  return (
    <footer
      className="relative py-8 sm:py-10 lg:py-12 px-4 sm:px-6 overflow-hidden"
      style={{
        backgroundImage: `url('https://jenpaints.art/wp-content/uploads/2025/08/5c84396c2a0af0ee4113e7697a45083ed0ac1533-1-scaled.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/75"></div>

      <div className="relative max-w-4xl mx-auto z-10 text-center">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-center mb-4 sm:mb-6"
        >
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_6671-removebg-preview.png"
            alt="Playgram Logo"
            className="h-20 sm:h-24 lg:h-32 w-auto object-contain"
          />
        </motion.div>

        {/* App Store Buttons */}
        <div className="flex flex-col xs:flex-row justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="block mx-auto xs:mx-0"
          >
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_175902584.png"
              alt="Download on the App Store"
              className="h-8 sm:h-9 lg:h-10 w-auto"
            />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="block mx-auto xs:mx-0"
          >
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_175955869.png"
              alt="Get it on Google Play"
              className="h-8 sm:h-9 lg:h-10 w-auto"
            />
          </motion.a>
        </div>

        {/* Copyright */}
        <div className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
          © 2025 Playgram
        </div>

        {/* Divider Line */}
        <div className="relative -mx-8 sm:-mx-16 lg:-mx-32">
          <div className="border-t border-white/30 mb-4 sm:mb-6"></div>
        </div>

        {/* Bottom Section - Single Row Layout */}
        <div className="relative -mx-12 sm:-mx-24 lg:-mx-40 px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            {/* Legal Links - Left */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-gray-300 order-2 sm:order-1">
              <button
                onClick={() => setCurrentView?.('terms')}
                className="hover:text-white transition-colors"
              >
                Terms of use
              </button>
              <button
                onClick={() => setCurrentView?.('cookies')}
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </button>
              <button
                onClick={() => setCurrentView?.('privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy statement
              </button>
            </div>

            {/* Powered By Image - Center */}
            <div className="flex justify-center order-1 sm:order-2 sm:-ml-40 lg:-ml-52">
              <img
                src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-17_064756145.png"
                alt="Powered By Bricstal Group"
                className="h-6 w-auto object-contain"
              />
            </div>

            {/* Social Media Icons - Right */}
            <div className="flex justify-center sm:justify-end gap-3 order-3">
              <motion.a
                href="https://www.facebook.com/playgram.official/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-gray-700/80 hover:bg-gray-600/80 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.a>
              <motion.a
                href="https://www.instagram.com/playgram.official"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-gray-700/80 hover:bg-gray-600/80 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
