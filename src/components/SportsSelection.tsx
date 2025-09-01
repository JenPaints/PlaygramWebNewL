import { motion } from "framer-motion";

interface SportsSelectionProps {
  setCurrentView?: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'admin') => void;
}

const SportsSelection = ({ setCurrentView }: SportsSelectionProps) => {
  const sports = [
    {
      name: "Football",
      description: "From powerful kicks to precision passes and slam dunks, Playgram brings you the thrill of focused",
      image: "https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_172042020.png",
      view: "football" as const
    },
    {
      name: "Basketball",
      description: "From powerful kicks to precision passes and slam dunks, Playgram brings you the thrill of focused",
      image: "https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_172219297.png",
      view: "basketball" as const
    }
  ];

  const handleEnrollClick = (view: 'football' | 'basketball') => {
    if (setCurrentView) {
      setCurrentView(view);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6" style={{ backgroundColor: '#def7ff' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          {/* Our Coaching Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg font-medium flex items-center justify-center gap-2 sm:gap-3 select-none mb-6 sm:mb-8"
          >
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
              alt="Playgram Logo"
              className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
            />
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#E11C41' }}>{'>'}</span>
            <span className="text-black">Our Coaching</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-manrope text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-tight mb-4 sm:mb-6"
          >
            Pick Your Game. Bring Your A-Game.
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0"
          >
            From powerful kicks to precision passes and slam dunks, Playgram brings you the thrill of
            focused, high-energy training.
          </motion.p>
        </div>

        {/* Sports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {sports.map((sport, index) => (
            <motion.div
              key={sport.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Sport Image */}
              <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden p-3">
                <img
                  src={sport.image}
                  alt={`${sport.name} coaching session`}
                  className="w-full h-full object-cover rounded-lg border-2 border-white"
                />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-black text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{sport.name}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                  {sport.description}
                </p>

                {/* Enroll Now Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEnrollClick(sport.view)}
                  className="font-medium transition-all flex items-center justify-center relative overflow-hidden"
                  style={{
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsSelection;