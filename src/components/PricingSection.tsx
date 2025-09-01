import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Target, Waves, Dumbbell } from "lucide-react";
import { useContent } from "../contexts/ContentContext";

const pricingPlans = [
  {
    sport: "Football",
    icon: Zap,
    price: 2999,
    trialPrice: 0,
    gradient: "from-[#D7243F] to-red-600",
    features: [
      "Individual Training Sessions",
      "Group Practice Sessions",
      "Match Analysis Videos",
      "Nutrition Guidance",
      "Performance Tracking",
      "24/7 Coach Support"
    ],
    popular: false
  },
  {
    sport: "Basketball",
    icon: Target,
    price: 2499,
    trialPrice: 0,
    gradient: "from-orange-500 to-[#D7243F]",
    features: [
      "Shooting Technique Training",
      "Defensive Strategies",
      "Team Play Coaching",
      "Fitness Programs",
      "Game Film Review",
      "Mental Conditioning"
    ],
    popular: true
  },
  {
    sport: "Badminton",
    icon: Dumbbell,
    price: 1999,
    trialPrice: 0,
    gradient: "from-[#89D3EC] to-blue-500",
    features: [
      "Footwork Development",
      "Shot Precision Training",
      "Court Positioning",
      "Doubles Strategy",
      "Equipment Guidance",
      "Tournament Preparation"
    ],
    popular: false
  },
  {
    sport: "Swimming",
    icon: Waves,
    price: 3499,
    trialPrice: 0,
    gradient: "from-blue-400 to-[#89D3EC]",
    features: [
      "Stroke Technique Refinement",
      "Breathing Optimization",
      "Endurance Building",
      "Racing Strategies",
      "Pool Safety Training",
      "Competition Coaching"
    ],
    popular: false
  }
];

const PricingSection = () => {
  const { content } = useContent();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top left, rgba(137, 211, 236, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(215, 36, 63, 0.08) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#D7243F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#89D3EC] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Choose Your </span>
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
              Training Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Unlock your potential with our comprehensive coaching programs designed for every skill level.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <motion.button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-gray-700 rounded-full p-1"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-6 h-6  rounded-full flex items-center justify-center p-1"
                animate={{ 
                  x: billingCycle === 'yearly' ? 32 : 0,
                  rotateY: billingCycle === 'yearly' ? 180 : 0
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <img
                  src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                  alt="Playgram Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.button>
            <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
              <span className="ml-2 px-2 py-1 bg-[#D7243F] text-white text-xs rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.pricing.plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`
                relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border-2 
                ${plan.popular
                  ? 'border-[#D7243F] shadow-2xl shadow-[#D7243F]/20'
                  : 'border-gray-700 hover:border-[#89D3EC]'
                }
                transition-all duration-300
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-2 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-bold rounded-full hover:shadow-lg transition-shadow"
                >
                  Start Free Trial
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 border-2 border-[#89D3EC] text-[#89D3EC] font-bold rounded-full hover:bg-[#89D3EC] hover:text-gray-900 transition-all"
                >
                  Enroll Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700">
            <svg className="w-6 h-6 text-[#89D3EC]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">Push Through Your Passion</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
