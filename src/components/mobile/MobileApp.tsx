import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MobileLoginModal } from '../auth/MobileLoginModal';
import { Dashboard } from '../dashboard/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { isMobileApp } from '../../utils/mobileDetection';
import SwipeGestureHandler from './SwipeGestureHandler';
import MobileErrorBoundary from './MobileErrorBoundary';
import { pushNotificationService } from '../../services/pushNotificationService';
import { MobileUtils } from '../../utils/mobileUtils';
import { StorageTest } from '../debug/StorageTest';
import { LoginPersistenceTest } from '../debug/LoginPersistenceTest';
import MobileLayout from './MobileLayout';
import SafeAreaTest from '../debug/SafeAreaTest';
import { NativeContainer, SafeAreaDebug } from './NativeContainer';
import { useNativeMobile } from '../../hooks/useNativeMobile';
import LoadingStateDebug from '../debug/LoadingStateDebug';
import '../../styles/native.css';


type MobileAppState = 'login' | 'dashboard';

export const MobileApp: React.FC = () => {
    const [appState, setAppState] = useState<MobileAppState>('login');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const { user, logout, isLoading } = useAuth();
    
    // Use native mobile features
    const { isNative, isInitialized, initialize } = useNativeMobile({
        autoInitialize: true,
        config: {
            statusBarStyle: 'dark',
            statusBarBackgroundColor: '#ffffff',
            enableSafeArea: true,
            keyboardResize: 'native',
            lockOrientation: 'portrait-primary'
        }
    });

    // Auto-complete login if user is authenticated but not properly set up in Convex
    const { completeLogin } = useAuth();

    // Initialize mobile app with enhanced error handling
    useEffect(() => {
        const initMobileApp = async () => {
            try {
                console.log('🚀 Initializing mobile app...');

                // Check if we're actually in a Capacitor environment
                if (!isMobileApp()) {
                    console.log('💻 Not in mobile app environment, skipping mobile initialization');
                    return;
                }

                // Get device info for debugging
                const deviceInfo = await MobileUtils.getDeviceInfo();
                console.log('📱 Device Info:', deviceInfo);

                // Check network status
                const networkStatus = await MobileUtils.getNetworkStatus();
                console.log('🌐 Network Status:', networkStatus);

                // Hide splash screen with timeout
                try {
                    await Promise.race([
                        SplashScreen.hide(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Splash screen timeout')), 5000)
                        )
                    ]);
                    console.log('✅ Splash screen hidden successfully');
                } catch (splashError) {
                    console.error('❌ Failed to hide splash screen:', splashError);
                }

                // Native mobile service will handle status bar, safe area, and orientation
                console.log('🎉 Mobile app initialized successfully');
                
            } catch (error) {
                console.error('💥 Mobile app initialization failed:', error);
                // Don't crash the app, just log the error
            }
        };

        // Delay initialization slightly to ensure Capacitor is ready
        const timer = setTimeout(() => {
            initMobileApp().catch(error => {
                console.error('❌ Failed to initialize mobile app:', error);
            });
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (user && user.phoneNumber && (!user.name && !user.studentId)) {
            console.log('🔄 MobileApp: Completing login for user with missing profile data:', user.phoneNumber);
            completeLogin(user.phoneNumber).catch(error => {
                console.error('❌ Failed to complete login:', error);
                // Ensure we don't stay in loading state if completeLogin fails
                setIsInitializing(false);
            });
        }
    }, [user, completeLogin]);



    // Timeout to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isInitializing || isLoading) {
                console.warn('⚠️ MobileApp: Loading timeout reached, forcing initialization to complete');
                console.log('🔧 MobileApp: Force completing - Current state:', {
                    user: user ? `${user.phoneNumber}` : 'null',
                    isLoading,
                    isInitializing,
                    appState,
                    hasCheckedAuth
                });
                
                setIsInitializing(false);
                
                // If we have a user but are stuck in loading, transition to dashboard
                if (user && user.phoneNumber) {
                    console.log('🔧 MobileApp: User exists, forcing transition to dashboard');
                    setAppState('dashboard');
                    setShowLoginModal(false);
                    setHasCheckedAuth(true);
                } else {
                    console.log('🔧 MobileApp: No user, forcing transition to login');
                    setAppState('login');
                    setShowLoginModal(true);
                    setHasCheckedAuth(true);
                }
            }
        }, 10000); // 10 second timeout
        
        return () => clearTimeout(timeout);
    }, [isInitializing, isLoading, user, appState, hasCheckedAuth]);

    // Check if user is already logged in on app start
    useEffect(() => {
        console.log('🔄 MobileApp: User state changed:', {
            user: user ? `Logged in as ${user.phoneNumber}` : 'Not logged in',
            isLoading,
            isInitializing,
            appState,
            hasCheckedAuth,
            showLoginModal
        });
        
        // Don't do anything while auth is still loading
        if (isLoading) {
            console.log('⏳ Auth still loading, waiting...');
            return;
        }
        
        // Mark that we've finished initializing
        setIsInitializing(false);
        
        if (user) {
            console.log('✅ MobileApp: User authenticated, setting app state to dashboard');
            setAppState('dashboard');
            setShowLoginModal(false); // Ensure login modal is closed when user is authenticated
            setHasCheckedAuth(true);
        } else if (hasCheckedAuth) {
            // Only show login modal if we've checked auth before and user is now null (logout scenario)
            console.log('🚪 MobileApp: User logged out, showing login modal');
            setAppState('login');
            setShowLoginModal(true);
        } else {
            // First time checking - user is null, show login
            console.log('🔐 MobileApp: Initial check - no user, showing login');
            setAppState('login');
            setShowLoginModal(true);
            setHasCheckedAuth(true);
        }
    }, [user, hasCheckedAuth, isLoading]);

    // Handle user logout - only trigger when explicitly logged out
    useEffect(() => {
        // Only show login modal if user was previously authenticated and now is not
        if (!user && appState === 'dashboard') {
            console.log('🚪 User logged out, showing login modal');
            setAppState('login');
            setShowLoginModal(true);
        }
    }, [user, appState]);

    // Handle Android back button with proper navigation
    useEffect(() => {
        if (!isMobileApp()) return;

        const handleBackButton = () => {
            console.log('🔙 Back button pressed - App State:', appState, 'Login Modal:', showLoginModal);
            
            // If login modal is open, close it but stay in login state
            if (showLoginModal) {
                setShowLoginModal(false);
                return true; // Prevent app exit
            }

            // If in login state without modal, allow app to exit
            if (appState === 'login') {
                console.log('🚪 Allowing app to exit from login state');
                return false; // Allow app to close
            }

            // If in dashboard, the Dashboard component will handle its own back navigation
            // Only exit to login if explicitly requested
            return false; // Let Dashboard component handle back navigation
        };

        App.addListener('backButton', handleBackButton);

        return () => {
            App.removeAllListeners();
        };
    }, [appState, showLoginModal]);

    // Push notifications setup using isolated service with complete error isolation
    useEffect(() => {
        if (!isMobileApp()) return;

        let isComponentMounted = true;
        let timeoutId: NodeJS.Timeout;

        const initPushNotifications = async () => {
            // Wrap everything in multiple try-catch layers
            try {
                console.log('🔔 Starting push notification initialization...');

                // Check if we should even attempt this
                const shouldInitialize = localStorage.getItem('disable_push_notifications') !== 'true';

                if (!shouldInitialize) {
                    console.log('🚫 Push notifications disabled by user preference');
                    return;
                }

                // Try to initialize with timeout
                const initPromise = pushNotificationService.initialize();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Service initialization timeout')), 15000)
                );

                const success = await Promise.race([initPromise, timeoutPromise]) as boolean;

                if (success) {
                    console.log('✅ Push notification service initialized successfully');
                } else {
                    console.log('⚠️ Push notification service initialization failed (gracefully handled)');
                }
            } catch (error) {
                console.error('💥 Push notification error (completely isolated):', error);

                // Disable push notifications for this session to prevent repeated crashes
                try {
                    localStorage.setItem('disable_push_notifications', 'true');
                    console.log('🚫 Push notifications disabled due to error');
                } catch (storageError) {
                    console.error('❌ Could not disable push notifications in storage:', storageError);
                }
            }
        };

        // Use even longer delay and wrap in additional error handling
        timeoutId = setTimeout(() => {
            if (isComponentMounted) {
                // Final safety wrapper
                try {
                    initPushNotifications().catch(error => {
                        console.error('🚨 Final push notification error handler:', error);
                        // Absolutely nothing should escape this
                    });
                } catch (syncError) {
                    console.error('🚨 Synchronous push notification error:', syncError);
                }
            }
        }, 5000); // 5 second delay

        return () => {
            isComponentMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Clean up service with error handling
            try {
                // Push notification service cleanup is handled internally
                console.log('🧹 Push notification cleanup completed');
            } catch (cleanupError) {
                console.error('❌ Error cleaning up push notification service (ignored):', cleanupError);
            }
        };
    }, []);

    const handleLoginSuccess = () => {
        console.log('✅ MobileApp: Login successful, transitioning to dashboard');
        console.log('🔄 MobileApp: Current user state:', user);
        console.log('🔄 MobileApp: Current loading state:', isLoading);
        
        setShowLoginModal(false);
        setAppState('dashboard');
        setHasCheckedAuth(true);
        setIsInitializing(false); // Ensure we're not stuck in initializing state
        
        console.log('✅ MobileApp: State updated - appState: dashboard, showLoginModal: false');
    };

    const handleLogout = async () => {
        await logout();
        setAppState('login');
        setShowLoginModal(true);
    };

    const handleSwipeBack = () => {
        if (showLoginModal) {
            setShowLoginModal(false);
            return;
        }

        if (appState === 'dashboard') {
            handleLogout().catch(console.error);
            return;
        }

        if (appState === 'login') {
            App.exitApp();
        }
    };

    // Show loading screen while initializing
    if (isInitializing || isLoading) {
        return (
            <MobileErrorBoundary>
                <NativeContainer 
                    statusBarStyle="light" 
                    statusBarBackgroundColor="#1e40af"
                    theme="dark"
                >
                    <div className="native-content bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center">
                        <div className="text-center">
                            <img
                                src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png"
                                alt="Playgram Logo"
                                className="w-24 h-24 mx-auto mb-4 object-contain"
                            />
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                            <p className="text-white mt-4">Loading...</p>
                        </div>
                    </div>
                </NativeContainer>
            </MobileErrorBoundary>
        );
    }

    return (
        <MobileErrorBoundary>
            <NativeContainer 
                statusBarStyle="dark" 
                statusBarBackgroundColor="#ffffff"
                theme="light"
            >
                {/* Login State */}
                {appState === 'login' && (
                    <SwipeGestureHandler
                        onSwipeBack={handleSwipeBack}
                        enabled={!showLoginModal}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="native-content bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4 sm:p-6 md:p-8"
                        >
                            <div className="text-center w-full max-w-sm mx-auto">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="mb-6 sm:mb-8"
                                >
                                    <img
                                        src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png"
                                        alt="Playgram Logo"
                                        className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 object-contain"
                                    />
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 px-2">Welcome to Playgram</h1>
                                    <p className="text-blue-100 text-base sm:text-lg px-4">Your sports journey starts here</p>
                                </motion.div>

                                {/* Debug Storage Test - Remove in production */}
                                <div className="mb-4">
                                    <StorageTest />
                                </div>

                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    onClick={async () => {
                                        await MobileUtils.vibrate('light');
                                        setShowLoginModal(true);
                                    }}
                                    className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full max-w-xs"
                                >
                                    Get Started
                                </motion.button>
                            </div>
                        </motion.div>
                    </SwipeGestureHandler>
                )}

                {/* Dashboard State */}
                {appState === 'dashboard' && user && (
                    <SwipeGestureHandler
                        onSwipeBack={handleSwipeBack}
                        enabled={true}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Dashboard onNavigateHome={handleLogout} />
                        </motion.div>
                    </SwipeGestureHandler>
                )}

                {/* Login Modal */}
                <AnimatePresence>
                    {showLoginModal && (
                        <MobileLoginModal
                            isOpen={showLoginModal}
                            onClose={() => setShowLoginModal(false)}
                            onSuccess={handleLoginSuccess}
                        />
                    )}
                </AnimatePresence>

                {/* Debug Components - Remove in production */}
                <LoginPersistenceTest />
                <SafeAreaDebug />
                <LoadingStateDebug 
                    isInitializing={isInitializing}
                    appState={appState}
                    hasCheckedAuth={hasCheckedAuth}
                    showLoginModal={showLoginModal}
                />
            </NativeContainer>
        </MobileErrorBoundary>
    );
};

export default MobileApp;