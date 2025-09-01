import { motion } from "framer-motion";
import { ArrowLeft, Play, Users, Trophy, Target, Clock, Zap } from "lucide-react";

interface BadmintonPageProps {
  onBack: () => void;
}

const BadmintonPage = ({ onBack }: BadmintonPageProps) => {
  const features = [
    {
      icon: Target,
      title: "Shot Precision",
      description: "Master smashes, drops, clears, and net shots with pinpoint accuracy and control."
    },
    {
      icon: Users,
      title: "Court Positioning",
      description: "Learn optimal positioning for singles and doubles play, including rotation strategies."
    },
    {
      icon: Trophy,
      title: "Footwork Training",
      description: "Develop lightning-fast footwork and court coverage for competitive advantage."
    },
    {
      icon: Clock,
      title: "Mental Game",
      description: "Build focus, strategy, and mental toughness for high-pressure match situations."
    }
  ];

  const coaches = [
    {
      name: "Lin Wei Chen",
      experience: "18+ years",
      specialty: "Singles Strategy",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      name: "Priya Sharma",
      experience: "14+ years", 
      specialty: "Doubles Tactics",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    },
    {
      name: "James Mitchell",
      experience: "22+ years",
      specialty: "Technical Skills",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#89D3EC]/20 to-blue-500/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white mb-6 sm:mb-8 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-[#89D3EC] to-blue-500 bg-clip-text text-transparent">
                    Badminton
                  </span>
                  <br />
                  <span className="text-white">Precision</span>
                </h1>
              </div>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Perfect your racquet skills with precision training in footwork, shot selection, 
                and competitive strategies for both singles and doubles excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#89D3EC] to-blue-500 rounded-full text-white font-bold text-base sm:text-lg shadow-lg"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#89D3EC] text-[#89D3EC] rounded-full font-bold text-base sm:text-lg hover:bg-[#89D3EC] hover:text-gray-900 transition-all"
                >
                  View Programs
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl sm:rounded-3xl overflow-hidden relative">
                <img
                  src="https://us.yonex.com/cdn/shop/files/Product_Banner_BadmintonProRacquets_Mobile.jpg?v=1750184928&width=3840"
                  alt="Badminton Training"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-white">Perfect Your </span>
              <span className="bg-gradient-to-r from-[#89D3EC] to-blue-500 bg-clip-text text-transparent">Technique</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
              Master every aspect of badminton with our comprehensive training approach
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-600/30 hover:border-[#89D3EC]/30 transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#89D3EC] to-blue-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-white">World-Class </span>
              <span className="bg-gradient-to-r from-[#89D3EC] to-blue-500 bg-clip-text text-transparent">Coaches</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
              Learn from international coaches with tournament experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {coaches.map((coach, index) => (
              <motion.div
                key={coach.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-600/30 text-center"
              >
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{coach.name}</h3>
                <p className="text-[#89D3EC] font-semibold mb-1 text-sm sm:text-base">{coach.experience}</p>
                <p className="text-gray-300 text-sm sm:text-base">{coach.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-600/30"
          >
            <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Ready to Excel at Badminton?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto">
              Join our badminton program and master the precision, speed, and strategy needed to dominate the court.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#89D3EC] to-blue-500 rounded-full text-white font-bold text-base sm:text-lg shadow-lg"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#89D3EC] text-[#89D3EC] rounded-full font-bold text-base sm:text-lg hover:bg-[#89D3EC] hover:text-gray-900 transition-all"
              >
                Contact Coach
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BadmintonPage;