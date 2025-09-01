/**
 * Memory Management Service
 * Handles memory warnings and cleanup to prevent SIGTERM crashes
 */

import { Capacitor } from '@capacitor/core';

export class MemoryManagementService {
  private static instance: MemoryManagementService;
  private memoryWarningListener?: () => void;
  private cleanupInterval?: number;
  private isInitialized = false;
  
  static getInstance(): MemoryManagementService {
    if (!MemoryManagementService.instance) {
      MemoryManagementService.instance = new MemoryManagementService();
    }
    return MemoryManagementService.instance;
  }
  
  initialize() {
    if (this.isInitialized) {
      console.log('Memory management service already initialized');
      return;
    }
    
    if (Capacitor.isNativePlatform()) {
      this.setupMemoryWarningListener();
      this.setupPeriodicCleanup();
      this.setupGlobalErrorHandling();
      this.isInitialized = true;
      console.log('📱 Memory management service initialized');
    } else {
      console.log('💻 Running on web - limited memory management available');
    }
  }
  
  private setupMemoryWarningListener() {
    // Listen for memory warnings from native layer
    this.memoryWarningListener = () => {
      console.warn('🚨 Memory warning received from native layer - performing emergency cleanup');
      this.performEmergencyCleanup();
    };
    
    // Listen for the custom memory warning event
    document.addEventListener('memorywarning', this.memoryWarningListener);
    
    // Also listen for native notifications if available
    if (typeof window !== 'undefined' && window.Capacitor) {
      // Listen for memory warnings through Capacitor
      document.addEventListener('capacitor:memoryWarning', this.memoryWarningListener);
    }
  }
  
  private setupPeriodicCleanup() {
    // Cleanup every 5 minutes
    this.cleanupInterval = window.setInterval(() => {
      this.performRoutineCleanup();
    }, 5 * 60 * 1000);
    
    console.log('⏰ Periodic cleanup scheduled every 5 minutes');
  }
  
