import { User } from '../components/auth/AuthContext';

export const isAdmin = (user: User | null): boolean => {
  return user?.userType === 'admin';
};

export const isCoach = (user: User | null): boolean => {
  return user?.userType === 'coach';
};

export const isStudent = (user: User | null): boolean => {
  return user?.userType === 'student';
};

export const hasAdminAccess = (user: User | null): boolean => {
  return user?.userType === 'admin' || user?.userType === 'coach';
};

export const canAccessAdminDashboard = (user: User | null): boolean => {
  return user?.userType === 'admin';
};