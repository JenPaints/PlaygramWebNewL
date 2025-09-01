import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { CircleDot, Activity, Zap, Waves } from "lucide-react";

const sports = [
  {
    id: "football",
    name: "Football",
    description: "Master the beautiful game with professional coaching techniques, tactical awareness, and skill development programs designed for all levels.",
    icon: <CircleDot className="w-8 h-8" />,
    gradient: "from-[#D7243F] to-red-600",
    features: ["Technical Skills", "Tactical Training", "Physical Conditioning", "Match Analysis"]
  },
  {
    id: "basketball",
    name: "Basketball",
    description: "Elevate your basketball IQ with comprehensive training in shooting, dribbling, defense, and team strategies from experienced coaches.",
    icon: <Activity className="w-8 h-8" />,
    gradient: "from-orange-500 to-[#D7243F]",
    features: ["Shooting Mechanics", "Ball Handling", "Defensive Strategies", "Team Play"]
  },
  {
    id: "badminton",
    name: "Badminton",
    description: "Perfect your racquet skills with precision training in footwork, shot selection, and competitive strategies for singles and doubles play.",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-[#89D3EC] to-blue-500",
    features: ["Footwork Training", "Shot Precision", "Court Positioning", "Mental Game"]
  },
  {
    id: "swimming",
    name: "Swimming",
    description: "Dive into excellence with stroke technique refinement, endurance building, and competitive swimming strategies for all swimming styles.",
    icon: <Waves className="w-8 h-8" />,
    gradient: "from-blue-400 to-[#89D3EC]",
    features: ["Stroke Technique", "Breathing Control", "Endurance Training", "Racing Strategies"]
  }
];

const SportsStack = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={containerRef} className="relative py-20 min-h-[400vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 w-full">
          {sports.map((sport, index) => {
            const start = index / sports.length;
            const end = (index + 1) / sports.length;
            
            const y = useTransform(scrollYProgress, [start, end], [100, -100]);
            const scale = useTransform(scrollYProgress, [start, end], [0.8, 1]);
            const opacity = useTransform(scrollYProgress, [start, end], [0.3, 1]);
            const zIndex = sports.length - index;

            return (
              <motion.div
                key={sport.id}
                style={{ y, scale, opacity, zIndex }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`w-full max-w-4xl bg-gradient-to-br ${sport.gradient} p-1 rounded-3xl shadow-2xl`}>
                  <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 md:p-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="text-6xl">{sport.icon}</div>
                          <h2 className="text-4xl md:text-5xl font-bold text-white">
                            {sport.name}
                          </h2>
                        </div>
                        
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                          {sport.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {sport.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-[#89D3EC] rounded-full"></div>
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                          >
                            Book Free Trial
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 border-2 border-[#89D3EC] text-[#89D3EC] rounded-full font-semibold hover:bg-[#89D3EC] hover:text-gray-900 transition-all"
                          >
                            Enroll Now
                          </motion.button>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center">
                          <div className="text-8xl opacity-50">{sport.icon}</div>
                        </div>
                        
                        {/* Floating elements */}
                        <motion.div
                          className="absolute -top-4 -right-4 w-8 h-8 bg-[#D7243F] rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute -bottom-4 -left-4 w-6 h-6 bg-[#89D3EC] rounded-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SportsStack;
