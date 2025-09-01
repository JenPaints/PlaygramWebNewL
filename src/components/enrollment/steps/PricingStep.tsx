import React from 'react';
import { StepComponentProps, PricingPlan } from '../types';
import { PRICING_PLANS } from '../utils/constants';

interface PricingStepProps extends StepComponentProps {}

const PricingStep: React.FC<PricingStepProps> = ({
  onNext,
  onBack,
  enrollmentState,
  updateState
}) => {
  const handlePlanSelect = (plan: any) => {
    updateState({
      selectedPlan: plan,
      errors: { ...enrollmentState.errors, plan: '' }
    });
  };

  const handleContinue = () => {
    if (!enrollmentState.selectedPlan) {
      updateState({
        errors: { ...enrollmentState.errors, plan: 'Please select a plan to continue' }
      });
      return;
    }
    onNext();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateSavings = (plan: any) => {
    const originalTotal = plan.sessions * plan.originalPricePerSession;
    return originalTotal - plan.totalPrice;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto component-text-fix">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Choose Your Training Plan
            </h2>
            <p className="text-lg text-gray-600">
              Select the perfect plan to kickstart your football journey at PlayOn Sports Arena
            </p>
          </div>

      {/* Pricing Plans - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
              enrollmentState.selectedPlan?.id === plan.id
                ? 'border-blue-500 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
            } ${plan.popular ? 'ring-2 ring-orange-400' : ''}`}
            onClick={() => handlePlanSelect(plan)}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              </div>
            )}

            {/* Discount Badge */}
            {plan.discount !== '0% OFF' && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {plan.discount}
              </div>
            )}

            {/* Selection Indicator */}
            {enrollmentState.selectedPlan?.id === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Plan Content */}
            <div className="pt-4 text-center">
              {/* Duration */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.duration}
              </h3>
              
              {/* Classes */}
              <div className="text-gray-600 mb-4">
                {plan.sessions} classes
              </div>

              {/* Price per session */}
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{plan.pricePerSession}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                per session
              </div>

              {/* Total price */}
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(plan.totalPrice)} total
              </div>
            </div>
          </div>
        ))}
      </div>

          {/* Error Message */}
          {enrollmentState.errors.plan && (
            <div className="text-center mt-6">
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 inline-block">
                {enrollmentState.errors.plan}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Court Details</span>
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!enrollmentState.selectedPlan}
            className={`flex items-center space-x-2 font-semibold py-3 px-8 rounded-xl transition-all duration-300 ${
              enrollmentState.selectedPlan
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Payment</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingStep;