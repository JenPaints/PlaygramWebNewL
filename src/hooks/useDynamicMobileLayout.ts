import { useState, useEffect, useCallback } from 'react';
import { getSafeAreaInsets, getDeviceType, isLandscape } from '../utils/safeAreaUtils';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

export interface DynamicLayoutMetrics {
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  deviceType: 'ios' | 'android' | 'web';
  orientation: 'portrait' | 'landscape';
  viewportHeight: number;
  viewportWidth: number;
  isNativePlatform: boolean;
  headerHeight: number;
  footerHeight: number;
  contentHeight: number;
}

export interface DynamicLayoutStyles {
  header: {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    minHeight: number;
  };
  footer: {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  };
  content: {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    minHeight: number;
  };
  navigation: {
    buttonSize: 'small' | 'medium' | 'large';
    showLabels: boolean;
    itemPadding: number;
  };
}

/**
 * Hook for managing dynamic mobile layout that adapts to any device
 */
export const useDynamicMobileLayout = () => {
  const [metrics, setMetrics] = useState<DynamicLayoutMetrics>({
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    deviceType: 'web',
    orientation: 'portrait',
    viewportHeight: 0,
    viewportWidth: 0,
    isNativePlatform: false,
    headerHeight: 68,
    footerHeight: 80,
    contentHeight: 0,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate layout metrics
  const calculateMetrics = useCallback((): DynamicLayoutMetrics => {
    const insets = getSafeAreaInsets();
    const device = getDeviceType();
    const isLandscapeMode = isLandscape();
    const height = window.innerHeight;
    const width = window.innerWidth;
    const isNative = Capacitor.isNativePlatform();

    // Calculate dynamic heights based on orientation and device
    let headerHeight = 68;
    let footerHeight = 80;

    if (isLandscapeMode && height < 500) {
      headerHeight = 56;
      footerHeight = 60;
    }

    const totalHeaderHeight = insets.top + headerHeight;
    const totalFooterHeight = insets.bottom + footerHeight;
    const contentHeight = height - totalHeaderHeight - totalFooterHeight;

    return {
      safeAreaInsets: insets,
      deviceType: device,
      orientation: isLandscapeMode ? 'landscape' : 'portrait',
      viewportHeight: height,
      viewportWidth: width,
      isNativePlatform: isNative,
      headerHeight: totalHeaderHeight,
      footerHeight: totalFooterHeight,
      contentHeight: Math.max(contentHeight, 200), // Minimum content height
    };
  }, []);

  // Update CSS custom properties
  const updateCSSProperties = useCallback((newMetrics: DynamicLayoutMetrics) => {
    const root = document.documentElement;
    
    // Safe area insets
    root.style.setProperty('--safe-area-top', `${newMetrics.safeAreaInsets.top}px`);
    root.style.setProperty('--safe-area-bottom', `${newMetrics.safeAreaInsets.bottom}px`);
    root.style.setProperty('--safe-area-left', `${newMetrics.safeAreaInsets.left}px`);
    root.style.setProperty('--safe-area-right', `${newMetrics.safeAreaInsets.right}px`);
    
    // Viewport dimensions
    root.style.setProperty('--viewport-height', `${newMetrics.viewportHeight}px`);
    root.style.setProperty('--viewport-width', `${newMetrics.viewportWidth}px`);
    
    // Device and orientation
    root.style.setProperty('--device-type', newMetrics.deviceType);
    root.style.setProperty('--orientation', newMetrics.orientation);
    
    // Calculated heights
    root.style.setProperty('--header-total-height', `${newMetrics.headerHeight}px`);
    root.style.setProperty('--footer-total-height', `${newMetrics.footerHeight}px`);
    root.style.setProperty('--content-available-height', `${newMetrics.contentHeight}px`);
    
    // Platform flag
    root.style.setProperty('--is-native', newMetrics.isNativePlatform ? '1' : '0');
  }, []);

  // Update layout metrics
  const updateMetrics = useCallback(() => {
    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);
    updateCSSProperties(newMetrics);
    
    console.log('📱 Dynamic Layout Updated:', {
      device: newMetrics.deviceType,
      orientation: newMetrics.orientation,
      viewport: `${newMetrics.viewportWidth}x${newMetrics.viewportHeight}`,
      safeArea: newMetrics.safeAreaInsets,
      headerHeight: newMetrics.headerHeight,
      footerHeight: newMetrics.footerHeight,
      contentHeight: newMetrics.contentHeight,
    });
  }, [calculateMetrics, updateCSSProperties]);

  // Generate dynamic styles
  const getStyles = useCallback((): DynamicLayoutStyles => {
    const { safeAreaInsets, orientation, deviceType } = metrics;
    
    // Header styles
    const headerPaddingTop = Math.max(safeAreaInsets.top + 12, 56);
    const headerPaddingBottom = orientation === 'landscape' && deviceType === 'ios' ? 8 : 12;
    const headerMinHeight = headerPaddingTop + headerPaddingBottom + 44;
    
    // Footer styles
    const footerPaddingBottom = Math.max(safeAreaInsets.bottom + 8, 8);
    const footerPaddingTop = orientation === 'landscape' ? 8 : 12;
    
    // Content styles
    const contentPaddingTop = metrics.headerHeight;
    const contentPaddingBottom = metrics.footerHeight;
    
    // Navigation styles
    const buttonSize = orientation === 'landscape' ? 'small' : 'medium';
    const showLabels = orientation === 'portrait';
    const itemPadding = orientation === 'landscape' ? 8 : 12;
    
    return {
      header: {
        paddingTop: headerPaddingTop,
        paddingBottom: headerPaddingBottom,
        paddingLeft: Math.max(safeAreaInsets.left + 16, 16),
        paddingRight: Math.max(safeAreaInsets.right + 16, 16),
        minHeight: headerMinHeight,
      },
      footer: {
        paddingTop: footerPaddingTop,
        paddingBottom: footerPaddingBottom,
        paddingLeft: Math.max(safeAreaInsets.left + 8, 8),
        paddingRight: Math.max(safeAreaInsets.right + 8, 8),
      },
      content: {
        paddingTop: contentPaddingTop,
        paddingBottom: contentPaddingBottom,
        paddingLeft: Math.max(safeAreaInsets.left + 16, 16),
        paddingRight: Math.max(safeAreaInsets.right + 16, 16),
        minHeight: metrics.contentHeight,
      },
      navigation: {
        buttonSize: buttonSize as 'small' | 'medium' | 'large',
        showLabels,
        itemPadding,
      },
    };
  }, [metrics]);

  // Initialize and handle layout changes
  useEffect(() => {
    // Initial update
    updateMetrics();
    setIsInitialized(true);

    // Event handlers
    const handleResize = () => {
      updateMetrics();
    };

    const handleOrientationChange = async () => {
      // Delay to ensure viewport has updated
      setTimeout(updateMetrics, 150);
      
      if (Capacitor.isNativePlatform()) {
        try {
          const orientation = await ScreenOrientation.orientation();
          console.log('📱 Orientation changed:', orientation);
        } catch (error) {
          console.log('📱 Orientation detection not available');
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Re-calculate when app becomes visible (handles iOS dynamic island changes)
        setTimeout(updateMetrics, 100);
      }
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.documentElement);

    // Capacitor-specific listeners
    if (Capacitor.isNativePlatform()) {
      ScreenOrientation.addListener('screenOrientationChange', handleOrientationChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      
      if (Capacitor.isNativePlatform()) {
        ScreenOrientation.removeAllListeners();
      }
    };
  }, [updateMetrics]);

  // Utility functions
  const isLandscapeMode = metrics.orientation === 'landscape';
  const isPortraitMode = metrics.orientation === 'portrait';
  const hasNotch = metrics.safeAreaInsets.top > 20;
  const hasHomeIndicator = metrics.safeAreaInsets.bottom > 0;
  const isSmallScreen = metrics.viewportHeight < 600;
  const isTallScreen = metrics.viewportHeight > 800;

  return {
    metrics,
    styles: getStyles(),
    isInitialized,
    
    // Utility flags
    isLandscapeMode,
    isPortraitMode,
    hasNotch,
    hasHomeIndicator,
    isSmallScreen,
    isTallScreen,
    
    // Utility functions
    updateMetrics,
    
    // Responsive helpers
    getButtonSize: () => {
      if (isLandscapeMode) return { width: 32, height: 32, icon: 16 };
      if (isSmallScreen) return { width: 36, height: 36, icon: 18 };
      return { width: 40, height: 40, icon: 20 };
    },
    
    getTextSize: () => {
      if (isLandscapeMode) return 'text-xs';
      if (isSmallScreen) return 'text-sm';
      return 'text-sm';
    },
    
    getPadding: () => {
      if (isLandscapeMode) return 'p-2';
      if (isSmallScreen) return 'p-3';
      return 'p-4';
    },
  };
};

export default useDynamicMobileLayout;