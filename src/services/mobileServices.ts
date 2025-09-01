import { Device, DeviceInfo } from '@capacitor/device';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { isMobileApp } from '../utils/mobileDetection';

export class MobileServices {
    // Device Information
    static async getDeviceInfo(): Promise<DeviceInfo | null> {
        if (!isMobileApp()) return null;
        try {
            return await Device.getInfo();
        } catch (error) {
            console.error('Error getting device info:', error);
            return null;
        }
    }

    // Network Status
    static async getNetworkStatus(): Promise<ConnectionStatus | null> {
        if (!isMobileApp()) return null;
        try {
            return await Network.getStatus();
        } catch (error) {
            console.error('Error getting network status:', error);
            return null;
        }
    }

    static addNetworkListener(callback: (status: ConnectionStatus) => void): (() => void) | null {
        if (!isMobileApp()) return null;
        try {
            const listener = Network.addListener('networkStatusChange', callback);
            return () => listener.remove();
        } catch (error) {
            console.error('Error adding network listener:', error);
            return null;
        }
    }

    // Geolocation
    static async getCurrentPosition(): Promise<Position | null> {
        if (!isMobileApp()) return null;
        try {
            return await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            });
        } catch (error) {
            console.error('Error getting current position:', error);
            return null;
        }
    }

    // Camera
    static async takePicture(): Promise<string | null> {
        if (!isMobileApp()) return null;
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });
            return image.dataUrl || null;
        } catch (error) {
            console.error('Error taking picture:', error);
            return null;
        }
    }

    static async selectFromGallery(): Promise<string | null> {
        if (!isMobileApp()) return null;
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos
            });
            return image.dataUrl || null;
        } catch (error) {
            console.error('Error selecting from gallery:', error);
            return null;
        }
    }

    // Share
    static async shareContent(title: string, text: string, url?: string): Promise<boolean> {
        if (!isMobileApp()) {
            // Fallback for web
            if (navigator.share) {
                try {
                    await navigator.share({ title, text, url });
                    return true;
                } catch (error) {
                    console.error('Web share error:', error);
                    return false;
                }
            }
            return false;
        }

        try {
            await Share.share({
                title,
                text,
                url,
                dialogTitle: 'Share with friends'
            });
            return true;
        } catch (error) {
            console.error('Error sharing content:', error);
            return false;
        }
    }

    // Toast Messages
    static async showToast(message: string, duration: 'short' | 'long' = 'short'): Promise<void> {
        if (!isMobileApp()) {
            // Fallback for web - you could use a toast library here
            console.log('Toast:', message);
            return;
        }

        try {
            await Toast.show({
                text: message,
                duration: duration,
                position: 'bottom'
            });
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    }

    // Local Notifications
    static async scheduleNotification(
        title: string, 
        body: string, 
        id: number = Date.now(),
        schedule?: Date
    ): Promise<boolean> {
        if (!isMobileApp()) return false;

        try {
            // Request permissions first
            const permission = await LocalNotifications.requestPermissions();
            if (permission.display !== 'granted') {
                console.warn('Notification permission not granted');
                return false;
            }

            await LocalNotifications.schedule({
                notifications: [{
                    title,
                    body,
                    id,
                    schedule: schedule ? { at: schedule } : undefined,
                    sound: 'beep.wav',
                    attachments: undefined,
                    actionTypeId: '',
                    extra: null
                }]
            });
            return true;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return false;
        }
    }

    // Haptic Feedback
    static async vibrate(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
        if (!isMobileApp()) return;

        try {
            const impactStyle = style === 'light' ? ImpactStyle.Light :
                              style === 'heavy' ? ImpactStyle.Heavy :
                              ImpactStyle.Medium;
            
            await Haptics.impact({ style: impactStyle });
        } catch (error) {
            console.error('Error with haptic feedback:', error);
        }
    }

    static async vibrateNotification(): Promise<void> {
        if (!isMobileApp()) return;

        try {
            await Haptics.notification({ type: 'SUCCESS' });
        } catch (error) {
            console.error('Error with notification haptic:', error);
        }
    }

    // Keyboard
    static async hideKeyboard(): Promise<void> {
        if (!isMobileApp()) return;

        try {
            await Keyboard.hide();
        } catch (error) {
            console.error('Error hiding keyboard:', error);
        }
    }

    static addKeyboardListener(
        onShow: () => void,
        onHide: () => void
    ): (() => void) | null {
        if (!isMobileApp()) return null;

        try {
            const showListener = Keyboard.addListener('keyboardWillShow', onShow);
            const hideListener = Keyboard.addListener('keyboardWillHide', onHide);
            
            return () => {
                showListener.remove();
                hideListener.remove();
            };
        } catch (error) {
            console.error('Error adding keyboard listeners:', error);
            return null;
        }
    }

    // Utility Methods
    static async isOnline(): Promise<boolean> {
        const status = await this.getNetworkStatus();
        return status?.connected ?? navigator.onLine;
    }

    static async getDeviceId(): Promise<string | null> {
        const deviceInfo = await this.getDeviceInfo();
        return deviceInfo?.identifier || null;
    }

    static async getPlatform(): Promise<string> {
        const deviceInfo = await this.getDeviceInfo();
        return deviceInfo?.platform || 'web';
    }
}