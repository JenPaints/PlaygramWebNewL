import { motion } from "framer-motion";
import { useState } from "react";

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "What sports do you offer coaching for?",
            answer: "We currently offer professional coaching for football and basketball, with separate programs designed for each sport."
        },
        {
            question: "Who can join Playgram coaching programs?",
            answer: "We currently offer professional coaching for football and basketball, with separate programs designed for each sport."
        },
        {
            question: "How many sessions are included in a month?",
            answer: "We currently offer professional coaching for football and basketball, with separate programs designed for each sport."
        },
        {
            question: "Can I join mid-month?",
            answer: "We currently offer professional coaching for football and basketball, with separate programs designed for each sport."
        },
        {
            question: "Where are your coaching centers located?",
            answer: "We currently offer professional coaching for football and basketball, with separate programs designed for each sport."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
            <div className="max-w-4xl mx-auto">
                {/* Section Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-normal text-center text-gray-900 mb-8 sm:mb-12 lg:mb-16"
                >
                    Frequently Asked Questions
                </motion.h2>

                {/* FAQ Items */}
                <div className="space-y-0">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`border-b border-gray-200 last:border-b-0 transition-colors duration-300 ${
                                openIndex === index ? 'bg-blue-50' : ''
                            }`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between py-6 sm:py-8 text-left hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-4 sm:space-x-6 flex-1 min-w-0">
                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-300 flex-shrink-0">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 leading-tight">
                                        {faq.question}
                                    </h3>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 45 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                            openIndex === index ? 'bg-red-500' : 'bg-transparent'
                                        }`}
                                    >
                                        <svg
                                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                                                openIndex === index ? 'text-white' : 'text-red-500'
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                    </motion.div>
                                </div>
                            </button>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: openIndex === index ? "auto" : 0,
                                    opacity: openIndex === index ? 1 : 0
                                }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="pb-6 sm:pb-8">
                                    <div className="ml-12 sm:ml-16 lg:ml-20">
                                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;