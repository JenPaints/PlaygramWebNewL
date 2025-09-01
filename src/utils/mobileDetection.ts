// Utility to detect if the app is running in a mobile environment (Capacitor)
export const isMobileApp = (): boolean => {
  // Check if we're in a browser environment first
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check if Capacitor is available and properly initialized (indicates mobile app)
  const capacitor = (window as any).Capacitor;
  return !!(capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform());
};

// Check if running on iOS
export const isIOS = (): boolean => {
  if (isMobileApp()) {
    return (window as any).Capacitor?.getPlatform() === 'ios';
  }
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Check if running on Android
export const isAndroid = (): boolean => {
  if (isMobileApp()) {
    return (window as any).Capacitor?.getPlatform() === 'android';
  }
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Get platform name
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  if (isMobileApp()) {
    const platform = (window as any).Capacitor?.getPlatform();
    return platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'web';
  }
  
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'web';
};