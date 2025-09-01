import { motion } from "framer-motion";

const BetterCoachingSection = () => {
    return (
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 sm:mb-12 lg:mb-16"
                >
                    <h2 className="font-manrope text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin text-black leading-tight">
                        Better Coaching. Better{" "}
                        <span className="block font-bold">Experience.</span>
                    </h2>
                </motion.div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                    {/* Basketball Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white overflow-hidden shadow-lg"
                    >
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_172303370.png"
                            alt="Basketball training session"
                            className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                        />
                    </motion.div>

                    {/* Fitness That Feels Like Fun */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 sm:p-6 lg:p-8 shadow-lg"
                    >
                        <h3 className="text-black text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                            Fitness That Feels Like Fun
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            Our football training combines cardio, strength, and endurance, so you get fitter
                            while enjoying every session.
                        </p>
                    </motion.div>

                    {/* Team Training Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="bg-white overflow-hidden shadow-lg sm:col-span-2 lg:col-span-1"
                    >
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_172507426.png"
                            alt="Team training session"
                            className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                        />
                    </motion.div>

                    {/* Skill-Driven Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6 lg:p-8 shadow-lg sm:col-span-2 lg:col-span-1"
                    >
                        <h3 className="text-black text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                            Skill-Driven Progress
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            Our structured monthly sessions focus on dribbling, passing, shooting, and positioning,
                            helping you master the fundamentals step-by-step.
                        </p>
                    </motion.div>

                    {/* Basketball Court Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white overflow-hidden shadow-lg"
                    >
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_172351395.png"
                            alt="Basketball court aerial view"
                            className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                        />
                    </motion.div>

                    {/* Build Strong Team Spirit */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 sm:p-6 lg:p-8 shadow-lg"
                    >
                        <h3 className="text-black text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                            Build Strong Team Spirit
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            We encourage group drills, match play, and positive communication to help you become a
                            better team player.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default BetterCoachingSection;