import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingStep from '../PricingStep';
import { EnrollmentState } from '../../types';
import { PRICING_PLANS } from '../../utils/constants';

const mockEnrollmentState: EnrollmentState = {
  currentStep: 'pricing',
  userPhone: '+911234567890',
  isAuthenticated: true,
  selectedPlan: null,
  paymentStatus: 'pending',
  enrollmentData: {
    phoneNumber: '+911234567890',
    sport: 'football',
    planId: '',
    status: 'pending',
    enrollmentDate: new Date()
  },
  errors: {}
};

const mockProps = {
  onNext: jest.fn(),
  onBack: jest.fn(),
  enrollmentState: mockEnrollmentState,
  updateState: jest.fn()
};

describe('PricingStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pricing plans correctly', () => {
    render(<PricingStep {...mockProps} />);
    
    expect(screen.getByText('Choose Your Training Plan')).toBeInTheDocument();
    expect(screen.getByText('1-month Plan')).toBeInTheDocument();
    expect(screen.getByText('3-month Plan')).toBeInTheDocument();
    expect(screen.getByText('12-month Plan')).toBeInTheDocument();
  });

  it('displays most popular badge for yearly plan', () => {
    render(<PricingStep {...mockProps} />);
    
    expect(screen.getByText('🏆 Most Popular')).toBeInTheDocument();
  });

  it('shows discount badges for all plans', () => {
    render(<PricingStep {...mockProps} />);
    
    expect(screen.getByText('25% OFF')).toBeInTheDocument();
    expect(screen.getByText('33% OFF')).toBeInTheDocument();
    expect(screen.getByText('48% OFF')).toBeInTheDocument();
  });

  it('handles plan selection', () => {
    render(<PricingStep {...mockProps} />);
    
    const monthlyPlan = screen.getByText('1-month Plan').closest('div');
    fireEvent.click(monthlyPlan!);
    
    expect(mockProps.updateState).toHaveBeenCalledWith({
      selectedPlan: PRICING_PLANS[0],
      errors: { ...mockEnrollmentState.errors, plan: '' }
    });
  });

  it('disables continue button when no plan selected', () => {
    render(<PricingStep {...mockProps} />);
    
    const continueButton = screen.getByText('Proceed to Payment');
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when plan is selected', () => {
    const stateWithSelectedPlan = {
      ...mockEnrollmentState,
      selectedPlan: PRICING_PLANS[0]
    };
    
    render(<PricingStep {...mockProps} enrollmentState={stateWithSelectedPlan} />);
    
    const continueButton = screen.getByText('Proceed to Payment');
    expect(continueButton).not.toBeDisabled();
  });

  it('shows error message when trying to continue without selection', () => {
    render(<PricingStep {...mockProps} />);
    
    const continueButton = screen.getByText('Proceed to Payment');
    fireEvent.click(continueButton);
    
    expect(mockProps.updateState).toHaveBeenCalledWith({
      errors: { ...mockEnrollmentState.errors, plan: 'Please select a plan to continue' }
    });
  });

  it('displays selected plan summary', () => {
    const stateWithSelectedPlan = {
      ...mockEnrollmentState,
      selectedPlan: PRICING_PLANS[0]
    };
    
    render(<PricingStep {...mockProps} enrollmentState={stateWithSelectedPlan} />);
    
    expect(screen.getByText('Selected: 1 month Plan')).toBeInTheDocument();
    expect(screen.getByText('8 sessions • ₹375 per session')).toBeInTheDocument();
  });

  it('shows special promotion section', () => {
    render(<PricingStep {...mockProps} />);
    
    expect(screen.getByText('🎯 Why Choose the 1-Year Plan?')).toBeInTheDocument();
    expect(screen.getByText('₹23,000+')).toBeInTheDocument();
    expect(screen.getByText('Total Savings')).toBeInTheDocument();
  });

  it('calls onNext when continue button is clicked with selected plan', () => {
    const stateWithSelectedPlan = {
      ...mockEnrollmentState,
      selectedPlan: PRICING_PLANS[0]
    };
    
    render(<PricingStep {...mockProps} enrollmentState={stateWithSelectedPlan} />);
    
    const continueButton = screen.getByText('Proceed to Payment');
    fireEvent.click(continueButton);
    
    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button is clicked', () => {
    render(<PricingStep {...mockProps} />);
    
    const backButton = screen.getByText('Back to Court Details');
    fireEvent.click(backButton);
    
    expect(mockProps.onBack).toHaveBeenCalled();
  });
});