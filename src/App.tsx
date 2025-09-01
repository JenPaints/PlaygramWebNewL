import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CoachingSection from "./components/CoachingSection";
import SportsSelection from "./components/SportsSelection";
import WholeExperienceIntroSection from "./components/WholeExperienceIntroSection";
import BetterCoachingSection from "./components/BetterCoachingSection";
import MobileAppSection from "./components/MobileAppSection";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import FootballPage from "./components/sports/FootballPage";
import BasketballPage from "./components/sports/BasketballPage";
import BadmintonPage from "./components/sports/BadmintonPage";
import SwimmingPage from "./components/sports/SwimmingPage";
import WaitlistPage from "./components/WaitlistPage";
import ContactPage from "./components/ContactPage";
import SectionTransition from "./components/ui/SectionTransition";
import AdminWrapper from "./components/admin/AdminWrapper";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import CookiePolicy from "./components/legal/CookiePolicy";
import { analytics } from "./services/analytics";
import { notificationService } from "./services/notificationService";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { LoginModal } from "./components/auth/LoginModal";
import { Dashboard } from "./components/dashboard/Dashboard";
import { CoachLoginPage } from "./components/coach/CoachLoginPage";
import CoachDashboard from "./components/coach/CoachDashboard";
import { CoachingView } from "./components/dashboard/views/CoachingView";
import MobileApp from "./components/mobile/MobileApp";
import { isMobileApp } from "./utils/mobileDetection";

// Import text visibility debug utility for development

