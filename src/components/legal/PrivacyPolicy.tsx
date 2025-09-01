import { motion } from "framer-motion";

interface PrivacyPolicyProps {
  setCurrentView: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'privacy' | 'terms' | 'cookies') => void;
}

const PrivacyPolicy = ({ setCurrentView }: PrivacyPolicyProps) => {
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
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
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
                1. Information We Collect
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              At Playgram, we collect information you provide directly to us, such as when you create an account, 
              book coaching sessions, or contact us for support.
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Personal information (name, email address, phone number)</li>
              <li>Profile information (age, skill level, sports preferences)</li>
              <li>Booking and payment information</li>
              <li>Communication records with our support team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                2. How We Use Your Information
              </span>
            </h2>
            <p className="text-gray-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide and improve our coaching services</li>
              <li>Process bookings and payments</li>
              <li>Send you important updates about your sessions</li>
              <li>Respond to your questions and provide customer support</li>
              <li>Analyze usage patterns to improve our app and services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                3. Information Sharing
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>With coaches to facilitate your training sessions</li>
              <li>With payment processors to handle transactions</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                4. Data Security
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                5. Your Rights
              </span>
            </h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                6. Contact Us
              </span>
            </h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;