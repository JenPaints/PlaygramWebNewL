import { Preferences } from '@capacitor/preferences';
import { isMobileApp } from './mobileDetection';

export class StorageService {
    static async setItem(key: string, value: string): Promise<void> {
        try {
            if (isMobileApp()) {
                await Preferences.set({ key, value });
                console.log(`📱 Capacitor: Saved ${key} to preferences`);
            } else {
                localStorage.setItem(key, value);
                console.log(`💻 Web: Saved ${key} to localStorage`);
            }
        } catch (error) {
            console.error(`❌ Error saving ${key}:`, error);
            throw error;
        }
    }

    static async getItem(key: string): Promise<string | null> {
        try {
            if (isMobileApp()) {
                const result = await Preferences.get({ key });
                console.log(`📱 Capacitor: Retrieved ${key} from preferences:`, !!result.value);
                return result.value;
            } else {
                const value = localStorage.getItem(key);
                console.log(`💻 Web: Retrieved ${key} from localStorage:`, !!value);
                return value;
            }
        } catch (error) {
            console.error(`❌ Error retrieving ${key}:`, error);
            return null;
        }
    }

    static async removeItem(key: string): Promise<void> {
        try {
            if (isMobileApp()) {
                await Preferences.remove({ key });
                console.log(`📱 Capacitor: Removed ${key} from preferences`);
            } else {
                localStorage.removeItem(key);
                console.log(`💻 Web: Removed ${key} from localStorage`);
            }
        } catch (error) {
            console.error(`❌ Error removing ${key}:`, error);
        }
    }

    static async clear(): Promise<void> {
        try {
            if (isMobileApp()) {
                await Preferences.clear();
                console.log('📱 Capacitor: Cleared all preferences');
            } else {
                localStorage.clear();
                console.log('💻 Web: Cleared localStorage');
            }
        } catch (error) {
            console.error('❌ Error clearing storage:', error);
        }
    }
}