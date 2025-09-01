import React, { useState } from 'react';
import { StorageService } from '../../utils/storage';
import { MobileServices } from '../../services/mobileServices';

export const StorageTest: React.FC = () => {
    const [testResult, setTestResult] = useState<string>('');

    const testStorage = async () => {
        try {
            setTestResult('Testing storage...');
            
            // Test basic storage operations
            const testKey = 'test_key';
            const testValue = 'test_value_' + Date.now();
            
            // Set item
            await StorageService.setItem(testKey, testValue);
            await MobileServices.showToast('Saved test data', 'short');
            
            // Get item
            const retrievedValue = await StorageService.getItem(testKey);
            
            if (retrievedValue === testValue) {
                setTestResult('✅ Storage test PASSED! Data persisted correctly.');
                await MobileServices.vibrate('light');
            } else {
                setTestResult(`❌ Storage test FAILED! Expected: ${testValue}, Got: ${retrievedValue}`);
            }
            
            // Clean up
            await StorageService.removeItem(testKey);
            
        } catch (error) {
            setTestResult(`💥 Storage test ERROR: ${error}`);
            console.error('Storage test error:', error);
        }
    };

    const testSessionStorage = async () => {
        try {
            setTestResult('Testing session storage...');
            
            // Check if session data exists
            const storedUser = await StorageService.getItem('playgram_user');
            const sessionTimestamp = await StorageService.getItem('playgram_session_timestamp');
            
            const result = `
📱 Session Data Check:
- User data exists: ${!!storedUser}
- Session timestamp exists: ${!!sessionTimestamp}
- Timestamp: ${sessionTimestamp || 'None'}
- User phone: ${storedUser ? JSON.parse(storedUser).phoneNumber : 'None'}
            `;
            
            setTestResult(result);
            await MobileServices.showToast('Session check complete', 'short');
            
        } catch (error) {
            setTestResult(`💥 Session test ERROR: ${error}`);
            console.error('Session test error:', error);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 m-4">
            <h3 className="text-lg font-semibold mb-4">🧪 Storage Debug Test</h3>
            
            <div className="space-y-2 mb-4">
                <button
                    onClick={testStorage}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Test Basic Storage
                </button>
                
                <button
                    onClick={testSessionStorage}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                    Check Session Data
                </button>
            </div>
            
            {testResult && (
                <div className="bg-gray-100 p-3 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
                </div>
            )}
        </div>
    );
};