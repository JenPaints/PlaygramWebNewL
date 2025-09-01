import { motion } from "framer-motion";

const WholeExperienceIntroSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-base sm:text-lg font-medium flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-8 sm:mb-12"
        >
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#E11C41' }}>{'>'}</span>
          <span className="text-black">The Game Plan</span>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Left Side */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-manrope text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black leading-tight">
                <span className="font-thin">Beyond Coaching. It's a</span>
                <br />
                <span className="font-bold">Whole Experience</span>
              </h2>
            </motion.div>

            {/* Bottom Section - Image with Logo and Text */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center lg:items-start">
              {/* Training Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg flex-shrink-0 mt-8 sm:mt-12 lg:mt-16"
              >
                <img
                  src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_174101402.png"
                  alt="Football training session"
                  className="w-full sm:w-48 lg:w-64 h-36 sm:h-36 lg:h-48 object-cover"
                />
              </motion.div>

              {/* Logo and Text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center space-y-3 sm:space-y-4 mt-8 sm:mt-12 lg:mt-32 text-center sm:text-left"
              >
                {/* Tiny Playgram Logo */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center mx-auto sm:mx-0">
                  <img
                    src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                    alt="Playgram Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-full sm:max-w-sm">
                  Every feature at Playgram is crafted to support your journey,
                  whether you're kicking off or leveling up.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Structured Training Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg h-fit"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="w-full sm:w-1/2">
                <img
                  src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_174203786.png"
                  alt="Football player with ball"
                  className="w-full h-48 sm:h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="w-full sm:w-1/2 p-4 sm:p-6 flex flex-col justify-start">
                <h3 className="font-manrope text-black mb-3 sm:mb-4 text-xl sm:text-2xl lg:text-3xl" style={{ fontWeight: 400, lineHeight: '112%', letterSpacing: '0%' }}>
                  Structured Training Time
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Get personalized coaching in football and basketball, designed to match
                  your skill level, challenge your limits, and guide your growth with every
                  session.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WholeExperienceIntroSection;