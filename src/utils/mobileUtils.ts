import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isMobileApp } from './mobileDetection';

export class MobileUtils {
    // Device Information
    static async getDeviceInfo() {
        if (!isMobileApp()) return null;
        
        try {
            const info = await Device.getInfo();
            const batteryInfo = await Device.getBatteryInfo();
            return {
                ...info,
                battery: batteryInfo
            };
        } catch (error) {
            console.error('Error getting device info:', error);
            return null;
        }
    }

    // Network Status
    static async getNetworkStatus() {
        if (!isMobileApp()) {
            return { connected: navigator.onLine, connectionType: 'unknown' };
        }
        
        try {
            const status = await Network.getStatus();
            return status;
        } catch (error) {
            console.error('Error getting network status:', error);
            return { connected: false, connectionType: 'unknown' };
        }
    }

    // Network Listener
    static addNetworkListener(callback: (status: any) => void) {
        if (!isMobileApp()) {
            window.addEventListener('online', () => callback({ connected: true }));
            window.addEventListener('offline', () => callback({ connected: false }));
            return () => {
                window.removeEventListener('online', () => callback({ connected: true }));
                window.removeEventListener('offline', () => callback({ connected: false }));
            };
        }

        try {
            const listener = Network.addListener('networkStatusChange', callback);
            return () => listener.remove();
        } catch (error) {
            console.error('Error adding network listener:', error);
            return () => {};
        }
    }

    // Keyboard Management
    static async showKeyboard() {
        if (!isMobileApp()) return;
        
        try {
            await Keyboard.show();
        } catch (error) {
            console.error('Error showing keyboard:', error);
        }
    }

    static async hideKeyboard() {
        if (!isMobileApp()) return;
        
        try {
            await Keyboard.hide();
        } catch (error) {
            console.error('Error hiding keyboard:', error);
        }
    }

    static addKeyboardListener(callback: (info: any) => void) {
        if (!isMobileApp()) return () => {};

        try {
            const showListener = Keyboard.addListener('keyboardWillShow', callback);
            const hideListener = Keyboard.addListener('keyboardWillHide', callback);
            
            return () => {
                showListener.remove();
                hideListener.remove();
            };
        } catch (error) {
            console.error('Error adding keyboard listener:', error);
            return () => {};
        }
    }

    // Screen Orientation
    static async lockOrientation(orientation: 'portrait' | 'landscape') {
        if (!isMobileApp()) return;
        
        try {
            await ScreenOrientation.lock({ orientation });
        } catch (error) {
            console.error('Error locking orientation:', error);
        }
    }

    static async unlockOrientation() {
        if (!isMobileApp()) return;
        
        try {
            await ScreenOrientation.unlock();
        } catch (error) {
            console.error('Error unlocking orientation:', error);
        }
    }

    static async getCurrentOrientation() {
        if (!isMobileApp()) return null;
        
        try {
            const orientation = await ScreenOrientation.orientation();
            return orientation;
        } catch (error) {
            console.error('Error getting orientation:', error);
            return null;
        }
    }

    // Haptic Feedback
    static async vibrate(style: 'light' | 'medium' | 'heavy' = 'medium') {
        if (!isMobileApp()) {
            // Fallback for web
            if (navigator.vibrate) {
                const duration = style === 'light' ? 50 : style === 'medium' ? 100 : 200;
                navigator.vibrate(duration);
            }
            return;
        }
        
        try {
            const impactStyle = style === 'light' ? ImpactStyle.Light : 
                              style === 'medium' ? ImpactStyle.Medium : 
                              ImpactStyle.Heavy;
            await Haptics.impact({ style: impactStyle });
        } catch (error) {
            console.error('Error with haptic feedback:', error);
        }
    }

    static async vibrateNotification() {
        if (!isMobileApp()) {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            return;
        }
        
        try {
            await Haptics.notification({ type: 'SUCCESS' });
        } catch (error) {
            console.error('Error with notification haptic:', error);
        }
    }

    // Utility Methods
    static async isOnline(): Promise<boolean> {
        const status = await this.getNetworkStatus();
        return status.connected;
    }

    static async waitForNetwork(timeout = 10000): Promise<boolean> {
        return new Promise((resolve) => {
            let timeoutId: NodeJS.Timeout;
            
            const checkNetwork = async () => {
                const isOnline = await this.isOnline();
                if (isOnline) {
                    clearTimeout(timeoutId);
                    resolve(true);
                }
            };

            // Check immediately
            checkNetwork();

            // Set up listener
            const removeListener = this.addNetworkListener(async () => {
                const isOnline = await this.isOnline();
                if (isOnline) {
                    clearTimeout(timeoutId);
                    removeListener();
                    resolve(true);
                }
            });

            // Set timeout
            timeoutId = setTimeout(() => {
                removeListener();
                resolve(false);
            }, timeout);
        });
    }
}