# Native Mobile Features Implementation

This document describes the comprehensive native mobile features implemented using Capacitor plugins to make the Playgram app feel truly native on mobile devices.

## 🚀 Features Implemented

### 1. Status Bar Management
- **Plugin**: `@capacitor/status-bar`
- **Features**:
  - Transparent status bar handling
  - Dynamic style switching (light/dark)
  - Background color customization
  - Show/hide functionality
  - Overlay protection

### 2. Keyboard Handling
- **Plugin**: `@capacitor/keyboard`
- **Features**:
  - Intelligent resize behavior
  - Keyboard height detection
  - Smooth animations during show/hide
  - Content adjustment for keyboard
  - CSS variable integration

### 3. Safe Area Support
- **Plugin**: `@capacitor-community/safe-area`
- **Features**:
  - Notch and padding detection
  - Dynamic safe area insets
  - CSS variable integration
  - Real-time updates
  - Cross-platform compatibility

### 4. Screen Orientation
- **Plugin**: `@capacitor/screen-orientation`
- **Features**:
  - Orientation locking
  - Dynamic orientation detection
  - Portrait/landscape modes
  - Orientation change handling

## 📁 File Structure

```
src/
├── services/
│   └── nativeMobileService.ts     # Core native mobile service
├── hooks/
│   └── useNativeMobile.ts         # React hooks for native features
├── components/mobile/
│   ├── NativeContainer.tsx        # Native-styled components
│   └── NativeFeaturesDemo.tsx     # Demo component
├── styles/
│   └── native.css                 # Native mobile styles
└── utils/
    └── mobileDetection.ts         # Mobile platform detection
```

## 🛠️ Installation

The required Capacitor plugins are already installed:

```json
{
  "@capacitor/status-bar": "^7.0.2",
  "@capacitor/keyboard": "^7.0.2",
  "@capacitor/screen-orientation": "^7.0.2",
  "@capacitor-community/safe-area": "^7.0.0-alpha.1"
}
```

## 🎯 Usage

### Basic Setup

```tsx
import { NativeContainer } from './components/mobile/NativeContainer';
import { useNativeMobile } from './hooks/useNativeMobile';

function MyApp() {
  const { isNative, isInitialized } = useNativeMobile({
    autoInitialize: true,
    config: {
      statusBarStyle: 'dark',
      statusBarBackgroundColor: '#ffffff',
      enableSafeArea: true,
      keyboardResize: 'native',
      lockOrientation: 'portrait-primary'
    }
  });

  return (
    <NativeContainer
      statusBarStyle="dark"
      statusBarBackgroundColor="#ffffff"
      theme="light"
    >
      {/* Your app content */}
    </NativeContainer>
  );
}
```

### Using Individual Hooks

```tsx
import { useSafeArea, useKeyboard } from './hooks/useNativeMobile';

function MyComponent() {
  const safeAreaInsets = useSafeArea();
  const { isKeyboardOpen, keyboardHeight } = useKeyboard();

  return (
    <div style={{
      paddingTop: safeAreaInsets.top,
      paddingBottom: isKeyboardOpen ? keyboardHeight : safeAreaInsets.bottom
    }}>
      Content that respects safe areas and keyboard
    </div>
  );
}
```

### Native Components

```tsx
import {
  NativeButton,
  NativeInput,
  NativeCard,
  NativeListItem
} from './components/mobile/NativeContainer';

function NativeUI() {
  return (
    <div>
      <NativeCard className="p-4">
        <NativeInput 
          placeholder="Native-styled input"
          onChange={(value) => console.log(value)}
        />
        <NativeButton 
          variant="primary"
          onClick={() => alert('Native button!')}
        >
          Click Me
        </NativeButton>
      </NativeCard>
      
      <NativeListItem onClick={() => console.log('Item clicked')}>
        Clickable List Item
      </NativeListItem>
    </div>
  );
}
```

## 🎨 CSS Classes

### Safe Area Classes
```css
.safe-area-top      /* Padding top with safe area */
.safe-area-bottom   /* Padding bottom with safe area */
.safe-area-left     /* Padding left with safe area */
.safe-area-right    /* Padding right with safe area */
.safe-area-all      /* Padding all sides with safe area */
.safe-area-horizontal /* Padding left and right */
.safe-area-vertical   /* Padding top and bottom */
```

### Keyboard Classes
```css
.keyboard-aware     /* Element that responds to keyboard */
.keyboard-spacer    /* Spacer that adjusts for keyboard height */
```

### Native Component Classes
```css
.native-button      /* Native-styled button */
.native-input       /* Native-styled input */
.native-card        /* Native-styled card */
.native-list-item   /* Native-styled list item */
.native-container   /* Full-screen native container */
.native-content     /* Scrollable content area */
.native-header      /* Header with safe area */
.native-footer      /* Footer with safe area */
```

## 📱 CSS Variables

