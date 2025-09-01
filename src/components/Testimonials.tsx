import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useContent } from "../contexts/ContentContext";

const testimonials = [
  {
    id: 1,
    name: "Arjun Prabhakar",
    sport: "CEO",
    rating: 5,
    comment: "Our mission at Playgram is simple — to inspire, train, and transform lives through sports. We believe in nurturing not just skills, but confidence, discipline, and teamwork in every athlete.",
    image: "https://www.socialagent.in/_next/image?url=%2Fassets%2Fdirectors%2Farjun.webp&w=1080&q=75",
  },
  {
    id: 2,
    name: "Deekshith",
    sport: "Vice President",
    rating: 5,
    comment: "At Playgram, we combine technology and sports expertise to make training smarter, more accessible, and more engaging. Our vision is to build the ultimate destination for sports lovers who want to learn, compete, and excel.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
  },
  {
    id: 3,
    name: "Vishu",
    sport: "Swimming",
    rating: 5,
    comment: "",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  }
];

const Testimonials = () => {
  const { content } = useContent();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use content testimonials, fallback to static ones if empty
  const displayTestimonials = content.testimonials.length > 0 ? content.testimonials : testimonials;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top left, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(137, 211, 236, 0.08) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#D7243F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#89D3EC] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">What Our </span>
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
              Athletes Say
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of athletes who have transformed their game with Playgram's world-class coaching programs.
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-700"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#D7243F] to-[#89D3EC] flex items-center justify-center text-white text-2xl font-bold">
                  {displayTestimonials[currentIndex].name.charAt(0)}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(displayTestimonials[currentIndex].rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                  "{displayTestimonials[currentIndex].content}"
                </blockquote>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg">{displayTestimonials[currentIndex].name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-3 py-1 bg-[#D7243F]/20 border border-[#D7243F] text-[#D7243F] rounded-full text-sm">
                        {displayTestimonials[currentIndex].role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-2 mb-16">
          {displayTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex
                ? 'bg-gradient-to-r from-[#D7243F] to-[#89D3EC]'
                : 'bg-gray-600 hover:bg-gray-500'
                }`}
            />
          ))}
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTestimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gray-900/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-[#89D3EC]/50 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D7243F] to-[#89D3EC] flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <span className="text-[#D7243F] text-sm">{testimonial.role}</span>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                {testimonial.content.length > 120
                  ? testimonial.content.substring(0, 120) + "..."
                  : testimonial.content
                }
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
