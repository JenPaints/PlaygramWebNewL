import React, { createContext, useContext, useState, useEffect } from 'react';
import { aisensyOTPService } from '../../services/aisensyOTP';
import { userEnrollmentService, UserEnrollmentStatus } from '../../services/userEnrollmentService';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { isMobileApp, getPlatform, isAndroid, isIOS } from '../../utils/mobileDetection';
import { StorageService } from '../../utils/storage';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';

export interface User {
    uid: string;
    phoneNumber: string;
    isAnonymous: boolean;
    name?: string;
    fullName?: string;
    studentId?: string;
    email?: string;
    userType?: string;
    status?: string;
    city?: string;
    registrationSource?: string;
    lastActivity?: number;
    lastLoginTime?: number;
    createdAt?: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (phoneNumber: string) => Promise<any>;
    completeLogin: (phoneNumber: string) => Promise<User>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    setAuthenticatedUser: (userData: User) => Promise<void>;
    enrollmentStatus: UserEnrollmentStatus | null;
    checkEnrollmentStatus: () => Promise<void>;
    refreshUser: () => Promise<void>;
    validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollmentStatus, setEnrollmentStatus] = useState<UserEnrollmentStatus | null>(null);
    const convex = useConvex();

    // Initialize userEnrollmentService with convex client
    useEffect(() => {
        if (convex) {
            userEnrollmentService.setConvexClient(convex);
        }
    }, [convex]);

    useEffect(() => {
        // Check for existing session on app load with enhanced error handling
        const checkExistingSession = async () => {
            try {
                console.log('🔍 Checking existing session...');
                const storedUser = await StorageService.getItem('playgram_user');
                const sessionTimestamp = await StorageService.getItem('playgram_session_timestamp');
                
                console.log('📱 Stored user exists:', !!storedUser);
                console.log('⏰ Session timestamp exists:', !!sessionTimestamp);
                
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    
                    // Validate user data structure
                    if (userData && userData.phoneNumber && userData.uid) {
                        console.log('✅ Valid persistent session found, restoring user:', userData.phoneNumber);
                        
                        // Update last activity timestamp to track usage
                        const currentTime = Date.now();
                        userData.lastActivity = currentTime;
                        
                        // Update stored user data with new activity timestamp
                        try {
                            await StorageService.setItem('playgram_user', JSON.stringify(userData));
                            await StorageService.setItem('playgram_session_timestamp', currentTime.toString());
                            console.log('📱 Updated user activity timestamp');
                        } catch (updateError) {
                            console.warn('⚠️ Could not update activity timestamp:', updateError);
                        }
                        
                        setUser(userData);
                    } else {
                        console.warn('⚠️ Invalid user data in storage, clearing...');
                        await StorageService.removeItem('playgram_user');
                        await StorageService.removeItem('playgram_session_timestamp');
                        await StorageService.removeItem('aisensy_otp_sessions');
                    }
                } else if (storedUser) {
                    // Old session without timestamp, clear it
                    console.log('🔄 Old session format detected, clearing...');
                    await StorageService.removeItem('playgram_user');
                } else {
                    console.log('🆕 No existing session found');
                }
            } catch (error) {
                console.error('💥 Error checking existing session:', error);
                // Clear corrupted data
                try {
                    await StorageService.removeItem('playgram_user');
                    await StorageService.removeItem('playgram_session_timestamp');
                } catch (clearError) {
                    console.error('❌ Error clearing storage:', clearError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkExistingSession();
    }, []);

    // Handle app lifecycle events for mobile apps
    useEffect(() => {
        if (!isMobileApp()) return;

        const handleAppStateChange = async (state: { isActive: boolean }) => {
            console.log('📱 App state changed:', state.isActive ? 'Active' : 'Background');
            
            if (state.isActive && user) {
                // App became active, refresh user session
                console.log('🔄 App became active, refreshing session...');
                try {
                    const currentTime = Date.now();
                    const updatedUser = { ...user, lastActivity: currentTime };
                    
                    setUser(updatedUser);
                    await StorageService.setItem('playgram_user', JSON.stringify(updatedUser));
                    await StorageService.setItem('playgram_session_timestamp', currentTime.toString());
                    
                    console.log('✅ Session refreshed on app resume');
                } catch (error) {
                    console.error('❌ Error refreshing session on app resume:', error);
                }
            }
        };

        // Listen for app state changes
        App.addListener('appStateChange', handleAppStateChange);

        return () => {
            App.removeAllListeners();
        };
    }, [user]);

    const refreshUser = async () => {
        if (!user?.phoneNumber || !convex) return;
        
        try {
            console.log('🔄 Refreshing user data from server...');
            
            // Fetch updated user data from Convex with timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );
            
            const updatedUser = await Promise.race([
                convex.query(api.auth.getUserByPhone, {
                    phoneNumber: user.phoneNumber
                }),
                timeoutPromise
            ]) as any;
            
            if (updatedUser) {
                const userData = {
                    uid: user.uid,
                    phoneNumber: user.phoneNumber,
                    isAnonymous: false,
                    name: updatedUser.name,
                    fullName: updatedUser.fullName,
                    studentId: updatedUser.studentId,
                    email: updatedUser.email,
                    userType: updatedUser.userType || 'student',
                    status: updatedUser.status || 'active',
                    city: updatedUser.city,
                    registrationSource: updatedUser.registrationSource,
                    lastActivity: Date.now(), // Update activity timestamp
                    lastLoginTime: updatedUser.lastLoginTime,
                    createdAt: updatedUser.createdAt
                };
                
                setUser(userData);
                try {
                    await StorageService.setItem('playgram_user', JSON.stringify(userData));
                    await StorageService.setItem('playgram_session_timestamp', Date.now().toString());
                    console.log('✅ User data refreshed and saved');
                } catch (storageError) {
                    console.error('❌ Error saving refreshed user data to storage:', storageError);
                }
            } else {
                console.warn('⚠️ No user data received from server, keeping cached data');
            }
        } catch (error) {
            console.error('❌ Error refreshing user data:', error);
            // Don't logout the user, just log the error and continue with cached data
            // This ensures the app remains functional even with network issues
        }
    };

    // Handle network connectivity changes
    useEffect(() => {
        if (!isMobileApp()) return;

        const handleNetworkChange = async (status: { connected: boolean }) => {
            console.log('🌐 Network status changed:', status.connected ? 'Connected' : 'Disconnected');
            
            if (status.connected && user) {
                // Network is back, refresh user session
                console.log('🔄 Network restored, refreshing user session...');
                try {
                    await refreshUser();
                } catch (error) {
                    console.error('❌ Error refreshing session after network restore:', error);
                }
            }
        };

        // Listen for network changes
        Network.addListener('networkStatusChange', handleNetworkChange);

        return () => {
            Network.removeAllListeners();
        };
    }, [user, refreshUser]);

    const login = async (phoneNumber: string) => {
        setIsLoading(true);
        try {
            // Validate phone number
            if (!phoneNumber || phoneNumber.trim().length === 0) {
                throw new Error('Phone number is required');
            }
            
            // Add timeout to OTP service
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('OTP request timeout')), 15000)
            );
            
            const confirmationResult = await Promise.race([
                aisensyOTPService.sendOTP(phoneNumber),
                timeoutPromise
            ]);
            
            return confirmationResult;
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
            throw error;
        }
    };

    const completeLogin = async (phoneNumber: string): Promise<User> => {
        if (!convex) {
            throw new Error('Convex client not available');
        }

        try {
            // Get device and location info using proper mobile detection
            const platform = getPlatform();
            const deviceInfo = {
                deviceType: isMobileApp() ? 'mobile-app' : 'web',
                browser: isMobileApp() ? 'capacitor-webview' : 
                         (typeof navigator !== 'undefined' && navigator.userAgent?.includes('Chrome')) ? 'Chrome' : 
                         (typeof navigator !== 'undefined' && navigator.userAgent?.includes('Firefox')) ? 'Firefox' : 
                         (typeof navigator !== 'undefined' && navigator.userAgent?.includes('Safari')) ? 'Safari' : 'Unknown',
                os: platform,
                isMobile: isMobileApp() || isAndroid() || isIOS(),
                isCapacitor: isMobileApp(),
                platform: platform
            };
            
            // Call handleUserLogin to create/update user and establish session
            const loginResult = await convex.mutation(api.auth.handleUserLogin, {
                phoneNumber: phoneNumber,
                deviceInfo,
                ipAddress: undefined, // Could be obtained from a service
                userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : 'Unknown',
                location: undefined, // Could be obtained from geolocation API
            });
            
            const userData: User = {
                uid: `convex_${loginResult.user!._id}`,
                phoneNumber: phoneNumber,
                isAnonymous: false,
                name: loginResult.user?.name,
                fullName: loginResult.user?.fullName,
                studentId: loginResult.user?.studentId,
                email: loginResult.user?.email,
                userType: loginResult.user?.userType,
                status: loginResult.user?.status,
                city: loginResult.user?.city,
                registrationSource: loginResult.user?.registrationSource,
                lastActivity: loginResult.user?.lastActivity,
                lastLoginTime: loginResult.user?.lastLoginTime,
                createdAt: loginResult.user?.createdAt
            };
            
            // Set user in auth context
            setAuthenticatedUser(userData);
            setIsLoading(false);
            
            return userData;
        } catch (error) {
            console.error('Error in completeLogin:', error);
            setIsLoading(false);
            throw error;
        }
    };

    const checkEnrollmentStatus = async () => {
        if (!user?.phoneNumber) return;

        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Enrollment check timeout')), 8000)
            );
            
            const status = await Promise.race([
                userEnrollmentService.checkUserEnrollmentStatus(user.phoneNumber),
                timeoutPromise
            ]) as any;
            
            setEnrollmentStatus(status);
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            // Set a default status to prevent UI issues
            setEnrollmentStatus({
                hasActiveEnrollments: false,
                enrollments: [],
                totalEnrollments: 0,
                activeSports: []
            });
        }
    };

    const setAuthenticatedUser = async (userData: User) => {
        try {
            // Validate user data before setting
            if (!userData || !userData.phoneNumber || !userData.uid) {
                console.error('❌ Invalid user data provided to setAuthenticatedUser');
                return;
            }
            
            console.log('💾 Setting authenticated user:', userData.phoneNumber);
            setUser(userData);
            
            try {
                const timestamp = Date.now().toString();
                await StorageService.setItem('playgram_user', JSON.stringify(userData));
                await StorageService.setItem('playgram_session_timestamp', timestamp);
                console.log('✅ User data saved to storage with timestamp:', timestamp);
            } catch (storageError) {
                console.error('❌ Error saving user to storage:', storageError);
                // Continue without storage if it fails
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error('💥 Error in setAuthenticatedUser:', error);
            setIsLoading(false);
        }
    };

    // Validate session integrity
    const validateSession = async (): Promise<boolean> => {
        try {
            const storedUser = await StorageService.getItem('playgram_user');
            const sessionTimestamp = await StorageService.getItem('playgram_session_timestamp');
            
            if (!storedUser || !sessionTimestamp) {
                return false;
            }
            
            const userData = JSON.parse(storedUser);
            return !!(userData && userData.phoneNumber && userData.uid);
        } catch (error) {
            console.error('❌ Error validating session:', error);
            return false;
        }
    };

    const logout = async () => {
        console.log('🚪 Logging out user...');
        
        try {
            // Clear user state
            setUser(null);
            setEnrollmentStatus(null);
            
            // Clear all authentication-related storage
            await StorageService.removeItem('playgram_user');
            await StorageService.removeItem('playgram_session_timestamp');
            await StorageService.removeItem('aisensy_otp_sessions');
            
            // Clear any cached profile images
            if (user?.phoneNumber) {
                await StorageService.removeItem(`profileImage_${user.phoneNumber}`);
            }
            
            console.log('✅ User logged out successfully');
        } catch (error) {
            console.error('❌ Error during logout:', error);
            // Still clear the user state even if storage operations fail
            setUser(null);
            setEnrollmentStatus(null);
        }
    };

    // Check enrollment status when user changes with error handling
    useEffect(() => {
        if (user?.phoneNumber) {
            try {
                checkEnrollmentStatus();
            } catch (error) {
                console.error('Error in enrollment status check useEffect:', error);
            }
        }
    }, [user]);

    // Periodic session refresh to maintain persistent login
    useEffect(() => {
        if (!user) return;

        const updateUserActivity = async () => {
            try {
                const currentTime = Date.now();
                const updatedUser = { ...user, lastActivity: currentTime };
                
                // Update in memory
                setUser(updatedUser);
                
                // Update in storage
                await StorageService.setItem('playgram_user', JSON.stringify(updatedUser));
                await StorageService.setItem('playgram_session_timestamp', currentTime.toString());
                
                console.log('🔄 Updated user activity for persistent session');
            } catch (error) {
                console.error('❌ Error updating user activity:', error);
            }
        };

        // Update activity every 5 minutes when app is active
        const activityInterval = setInterval(updateUserActivity, 5 * 60 * 1000);

        // Update activity when user interacts with the app
        const handleUserActivity = () => {
            updateUserActivity();
        };

        // Listen for user interactions
        if (typeof window !== 'undefined') {
            window.addEventListener('click', handleUserActivity);
            window.addEventListener('keydown', handleUserActivity);
            window.addEventListener('scroll', handleUserActivity);
            window.addEventListener('touchstart', handleUserActivity);
        }

        return () => {
            clearInterval(activityInterval);
            if (typeof window !== 'undefined') {
                window.removeEventListener('click', handleUserActivity);
                window.removeEventListener('keydown', handleUserActivity);
                window.removeEventListener('scroll', handleUserActivity);
                window.removeEventListener('touchstart', handleUserActivity);
            }
        };
    }, [user]);

    const value = {
        user,
        isLoading,
        login,
        completeLogin,
        logout,
        isAuthenticated: !!user,
        setAuthenticatedUser,
        enrollmentStatus,
        checkEnrollmentStatus,
        refreshUser,
        validateSession
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};