import { motion } from "framer-motion";

interface TermsOfServiceProps {
  setCurrentView: (view: 'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'privacy' | 'terms' | 'cookies') => void;
}

const TermsOfService = ({ setCurrentView }: TermsOfServiceProps) => {
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
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
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
                1. Acceptance of Terms
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              By accessing and using Playgram's services, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                2. Description of Service
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              Playgram provides sports coaching services including but not limited to football, basketball, 
              badminton, and swimming coaching for all ages and skill levels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                3. User Responsibilities
              </span>
            </h2>
            <p className="text-gray-300 mb-4">As a user of our services, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Attend scheduled coaching sessions or cancel with appropriate notice</li>
              <li>Follow safety guidelines and coach instructions during sessions</li>
              <li>Treat coaches and other participants with respect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                4. Booking and Cancellation Policy
              </span>
            </h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Bookings must be made at least 24 hours in advance</li>
              <li>Cancellations must be made at least 12 hours before the session</li>
              <li>Late cancellations may result in charges</li>
              <li>No-shows will be charged the full session fee</li>
              <li>Refunds are processed according to our refund policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                5. Payment Terms
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              Payment is required at the time of booking. We accept major credit cards and digital payment methods. 
              All fees are non-refundable except as specified in our cancellation policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                6. Liability and Safety
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              Participation in sports activities involves inherent risks. By using our services, you acknowledge 
              these risks and agree that Playgram is not liable for injuries that may occur during coaching sessions. 
              We recommend appropriate insurance coverage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                7. Intellectual Property
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              All content, trademarks, and intellectual property on the Playgram platform are owned by Playgram 
              or our licensors. You may not use, copy, or distribute our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                8. Termination
              </span>
            </h2>
            <p className="text-gray-300 mb-4">
              We reserve the right to terminate or suspend your account at any time for violations of these terms 
              or for any other reason at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
                9. Contact Information
              </span>
            </h2>
            <p className="text-gray-300">
              For questions about these Terms of Service, please contact us at:
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

export default TermsOfService;