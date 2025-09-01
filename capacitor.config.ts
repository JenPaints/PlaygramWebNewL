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
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#3B82F6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
      androidStatusBarColor: '#ffffff'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    App: {
      launchUrl: ''
    },
    Preferences: {
      group: 'PlaygramApp'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    Device: {},
    Network: {},
    Geolocation: {
      permissions: {
        location: 'always'
      }
    },
    Camera: {
      permissions: {
        camera: 'required',
        photos: 'required'
      }
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#3B82F6',
      sound: 'beep.wav'
    },
    Toast: {},
    Share: {},
    Filesystem: {},
    Haptics: {}
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    loggingBehavior: 'none'
  }
};

export default config;
