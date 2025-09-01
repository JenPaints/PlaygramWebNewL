import { analytics } from './analytics';

export interface RealTimeMetrics {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  revenue: number;
  bookings: number;
  growthRate: number;
  conversionRate: number;
  pageViews: number;
  bounceRate: string;
  avgSessionDuration: number;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  sport: string;
  status: 'Active' | 'Pending' | 'Inactive';
  joinDate: string;
  plan: string;
  lastActive?: string;
  location?: string;
}

export interface ActivityLog {
  id: number;
  type: string;
  message: string;
  timestamp: number;
  status: 'success' | 'info' | 'warning' | 'error';
  userId?: number;
  details?: Record<string, any>;
}

class RealTimeDataService {
  private static instance: RealTimeDataService;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private data: {
    metrics: RealTimeMetrics;
    users: UserData[];
    activities: ActivityLog[];
  };

  constructor() {
    this.data = {
      metrics: {
        totalUsers: 1234,
        activeUsers: 89,
        activeSessions: 67,
        revenue: 240000,
        bookings: 156,
        growthRate: 12.5,
        conversionRate: 8.3,
        pageViews: 2847,
        bounceRate: '24.5',
        avgSessionDuration: 245
      },
      users: [
        {
          id: 1,
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          sport: 'Football',
          status: 'Active',
          joinDate: '2024-01-15',
          plan: 'Pro Plan',
          lastActive: '2 minutes ago',
          location: 'Mumbai, India'
        },
        {
          id: 2,
          name: 'Priya Patel',
          email: 'priya@example.com',
          sport: 'Swimming',
          status: 'Active',
          joinDate: '2024-02-20',
          plan: 'Elite Plan',
          lastActive: '5 minutes ago',
          location: 'Bangalore, India'
        },
        {
          id: 3,
          name: 'Arjun Kumar',
          email: 'arjun@example.com',
          sport: 'Basketball',
          status: 'Pending',
          joinDate: '2024-03-08',
          plan: 'Basic Plan',
          lastActive: '1 hour ago',
          location: 'Delhi, India'
        },
        {
          id: 4,
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          sport: 'Badminton',
          status: 'Active',
          joinDate: '2023-12-10',
          plan: 'Pro Plan',
          lastActive: '10 minutes ago',
          location: 'Chennai, India'
        }
      ],
      activities: [
        {
          id: 1,
          type: 'user_registration',
          message: 'New user registration: rahul@example.com',
          timestamp: Date.now() - 120000,
          status: 'success',
          userId: 1
        },
        {
          id: 2,
          type: 'booking_confirmed',
          message: 'Booking confirmed for Football training',
          timestamp: Date.now() - 300000,
          status: 'info',
          userId: 1
        },
        {
          id: 3,
          type: 'payment_received',
          message: 'Payment received: ₹4,999',
          timestamp: Date.now() - 600000,
          status: 'success',
          userId: 2
        }
      ]
    };
  }

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  // Subscribe to real-time updates
  subscribe(dataType: string, callback: (data: any) => void) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)!.push(callback);

    // Start real-time updates for this data type
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

    const interval = setInterval(() => {
      this.updateData(dataType);
      this.notifySubscribers(dataType);
    }, dataType === 'metrics' ? 5000 : 10000); // Metrics update every 5s, others every 10s

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
    const metrics = this.data.metrics;
    
    // Simulate real-time metric changes
    metrics.activeUsers = Math.max(50, metrics.activeUsers + Math.floor(Math.random() * 10 - 5));
    metrics.activeSessions = Math.max(30, metrics.activeSessions + Math.floor(Math.random() * 8 - 4));
    metrics.pageViews += Math.floor(Math.random() * 20 + 5);
    
    // Occasionally update other metrics
    if (Math.random() < 0.3) {
      metrics.totalUsers += Math.floor(Math.random() * 3);
      metrics.bookings += Math.floor(Math.random() * 2);
      metrics.revenue += Math.floor(Math.random() * 5000);
    }

    // Track analytics
    analytics.trackEvent('real_time_metrics_update', {
      active_users: metrics.activeUsers,
      page_views: metrics.pageViews,
      sessions: metrics.activeSessions
    });
  }

  private updateUsers() {
    // Simulate user status changes
    if (Math.random() < 0.2) {
      const randomUser = this.data.users[Math.floor(Math.random() * this.data.users.length)];
      const statuses: UserData['status'][] = ['Active', 'Pending', 'Inactive'];
      randomUser.status = statuses[Math.floor(Math.random() * statuses.length)];
      randomUser.lastActive = 'Just now';
    }
  }

  private updateActivities() {
    // Add new activities occasionally
    if (Math.random() < 0.3) {
      const activities = [
        'New user joined the platform',
        'Payment processed successfully',
        'Training session completed',
        'User upgraded to Pro plan',
        'Booking cancelled by user',
        'Coach feedback submitted'
      ];

      const newActivity: ActivityLog = {
        id: Date.now(),
        type: 'system_update',
        message: activities[Math.floor(Math.random() * activities.length)],
        timestamp: Date.now(),
        status: Math.random() < 0.8 ? 'success' : 'info'
      };

      this.data.activities.unshift(newActivity);
      this.data.activities = this.data.activities.slice(0, 20); // Keep only latest 20
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
        return { ...this.data.metrics };
      case 'users':
        return [...this.data.users];
      case 'activities':
        return [...this.data.activities];
      default:
        return null;
    }
  }

  // Public methods for getting data
  getMetrics(): RealTimeMetrics {
    return { ...this.data.metrics };
  }

  getUsers(): UserData[] {
    return [...this.data.users];
  }

  getActivities(): ActivityLog[] {
    return [...this.data.activities];
  }

  // Methods for updating data
  addUser(user: Omit<UserData, 'id'>) {
    const newUser: UserData = {
      ...user,
      id: Date.now(),
      lastActive: 'Just now'
    };
    this.data.users.unshift(newUser);
    this.data.metrics.totalUsers++;
    
    this.notifySubscribers('users');
    this.notifySubscribers('metrics');
    
    // Track analytics
    analytics.trackUserRegistration(user.sport, user.plan);
    
    // Add activity
    this.addActivity({
      type: 'user_registration',
      message: `New user registered: ${user.email}`,
      status: 'success',
      userId: newUser.id
    });
  }

  updateUser(userId: number, updates: Partial<UserData>) {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.notifySubscribers('users');
      
      // Add activity
      this.addActivity({
        type: 'user_updated',
        message: `User updated: ${this.data.users[userIndex].email}`,
        status: 'info',
        userId: userId
      });
    }
  }

  deleteUser(userId: number) {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      const user = this.data.users[userIndex];
      this.data.users.splice(userIndex, 1);
      this.data.metrics.totalUsers--;
      
      this.notifySubscribers('users');
      this.notifySubscribers('metrics');
      
      // Add activity
      this.addActivity({
        type: 'user_deleted',
        message: `User deleted: ${user.email}`,
        status: 'warning'
      });
    }
  }

  addActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now(),
      timestamp: Date.now()
    };
    this.data.activities.unshift(newActivity);
    this.data.activities = this.data.activities.slice(0, 50); // Keep only latest 50
    
    this.notifySubscribers('activities');
  }

  // Analytics integration
  async syncWithAnalytics() {
    try {
      const realTimeData = await analytics.getRealTimeData();
      
      // Update metrics with real analytics data
      this.data.metrics.activeUsers = realTimeData.activeUsers;
      this.data.metrics.pageViews = realTimeData.pageViews;
      this.data.metrics.activeSessions = realTimeData.sessions;
      this.data.metrics.bounceRate = realTimeData.bounceRate;
      this.data.metrics.avgSessionDuration = realTimeData.avgSessionDuration;
      
      this.notifySubscribers('metrics');
    } catch (error) {
      console.error('Failed to sync with analytics:', error);
    }
  }
}

export const realTimeData = RealTimeDataService.getInstance();