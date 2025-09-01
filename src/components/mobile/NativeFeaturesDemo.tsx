/**
 * Native Features Demo Component
 * Demonstrates all the native mobile features implemented with Capacitor plugins
 */

import React, { useState } from 'react';
import {
  NativeContainer,
  NativeHeader,
  NativeContent,
  NativeFooter,
  NativeButton,
  NativeInput,
  NativeCard,
  NativeListItem,
  NativeDivider,
  SafeAreaDebug
} from './NativeContainer';
import { useNativeMobile, useSafeArea, useKeyboard } from '../../hooks/useNativeMobile';
import { OrientationLockType } from '@capacitor/screen-orientation';

export interface NativeFeaturesDemoProps {
  onClose?: () => void;
}

export function NativeFeaturesDemo({ onClose }: NativeFeaturesDemoProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [statusBarStyle, setStatusBarStyle] = useState<'light' | 'dark'>('dark');
  const [showDebug, setShowDebug] = useState(false);
  
  const {
    isNative,
    isInitialized,
    safeAreaInsets,
    currentOrientation,
    setStatusBarStyle: updateStatusBar,
    hideStatusBar,
    showStatusBar,
    lockOrientation,
    unlockOrientation,
    setDarkTheme,
    setLightTheme,
    refreshSafeArea
  } = useNativeMobile();
  
  const { isKeyboardOpen, keyboardHeight } = useKeyboard();

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    setCurrentTheme(theme);
    if (theme === 'dark') {
      await setDarkTheme();
      setStatusBarStyle('light');
    } else if (theme === 'light') {
      await setLightTheme();
      setStatusBarStyle('dark');
    }
  };

  const handleStatusBarToggle = async () => {
    const newStyle = statusBarStyle === 'dark' ? 'light' : 'dark';
    setStatusBarStyle(newStyle);
    await updateStatusBar(newStyle);
  };

  const handleOrientationLock = async (orientation: OrientationLockType) => {
    await lockOrientation(orientation);
  };

  const handleOrientationUnlock = async () => {
    await unlockOrientation();
  };

  return (
    <NativeContainer
      statusBarStyle={statusBarStyle}
      theme={currentTheme}
      className="native-fade-in"
    >
      {/* Header */}
      <NativeHeader>
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold native-text-primary">Native Features Demo</h1>
          {onClose && (
            <NativeButton variant="secondary" onClick={onClose}>
              Close
            </NativeButton>
          )}
        </div>
      </NativeHeader>

      {/* Content */}
      <NativeContent className="p-4 space-y-6">
        {/* Platform Info */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Platform Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="native-text-secondary">Is Native:</span>
              <span className={`font-medium ${isNative ? 'text-green-600' : 'text-red-600'}`}>
                {isNative ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="native-text-secondary">Service Initialized:</span>
              <span className={`font-medium ${isInitialized ? 'text-green-600' : 'text-orange-600'}`}>
                {isInitialized ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="native-text-secondary">Current Orientation:</span>
              <span className="font-medium native-text-primary">
                {currentOrientation || 'Unknown'}
              </span>
            </div>
          </div>
        </NativeCard>

        {/* Safe Area Information */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Safe Area Insets</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="native-text-secondary">Top:</span>
              <span className="font-medium native-text-primary">{safeAreaInsets.top}px</span>
            </div>
            <div className="flex justify-between">
              <span className="native-text-secondary">Bottom:</span>
              <span className="font-medium native-text-primary">{safeAreaInsets.bottom}px</span>
            </div>
            <div className="flex justify-between">
              <span className="native-text-secondary">Left:</span>
              <span className="font-medium native-text-primary">{safeAreaInsets.left}px</span>
            </div>
            <div className="flex justify-between">
              <span className="native-text-secondary">Right:</span>
              <span className="font-medium native-text-primary">{safeAreaInsets.right}px</span>
            </div>
          </div>
          <NativeButton 
            variant="secondary" 
            className="mt-3 w-full"
            onClick={refreshSafeArea}
          >
            Refresh Safe Area
          </NativeButton>
        </NativeCard>

        {/* Keyboard Information */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Keyboard Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="native-text-secondary">Keyboard Open:</span>
              <span className={`font-medium ${isKeyboardOpen ? 'text-green-600' : 'text-gray-600'}`}>
                {isKeyboardOpen ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="native-text-secondary">Keyboard Height:</span>
              <span className="font-medium native-text-primary">{keyboardHeight}px</span>
            </div>
          </div>
          <div className="mt-3">
            <NativeInput
              value={inputValue}
              onChange={setInputValue}
              placeholder="Type here to test keyboard..."
              className="w-full"
            />
          </div>
        </NativeCard>

        {/* Theme Controls */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Theme Controls</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <NativeButton
                variant={currentTheme === 'light' ? 'primary' : 'secondary'}
                onClick={() => handleThemeChange('light')}
                className="flex-1"
              >
                Light
              </NativeButton>
              <NativeButton
                variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
                onClick={() => handleThemeChange('dark')}
                className="flex-1"
              >
                Dark
              </NativeButton>
              <NativeButton
                variant={currentTheme === 'auto' ? 'primary' : 'secondary'}
                onClick={() => handleThemeChange('auto')}
                className="flex-1"
              >
                Auto
              </NativeButton>
            </div>
          </div>
        </NativeCard>

        {/* Status Bar Controls */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Status Bar Controls</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <NativeButton
                variant="secondary"
                onClick={handleStatusBarToggle}
                className="flex-1"
              >
                Toggle Style ({statusBarStyle})
              </NativeButton>
            </div>
            <div className="flex gap-2">
              <NativeButton
                variant="secondary"
                onClick={hideStatusBar}
                className="flex-1"
              >
                Hide
              </NativeButton>
              <NativeButton
                variant="secondary"
                onClick={showStatusBar}
                className="flex-1"
              >
                Show
              </NativeButton>
            </div>
          </div>
        </NativeCard>

        {/* Orientation Controls */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Orientation Controls</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <NativeButton
                variant="secondary"
                onClick={() => handleOrientationLock('portrait-primary')}
              >
                Lock Portrait
              </NativeButton>
              <NativeButton
                variant="secondary"
                onClick={() => handleOrientationLock('landscape-primary')}
              >
                Lock Landscape
              </NativeButton>
            </div>
            <NativeButton
              variant="primary"
              onClick={handleOrientationUnlock}
              className="w-full"
            >
              Unlock Orientation
            </NativeButton>
          </div>
        </NativeCard>

        {/* Native Components Demo */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Native Components</h2>
          <div className="space-y-3">
            <NativeListItem onClick={() => alert('List item clicked!')}>
              <div className="flex items-center justify-between">
                <span>Clickable List Item</span>
                <span className="text-blue-600">→</span>
              </div>
            </NativeListItem>
            
            <NativeDivider />
            
            <NativeListItem showDivider={false}>
              <div className="flex items-center justify-between">
                <span>Non-clickable Item</span>
                <span className="native-text-secondary">Info</span>
              </div>
            </NativeListItem>
          </div>
        </NativeCard>

        {/* Debug Toggle */}
        <NativeCard className="p-4">
          <h2 className="text-lg font-semibold native-text-primary mb-3">Debug Tools</h2>
          <NativeButton
            variant={showDebug ? 'primary' : 'secondary'}
            onClick={() => setShowDebug(!showDebug)}
            className="w-full"
          >
            {showDebug ? 'Hide' : 'Show'} Safe Area Debug
          </NativeButton>
        </NativeCard>

        {/* Spacer for keyboard */}
        <div className="keyboard-spacer" />
      </NativeContent>

      {/* Footer */}
      <NativeFooter>
        <div className="py-4 text-center">
          <p className="text-sm native-text-secondary">
            Native Mobile Features Demo • Powered by Capacitor
          </p>
        </div>
      </NativeFooter>

      {/* Debug Overlay */}
      {showDebug && <SafeAreaDebug />}
    </NativeContainer>
  );
}

export default NativeFeaturesDemo;