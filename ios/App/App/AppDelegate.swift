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
        
        print("📱 Playgram app launched successfully")
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
        // Set reasonable cache limits to prevent memory issues
        let cache = URLCache.shared
        cache.memoryCapacity = 10 * 1024 * 1024 // 10MB
        cache.diskCapacity = 50 * 1024 * 1024   // 50MB
        
        print("🔧 App configured for stability with cache limits")
    }
    
    func applicationDidReceiveMemoryWarning(_ application: UIApplication) {
        print("🚨 Application received memory warning")
        handleMemoryWarning()
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        print("📱 App will resign active - pausing operations")
        // Pause any intensive operations to prevent crashes
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        print("📱 App entered background - cleaning up")
        
        // Start background task to prevent immediate termination
        var backgroundTask: UIBackgroundTaskIdentifier = .invalid
        backgroundTask = application.beginBackgroundTask {
            // Clean up any long-running tasks
            print("⏰ Background task time expired - cleaning up")
            application.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
        
        // Perform cleanup
        DispatchQueue.global().async {
            // Clean up resources to free memory
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
        // Remove observers to prevent crashes
        NotificationCenter.default.removeObserver(self)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        print("🔗 App opened with URL: \(url)")
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        print("🔗 App continuing user activity: \(userActivity.activityType)")
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        print("🧹 AppDelegate deinitialized")
    }

}
