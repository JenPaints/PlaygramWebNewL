import { motion } from "framer-motion";
import CardFlip from "./CardFlip";
import { Users, Trophy, Shield, Zap, Target, Star } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import { RetroGrid } from "./ui/retro-grid";

const SportsProsBenefits = () => {
  const { content } = useContent();

  const playgramCards = [
    {
      title: "About Us",
      subtitle: "Our Coaching Speaks",
      description: "Our coaches and training method ensures the best outcome for the athletes",
      features: [
        "Feel The differnce",
        "Learn from the best",
        "Best facilities",
        "Sports Strategies"
      ],
      icon: Shield
    },
    {
      title: "Expert Coaches",
      subtitle: "Learn from the best",
      description: "Playgram connects you with certified professional coaches who have trained athletes at national and international levels.",
      features: [
        "Certified Professionals",
        "Proven Track Record",
        "Personalized Training",
        "24/7 Support"
      ],
      icon: Star
    },
    {
      title: "All-in-One Platform",
      subtitle: "Everything you need",
      description: "Access training programs, connect with coaches, track progress, and join a community of athletes - all in one comprehensive app.",
      features: [
        "Unified Platform",
        "Progress Tracking",
        "Community Access",
        "Mobile Convenience"
      ],
      icon: Users
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-white">
      {/* RetroGrid Background */}
      <RetroGrid className="opacity-60" />

      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#D7243F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#89D3EC] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-900">{content.benefits.title.split(' ').slice(0, -1).join(' ')} </span>
            <span className="bg-gradient-to-r from-[#D7243F] via-[#89D3EC] to-[#D7243F] bg-clip-text text-transparent">
              {content.benefits.title.split(' ').slice(-1)[0]}
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {content.benefits.subtitle}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {playgramCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="w-full max-w-[300px]"
            >
              <CardFlip
                title={card.title}
                subtitle={card.subtitle}
                description={card.description}
                features={card.features}
              />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          
        </motion.div>
      </div>
    </section>
  );
};

export default SportsProsBenefits;