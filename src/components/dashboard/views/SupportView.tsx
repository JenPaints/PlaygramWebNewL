import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, HelpCircle, Send, Clock, CheckCircle, AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';

export const SupportView: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  
  const userTickets = useQuery(api.enquiries.getUserEnquiries, user ? { phone: user.phoneNumber } : "skip") ?? [];
  
  // Submit support ticket
  const submitTicket = useMutation(api.enquiries.submitEnquiry);

  const supportCategories = [
    'Technical Issues',
    'Billing & Payments',
    'Training Sessions',
    'Account Management',
    'Merchandise',
    'General Inquiry'
  ];

  const faqs = [
    {
      id: 1,
      category: 'Training Sessions',
      question: 'How do I reschedule my training session?',
      answer: 'You can reschedule your session up to 24 hours in advance through the My Batches section or by contacting your coach directly. Go to Dashboard > My Batches > Select your session > Reschedule option.'
    },
    {
      id: 2,
      category: 'Training Sessions',
      question: 'What happens if I miss a session?',
      answer: 'Missed sessions can be made up within the same month, subject to availability. Please contact support to arrange a makeup session. Note that frequent no-shows may affect your enrollment status.'
    },
    {
      id: 3,
      category: 'Account Management',
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked and visible in your dashboard. You can view completed sessions, achievements, performance metrics, and attendance records in the Dashboard > Overview section.'
    },
    {
      id: 4,
      category: 'Training Sessions',
      question: 'Can I change my training location?',
      answer: 'Location changes are possible based on availability. Please contact support at least 48 hours before your next session. Additional charges may apply for premium locations.'
    },
    {
      id: 5,
      category: 'Billing & Payments',
      question: 'How do I update my payment method?',
      answer: 'Go to Settings > Billing to update your payment information. You can add multiple payment methods and set a default one for automatic renewals.'
    },
    {
      id: 6,
      category: 'Billing & Payments',
      question: 'What is your refund policy?',
      answer: 'Refunds are available within 7 days of enrollment if no sessions have been attended. Partial refunds may be considered for medical emergencies with proper documentation.'
    },
    {
      id: 7,
      category: 'Technical Issues',
      question: 'I cannot access my dashboard. What should I do?',
      answer: 'Try clearing your browser cache and cookies, or use an incognito/private browsing window. If the issue persists, contact our technical support team.'
    },
    {
      id: 8,
      category: 'Merchandise',
      question: 'How do I track my merchandise order?',
      answer: 'You can track your order status in Dashboard > Merchandise > My Orders. You will also receive SMS updates on your registered phone number.'
    }
  ];
  
  // Filter FAQs based on search query
  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject || !message || !selectedCategory) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      await submitTicket({
        name: user.name || user.fullName || 'User',
        email: user.email || '',
        phone: user.phoneNumber,
        sport: selectedCategory,
        message: `Subject: ${subject}\n\nPriority: ${priority}\n\nMessage: ${message}`
      });
      
      // Reset form
      setSelectedCategory('');
      setMessage('');
      setSubject('');
      setPriority('medium');
      setSubmitStatus('success');
      
      // Switch to tickets tab to show the submitted ticket
      setTimeout(() => setActiveTab('tickets'), 1000);
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600 mt-1">Get help and support for your PlayGram experience</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'contact', label: 'Contact Support', icon: MessageCircle },
            { id: 'tickets', label: 'My Tickets', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'tickets' && userTickets.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {userTickets.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* FAQ Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['All', 'Training Sessions', 'Billing & Payments', 'Technical Issues', 'Account Management', 'Merchandise'].map((category) => (
              <button
                key={category}
                onClick={() => setSearchQuery(category === 'All' ? '' : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (category === 'All' && !searchQuery) || searchQuery === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                    <span className="text-sm text-blue-600 mt-1">{faq.category}</span>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
            
            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-600">Try adjusting your search or browse different categories.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Options */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone Support</h3>
                  <p className="text-sm text-gray-600">Mon-Fri, 9 AM - 6 PM</p>
                </div>
              </div>
              <p className="text-gray-900 font-medium">+91 7888388817</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Support</h3>
                  <p className="text-sm text-gray-600">24/7 Response</p>
                </div>
              </div>
              <p className="text-gray-900 font-medium">support@playgram.app</p>
            </div>


          </div>

          {/* Response Time */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={16} className="text-gray-600" />
              <span className="font-medium text-gray-900">Response Time</span>
            </div>
            <p className="text-sm text-gray-600">
              We typically respond within 2-4 hours during business hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Support Ticket</h2>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">Ticket submitted successfully! We'll get back to you soon.</span>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Failed to submit ticket. Please try again.</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {supportCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !subject || !message || !selectedCategory}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
        </div>
      )}
      
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Support Tickets</h2>
            <button
              onClick={() => setActiveTab('contact')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              New Ticket
            </button>
          </div>
          
          {userTickets.length > 0 ? (
               <div className="space-y-4">
                 {userTickets.map((ticket: any) => (
                <div key={ticket._id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                      {ticket.sport} - {ticket.message.split('\n')[0].replace('Subject: ', '')}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.message.split('\n')[1].replace('Priority: ', '').toLowerCase())}`}>
                      {ticket.message.split('\n')[1].replace('Priority: ', '')}
                    </span>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(ticket._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-gray-600 text-sm">
                    {ticket.message.split('\n').slice(2).join('\n')}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>Ticket ID: {ticket._id.slice(-8)}</span>
                    <span>Category: {ticket.sport}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any support tickets yet.</p>
              <button
                onClick={() => setActiveTab('contact')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Submit Your First Ticket
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};