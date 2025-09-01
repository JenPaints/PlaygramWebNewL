import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface PushNotificationToken {
  value: string;
  platform: 'ios' | 'android' | 'web';
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class PushNotificationService {
  private isInitialized = false;
  private token: string | null = null;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      // Request permission to use push notifications
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied push notification permissions');
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // Set up listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  private setupListeners(): void {
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      this.token = token.value;
      // Here you would typically send the token to your server
      this.sendTokenToServer(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      // Handle foreground notification
      this.handleForegroundNotification(notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      // Handle notification tap
      this.handleNotificationTap(notification);
    });
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Implement API call to send token to your server
      console.log('Sending token to server:', token);
      // Example:
      // await fetch('/api/push-tokens', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, platform: Capacitor.getPlatform() })
      // });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  private handleForegroundNotification(notification: any): void {
    // Handle notification when app is in foreground
    console.log('Handling foreground notification:', notification);
    
    // You could show a custom in-app notification here
    // or update the UI based on the notification content
  }

  private handleNotificationTap(notification: any): void {
    // Handle notification tap - navigate to specific screen, etc.
    console.log('Handling notification tap:', notification);
    
    // Example: Navigate based on notification data
    const data = notification.notification?.data;
    if (data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to screen:', data.screen);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.token;
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not available on web platform');
      return;
    }

    try {
      // Note: You might need to install @capacitor/local-notifications for this
      console.log('Sending local notification:', payload);
      // await LocalNotifications.schedule({
      //   notifications: [{
      //     title: payload.title,
      //     body: payload.body,
      //     id: Date.now(),
      //     extra: payload.data
      //   }]
      // });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  async clearAllNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Clear all delivered notifications
      // await LocalNotifications.removeAllDeliveredNotifications();
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();