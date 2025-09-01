/**
 * Notification Service
 * Handles notification initialization, service worker registration, and push notification setup
 */

import { pushNotificationService } from './pushNotificationService';

class NotificationService {
  private isInitialized = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private notificationQueue: any[] = [];

  constructor() {
    // Don't auto-initialize to prevent crashes
    // Initialize will be called manually when needed
  }

  /**
   * Initialize the notification service
   */
  async initialize() {
    try {
      console.log('🔔 Initializing notification service...');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('🚫 Not in browser environment');
        return;
      }

      // Register service worker
      await this.registerServiceWorker();
      
      // Initialize push notifications
      await this.initializePushNotifications();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
      
      // Process any queued notifications
      this.processNotificationQueue();
      
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  /**
   * Register service worker for push notifications
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.log('🚫 Service workers not supported');
        return;
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service worker registered:', registration);
      this.serviceWorkerRegistration = registration;

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New service worker installed');
              // Optionally notify user about update
              this.showUpdateNotification();
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('💬 Message from service worker:', event.data);
        this.handleServiceWorkerMessage(event.data);
      });

    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  }

  /**
   * Initialize push notifications
   */
  private async initializePushNotifications(): Promise<void> {
    try {
      // Request notification permission
      const permission = await pushNotificationService.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Get FCM token if available
        const token = await pushNotificationService.getRegistrationToken();
        
        if (token) {
          console.log('🔑 FCM token obtained');
          // Store token in user preferences or send to server
          this.storeFCMToken(token);
        }
      } else {
        console.log('🚫 Notification permission denied');
      }
    } catch (error) {
      console.error('❌ Push notification initialization failed:', error);
    }
  }

  /**
   * Setup notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listen for visibility change to handle notification interactions
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // User returned to the app, clear notifications
        this.clearNotifications();
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Back online - syncing notifications');
      this.syncNotifications();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline - queuing notifications');
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(data: any): void {
    const { type, payload } = data;
    
    switch (type) {
      case 'NOTIFICATION_CLICKED':
        console.log('🖱️ Notification clicked:', payload);
        this.handleNotificationClick(payload);
        break;
        
      case 'NOTIFICATION_CLOSED':
        console.log('🔕 Notification closed:', payload);
        this.handleNotificationClose(payload);
        break;
        
      default:
        console.log('❓ Unknown service worker message:', type, payload);
    }
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(payload: any): void {
    // Navigate to the specified URL or perform action
    if (payload.url) {
      window.open(payload.url, '_blank');
    }
    
    // Mark notification as read if needed
    if (payload.notificationId) {
      this.markNotificationAsRead(payload.notificationId);
    }
  }

  /**
   * Handle notification close
   */
  private handleNotificationClose(payload: any): void {
    // Track notification close analytics
    console.log('📊 Notification closed analytics:', payload);
  }

  /**
   * Store FCM token
   */
  private storeFCMToken(token: string): void {
    try {
      // Store in localStorage for now
      localStorage.setItem('fcm_token', token);
      localStorage.setItem('fcm_token_timestamp', Date.now().toString());
      
      console.log('💾 FCM token stored locally');
      
      // TODO: Send token to server to associate with user account
      // this.sendTokenToServer(token);
    } catch (error) {
      console.error('❌ Failed to store FCM token:', error);
    }
  }

  /**
   * Show notification about app update
   */
  private showUpdateNotification(): void {
    if (pushNotificationService.getPermissionStatus() === 'granted') {
      pushNotificationService.showLocalNotification(
        '🆕 App Updated',
        {
          body: 'PlayGram has been updated with new features and improvements!',
          tag: 'app-update',
          requireInteraction: false
        }
      );
    }
  }

  /**
   * Clear all notifications
   */
  private clearNotifications(): void {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.getNotifications().then((notifications) => {
        notifications.forEach((notification) => {
          notification.close();
        });
      });
    }
  }

  /**
   * Sync notifications when back online
   */
  private syncNotifications(): void {
    if (this.serviceWorkerRegistration && 'sync' in this.serviceWorkerRegistration) {
      (this.serviceWorkerRegistration as any).sync.register('notification-sync');
    }
  }

  /**
   * Mark notification as read
   */
  private markNotificationAsRead(notificationId: string): void {
    // TODO: Call API to mark notification as read
    console.log('✅ Marking notification as read:', notificationId);
  }

  /**
   * Queue notification for later processing
   */
  private queueNotification(notification: any): void {
    this.notificationQueue.push(notification);
  }

  /**
   * Process queued notifications
   */
  private processNotificationQueue(): void {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      this.showNotification(notification);
    }
  }

  /**
   * Show notification (public method)
   */
  public async showNotification(title: string, options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    data?: any;
  } = {}): Promise<void> {
    if (this.isInitialized) {
      await pushNotificationService.sendNotification(title, options.body || '', {
        icon: options.icon,
        badge: options.badge,
        tag: options.tag,
        url: options.url,
        data: options.data
      });
    } else {
      this.queueNotification({ title, options });
    }
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    return await pushNotificationService.requestPermission();
  }

  /**
   * Check if notifications are supported
   */
  public isSupported(): boolean {
    return pushNotificationService.isSupported();
  }

  /**
   * Get permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return pushNotificationService.getPermissionStatus();
  }

  /**
   * Get FCM token
   */
  public getFCMToken(): string | null {
    return localStorage.getItem('fcm_token');
  }

  /**
   * Subscribe to topic
   */
  public async subscribeToTopic(topic: string): Promise<boolean> {
    return await pushNotificationService.subscribeToTopic(topic);
  }

  /**
   * Unsubscribe from topic
   */
  public async unsubscribeFromTopic(topic: string): Promise<boolean> {
    return await pushNotificationService.unsubscribeFromTopic(topic);
  }

  /**
   * Send message to service worker
   */
  public sendMessageToServiceWorker(message: any): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  /**
   * Get service worker registration
   */
  public getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.serviceWorkerRegistration;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;