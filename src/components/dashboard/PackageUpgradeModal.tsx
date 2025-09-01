import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { merchandisePaymentService } from '../../services/merchandisePayment';

interface PackageUpgradeModalProps {
  enrollmentId: Id<"userEnrollments">;
  currentEnrollment: any;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

interface UpgradePackage {
  duration: string;
  sessions: number;
  price: number;
  savings: number;
  features: string[];
}

const PackageUpgradeModal: React.FC<PackageUpgradeModalProps> = ({
  enrollmentId,
  currentEnrollment,
  onClose,
  onUpgradeSuccess
}) => {
  const [selectedPackage, setSelectedPackage] = useState<UpgradePackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if enrollment can be upgraded
  const upgradeEligibility = useQuery(
    api.userEnrollments.canUpgradeEnrollment,
    { enrollmentId }
  );
  
  // Upgrade enrollment mutation
  const upgradeEnrollment = useMutation(api.userEnrollments.upgradeEnrollmentPackage);
  
  // Available upgrade packages (only show packages longer than current)
  const getAvailablePackages = (): UpgradePackage[] => {
    const currentDurationMonths = parseInt(currentEnrollment.packageDuration) || 1;
    const packages: UpgradePackage[] = [];
    
    if (currentDurationMonths < 3) {
      packages.push({
        duration: '3 months',
        sessions: 30,
        price: 4500,
        savings: 500,
        features: ['30 Training Sessions', 'Performance Tracking', 'Nutrition Guidance', 'Priority Support']
      });
    }
    
    if (currentDurationMonths < 6) {
      packages.push({
        duration: '6 months',
        sessions: 60,
        price: 8500,
        savings: 1500,
        features: ['60 Training Sessions', 'Advanced Analytics', 'Personal Coach Consultation', 'Injury Prevention Program']
      });
    }
    
    if (currentDurationMonths < 12) {
      packages.push({
        duration: '1 year',
        sessions: 120,
        price: 15000,
        savings: 5000,
        features: ['120 Training Sessions', 'Complete Fitness Journey', 'Monthly Progress Reviews', 'Exclusive Events Access']
      });
    }
    
    return packages;
  };
  
  const availablePackages = getAvailablePackages();
  
  // Calculate upgrade pricing
  const calculateUpgradePrice = (newPackage: UpgradePackage) => {
    const currentPackageValue = currentEnrollment.paymentAmount || 0;
    const additionalSessions = newPackage.sessions - currentEnrollment.sessionsTotal;
    const additionalAmount = newPackage.price - currentPackageValue;
    
    return {
      additionalSessions,
      additionalAmount: Math.max(0, additionalAmount),
      totalValue: newPackage.price,
      savings: newPackage.savings
    };
  };
  
  // Handle package upgrade
  const handleUpgrade = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    try {
      const upgradeDetails = calculateUpgradePrice(selectedPackage);
      
      // For now, process upgrade without payment integration
      // TODO: Implement proper payment gateway for package upgrades
      if (upgradeDetails.additionalAmount > 0) {
        // Simulate payment success for demo purposes
        // In production, integrate with Razorpay or other payment gateway
        const confirmed = window.confirm(
          `Confirm upgrade to ${selectedPackage.duration} package?\n` +
          `Additional amount: ₹${upgradeDetails.additionalAmount}\n` +
          `Additional sessions: ${upgradeDetails.additionalSessions}`
        );
        
        if (!confirmed) {
          throw new Error('Payment cancelled by user');
        }
        
        // Upgrade enrollment with simulated payment
        await upgradeEnrollment({
          enrollmentId,
          newPackageType: selectedPackage.duration,
          newPackageDuration: selectedPackage.duration,
          additionalSessions: upgradeDetails.additionalSessions,
          additionalPaymentAmount: upgradeDetails.additionalAmount,
          razorpayOrderId: `upgrade-${enrollmentId}-${Date.now()}`,
        });
      } else {
        // Free upgrade (shouldn't happen but handle gracefully)
        await upgradeEnrollment({
          enrollmentId,
          newPackageType: selectedPackage.duration,
          newPackageDuration: selectedPackage.duration,
          additionalSessions: upgradeDetails.additionalSessions,
          additionalPaymentAmount: 0,
        });
      }
      
      toast.success(`Successfully upgraded to ${selectedPackage.duration} package!`);
      onUpgradeSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast.error(error.message || 'Failed to upgrade package');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!upgradeEligibility) {
    return null;
  }
  
  if (!upgradeEligibility.canUpgrade) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upgrade Not Available</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">{upgradeEligibility.reason}</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upgrade Your Package</h2>
            <p className="text-sm text-gray-600 mt-1">
              Current: {currentEnrollment.packageDuration} ({currentEnrollment.sessionsTotal} sessions)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Current Package Info */}
        <div className="p-6 bg-blue-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{upgradeEligibility.sessionsAttended}</div>
              <div className="text-sm text-gray-600">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{upgradeEligibility.remainingSessions}</div>
              <div className="text-sm text-gray-600">Sessions Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{upgradeEligibility.currentSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
          </div>
        </div>
        
        {/* Available Packages */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Upgrade</h3>
          
          {availablePackages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No upgrade packages available for your current plan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePackages.map((pkg, index) => {
                const upgradeDetails = calculateUpgradePrice(pkg);
                const isSelected = selectedPackage?.duration === pkg.duration;
                
                return (
                  <motion.div
                    key={pkg.duration}
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{pkg.duration}</h4>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        +₹{upgradeDetails.additionalAmount}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: ₹{upgradeDetails.totalValue}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Additional Sessions:</span>
                        <span className="font-medium text-green-600">+{upgradeDetails.additionalSessions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Sessions:</span>
                        <span className="font-medium">{pkg.sessions}</span>
                      </div>
                      {pkg.savings > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">You Save:</span>
                          <span className="font-medium text-green-600">₹{pkg.savings}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                        <div className="text-xs text-blue-800 text-center font-medium">
                          Selected Package
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {selectedPackage && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Upgrade Summary</h4>
                <p className="text-sm text-gray-600">
                  Upgrading to {selectedPackage.duration} package
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  +₹{calculateUpgradePrice(selectedPackage).additionalAmount}
                </div>
                <div className="text-sm text-gray-500">
                  +{calculateUpgradePrice(selectedPackage).additionalSessions} sessions
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Upgrade Package
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PackageUpgradeModal;