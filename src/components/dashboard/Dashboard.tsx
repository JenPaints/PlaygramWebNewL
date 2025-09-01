import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { DashboardSidebar } from './DashboardSidebar';
import { MobileNavigation } from './MobileNavigation';
import { DashboardContent } from './DashboardContent';
import { useQuery, useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { userEnrollmentService } from '../../services/userEnrollmentService';
import { App } from '@capacitor/app';
import { isMobileApp } from '../../utils/mobileDetection';
import SwipeGestureHandler from '../mobile/SwipeGestureHandler';
import MobileLayout from '../mobile/MobileLayout';

export type DashboardView = 'overview' | 'coaching' | 'batches' | 'merchandise' | 'notifications' | 'settings' | 'support' | 'referrals' | 'orders' | 'profile';

interface DashboardProps {
  initialView?: DashboardView;
  onNavigateHome?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialView = 'overview', onNavigateHome }) => {
  const [currentView, setCurrentView] = useState<DashboardView>(initialView);
  const { user } = useAuth();
  const convex = useConvex();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Initialize the enrollment service with Convex client
  useEffect(() => {
    userEnrollmentService.setConvexClient(convex);
  }, [convex]);

  // Fetch user enrollments from the correct table
  const enrollments = useQuery(api.userEnrollments.getUserEnrollmentsByPhone, {
    phoneNumber: user?.phoneNumber || ''
  });

  // Fetch trial bookings
  const trialBookings = useQuery(api.trialBookings.getTrialBookingsByPhone, {
    phoneNumber: user?.phoneNumber || ''
  });

  // Navigation history for proper back button handling
  const [navigationHistory, setNavigationHistory] = useState<DashboardView[]>([initialView]);

  // Navigation handler that manages history
  const handleViewChange = (newView: DashboardView) => {
    setNavigationHistory(prev => {
      // If the new view is already the last item in history, don't add it again
      if (prev[prev.length - 1] === newView) {
        return prev;
      }
      // Add new view to history, but limit history to last 10 items
      const newHistory = [...prev, newView];
      return newHistory.slice(-10);
    });
    setCurrentView(newView);
    
    // Scroll to top when view changes
    scrollToTop();
  };

  // Scroll to top function
  const scrollToTop = () => {
    // Scroll the main content area
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Also scroll the window as fallback
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // For mobile apps, also try scrolling the document body
    if (isMobileApp()) {
      document.body.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current view
      const previousView = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentView(previousView);
      console.log('📱 Navigating back to:', previousView);
      
      // Scroll to top when going back
      scrollToTop();
    } else {
      // If no history, go to overview or logout
      if (currentView === 'overview') {
        console.log('🏠 On overview, going back to login');
        if (onNavigateHome) {
          onNavigateHome();
        }
      } else {
        setCurrentView('overview');
        scrollToTop();
      }
    }
  };

  // Handle Android back button in dashboard with proper navigation
  useEffect(() => {
    if (!isMobileApp()) return;

    const handleDashboardBackButton = () => {
      console.log('🔙 Dashboard back button - Current view:', currentView, 'History:', navigationHistory);
      handleBackNavigation();
      return true; // Prevent default back action
    };

    // Add back button listener
    App.addListener('backButton', handleDashboardBackButton);

    // Cleanup
    return () => {
      App.removeAllListeners();
    };
  }, [currentView, navigationHistory, onNavigateHome]);

  // Handle swipe back navigation
  const handleSwipeBack = () => {
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <SwipeGestureHandler
      onSwipeBack={isMobileApp() ? handleSwipeBack : undefined}
      enabled={isMobileApp()}
    >
      <MobileLayout>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            user={user}
            onNavigateHome={onNavigateHome}
          />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNavigation
            currentView={currentView}
            onViewChange={handleViewChange}
            user={user}
            onNavigateHome={onNavigateHome}
            navigationHistory={navigationHistory}
            onBackNavigation={handleBackNavigation}
          />
        </div>

        {/* Main Content */}
        <div 
          ref={mainContentRef}
          className={`lg:pl-64 min-h-screen ${isMobileApp() ? 'native-content' : 'mobile-content-with-nav'} lg:pt-0 lg:pb-0 overflow-y-auto`}
        >
          <DashboardContent
            currentView={currentView}
            user={user}
            enrollments={enrollments || []}
            trialBookings={trialBookings || []}
            setCurrentView={handleViewChange}
          />
        </div>
      </MobileLayout>
    </SwipeGestureHandler>
  );
};