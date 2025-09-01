import React, { useState, useEffect } from 'react';
import { getSafeAreaInsets, getDeviceType, hasNotch } from '../../utils/safeAreaUtils';
import { isMobileApp } from '../../utils/mobileDetection';

export const SafeAreaTest: React.FC = () => {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [deviceType, setDeviceType] = useState<string>('unknown');
  const [hasNotchArea, setHasNotchArea] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateInfo = () => {
      setInsets(getSafeAreaInsets());
      setDeviceType(getDeviceType());
      setHasNotchArea(hasNotch());
      setIsMobile(isMobileApp());
    };

    updateInfo();

    // Update on orientation change
    window.addEventListener('orientationchange', updateInfo);
    window.addEventListener('resize', updateInfo);

    return () => {
      window.removeEventListener('orientationchange', updateInfo);
      window.removeEventListener('resize', updateInfo);
    };
  }, []);

  if (!isMobile) {
    return null; // Only show in mobile app
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
      <div className="font-bold mb-1">Safe Area Debug</div>
      <div>Device: {deviceType}</div>
      <div>Has Notch: {hasNotchArea ? 'Yes' : 'No'}</div>
      <div>Top: {insets.top}px</div>
      <div>Bottom: {insets.bottom}px</div>
      <div>Left: {insets.left}px</div>
      <div>Right: {insets.right}px</div>
      <div>Viewport: {window.innerWidth}x{window.innerHeight}</div>
    </div>
  );
};

export default SafeAreaTest;