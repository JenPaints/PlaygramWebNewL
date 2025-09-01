import React, { useState } from 'react';
import { pushNotificationService } from '../../services/pushNotificationService';
import { isMobileApp } from '../../utils/mobileDetection';

export const PushNotificationTest: React.FC = () => {
    const [status, setStatus] = useState<string>('Not tested');
    const [isLoading, setIsLoading] = useState(false);

    const testPushNotifications = async () => {
        setIsLoading(true);
        setStatus('Testing...');

        try {
            console.log('🧪 Starting push notification test...');

            if (!isMobileApp()) {
                setStatus('❌ Not in mobile app environment');
                return;
            }

            // Clear any previous disable flag
            localStorage.removeItem('disable_push_notifications');

            const success = await pushNotificationService.initialize();

            if (success) {
                const token = pushNotificationService.getStoredToken();
                if (token) {
                    setStatus(`✅ Success! Token: ${token.substring(0, 20)}...`);
                } else {
                    setStatus('✅ Initialized but no token yet');
                }
            } else {
                // Check if it's a Firebase issue
                setStatus('⚠️ Firebase not configured - push notifications disabled (this is normal for debug builds)');
            }
        } catch (error) {
            console.error('🧪 Push notification test error:', error);
            
            // Check if it's a Firebase error
            if (error instanceof Error && (
                error.message.includes('FirebaseApp is not initialized') ||
                error.message.includes('Default FirebaseApp')
            )) {
                setStatus('🔥 Firebase not configured - this is expected for debug builds');
            } else {
                setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearDisableFlag = () => {
        localStorage.removeItem('disable_push_notifications');
        setStatus('🔄 Cleared disable flag - try testing again');
    };

    const getStoredToken = () => {
        const token = pushNotificationService.getStoredToken();
        if (token) {
            setStatus(`📱 Stored token: ${token.substring(0, 30)}...`);
        } else {
            setStatus('📱 No token stored');
        }
    };

    if (!isMobileApp()) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 m-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                🔔 Push Notification Test
            </h3>
            
            <div className="space-y-3">
                <button
                    onClick={testPushNotifications}
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {isLoading ? '🔄 Testing...' : '🧪 Test Push Notifications'}
                </button>

                <button
                    onClick={getStoredToken}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    📱 Check Stored Token
                </button>

                <button
                    onClick={clearDisableFlag}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    🔄 Reset Push Notifications
                </button>

                <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Status:</p>
                    <p className="text-sm text-gray-600 mt-1">{status}</p>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                    <p>• Use "Test Push Notifications" to manually trigger setup</p>
                    <p>• Firebase errors are normal in debug builds without proper configuration</p>
                    <p>• Check console logs for detailed error information</p>
                    <p>• "Reset" clears any error flags that disable notifications</p>
                </div>
            </div>
        </div>
    );
};

export default PushNotificationTest;