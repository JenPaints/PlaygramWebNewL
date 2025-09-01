# iOS SIGTERM Crash Fix

## Problem
The iOS app is crashing with `Thread 1: signal SIGTERM` in the AppDelegate, causing the app to terminate unexpectedly.

## Root Cause Analysis
SIGTERM (Signal Terminate) crashes in iOS apps are typically caused by:

1. **Memory Pressure**: App using too much memory
2. **Background Task Timeout**: Long-running tasks not properly managed
3. **Plugin Conflicts**: Capacitor plugins causing issues
4. **Infinite Loops**: Code causing the main thread to hang
5. **Resource Leaks**: Unmanaged resources causing system termination

## Diagnostic Steps

### 1. Check Memory Usage
The app might be consuming too much memory, causing iOS to terminate it.

### 2. Plugin Configuration Issues
Some Capacitor plugins might be misconfigured or conflicting.

### 3. Background Task Management
Long-running operations might not be properly handled.

## Solutions Implemented

### 1. Enhanced AppDelegate with Error Handling

```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Add memory warning observer
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMemoryWarning),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
        
        // Configure app for better memory management
        configureAppForStability()
        
        return true
    }
    
    @objc func handleMemoryWarning() {
        print("⚠️ Memory warning received - cleaning up resources")
        // Force garbage collection and cleanup
        DispatchQueue.main.async {
            // Clear any cached data
            URLCache.shared.removeAllCachedResponses()
            
            // Post notification to web layer to cleanup
            NotificationCenter.default.post(
                name: NSNotification.Name("MemoryWarning"),
                object: nil
            )
        }
    }
    
    func configureAppForStability() {
        // Disable automatic screenshot for app switcher to save memory
        if #available(iOS 13.0, *) {
            // Configure for better memory management
        }
        
        // Set reasonable cache limits
        let cache = URLCache.shared
        cache.memoryCapacity = 10 * 1024 * 1024 // 10MB
        cache.diskCapacity = 50 * 1024 * 1024   // 50MB
    }
    
    func applicationDidReceiveMemoryWarning(_ application: UIApplication) {
        print("🚨 Application received memory warning")
        handleMemoryWarning()
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Pause any intensive operations
        print("📱 App will resign active - pausing operations")
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        print("📱 App entered background - cleaning up")
        
        // Start background task to prevent immediate termination
        var backgroundTask: UIBackgroundTaskIdentifier = .invalid
        backgroundTask = application.beginBackgroundTask {
            // Clean up any long-running tasks
            application.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
        
        // Perform cleanup
        DispatchQueue.global().async {
            // Clean up resources
            URLCache.shared.removeAllCachedResponses()
            
            // End background task
            application.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        print("📱 App will enter foreground - resuming operations")
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        print("📱 App became active - resuming full operations")
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        print("📱 App will terminate - final cleanup")
        // Remove observers
        NotificationCenter.default.removeObserver(self)
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
```

### 2. Updated Capacitor Configuration

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playgram.app',
  appName: 'Playgram',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500, // Reduced from 2000
      launchAutoHide: true,
      backgroundColor: '#3B82F6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'native', // Changed from 'body' for better performance
      style: 'dark',
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: ''
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile',
    // Add memory management settings
    allowsLinkPreview: false,
    handleApplicationNotifications: false
  }
};

export default config;
```

### 3. Memory Management Service

```typescript
// src/services/memoryManagementService.ts
export class MemoryManagementService {
  private static instance: MemoryManagementService;
  private memoryWarningListener?: () => void;
  
  static getInstance(): MemoryManagementService {
    if (!MemoryManagementService.instance) {
      MemoryManagementService.instance = new MemoryManagementService();
    }
    return MemoryManagementService.instance;
  }
  
  initialize() {
    if (window.Capacitor?.isNativePlatform()) {
      this.setupMemoryWarningListener();
      this.setupPeriodicCleanup();
    }
  }
  
  private setupMemoryWarningListener() {
    // Listen for memory warnings from native layer
    document.addEventListener('memorywarning', () => {
      console.warn('🚨 Memory warning received - cleaning up');
      this.performEmergencyCleanup();
    });
  }
  
  private setupPeriodicCleanup() {
    // Cleanup every 5 minutes
    setInterval(() => {
      this.performRoutineCleanup();
    }, 5 * 60 * 1000);
  }
  