The service automatically sets these CSS variables:

```css
:root {
  --safe-area-inset-top: 44px;     /* Dynamic safe area top */
  --safe-area-inset-bottom: 34px;  /* Dynamic safe area bottom */
  --safe-area-inset-left: 0px;     /* Dynamic safe area left */
  --safe-area-inset-right: 0px;    /* Dynamic safe area right */
  --keyboard-height: 0px;          /* Dynamic keyboard height */
}
```

## 🔧 Configuration Options

### NativeMobileConfig
```typescript
interface NativeMobileConfig {
  statusBarStyle?: 'light' | 'dark';           // Status bar text color
  statusBarBackgroundColor?: string;           // Status bar background
  keyboardResize?: 'body' | 'ionic' | 'native'; // Keyboard behavior
  lockOrientation?: OrientationLockType;       // Lock screen orientation
  enableSafeArea?: boolean;                    // Enable safe area handling
}
```

### NativeContainer Props
```typescript
interface NativeContainerProps {
  statusBarStyle?: 'light' | 'dark';
  statusBarBackgroundColor?: string;
  enableSafeArea?: boolean;
  enableKeyboardHandling?: boolean;
  lockOrientation?: OrientationLockType;
  theme?: 'light' | 'dark' | 'auto';
}
```

## 🎯 Best Practices

### 1. Always Use NativeContainer
```tsx
// ✅ Good
<NativeContainer>
  <YourContent />
</NativeContainer>

// ❌ Bad - Missing native features
<div>
  <YourContent />
</div>
```

### 2. Handle Keyboard Properly
```tsx
// ✅ Good
<div className="keyboard-aware">
  <input className="native-input" />
  <div className="keyboard-spacer" />
</div>
```

### 3. Use Safe Area Classes
```tsx
// ✅ Good
<header className="safe-area-top">
  Header content
</header>

<main className="safe-area-horizontal">
  Main content
</main>

<footer className="safe-area-bottom">
  Footer content
</footer>
```

### 4. Theme Handling
```tsx
// ✅ Good - Automatic theme switching
const { setDarkTheme, setLightTheme } = useNativeMobile();

useEffect(() => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) {
    setDarkTheme();
  } else {
    setLightTheme();
  }
}, []);
```

## 🐛 Debugging

### Safe Area Debug Component
```tsx
import { SafeAreaDebug } from './components/mobile/NativeContainer';

// Add to your app during development
<SafeAreaDebug />
```

### Console Logging
The service provides detailed console logs:
- ✅ Successful operations
- ❌ Error messages
- 📱 Device information
- 🔧 Configuration changes

## 🚀 Demo Component

Use the `NativeFeaturesDemo` component to test all features:

```tsx
import NativeFeaturesDemo from './components/mobile/NativeFeaturesDemo';

<NativeFeaturesDemo onClose={() => setShowDemo(false)} />
```

## 📋 Platform Support

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Status Bar | ✅ | ✅ | ⚠️ Limited |
| Safe Area | ✅ | ✅ | ⚠️ Fallback |
| Keyboard | ✅ | ✅ | ⚠️ Basic |
| Orientation | ✅ | ✅ | ❌ |

## 🔄 Migration from Old Code

If you have existing mobile code, here's how to migrate:

### Before
```tsx
// Old manual setup
import { StatusBar, Style } from '@capacitor/status-bar';

useEffect(() => {
  StatusBar.setStyle({ style: Style.Dark });
  StatusBar.setBackgroundColor({ color: '#ffffff' });
}, []);
```

### After
```tsx
// New service-based approach
import { useNativeMobile } from './hooks/useNativeMobile';

const { setStatusBarStyle } = useNativeMobile({
  config: {
    statusBarStyle: 'dark',
    statusBarBackgroundColor: '#ffffff'
  }
});
```

## 🎉 Benefits

1. **Unified API**: Single service for all native features
2. **React Integration**: Custom hooks for easy component integration
3. **Automatic Handling**: Safe areas, keyboard, and orientation handled automatically
4. **CSS Integration**: Native features exposed as CSS variables
5. **Error Handling**: Robust error handling and fallbacks
6. **TypeScript Support**: Full type safety
7. **Performance**: Optimized for mobile performance
8. **Debugging**: Built-in debugging tools

## 🔧 Troubleshooting

### Common Issues

1. **Safe area not working**: Ensure you're running on a native platform
2. **Keyboard not detected**: Check if `enableKeyboardHandling` is true
3. **Status bar not changing**: Verify platform permissions
4. **Orientation lock failing**: Check device orientation settings

### Debug Steps

1. Check console logs for initialization messages
2. Use `SafeAreaDebug` component to verify safe areas
3. Test on actual device, not just simulator
4. Ensure Capacitor sync has been run after changes

This implementation provides a comprehensive, production-ready solution for native mobile features that makes your Capacitor app feel truly native!