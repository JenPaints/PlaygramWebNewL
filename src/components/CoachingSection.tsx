import { motion } from "framer-motion";

const CoachingSection = () => {
    return (
        <section className="pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 xl:pb-48 px-4 sm:px-6 bg-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
                {/* Left: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="space-y-4 sm:space-y-6 text-center lg:text-left"
                >
                    {/* Breadcrumb */}
                    <div className="text-base sm:text-lg font-medium flex items-center justify-center lg:justify-start gap-2 sm:gap-3 select-none">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#E11C41' }}>{'>'}</span>
                        <span className="text-black">Game Plan</span>
                    </div>

                    {/* Heading */}
                    <div className="flex items-start gap-4 mb-4">
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                            alt="Playgram Logo"
                            className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain mt-2"
                        />
                        <h2 className="font-manrope text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                            <span className="block">
                                <span className="font-bold">Coaching </span>
                                <span className="font-normal">That Brings</span>
                            </span>
                            <span className="block">
                                <span className="font-normal">Out Your </span>
                                <span className="font-normal">Best Game</span>
                            </span>
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-full lg:max-w-lg mx-auto lg:mx-0">
                        At Playgram, we offer football and basketball coaching for all ages and every skill level, helping each player grow with structured, engaging sessions.
                    </p>
                </motion.div>

                {/* Right: Image */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="relative flex items-center justify-center"
                >
                    {/* Main image */}
                    <div className="relative w-full max-w-md lg:max-w-none">
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-15_155022609.png"
                            alt="Playgram coaching session with children playing football"
                            className="w-full h-64 sm:h-80 lg:h-96 xl:h-[400px] object-cover rounded-lg"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CoachingSection;