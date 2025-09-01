import { motion } from "framer-motion";

interface CookiePolicyProps {
    setCurrentView: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'privacy' | 'terms' | 'cookies') => void;
}

const CookiePolicy = ({ setCurrentView }: CookiePolicyProps) => {
    return (
        <div className="min-h-screen text-white" style={{
            background: 'radial-gradient(ellipse at top left, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(137, 211, 236, 0.08) 0%, transparent 50%), linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
        }}>
            {/* Header */}
            <div className="py-16" style={{
                background: 'radial-gradient(ellipse at center top, rgba(215, 36, 63, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom center, rgba(137, 211, 236, 0.06) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 100%)'
            }}>
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <button
                            onClick={() => setCurrentView('home')}
                            className="text-[#89D3EC] hover:text-white mb-4 flex items-center transition-colors"
                        >
                            ← Back to Home
                        </button>
                        <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
                        <p className="text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="prose prose-lg max-w-none"
                >
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                What Are Cookies?
                            </span>
                        </h2>
                        <p className="text-gray-300 mb-4">
                            Cookies are small text files that are stored on your device when you visit our website.
                            They help us provide you with a better experience by remembering your preferences and
                            understanding how you use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                How We Use Cookies
                            </span>
                        </h2>
                        <p className="text-gray-300 mb-4">Playgram uses cookies for the following purposes:</p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2">
                            <li>To keep you logged in to your account</li>
                            <li>To remember your preferences and settings</li>
                            <li>To analyze website traffic and usage patterns</li>
                            <li>To improve our services and user experience</li>
                            <li>To provide personalized content and recommendations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                Types of Cookies We Use
                            </span>
                        </h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Essential Cookies</h3>
                            <p className="text-gray-300">
                                These cookies are necessary for the website to function properly. They enable core functionality
                                such as security, network management, and accessibility.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Performance Cookies</h3>
                            <p className="text-gray-300">
                                These cookies help us understand how visitors interact with our website by collecting and
                                reporting information anonymously.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Functional Cookies</h3>
                            <p className="text-gray-300">
                                These cookies enable the website to provide enhanced functionality and personalization,
                                such as remembering your login details and preferences.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Marketing Cookies</h3>
                            <p className="text-gray-300">
                                These cookies are used to deliver advertisements that are relevant to you and your interests.
                                They also help measure the effectiveness of advertising campaigns.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                Third-Party Cookies
                            </span>
                        </h2>
                        <p className="text-gray-300 mb-4">
                            We may also use third-party services that set cookies on your device, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2">
                            <li>Google Analytics for website analytics</li>
                            <li>Payment processors for secure transactions</li>
                            <li>Social media platforms for sharing functionality</li>
                            <li>Customer support tools for better service</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                Managing Your Cookie Preferences
                            </span>
                        </h2>
                        <p className="text-gray-300 mb-4">
                            You can control and manage cookies in several ways:
                        </p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2">
                            <li>Use your browser settings to block or delete cookies</li>
                            <li>Opt out of third-party advertising cookies</li>
                            <li>Use private/incognito browsing mode</li>
                            <li>Contact us to discuss your cookie preferences</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            Please note that disabling certain cookies may affect the functionality of our website
                            and your user experience.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                Updates to This Policy
                            </span>
                        </h2>
                        <p className="text-gray-300">
                            We may update this Cookie Policy from time to time to reflect changes in our practices
                            or for other operational, legal, or regulatory reasons. We encourage you to review this
                            policy periodically.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                                Contact Us
                            </span>
                        </h2>
                        <p className="text-gray-300">
                            If you have any questions about our use of cookies, please contact us at:
                            <br />
                            Email: support@playgram.com
                            <br />
                            Phone: +91 7888388817
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
};

export default CookiePolicy;