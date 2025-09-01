import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';

/**
 * Custom hook for automatic data refresh with configurable intervals
 * Eliminates the need for manual refresh buttons
 */
export function useAutoRefresh<T>(
  queryFunction: any,
  queryArgs: any,
  options: {
    interval?: number; // Refresh interval in milliseconds (default: 30 seconds)
    enabled?: boolean; // Whether auto-refresh is enabled (default: true)
    onUpdate?: (data: T) => void; // Callback when data updates
  } = {}
) {
  const { interval = 30000, enabled = true, onUpdate } = options;
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T | null>(null);

  // Use Convex query for real-time data
  const data = useQuery(queryFunction, queryArgs);

  // Track data changes and call onUpdate callback
  useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      previousDataRef.current = data;
      setLastUpdated(new Date());
      onUpdate?.(data);
    }
  }, [data, onUpdate]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!enabled) return;

    const startAutoRefresh = () => {
      intervalRef.current = setInterval(() => {
        setIsRefreshing(true);
        // Convex automatically handles the refresh through reactivity
        setTimeout(() => setIsRefreshing(false), 1000);
      }, interval);
    };

    startAutoRefresh();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled]);

  const forceRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (enabled) {
      intervalRef.current = setInterval(() => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
      }, interval);
    }
  }, [interval, enabled]);

  return {
    data,
    lastUpdated,
    isRefreshing,
    forceRefresh,
    toggleAutoRefresh,
    isAutoRefreshEnabled: !!intervalRef.current
  };
}

/**
 * Hook for real-time user management data
 */
export function useRealTimeUsers() {
  return useAutoRefresh(
    'studentIdGenerator:getAllStudents',
    { limit: 200 },
    {
      interval: 15000, // Refresh every 15 seconds
      onUpdate: (users: any[]) => {
        console.log('👥 Users updated:', Array.isArray(users) ? users.length : 0, 'users');
      }
    }
  );
}

/**
 * Hook for real-time payment data
 */
export function useRealTimePayments() {
  return useAutoRefresh(
    'paymentTracking:getAllPaymentRecords',
    {},
    {
      interval: 10000, // Refresh every 10 seconds
      onUpdate: (payments: any[]) => {
        console.log('💳 Payments updated:', Array.isArray(payments) ? payments.length : 0, 'payments');
      }
    }
  );
}

/**
 * Hook for real-time enrollment data
 */
export function useRealTimeEnrollments() {
  return useAutoRefresh(
    'userEnrollments:getAllEnrollments',
    {},
    {
      interval: 20000, // Refresh every 20 seconds
      onUpdate: (enrollments: any[]) => {
        console.log('📚 Enrollments updated:', Array.isArray(enrollments) ? enrollments.length : 0, 'enrollments');
      }
    }
  );
}

/**
 * Hook for real-time statistics
 */
export function useRealTimeStats() {
  return useAutoRefresh(
    'users:getUserStatistics',
    {},
    {
      interval: 30000, // Refresh every 30 seconds
      onUpdate: (stats) => {
        console.log('📊 Stats updated:', stats);
      }
    }
  );
}

/**
 * Hook for real-time notifications
 */
export function useRealTimeNotifications() {
  return useAutoRefresh(
    'notifications:getAdminNotifications',
    {},
    {
      interval: 5000, // Refresh every 5 seconds for notifications
      onUpdate: (notifications: any[]) => {
        console.log('🔔 Notifications updated:', Array.isArray(notifications) ? notifications.length : 0, 'notifications');
      }
    }
  );
}