  private setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      // Prevent the default handling (which might cause crashes)
      event.preventDefault();
    });
    
    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', event.error);
      // Perform cleanup if error seems memory-related
      if (event.error?.message?.includes('memory') || event.error?.message?.includes('heap')) {
        this.performEmergencyCleanup();
      }
    });
  }
  
  performEmergencyCleanup() {
    console.log('🧹 Performing emergency memory cleanup');
    
    try {
      // Clear browser caches
      this.clearBrowserCaches();
      
      // Clear large objects from memory
      this.clearLargeObjects();
      
      // Clear old storage items
      this.cleanupOldStorageItems();
      
      // Clear unused image caches
      this.clearUnusedImageCaches();
      
      // Force garbage collection if available
      this.forceGarbageCollection();
      
      console.log('✅ Emergency cleanup completed');
    } catch (error) {
      console.error('❌ Error during emergency cleanup:', error);
    }
  }
  
  performRoutineCleanup() {
    console.log('🧹 Performing routine memory cleanup');
    
    try {
      // Clear old localStorage items
      this.cleanupOldStorageItems();
      
      // Clear unused image caches
      this.clearUnusedImageCaches();
      
      // Clear old session data
      this.clearOldSessionData();
      
      console.log('✅ Routine cleanup completed');
    } catch (error) {
      console.error('❌ Error during routine cleanup:', error);
    }
  }
  
  private clearBrowserCaches() {
    // Clear caches if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          // Keep critical caches, clear others
          if (!name.includes('critical') && !name.includes('essential')) {
            caches.delete(name);
            console.log(`🗑️ Cleared cache: ${name}`);
          }
        });
      }).catch(error => {
        console.warn('Failed to clear caches:', error);
      });
    }
  }
  
  private clearLargeObjects() {
    // Clear any large data structures stored globally
    // This should be customized based on your app's data structures
    
    // Clear any global arrays or objects that might be large
    if (window.largeDataCache) {
      window.largeDataCache = null;
    }
    
    // Clear any cached API responses
    if (window.apiCache) {
      window.apiCache.clear?.();
    }
  }
  
  private cleanupOldStorageItems() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    let itemsRemoved = 0;
    
    // Clean localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('temp_') || key.startsWith('cache_'))) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              localStorage.removeItem(key);
              itemsRemoved++;
            }
          }
        } catch (e) {
          // Remove invalid items
          localStorage.removeItem(key);
          itemsRemoved++;
        }
      }
    }
    
    // Clean sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('temp_')) {
        try {
          const item = sessionStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              sessionStorage.removeItem(key);
              itemsRemoved++;
            }
          }
        } catch (e) {
          sessionStorage.removeItem(key);
          itemsRemoved++;
        }
      }
    }
    
    if (itemsRemoved > 0) {
      console.log(`🗑️ Removed ${itemsRemoved} old storage items`);
    }
  }
  
  private clearUnusedImageCaches() {
    // Clear any cached images that aren't currently visible
    const images = document.querySelectorAll('img');
    const visibleImages = new Set<string>();
    
    images.forEach(img => {
      if (img.offsetParent !== null) {
        visibleImages.add(img.src);
      }
    });
    
    // Clear blob URLs that are no longer needed
    const blobUrls = document.querySelectorAll('[src^="blob:"]');
    blobUrls.forEach(element => {
      const src = (element as HTMLImageElement).src;
      if (!visibleImages.has(src)) {
        URL.revokeObjectURL(src);
      }
    });
  }
  
  private clearOldSessionData() {
    // Clear old session-related data
    const sessionKeys = ['user_session', 'auth_token', 'temp_data'];
    
    sessionKeys.forEach(key => {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          const data = JSON.parse(item);
          const now = Date.now();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (data.timestamp && (now - data.timestamp) > maxAge) {
            sessionStorage.removeItem(key);
            console.log(`🗑️ Cleared old session data: ${key}`);
          }
        }
      } catch (error) {
        // Remove invalid session data
        sessionStorage.removeItem(key);
      }
    });
  }
  
  private forceGarbageCollection() {
    // Force garbage collection if available (development only)
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc();
        console.log('🗑️ Forced garbage collection');
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
      }
    }
  }
  
  /**
   * Get current memory usage information
   */
  getMemoryInfo() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
  
  /**
   * Monitor memory usage and log warnings
   */
  startMemoryMonitoring() {
    if (typeof performance === 'undefined' || !performance.memory) {
      console.warn('Memory monitoring not available in this environment');
      return;
    }
    
    const monitorInterval = setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      if (memoryInfo) {
        const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        
        if (usagePercent > 80) {
          console.warn(`🚨 High memory usage: ${usagePercent.toFixed(1)}% (${memoryInfo.used}MB/${memoryInfo.limit}MB)`);
          this.performEmergencyCleanup();
        } else if (usagePercent > 60) {
          console.warn(`⚠️ Moderate memory usage: ${usagePercent.toFixed(1)}% (${memoryInfo.used}MB/${memoryInfo.limit}MB)`);
        }
      }
    }, 30000); // Check every 30 seconds
    
    console.log('📊 Memory monitoring started');
    return monitorInterval;
  }
  
  /**
   * Cleanup and destroy the service
   */
  cleanup() {
    if (this.memoryWarningListener) {
      document.removeEventListener('memorywarning', this.memoryWarningListener);
      document.removeEventListener('capacitor:memoryWarning', this.memoryWarningListener);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.isInitialized = false;
    console.log('🧹 Memory management service cleaned up');
  }
}

// Global memory management interface
declare global {
  interface Window {
    gc?: () => void;
    largeDataCache?: any;
    apiCache?: Map<string, any>;
    Capacitor?: any;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// Export singleton instance
export const memoryManagementService = MemoryManagementService.getInstance();
export default memoryManagementService;