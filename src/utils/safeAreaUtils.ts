/**
 * Safe Area Utilities for Mobile Apps
 * Handles safe area insets for iOS notch, Android navigation, etc.
 */

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Get safe area insets from CSS environment variables
 */
export const getSafeAreaInsets = (): SafeAreaInsets => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Create a temporary element to test CSS env() support
  const testElement = document.createElement('div');
  testElement.style.paddingTop = 'env(safe-area-inset-top)';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const hasEnvSupport = computedStyle.paddingTop !== '0px' && computedStyle.paddingTop !== '';
  
  document.body.removeChild(testElement);

  if (!hasEnvSupport) {
    // Fallback values for devices without env() support
    return {
      top: 44,    // Standard status bar height
      bottom: 34, // Standard home indicator area
      left: 0,
      right: 0
    };
  }

  // Get actual values from CSS environment variables
  const getEnvValue = (variable: string): number => {
    const testDiv = document.createElement('div');
    testDiv.style.padding = `env(${variable})`;
    document.body.appendChild(testDiv);
    
    const value = parseInt(window.getComputedStyle(testDiv).paddingTop) || 0;
    document.body.removeChild(testDiv);
    
    return value;
  };

  return {
    top: getEnvValue('safe-area-inset-top'),
    bottom: getEnvValue('safe-area-inset-bottom'),
    left: getEnvValue('safe-area-inset-left'),
    right: getEnvValue('safe-area-inset-right')
  };
};

/**
 * Check if device has a notch or safe area requirements
 */
export const hasNotch = (): boolean => {
  const insets = getSafeAreaInsets();
  return insets.top > 20 || insets.bottom > 0 || insets.left > 0 || insets.right > 0;
};

/**
 * Get the total header height including safe area
 */
export const getHeaderHeight = (): number => {
  const insets = getSafeAreaInsets();
  const baseHeaderHeight = 68; // Base header content height
  return insets.top + baseHeaderHeight;
};

/**
 * Get the total footer height including safe area
 */
export const getFooterHeight = (): number => {
  const insets = getSafeAreaInsets();
  const baseFooterHeight = 80; // Base footer content height
  return insets.bottom + baseFooterHeight;
};

/**
 * Get the available content height
 */
export const getContentHeight = (): number => {
  const viewportHeight = window.innerHeight;
  const headerHeight = getHeaderHeight();
  const footerHeight = getFooterHeight();
  
  return viewportHeight - headerHeight - footerHeight;
};

/**
 * Apply safe area styles to an element
 */
export const applySafeAreaStyles = (element: HTMLElement, areas: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right']): void => {
  const insets = getSafeAreaInsets();
  
  if (areas.includes('top')) {
    element.style.paddingTop = `${insets.top}px`;
  }
  if (areas.includes('bottom')) {
    element.style.paddingBottom = `${insets.bottom}px`;
  }
  if (areas.includes('left')) {
    element.style.paddingLeft = `${insets.left}px`;
  }
  if (areas.includes('right')) {
    element.style.paddingRight = `${insets.right}px`;
  }
};

/**
 * CSS custom properties for safe areas
 */
export const setSafeAreaCustomProperties = (): void => {
  if (typeof document === 'undefined') return;
  
  const insets = getSafeAreaInsets();
  const root = document.documentElement;
  
  root.style.setProperty('--safe-area-inset-top', `${insets.top}px`);
  root.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`);
  root.style.setProperty('--safe-area-inset-left', `${insets.left}px`);
  root.style.setProperty('--safe-area-inset-right', `${insets.right}px`);
  
  // Calculated values
  root.style.setProperty('--header-height', `${getHeaderHeight()}px`);
  root.style.setProperty('--footer-height', `${getFooterHeight()}px`);
  root.style.setProperty('--content-height', `${getContentHeight()}px`);
};

/**
 * Device type detection
 */
export const getDeviceType = (): 'ios' | 'android' | 'web' => {
  if (typeof navigator === 'undefined') return 'web';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  }
  
  return 'web';
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > window.innerHeight;
};

/**
 * Initialize safe area handling
 */
export const initializeSafeArea = (): (() => void) => {
  // Set initial custom properties
  setSafeAreaCustomProperties();
  
  // Update on orientation change
  const handleOrientationChange = () => {
    // Small delay to ensure viewport has updated
    setTimeout(() => {
      setSafeAreaCustomProperties();
    }, 100);
  };
  
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  
  // Cleanup function
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
  };
};