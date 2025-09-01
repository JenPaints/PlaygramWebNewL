import { motion } from "framer-motion";
import { useState } from "react";

const GamePlanPricing = () => {
  const [selectedLayout, setSelectedLayout] = useState("HSR Layout");

  const pricingPlans = [
    {
      duration: "1 Month",
      price: "₹4599",
      originalPrice: null,
      discount: null,
      sessions: "12 Sessions",
      pricePerSession: "₹383 per session",
      batches: ["M", "W", "F"],
      timings: "5pm - 6:30pm"
    },
    {
      duration: "3 Months",
      price: "₹13,107",
      originalPrice: "₹16,500",
      discount: "5% Off",
      sessions: "36 Sessions",
      pricePerSession: "₹364 per session",
      batches: ["M", "W", "F"],
      timings: "5pm - 6:30pm"
    },
    {
      duration: "6 Months",
      price: "₹24,835",
      originalPrice: "₹14,500",
      discount: "10% Off",
      sessions: "72 Sessions",
      pricePerSession: "₹345 per session",
      batches: ["M", "W", "F"],
      timings: "5pm - 6:30pm"
    },
    {
      duration: "12 Months",
      price: "₹44,150",
      originalPrice: "₹16,500",
      discount: "20% Off",
      sessions: "144 Sessions",
      pricePerSession: "₹307 per session",
      batches: ["M", "W", "F"],
      timings: "5pm - 6:30pm"
    }
  ];

  return (
    <section className="py-20 px-6" style={{
      background: 'radial-gradient(ellipse at top left, rgba(215, 36, 63, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(137, 211, 236, 0.06) 0%, transparent 60%), linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #1a1a1a 50%, #0f0f0f 70%, #000000 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          {/* Price Packages Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-gray-600 text-gray-300 text-sm mb-6 lg:mb-0 w-fit"
          >
            Price Packages
          </motion.div>

          {/* Location Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-[#89D3EC]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <select 
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
              >
                <option value="HSR Layout" className="bg-gray-800">HSR Layout</option>
                <option value="Koramangala" className="bg-gray-800">Koramangala</option>
                <option value="Indiranagar" className="bg-gray-800">Indiranagar</option>
              </select>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="font-manrope text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-16"
        >
          Choose Your Game Plan
        </motion.h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.duration}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              {/* Discount Badge */}
              {plan.discount && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full transform rotate-12">
                  {plan.discount}
                </div>
              )}

              {/* Duration */}
              <div className="mb-4">
                <h3 className="text-white text-xl font-bold">{plan.duration}</h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  {plan.originalPrice && (
                    <span className="text-gray-400 text-sm line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
                <div className="text-white text-3xl font-bold">
                  {plan.price}
                </div>
              </div>

              {/* Sessions Info */}
              <div className="mb-4 space-y-2">
                <div className="text-gray-300 text-sm">
                  {plan.sessions}: <span className="text-white font-medium">{plan.pricePerSession}</span>
                </div>
              </div>

              {/* Batch Days */}
              <div className="mb-4">
                <div className="text-gray-400 text-sm mb-2">Batch:</div>
                <div className="flex space-x-2">
                  {plan.batches.map((day) => (
                    <span
                      key={day}
                      className="w-8 h-8 bg-gray-700 text-white text-sm rounded-full flex items-center justify-center font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timings */}
              <div className="mb-6">
                <div className="text-gray-400 text-sm mb-1">Timings:</div>
                <div className="text-white text-sm font-medium">{plan.timings}</div>
              </div>

              {/* Enroll Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-bold rounded-full hover:shadow-lg hover:shadow-[#D7243F]/20 transition-all duration-300"
              >
                Enroll Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamePlanPricing;