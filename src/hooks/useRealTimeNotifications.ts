import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MessageCircle, Bell, Users, Calendar } from 'lucide-react';

interface NotificationOptions {
  enableSound?: boolean;
  enableToast?: boolean;
  enableBrowserNotification?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface UseRealTimeNotificationsProps {
  userId?: string;
  userType?: 'student' | 'coach' | 'admin';
  options?: NotificationOptions;
}

export const useRealTimeNotifications = ({
  userId,
  userType = 'student',
  options = {
    enableSound: true,
    enableToast: true,
    enableBrowserNotification: true,
    position: 'top-right'
  }
}: UseRealTimeNotificationsProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  // Initialize audio and notification permissions
  useEffect(() => {
    // Create audio element for notification sounds
    if (options.enableSound) {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.3;
    }

    // Request notification permission
    if (options.enableBrowserNotification && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission;
      });
    }
  }, [options.enableSound, options.enableBrowserNotification]);

  const playNotificationSound = () => {
    if (options.enableSound && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    }
  };

  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (options.enableBrowserNotification && 
        'Notification' in window && 
        notificationPermissionRef.current === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/logo.png',
        badge: '/logo.png',
        tag: 'playgram-notification',
        requireInteraction: false,
        silent: false
      });
    }
  };

  const showNewMessageNotification = (message: any, batchName?: string) => {
    const senderName = message.sender?.name || 'Someone';
    const isCoachMessage = message.senderType === 'coach';
    const isAnnouncement = message.isAnnouncement;
    
    let title = '';
    let body = '';
    let toastType: 'success' | 'info' | 'warning' = 'info';

    if (isAnnouncement) {
      title = `📢 Announcement from ${senderName}`;
      body = message.content;
      toastType = 'warning';
    } else if (isCoachMessage) {
      title = `🏃‍♂️ Coach ${senderName}`;
      body = message.content;
      toastType = 'info';
    } else {
      title = `💬 ${senderName}`;
      body = message.content;
      toastType = 'info';
    }

    if (batchName) {
      title += ` (${batchName})`;
    }

    // Show toast notification
    if (options.enableToast) {
      toast[toastType](title, {
        description: body.length > 100 ? body.substring(0, 100) + '...' : body,
        duration: 4000,
        position: options.position,
        action: {
          label: 'View',
          onClick: () => {
            // Could trigger navigation to chat
            console.log('Navigate to chat');
          }
        }
      });
    }

    // Show browser notification
    showBrowserNotification(title, body);

    // Play sound
    playNotificationSound();
  };

  const showEnrollmentNotification = (enrollmentData: any) => {
    const title = '🎉 New Enrollment!';
    const body = `Welcome to ${enrollmentData.batchName || 'your new batch'}!`;

    if (options.enableToast) {
      toast.success(title, {
        description: body,
        duration: 5000,
        position: options.position
      });
    }

    showBrowserNotification(title, body);
    playNotificationSound();
  };

  const showSessionReminderNotification = (sessionData: any) => {
    const title = '⏰ Session Reminder';
    const body = `Your ${sessionData.sportName} session starts in 30 minutes at ${sessionData.location}`;

    if (options.enableToast) {
      toast.info(title, {
        description: body,
        duration: 6000,
        position: options.position,
        action: {
          label: 'View Details',
          onClick: () => {
            console.log('Navigate to session details');
          }
        }
      });
    }

    showBrowserNotification(title, body);
    playNotificationSound();
  };

  const showCoachAssignmentNotification = (coachData: any) => {
    const title = '👨‍🏫 New Coach Assignment';
    const body = `${coachData.coachName} has been assigned to your batch`;

    if (options.enableToast) {
      toast.info(title, {
        description: body,
        duration: 4000,
        position: options.position
      });
    }

    showBrowserNotification(title, body);
    playNotificationSound();
  };

  const showPaymentConfirmationNotification = (paymentData: any) => {
    const title = '💳 Payment Confirmed';
    const body = `Payment of ₹${paymentData.amount} has been confirmed for ${paymentData.packageName}`;

    if (options.enableToast) {
      toast.success(title, {
        description: body,
        duration: 5000,
        position: options.position
      });
    }

    showBrowserNotification(title, body);
    playNotificationSound();
  };

  const showGeneralNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (options.enableToast) {
      toast[type](title, {
        description: message,
        duration: 4000,
        position: options.position
      });
    }

    showBrowserNotification(title, message);
    playNotificationSound();
  };

  return {
    showNewMessageNotification,
    showEnrollmentNotification,
    showSessionReminderNotification,
    showCoachAssignmentNotification,
    showPaymentConfirmationNotification,
    showGeneralNotification,
    playNotificationSound,
    notificationPermission: notificationPermissionRef.current
  };
};

export default useRealTimeNotifications;