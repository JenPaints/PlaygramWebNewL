import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Users, 
  Copy, 
  Share2, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  UserPlus,
  Star,
  ExternalLink
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';

const StudentReferralView: React.FC = () => {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  // Get current user data to access student ID
  const currentUser = useQuery(
    api.auth.getUserByPhone,
    user?.phoneNumber ? { phoneNumber: user.phoneNumber } : "skip"
  );

  // Get referral stats for this student
  const referralStats = useQuery(
    api.referrals.getReferralStats,
    currentUser?.studentId ? { studentId: currentUser.studentId } : "skip"
  );

  // Get referral rewards for this user
  const referralRewards = useQuery(
    api.referrals.getUserReferralRewards,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Get active referral settings
  const referralSettings = useQuery(api.referrals.getReferralSettings) || [];

  const handleCopyReferralCode = () => {
    const referralCode = currentUser?.referralCode || currentUser?.studentId;
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareReferral = () => {
    const referralCode = currentUser?.referralCode || currentUser?.studentId;
    if (referralCode) {
      const shareText = `Join Playgram 360 sports coaching with my referral code: ${referralCode}. Get professional coaching and I'll earn free sessions too! 🏆`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join Playgram 360 Sports Coaching',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success('Referral message copied to clipboard!');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your referral information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button className="text-gray-600">
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4 p-4">
        {/* Header with Image */}
        <div className="text-center">
          {/* Top Image */}
          <div className="mb-4">
            <img 
              src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-23_025553682.png" 
              alt="Sports Referral" 
              className="w-48 h-auto mx-auto"
            />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-xl font-bold text-gray-900 mb-1">Invite More. Play More</h1>
          <p className="text-gray-500 text-sm mb-4">Because sports are better with friends.</p>
        </div>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="text-center">
            <h2 className="text-base font-medium text-gray-700 mb-3">Referral Code</h2>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 tracking-wider">{currentUser.referralCode || currentUser.studentId}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopyReferralCode}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-sm border"
              >
                {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={handleShareReferral}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Refer Now Button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
          Refer Now
        </button>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {referralStats?.stats?.totalReferrals || 1}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total<br />Referrals
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {referralStats?.stats?.completedReferrals || 1}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Successful<br />Referrals
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {referralStats?.stats?.totalSessionsEarned || 3}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Free Sessions<br />Earned
            </div>
          </div>
        </div>

        {/* Referral Rewards Section */}
        {referralSettings.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Rewards</h3>
            <p className="text-gray-600 text-sm mb-4">Earn free sessions based on your friend's package choice</p>
            <div className="grid grid-cols-2 gap-3">
              {referralSettings.map((setting) => (
                <div key={setting._id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600 mb-1">
                    +{setting.rewardSessions}
                  </div>
                  <div className="text-xs text-gray-500">
                    Free Sessions
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {setting.packageDuration.includes('month') ? 
                      setting.packageDuration.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                      setting.packageDuration
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReferralView;