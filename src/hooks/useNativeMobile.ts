/**
 * React Hook for Native Mobile Features
 * Provides easy access to native mobile functionality in React components
 */

import { useEffect, useState, useCallback } from 'react';
import { OrientationLockType } from '@capacitor/screen-orientation';
import nativeMobileService, { SafeAreaInsets, NativeMobileConfig } from '../services/nativeMobileService';
import { Capacitor } from '@capacitor/core';

export interface UseNativeMobileOptions {
  autoInitialize?: boolean;
  config?: NativeMobileConfig;
}

export interface UseNativeMobileReturn {
  isNative: boolean;
  isInitialized: boolean;
  safeAreaInsets: SafeAreaInsets;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  currentOrientation: OrientationLockType | null;
  
  // Methods
  initialize: (config?: NativeMobileConfig) => Promise<void>;
  setStatusBarStyle: (style: 'light' | 'dark', backgroundColor?: string) => Promise<void>;
  hideStatusBar: () => Promise<void>;
  showStatusBar: () => Promise<void>;
  lockOrientation: (orientation: OrientationLockType) => Promise<void>;
  unlockOrientation: () => Promise<void>;
  setDarkTheme: () => Promise<void>;
  setLightTheme: () => Promise<void>;
  refreshSafeArea: () => Promise<void>;
}

/**
 * Hook for using native mobile features
 */
export function useNativeMobile(options: UseNativeMobileOptions = {}): UseNativeMobileReturn {
  const { autoInitialize = true, config = {} } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentOrientation, setCurrentOrientation] = useState<OrientationLockType | null>(null);
  
  const isNative = Capacitor.isNativePlatform();

  // Initialize the service
  const initialize = useCallback(async (initConfig?: NativeMobileConfig) => {
    try {
      await nativeMobileService.initialize(initConfig || config);
      setIsInitialized(true);
      
      // Update safe area insets
      const insets = nativeMobileService.getSafeAreaInsets();
      setSafeAreaInsets(insets);
      
      // Get current orientation
      const orientation = await nativeMobileService.getCurrentOrientation();
      setCurrentOrientation(orientation);
      
    } catch (error) {
      console.error('Failed to initialize native mobile service:', error);
    }
  }, [config]);

  // Status bar methods
  const setStatusBarStyle = useCallback(async (style: 'light' | 'dark', backgroundColor?: string) => {
    await nativeMobileService.setupStatusBar(style, backgroundColor);
  }, []);

  const hideStatusBar = useCallback(async () => {
    await nativeMobileService.hideStatusBar();
  }, []);

  const showStatusBar = useCallback(async () => {
    await nativeMobileService.showStatusBar();
  }, []);

  // Orientation methods
  const lockOrientation = useCallback(async (orientation: OrientationLockType) => {
    await nativeMobileService.lockOrientation(orientation);
    setCurrentOrientation(orientation);
  }, []);

  const unlockOrientation = useCallback(async () => {
    await nativeMobileService.unlockOrientation();
    const orientation = await nativeMobileService.getCurrentOrientation();
    setCurrentOrientation(orientation);
  }, []);

  // Theme methods
  const setDarkTheme = useCallback(async () => {
    await nativeMobileService.setDarkTheme();
  }, []);

  const setLightTheme = useCallback(async () => {
    await nativeMobileService.setLightTheme();
  }, []);

  // Refresh safe area
  const refreshSafeArea = useCallback(async () => {
    const insets = nativeMobileService.refreshSafeAreaInsets();
    setSafeAreaInsets(insets);
  }, []);

  // Setup keyboard listeners
  useEffect(() => {
    if (!isNative) return;

    const handleKeyboardShow = () => {
      setIsKeyboardOpen(true);
      // Get keyboard height from CSS variable
      const height = parseInt(getComputedStyle(document.body).getPropertyValue('--keyboard-height') || '0');
      setKeyboardHeight(height);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardOpen(false);
      setKeyboardHeight(0);
    };

    // Listen for keyboard class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasKeyboardClass = document.body.classList.contains('keyboard-open');
          if (hasKeyboardClass && !isKeyboardOpen) {
            handleKeyboardShow();
          } else if (!hasKeyboardClass && isKeyboardOpen) {
            handleKeyboardHide();
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, [isNative, isKeyboardOpen]);

  // Auto-initialize if enabled
  useEffect(() => {
    if (autoInitialize && isNative && !isInitialized) {
      initialize();
    }
  }, [autoInitialize, isNative, isInitialized, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        nativeMobileService.cleanup();
      }
    };
  }, [isInitialized]);

  return {
    isNative,
    isInitialized,
    safeAreaInsets,
    isKeyboardOpen,
    keyboardHeight,
    currentOrientation,
    
    // Methods
    initialize,
    setStatusBarStyle,
    hideStatusBar,
    showStatusBar,
    lockOrientation,
    unlockOrientation,
    setDarkTheme,
    setLightTheme,
    refreshSafeArea
  };
}

/**
 * Hook for safe area insets only (lighter version)
 */
export function useSafeArea(): SafeAreaInsets {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const updateSafeArea = () => {
      const insets = nativeMobileService.getSafeAreaInsets();
      setSafeAreaInsets(insets);
    };

    // Initial update
    updateSafeArea();

    // Listen for safe area changes (orientation changes, etc.)
    const interval = setInterval(updateSafeArea, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return safeAreaInsets;
}

/**
 * Hook for keyboard state only
 */
export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleKeyboardShow = () => {
      setIsKeyboardOpen(true);
      const height = parseInt(getComputedStyle(document.body).getPropertyValue('--keyboard-height') || '0');
      setKeyboardHeight(height);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardOpen(false);
      setKeyboardHeight(0);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasKeyboardClass = document.body.classList.contains('keyboard-open');
          if (hasKeyboardClass && !isKeyboardOpen) {
            handleKeyboardShow();
          } else if (!hasKeyboardClass && isKeyboardOpen) {
            handleKeyboardHide();
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, [isKeyboardOpen]);

  return { isKeyboardOpen, keyboardHeight };
}

export default useNativeMobile;