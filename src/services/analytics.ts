// Google Analytics Integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Initialize Google Analytics
    if (window.gtag) {
      window.gtag('config', 'G-ETJFCXYJWY', {
        page_title: 'Playgram Website',
        page_location: 'https://playgram.app',
        stream_name: 'Playgram Website',
        stream_url: 'https://playgram.app',
        stream_id: '11508273791',
        measurement_id: 'G-ETJFCXYJWY'
      });
      this.isInitialized = true;
    }
  }

  // Track page views
  trackPageView(pageName: string, pageTitle?: string) {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
        stream_id: '11508273791'
      });
    }
  }

  // Track user interactions
  trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        stream_id: '11508273791',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track user registration
  trackUserRegistration(sport: string, plan: string) {
    this.trackEvent('sign_up', {
      method: 'website',
      sport: sport,
      plan: plan,
      value: 1
    });
  }

  // Track booking events
  trackBooking(sport: string, type: 'trial' | 'enrollment', value?: number) {
    this.trackEvent('purchase', {
      currency: 'INR',
      value: value || 0,
      sport: sport,
      booking_type: type,
      stream_name: 'Playgram Website'
    });
  }

  // Track content engagement
  trackContentEngagement(contentType: string, contentId: string, action: string) {
    this.trackEvent('engagement', {
      content_type: contentType,
      content_id: contentId,
      action: action,
      engagement_time_msec: Date.now()
    });
  }

  // Track admin actions
  trackAdminAction(action: string, section: string, details?: Record<string, any>) {
    this.trackEvent('admin_action', {
      action: action,
      section: section,
      ...details,
      user_type: 'admin'
    });
  }

  // Get real-time analytics data (simulated for demo)
  async getRealTimeData() {
    // In a real app, this would fetch from Google Analytics Reporting API
    return {
      activeUsers: Math.floor(Math.random() * 50) + 20,
      pageViews: Math.floor(Math.random() * 200) + 100,
      sessions: Math.floor(Math.random() * 80) + 40,
      bounceRate: (Math.random() * 30 + 20).toFixed(1),
      avgSessionDuration: Math.floor(Math.random() * 300 + 120),
      topPages: [
        { page: '/', views: Math.floor(Math.random() * 100) + 50 },
        { page: '/football', views: Math.floor(Math.random() * 50) + 25 },
        { page: '/basketball', views: Math.floor(Math.random() * 40) + 20 },
        { page: '/swimming', views: Math.floor(Math.random() * 35) + 15 }
      ],
      usersByLocation: [
        { country: 'India', users: Math.floor(Math.random() * 30) + 15 },
        { country: 'USA', users: Math.floor(Math.random() * 10) + 5 },
        { country: 'UK', users: Math.floor(Math.random() * 8) + 3 },
        { country: 'Australia', users: Math.floor(Math.random() * 6) + 2 }
      ]
    };
  }
}

export const analytics = AnalyticsService.getInstance();