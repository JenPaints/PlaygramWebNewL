import { analytics } from './analytics';

export interface LiveMetrics {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  pageViews: number;
  growthRate: number;
  conversionRate: number;
  bounceRate: string;
  avgSessionDuration: number;
  sessionsToday: number;
  newUsersToday: number;
}

export interface LiveUser {
  id: number;
  name: string;
  email: string;
  sport: string;
  status: 'Active' | 'Pending' | 'Inactive';
  plan: string;
  lastActive: string;
  joinDate: string;
  location?: string;
}

export interface LiveActivity {
  id: number;
  message: string;
  timestamp: number;
  status: 'success' | 'info' | 'warning' | 'error';
  type: string;
  userId?: number;
}

class LiveAnalyticsService {
  private static instance: LiveAnalyticsService;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  private metrics: LiveMetrics = {
    totalUsers: 1234,
    activeUsers: 89,
    revenue: 245678,
    pageViews: 3456,
    growthRate: 12.5,
    conversionRate: 8.3,
    bounceRate: '24.5',
    avgSessionDuration: 245,
    sessionsToday: 156,
    newUsersToday: 23
  };

  private users: LiveUser[] = [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      sport: 'Football',
      status: 'Active',
      plan: 'Pro Plan',
      lastActive: '2 min ago',
      joinDate: '2024-01-15',
      location: 'Mumbai, India'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya@example.com',
      sport: 'Swimming',
      status: 'Active',
      plan: 'Elite Plan',
      lastActive: '5 min ago',
      joinDate: '2024-02-20',
      location: 'Bangalore, India'
    },
    {
      id: 3,
      name: 'Arjun Kumar',
      email: 'arjun@example.com',
      sport: 'Basketball',
      status: 'Pending',
      plan: 'Basic Plan',
      lastActive: '1 hour ago',
      joinDate: '2024-03-08',
      location: 'Delhi, India'
    }
  ];

  private activities: LiveActivity[] = [
    {
      id: 1,
      message: 'New user registration: rahul@example.com',
      timestamp: Date.now() - 120000,
      status: 'success',
      type: 'user_registration',
      userId: 1
    },
    {
      id: 2,
      message: 'Payment received: ₹4,999',
      timestamp: Date.now() - 300000,
      status: 'success',
      type: 'payment'
    },
    {
      id: 3,
      message: 'Booking confirmed for Football training',
      timestamp: Date.now() - 600000,
      status: 'info',
      type: 'booking'
    }
  ];

  static getInstance(): LiveAnalyticsService {
    if (!LiveAnalyticsService.instance) {
      LiveAnalyticsService.instance = new LiveAnalyticsService();
    }
    return LiveAnalyticsService.instance;
  }

  // Subscribe to real-time updates
  subscribe(dataType: string, callback: (data: any) => void) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)!.push(callback);

    // Start real-time updates
    this.startRealTimeUpdates(dataType);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(dataType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.stopRealTimeUpdates(dataType);
        }
      }
    };
  }

  private startRealTimeUpdates(dataType: string) {
    if (this.intervals.has(dataType)) return;

    const updateInterval = dataType === 'metrics' ? 3000 : 8000; // Metrics every 3s, others every 8s
    
    const interval = setInterval(() => {
      this.updateData(dataType);
      this.notifySubscribers(dataType);
    }, updateInterval);

    this.intervals.set(dataType, interval);
  }

  private stopRealTimeUpdates(dataType: string) {
    const interval = this.intervals.get(dataType);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(dataType);
    }
  }

  private updateData(dataType: string) {
    switch (dataType) {
      case 'metrics':
        this.updateMetrics();
        break;
      case 'users':
        this.updateUsers();
        break;
      case 'activities':
        this.updateActivities();
        break;
    }
  }

  private updateMetrics() {
    // Simulate real-time metric changes
    this.metrics.activeUsers = Math.max(50, this.metrics.activeUsers + Math.floor(Math.random() * 10 - 5));
    this.metrics.pageViews += Math.floor(Math.random() * 20 + 5);
    
    // Occasionally update other metrics
    if (Math.random() < 0.2) {
      this.metrics.totalUsers += Math.floor(Math.random() * 3);
      this.metrics.revenue += Math.floor(Math.random() * 5000);
      this.metrics.sessionsToday += Math.floor(Math.random() * 2);
    }

    // Track analytics
    analytics.trackEvent('live_metrics_update', {
      active_users: this.metrics.activeUsers,
      page_views: this.metrics.pageViews,
      total_users: this.metrics.totalUsers
    });
  }

  private updateUsers() {
    // Simulate user activity changes
    if (Math.random() < 0.3) {
      const randomUser = this.users[Math.floor(Math.random() * this.users.length)];
      randomUser.lastActive = 'Just now';
    }
  }

  private updateActivities() {
    // Add new activities occasionally
    if (Math.random() < 0.4) {
      const activities = [
        'New user joined the platform',
        'Payment processed successfully',
        'Training session completed',
        'User upgraded to Pro plan',
        'Booking cancelled by user',
        'Coach feedback submitted',
        'System health check completed',
        'Database backup completed',
        'New testimonial added',
        'Content updated successfully'
      ];

      const newActivity: LiveActivity = {
        id: Date.now(),
        type: 'system_update',
        message: activities[Math.floor(Math.random() * activities.length)],
        timestamp: Date.now(),
        status: Math.random() < 0.8 ? 'success' : 'info'
      };

      this.activities.unshift(newActivity);
      this.activities = this.activities.slice(0, 20); // Keep only latest 20
    }
  }

  private notifySubscribers(dataType: string) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      const data = this.getData(dataType);
      callbacks.forEach(callback => callback(data));
    }
  }

  private getData(dataType: string) {
    switch (dataType) {
      case 'metrics':
        return { ...this.metrics };
      case 'users':
        return [...this.users];
      case 'activities':
        return [...this.activities];
      default:
        return null;
    }
  }

  // Public methods
  getMetrics(): LiveMetrics {
    return { ...this.metrics };
  }

  getUsers(): LiveUser[] {
    return [...this.users];
  }

  getActivities(): LiveActivity[] {
    return [...this.activities];
  }

  // User management methods
  addUser(user: Omit<LiveUser, 'id'>) {
    const newUser: LiveUser = {
      ...user,
      id: Date.now()
    };
    this.users.unshift(newUser);
    this.metrics.totalUsers++;
    
    this.notifySubscribers('users');
    this.notifySubscribers('metrics');
    
    // Add activity
    this.addActivity({
      type: 'user_registration',
      message: `New user registered: ${user.email}`,
      status: 'success',
      userId: newUser.id
    });

    // Track analytics
    analytics.trackUserRegistration(user.sport, user.plan);
  }

  updateUser(userId: number, updates: Partial<LiveUser>) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.notifySubscribers('users');
      
      this.addActivity({
        type: 'user_updated',
        message: `User updated: ${this.users[userIndex].email}`,
        status: 'info',
        userId: userId
      });
    }
  }

  deleteUser(userId: number) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      const user = this.users[userIndex];
      this.users.splice(userIndex, 1);
      this.metrics.totalUsers--;
      
      this.notifySubscribers('users');
      this.notifySubscribers('metrics');
      
      this.addActivity({
        type: 'user_deleted',
        message: `User deleted: ${user.email}`,
        status: 'warning'
      });
    }
  }

  addActivity(activity: Omit<LiveActivity, 'id' | 'timestamp'>) {
    const newActivity: LiveActivity = {
      ...activity,
      id: Date.now(),
      timestamp: Date.now()
    };
    this.activities.unshift(newActivity);
    this.activities = this.activities.slice(0, 50);
    
    this.notifySubscribers('activities');
  }

  // Analytics integration
  async syncWithAnalytics() {
    try {
      const realTimeData = await analytics.getRealTimeData();
      
      // Update metrics with real analytics data
      this.metrics.activeUsers = realTimeData.activeUsers;
      this.metrics.pageViews = realTimeData.pageViews;
      this.metrics.bounceRate = realTimeData.bounceRate;
      this.metrics.avgSessionDuration = realTimeData.avgSessionDuration;
      
      this.notifySubscribers('metrics');
    } catch (error) {
      console.error('Failed to sync with analytics:', error);
    }
  }
}

export const liveAnalytics = LiveAnalyticsService.getInstance();