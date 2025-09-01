import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const WholeExperienceSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const experiences = [
    {
      title: "Structured Training Time",
      description: "Get personalized coaching in football and basketball designed to match your skill level, challenge your limits, and guide your growth with every session.",
      image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=300&fit=crop"
    },
    {
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and insights that help you understand your strengths and areas for improvement.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop"
    },
    {
      title: "Community Support",
      description: "Join a community of athletes who share your passion and commitment to excellence in sports training.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % experiences.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  return (
    <section className="py-20 px-6" style={{
      background: 'radial-gradient(ellipse at top right, rgba(137, 211, 236, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(215, 36, 63, 0.12) 0%, transparent 55%), radial-gradient(ellipse at center, rgba(137, 211, 236, 0.08) 0%, transparent 70%), linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%, #ffffff 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm">
              The Game Plan
            </div>

            {/* Main Heading */}
            <h2 className="font-manrope text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              <span className="text-gray-900">Beyond Coaching, </span>
              <span className="text-gray-900">It's a</span>
              <br />
              <span className="text-gray-900 font-bold">Whole Experience</span>
            </h2>

            {/* Feature Image and Description */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden mb-6">
                <img
                  src="https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=250&fit=crop"
                  alt="Football training"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Playgram Logo Overlay */}
              <div className="absolute top-4 right-4">
                <img
                  src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_6671-removebg-preview.png"
                  alt="Playgram"
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              Every feature at Playgram is crafted to support your journey,
              whether you're kicking off or leveling up.
            </p>
          </motion.div>

          {/* Right Content - Sliding Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Card Container */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-start space-x-6">
                {/* Card Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden">
                    <img
                      src={experiences[currentSlide].image}
                      alt={experiences[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1">
                  <h3 className="font-manrope text-gray-900 mb-4" style={{ fontWeight: 400, fontSize: '34px', lineHeight: '112%', letterSpacing: '0%' }}>
                    {experiences[currentSlide].title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {experiences[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-[#89D3EC] hover:bg-[#89D3EC]/80 flex items-center justify-center transition-colors duration-300"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-[#89D3EC] hover:bg-[#89D3EC]/80 flex items-center justify-center transition-colors duration-300"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              {experiences.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentSlide ? 'bg-[#89D3EC]' : 'bg-gray-400'
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WholeExperienceSection;