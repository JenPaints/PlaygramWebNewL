/**
 * Native Mobile Service
 * Handles native mobile features using Capacitor plugins to make the app feel more native
 */

import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { ScreenOrientation, OrientationLockType } from '@capacitor/screen-orientation';
import { SafeArea } from '@capacitor-community/safe-area';
import { Capacitor } from '@capacitor/core';
import { memoryManagementService } from './memoryManagementService';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface NativeMobileConfig {
  statusBarStyle?: 'light' | 'dark';
  statusBarBackgroundColor?: string;
  keyboardResize?: 'body' | 'ionic' | 'native';
  lockOrientation?: OrientationLockType;
  enableSafeArea?: boolean;
}

class NativeMobileService {
  private safeAreaInsets: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  private isInitialized = false;

  /**
   * Initialize native mobile features
   */
  async initialize(config: NativeMobileConfig = {}) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not running on native platform, skipping native mobile setup');
      return;
    }

    try {
      // Initialize memory management first
      memoryManagementService.initialize();
      
      // Setup with error handling to prevent crashes
      await this.setupWithErrorHandling(config);
      
      this.isInitialized = true;
      console.log('Native mobile service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize native mobile service:', error);
      // Don't throw - continue with degraded functionality
    }
  }
  
  /**
   * Setup native features with individual error handling
   */
  private async setupWithErrorHandling(config: NativeMobileConfig) {
    const setupTasks = [
      {
        name: 'Status Bar',
        task: () => this.setupStatusBar(config.statusBarStyle, config.statusBarBackgroundColor)
      },
      {
        name: 'Keyboard',
        task: () => this.setupKeyboard(config.keyboardResize)
      },
      {
        name: 'Safe Area',
        task: () => config.enableSafeArea !== false ? this.setupSafeArea() : Promise.resolve()
      },
      {
        name: 'Screen Orientation',
        task: () => config.lockOrientation ? this.lockOrientation(config.lockOrientation) : Promise.resolve()
      }
    ];
    
    // Run setup tasks with individual error handling
    for (const { name, task } of setupTasks) {
      try {
        await task();
        console.log(`✅ ${name} setup completed`);
      } catch (error) {
        console.warn(`⚠️ ${name} setup failed, continuing:`, error);
      }
    }
  }

  /**
   * Setup status bar appearance
   */
  async setupStatusBar(style: 'light' | 'dark' = 'dark', backgroundColor?: string) {
    try {
      // Set status bar style
      await StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark
      });

      // Set background color if provided
      if (backgroundColor) {
        await StatusBar.setBackgroundColor({ color: backgroundColor });
      }

      // Show status bar
      await StatusBar.show();
      
      console.log(`Status bar configured: style=${style}, backgroundColor=${backgroundColor}`);
    } catch (error) {
      console.error('Failed to setup status bar:', error);
    }
  }

  /**
   * Hide status bar (useful for fullscreen experiences)
   */
  async hideStatusBar() {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Failed to hide status bar:', error);
    }
  }

  /**
   * Show status bar
   */
  async showStatusBar() {
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Failed to show status bar:', error);
    }
  }

  /**
   * Setup keyboard behavior
   */
  async setupKeyboard(resizeMode: 'body' | 'ionic' | 'native' = 'native') {
    try {
      // Set keyboard resize mode
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      
      // Add keyboard event listeners
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('Keyboard will show with height:', info.keyboardHeight);
        this.handleKeyboardShow(info.keyboardHeight);
      });

      Keyboard.addListener('keyboardDidShow', (info) => {
        console.log('Keyboard did show with height:', info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
        this.handleKeyboardHide();
      });

      Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard did hide');
      });

      console.log(`Keyboard configured with resize mode: ${resizeMode}`);
    } catch (error) {
      console.error('Failed to setup keyboard:', error);
    }
  }

  /**
   * Handle keyboard show event
   */
  private handleKeyboardShow(keyboardHeight: number) {
    // Add custom logic for when keyboard shows
    document.body.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    document.body.classList.add('keyboard-open');
  }

  /**
   * Handle keyboard hide event
   */
  private handleKeyboardHide() {
    // Add custom logic for when keyboard hides
    document.body.style.removeProperty('--keyboard-height');
    document.body.classList.remove('keyboard-open');
  }

  /**
   * Setup safe area handling
   */
  async setupSafeArea() {
    try {
      // Enable the safe area plugin for Android edge-to-edge support
      await SafeArea.enable({
        config: {
          customColorsForSystemBars: true,
          statusBarColor: '#00000000', // transparent
          statusBarContent: 'light',
          navigationBarColor: '#00000000', // transparent
          navigationBarContent: 'light',
        }
      });
      
      // Get safe area insets from CSS variables (set by the plugin)
      this.updateSafeAreaFromCSS();
      
      // Apply safe area insets as CSS variables (fallback for web/iOS)
      this.applySafeAreaCSS();
      
      console.log('Safe area insets:', this.safeAreaInsets);
    } catch (error) {
      console.error('Failed to setup safe area:', error);
      // Fallback: try to get values from CSS env() variables
      this.updateSafeAreaFromCSS();
    }
  }

  /**
   * Update safe area insets from CSS variables
   */
  private updateSafeAreaFromCSS() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Try to get values from the plugin's CSS variables first
    let top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top')) || 0;
    let bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom')) || 0;
    let left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left')) || 0;
    let right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right')) || 0;
    
    // Fallback to env() variables if plugin variables are not available
    if (top === 0 && bottom === 0 && left === 0 && right === 0) {
      // Create a temporary element to test env() values
      const testEl = document.createElement('div');
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      testEl.style.top = 'env(safe-area-inset-top)';
      testEl.style.bottom = 'env(safe-area-inset-bottom)';
      testEl.style.left = 'env(safe-area-inset-left)';
      testEl.style.right = 'env(safe-area-inset-right)';
      document.body.appendChild(testEl);
      
      const testStyle = getComputedStyle(testEl);
      top = parseInt(testStyle.top) || 0;
      bottom = parseInt(testStyle.bottom) || 0;
      left = parseInt(testStyle.left) || 0;
      right = parseInt(testStyle.right) || 0;
      
      document.body.removeChild(testEl);
    }
    
    this.safeAreaInsets = { top, bottom, left, right };
  }

  /**
   * Apply safe area insets as CSS variables
   */
  private applySafeAreaCSS() {
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', `${this.safeAreaInsets.top}px`);
    root.style.setProperty('--safe-area-inset-bottom', `${this.safeAreaInsets.bottom}px`);
    root.style.setProperty('--safe-area-inset-left', `${this.safeAreaInsets.left}px`);
    root.style.setProperty('--safe-area-inset-right', `${this.safeAreaInsets.right}px`);
  }

  /**
   * Get current safe area insets
   */
  getSafeAreaInsets(): SafeAreaInsets {
    return this.safeAreaInsets;
  }

  /**
   * Refresh safe area insets from current CSS variables
   */
  refreshSafeAreaInsets() {
    this.updateSafeAreaFromCSS();
    this.applySafeAreaCSS();
    return this.safeAreaInsets;
  }

  /**
   * Lock screen orientation
   */
  async lockOrientation(orientation: OrientationLockType) {
    try {
      await ScreenOrientation.lock({ orientation });
      console.log(`Screen orientation locked to: ${orientation}`);
    } catch (error) {
      console.error('Failed to lock orientation:', error);
    }
  }

  /**
   * Unlock screen orientation
   */
  async unlockOrientation() {
    try {
      await ScreenOrientation.unlock();
      console.log('Screen orientation unlocked');
    } catch (error) {
      console.error('Failed to unlock orientation:', error);
    }
  }

  /**
   * Get current screen orientation
   */
  async getCurrentOrientation() {
    try {
      const orientation = await ScreenOrientation.orientation();
      return orientation.type;
    } catch (error) {
      console.error('Failed to get current orientation:', error);
      return null;
    }
  }

  /**
   * Configure app for dark theme
   */
  async setDarkTheme() {
    await this.setupStatusBar('light', '#000000');
  }

  /**
   * Configure app for light theme
   */
  async setLightTheme() {
    await this.setupStatusBar('dark', '#ffffff');
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup listeners and resources
   */
  cleanup() {
    try {
      Keyboard.removeAllListeners();
      console.log('Native mobile service cleaned up');
    } catch (error) {
      console.error('Failed to cleanup native mobile service:', error);
    }
  }
}

// Export singleton instance
export const nativeMobileService = new NativeMobileService();
export default nativeMobileService;