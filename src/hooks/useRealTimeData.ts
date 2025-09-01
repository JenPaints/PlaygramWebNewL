import { useState, useEffect, useCallback } from 'react';
import { realTimeData, RealTimeMetrics, UserData, ActivityLog } from '../services/realTimeData';

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>(realTimeData.getMetrics());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = realTimeData.subscribe('metrics', (newMetrics: RealTimeMetrics) => {
      setMetrics(newMetrics);
    });

    return unsubscribe;
  }, []);

  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      await realTimeData.syncWithAnalytics();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { metrics, isLoading, refreshMetrics };
}

export function useRealTimeUsers() {
  const [users, setUsers] = useState<UserData[]>(realTimeData.getUsers());

  useEffect(() => {
    const unsubscribe = realTimeData.subscribe('users', (newUsers: UserData[]) => {
      setUsers(newUsers);
    });

    return unsubscribe;
  }, []);

  const addUser = useCallback((user: Omit<UserData, 'id'>) => {
    realTimeData.addUser(user);
  }, []);

  const updateUser = useCallback((userId: number, updates: Partial<UserData>) => {
    realTimeData.updateUser(userId, updates);
  }, []);

  const deleteUser = useCallback((userId: number) => {
    realTimeData.deleteUser(userId);
  }, []);

  return { users, addUser, updateUser, deleteUser };
}

export function useRealTimeActivities() {
  const [activities, setActivities] = useState<ActivityLog[]>(realTimeData.getActivities());

  useEffect(() => {
    const unsubscribe = realTimeData.subscribe('activities', (newActivities: ActivityLog[]) => {
      setActivities(newActivities);
    });

    return unsubscribe;
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    realTimeData.addActivity(activity);
  }, []);

  return { activities, addActivity };
}

// Combined hook for admin dashboard
export function useAdminDashboard() {
  const { metrics, isLoading: metricsLoading, refreshMetrics } = useRealTimeMetrics();
  const { users, addUser, updateUser, deleteUser } = useRealTimeUsers();
  const { activities, addActivity } = useRealTimeActivities();

  return {
    metrics,
    users,
    activities,
    isLoading: metricsLoading,
    actions: {
      refreshMetrics,
      addUser,
      updateUser,
      deleteUser,
      addActivity
    }
  };
}