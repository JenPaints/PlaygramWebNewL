import { motion } from "framer-motion";

const BetterExperienceSection = () => {
  const features = [
    {
      title: "Skill-Driven Progress",
      description: "Our structured monthly sessions focus on dribbling, passing, shooting, and positioning, helping you master the fundamentals step-by-step.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
      size: "large" // Takes up more space
    },
    {
      title: "Fitness That Feels Like Fun",
      description: "Our football training combines cardio, strength, and agility work, so you get fitter while enjoying every session.",
      image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=300&fit=crop",
      size: "medium"
    },
    {
      title: "Build Strong Team Spirit",
      description: "We encourage group drills, match play, and positive communication to help you become a better team player.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      size: "medium"
    },
    {
      title: "Professional Coaching",
      description: "Learn from experienced coaches who understand the game and know how to bring out your best performance.",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop",
      size: "large"
    }
  ];

  return (
    <section className="py-20 px-6" style={{
      background: 'radial-gradient(ellipse at center bottom, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at top center, rgba(137, 211, 236, 0.08) 0%, transparent 60%), linear-gradient(135deg, #000000 0%, #0a0a0a 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-manrope text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            <span className="text-white">Better Coaching. Better</span>
            <br />
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">Experience.</span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative group cursor-pointer rounded-3xl overflow-hidden ${feature.size === 'large' ? 'lg:col-span-2' : 'lg:col-span-1'
                } ${index === 0 ? 'md:col-span-1' : ''}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative h-80 lg:h-96">
                {/* Background Image */}
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-base lg:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D7243F]/20 to-[#89D3EC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BetterExperienceSection;