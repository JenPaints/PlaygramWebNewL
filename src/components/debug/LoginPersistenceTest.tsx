import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { StorageService } from '../../utils/storage';

export const LoginPersistenceTest: React.FC = () => {
    const { user, isAuthenticated, validateSession } = useAuth();
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkSessionInfo = async () => {
            try {
                const storedUser = await StorageService.getItem('playgram_user');
                const sessionTimestamp = await StorageService.getItem('playgram_session_timestamp');
                const isValid = await validateSession();
                
                setSessionInfo({
                    hasStoredUser: !!storedUser,
                    hasTimestamp: !!sessionTimestamp,
                    isValid,
                    timestamp: sessionTimestamp ? new Date(parseInt(sessionTimestamp)).toLocaleString() : null,
                    userPhone: user?.phoneNumber || 'None'
                });
            } catch (error) {
                console.error('Error checking session info:', error);
            }
        };

        checkSessionInfo();
        const interval = setInterval(checkSessionInfo, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [user, validateSession]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs z-50"
            >
                Debug Login
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg text-xs max-w-xs z-50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm">Login Persistence Debug</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
            
            <div className="space-y-1">
                <div className={`flex justify-between ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Authenticated:</span>
                    <span>{isAuthenticated ? '✅' : '❌'}</span>
                </div>
                
                <div className={`flex justify-between ${sessionInfo?.hasStoredUser ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Stored User:</span>
                    <span>{sessionInfo?.hasStoredUser ? '✅' : '❌'}</span>
                </div>
                
                <div className={`flex justify-between ${sessionInfo?.hasTimestamp ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Session Timestamp:</span>
                    <span>{sessionInfo?.hasTimestamp ? '✅' : '❌'}</span>
                </div>
                
                <div className={`flex justify-between ${sessionInfo?.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Session Valid:</span>
                    <span>{sessionInfo?.isValid ? '✅' : '❌'}</span>
                </div>
                
                <div className="text-gray-600 text-xs mt-2">
                    <div>Phone: {sessionInfo?.userPhone}</div>
                    {sessionInfo?.timestamp && (
                        <div>Last Update: {sessionInfo.timestamp}</div>
                    )}
                </div>
            </div>
        </div>
    );
};