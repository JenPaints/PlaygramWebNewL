import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const EnquirySection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sport: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission for demo purposes
    setTimeout(() => {
      toast.success("Enquiry submitted successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", sport: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at bottom left, rgba(137, 211, 236, 0.1) 0%, transparent 50%), radial-gradient(ellipse at top right, rgba(215, 36, 63, 0.08) 0%, transparent 60%), linear-gradient(135deg, #000000 0%, #0a0a0a 100%)'
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#D7243F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#89D3EC] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="text-white">Ready to </span>
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
              Get Started?
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Have questions about our coaching programs? Want to know more about pricing or schedules? 
            We're here to help you begin your athletic journey.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Get in Touch</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our team of expert coaches and support staff are ready to help you achieve your athletic goals. 
                Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: "📍",
                  title: "Visit Our Facility",
                  info: "4th Floor, BL Complex, 462, 16th Cross Rd, Sector 4, HSR Layout, Bengaluru, Karnataka 560102",
                  gradient: "from-[#D7243F] to-red-600"
                },
                {
                  icon: "📞",
                  title: "Call Us",
                  info: "+91 7888388817",
                  gradient: "from-[#89D3EC] to-blue-500"
                },
                {
                  icon: <Mail className="w-6 h-6" />,
                  title: "Email Us", 
                  info: "support@playgram.app",
                  gradient: "from-[#D7243F] to-[#89D3EC]"
                }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-2xl border border-gray-700/50 hover:border-[#89D3EC]/50 transition-colors"
                >
                  <div className="text-white">{contact.icon}</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{contact.title}</h4>
                    <p className="text-gray-300">{contact.info}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { name: "Instagram", icon: Instagram },
                  { name: "Facebook", icon: Facebook },
                ].map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.button
                      key={social.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 bg-gray-800/50 hover:bg-gradient-to-r hover:from-[#D7243F] hover:to-[#89D3EC] rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Enquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Sport of Interest *
                    </label>
                    <select
                      name="sport"
                      value={formData.sport}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors"
                    >
                      <option value="">Select a sport</option>
                      <option value="Football">Football</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Multiple">Multiple Sports</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#89D3EC] focus:ring-1 focus:ring-[#89D3EC] outline-none transition-colors resize-none"
                    placeholder="Tell us about your goals, experience level, or any questions you have..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-[#D7243F]/25 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EnquirySection;