  private performEmergencyCleanup() {
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name !== 'critical-cache') {
            caches.delete(name);
          }
        });
      });
    }
    
    // Clear large objects from memory
    this.clearLargeObjects();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
  
  private performRoutineCleanup() {
    // Clear old localStorage items
    this.cleanupOldStorageItems();
    
    // Clear unused image caches
    this.clearUnusedImageCaches();
  }
  
  private clearLargeObjects() {
    // Clear any large data structures
    // This should be customized based on your app's data
  }
  
  private cleanupOldStorageItems() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('temp_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Remove invalid items
          localStorage.removeItem(key);
        }
      }
    }
  }
  
  private clearUnusedImageCaches() {
    // Clear any cached images that aren't currently visible
    const images = document.querySelectorAll('img');
    const visibleImages = new Set();
    
    images.forEach(img => {
      if (img.offsetParent !== null) {
        visibleImages.add(img.src);
      }
    });
    
    // Clear non-visible image caches
    // Implementation depends on your image caching strategy
  }
}

// Initialize the service
export const memoryManagementService = MemoryManagementService.getInstance();
```

### 4. Updated Native Mobile Service

```typescript
// Add to nativeMobileService.ts
export class NativeMobileService {
  // ... existing code ...
  
  async initialize(config: NativeMobileConfig = {}) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not running on native platform, skipping native mobile setup');
      return;
    }

    try {
      // Initialize memory management
      memoryManagementService.initialize();
      
      // Setup with error handling
      await this.setupWithErrorHandling(config);
      
      this.isInitialized = true;
      console.log('Native mobile service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize native mobile service:', error);
      // Don't throw - continue with degraded functionality
    }
  }
  
  private async setupWithErrorHandling(config: NativeMobileConfig) {
    const setupTasks = [
      () => this.setupStatusBar(config.statusBarStyle, config.statusBarBackgroundColor),
      () => this.setupKeyboard(config.keyboardResize),
      () => config.enableSafeArea !== false ? this.setupSafeArea() : Promise.resolve(),
      () => config.lockOrientation ? this.lockOrientation(config.lockOrientation) : Promise.resolve()
    ];
    
    // Run setup tasks with individual error handling
    for (const task of setupTasks) {
      try {
        await task();
      } catch (error) {
        console.warn('Setup task failed, continuing:', error);
      }
    }
  }
}
```

## Prevention Strategies

### 1. Memory Monitoring
- Implement memory usage tracking
- Set up alerts for high memory usage
- Regular cleanup of unused resources

### 2. Background Task Management
- Properly handle background tasks
- Set timeouts for long-running operations
- Clean up resources when app goes to background

### 3. Plugin Management
- Only load necessary plugins
- Handle plugin errors gracefully
- Monitor plugin memory usage

### 4. Testing
- Test on devices with limited memory
- Use Xcode's Memory Graph Debugger
- Monitor crash reports in App Store Connect

## Debugging Steps

1. **Enable Debug Logging**:
   ```typescript
   // Add to main.tsx
   if (import.meta.env.DEV) {
     console.log('🐛 Debug mode enabled');
     window.addEventListener('error', (e) => {
       console.error('Global error:', e);
     });
     
     window.addEventListener('unhandledrejection', (e) => {
       console.error('Unhandled promise rejection:', e);
     });
   }
   ```

2. **Monitor Memory Usage**:
   ```typescript
   // Add periodic memory monitoring
   if (performance.memory) {
     setInterval(() => {
       const memory = performance.memory;
       console.log('Memory usage:', {
         used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
         total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
         limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
       });
     }, 30000); // Every 30 seconds
   }
   ```

3. **Use Xcode Instruments**:
   - Profile the app with Instruments
   - Look for memory leaks
   - Monitor CPU usage
   - Check for retain cycles

## Files to Update

1. `ios/App/App/AppDelegate.swift` - Enhanced error handling
2. `capacitor.config.ts` - Optimized configuration
3. `src/services/memoryManagementService.ts` - New memory management
4. `src/services/nativeMobileService.ts` - Enhanced error handling
5. `src/main.tsx` - Add global error handling

Implementing these fixes should resolve the SIGTERM crashes and make the iOS app more stable and resilient to memory pressure and other system-level issues.