if (process.env.NODE_ENV === 'development') {
  import('./utils/textVisibilityDebug');
}

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'football' | 'basketball' | 'badminton' | 'swimming' | 'waitlist' | 'admin' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'dashboard' | 'coach' | 'coaching'>('home');
  const [showCoachDashboard, setShowCoachDashboard] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Return mobile app if running in Capacitor environment
  if (isMobileApp()) {
    return <MobileApp />;
  }

  // Handle URL routing and navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      switch (path) {
        case '/admin':
          setCurrentView('admin');
          break;
        case '/football':
          setCurrentView('football');
          break;
        case '/basketball':
          setCurrentView('basketball');
          break;
        case '/badminton':
          setCurrentView('badminton');
          break;
        case '/swimming':
          setCurrentView('swimming');
          break;
        case '/waitlist':
          setCurrentView('waitlist');
          break;
        case '/contact':
          setCurrentView('contact');
          break;
        case '/privacy':
          setCurrentView('privacy');
          break;
        case '/terms':
          setCurrentView('terms');
          break;
        case '/cookies':
          setCurrentView('cookies');
          break;
        case '/dashboard':
          setCurrentView('dashboard');
          break;
        case '/coach':
          setCurrentView('coach');
          break;
        case '/coaching':
          setCurrentView('coaching');
          break;
        default:
          setCurrentView('home');
      }
    };

    // Handle initial route
    handleRouteChange();

    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Navigation helper function
  const navigateTo = (view: typeof currentView, updateUrl = true) => {
    // Check if user needs to login for dashboard
    if (view === 'dashboard' && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setCurrentView(view);

    if (updateUrl) {
      const routes = {
        'home': '/',
        'football': '/football',
        'basketball': '/basketball',
        'badminton': '/badminton',
        'swimming': '/swimming',
        'waitlist': '/waitlist',
        'admin': '/admin',
        'contact': '/contact',
        'privacy': '/privacy',
        'terms': '/terms',
        'cookies': '/cookies',
        'dashboard': '/dashboard',
        'coach': '/coach',
        'coaching': '/coaching'
      };

      const newPath = routes[view];
      if (newPath !== window.location.pathname) {
        window.history.pushState({}, '', newPath);
      }
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Let the component re-render with the new user data
    // The admin route will handle the user type check automatically
  };

  // Track page views when view changes with error handling
  useEffect(() => {
    try {
      const pageNames = {
        'home': 'Home Page',
        'football': 'Football Page',
        'basketball': 'Basketball Page',
        'badminton': 'Badminton Page',
        'swimming': 'Swimming Page',
        'waitlist': 'Waitlist Page',
        'admin': 'Admin Dashboard',
        'contact': 'Contact Page',
        'dashboard': 'User Dashboard',
        'coach': 'Coach Login',
        'coaching': 'Coaching View',
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service',
        'cookies': 'Cookie Policy'
      };

      analytics.trackPageView(currentView, pageNames[currentView]);
    } catch (error) {
      console.error('Failed to track page view:', error);
      // Continue without analytics if tracking fails
    }
  }, [currentView]);

  // Initialize notification service with error handling
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();

        // Show welcome notification if permission is granted
        if (notificationService.getPermissionStatus() === 'granted') {
          setTimeout(() => {
            notificationService.showNotification(
              '🎯 Welcome to PlayGram!',
              {
                body: 'Stay updated with training schedules, announcements, and more.',
                tag: 'welcome-notification',
                url: '/'
              }
            ).catch(error => {
              console.error('Failed to show welcome notification:', error);
            });
          }, 3000);
        }
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
        // Continue without notifications if initialization fails
      }
    };

    initNotifications();
  }, []);

  // Scroll to top when view changes with error handling
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to scroll to top:', error);
      // Fallback to instant scroll
      try {
        window.scrollTo(0, 0);
      } catch (fallbackError) {
        console.error('Failed to scroll (fallback):', fallbackError);
      }
    }
  }, [currentView]);

  // Handle admin route authentication - removed because AdminWrapper handles its own auth

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        // AdminWrapper handles its own authentication flow
        return <AdminWrapper />;
      case 'football':
        return <FootballPage onBack={() => navigateTo('home')} setCurrentView={navigateTo} />;
      case 'basketball':
        return <BasketballPage onBack={() => navigateTo('home')} setCurrentView={navigateTo} />;
      case 'badminton':
        return <BadmintonPage onBack={() => navigateTo('home')} />;
      case 'swimming':
        return <SwimmingPage onBack={() => navigateTo('home')} />;
      case 'waitlist':
        return <WaitlistPage onBack={() => navigateTo('home')} />;
      case 'contact':
        return <ContactPage onBack={() => navigateTo('home')} setCurrentView={navigateTo} />;
      case 'privacy':
        return <PrivacyPolicy setCurrentView={navigateTo} />;
      case 'terms':
        return <TermsOfService setCurrentView={navigateTo} />;
      case 'cookies':
        return <CookiePolicy setCurrentView={navigateTo} />;
      case 'dashboard':
        return <Dashboard onNavigateHome={() => navigateTo('home')} />;
      case 'coach':
        if (showCoachDashboard) {
          return <CoachDashboard />;
        } else {
          return (
            <CoachLoginPage
              onBack={() => navigateTo('home')}
              onSuccess={() => setShowCoachDashboard(true)}
            />
          );
        }
      case 'coaching':
        return <Dashboard initialView="coaching" onNavigateHome={() => navigateTo('home')} />;
      default:
        return (
          <>
            <HeroSection setCurrentView={navigateTo} />
            <CoachingSection />

            <SectionTransition
              topGradient="from-transparent via-gray-900/40 to-gray-900"
              marginTop="-mt-24"
            >
              <SportsSelection setCurrentView={navigateTo} />
            </SectionTransition>

            <WholeExperienceIntroSection />

            <BetterCoachingSection />

            <MobileAppSection setCurrentView={navigateTo} />

            <FAQSection />

            <SectionTransition
              topGradient="from-gray-900 via-gray-800/60 to-black"
              marginTop="-mt-8"
            >
              <Footer setCurrentView={navigateTo} />
            </SectionTransition>

          </>
        );
    }
  };

  // Don't show navbar for admin, dashboard, coach, coaching and legal pages
  if (currentView === 'admin' || currentView === 'dashboard' || currentView === 'coach' || currentView === 'coaching' || currentView === 'privacy' || currentView === 'terms' || currentView === 'cookies') {
    return (
      <>
        {renderCurrentView()}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden scroll-smooth" style={{
      background: 'radial-gradient(ellipse at top left, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(137, 211, 236, 0.08) 0%, transparent 50%), linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
    }}>
      <Navbar currentView={currentView} setCurrentView={navigateTo} />
      <div className="relative">
        {renderCurrentView()}
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
