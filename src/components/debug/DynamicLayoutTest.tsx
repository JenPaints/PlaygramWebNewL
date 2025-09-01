import React from 'react';
import { useDynamicMobileLayout } from '../../hooks/useDynamicMobileLayout';

const DynamicLayoutTest: React.FC = () => {
  const {
    metrics,
    styles,
    isInitialized,
    isLandscapeMode,
    isPortraitMode,
    hasNotch,
    hasHomeIndicator,
    isSmallScreen,
    isTallScreen,
    getButtonSize,
    getTextSize,
    getPadding
  } = useDynamicMobileLayout();

  if (!isInitialized) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const buttonSizes = getButtonSize();

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Dynamic Layout Debug</h2>
      
      {/* Device Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Device Info</h3>
          <div className="space-y-1 text-sm">
            <div>Type: <span className="font-mono">{metrics.deviceType}</span></div>
            <div>Platform: <span className="font-mono">{metrics.isNativePlatform ? 'Native' : 'Web'}</span></div>
            <div>Orientation: <span className="font-mono">{metrics.orientation}</span></div>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Viewport</h3>
          <div className="space-y-1 text-sm">
            <div>Width: <span className="font-mono">{metrics.viewportWidth}px</span></div>
            <div>Height: <span className="font-mono">{metrics.viewportHeight}px</span></div>
            <div>Content: <span className="font-mono">{metrics.contentHeight}px</span></div>
          </div>
        </div>
      </div>

      {/* Safe Area Insets */}
      <div className="bg-purple-50 p-3 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">Safe Area Insets</h3>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div>Top: <span className="font-mono">{metrics.safeAreaInsets.top}px</span></div>
          <div>Bottom: <span className="font-mono">{metrics.safeAreaInsets.bottom}px</span></div>
          <div>Left: <span className="font-mono">{metrics.safeAreaInsets.left}px</span></div>
          <div>Right: <span className="font-mono">{metrics.safeAreaInsets.right}px</span></div>
        </div>
      </div>

      {/* Layout Heights */}
      <div className="bg-orange-50 p-3 rounded-lg">
        <h3 className="font-semibold text-orange-900 mb-2">Layout Heights</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Header: <span className="font-mono">{metrics.headerHeight}px</span></div>
          <div>Footer: <span className="font-mono">{metrics.footerHeight}px</span></div>
          <div>Content: <span className="font-mono">{metrics.contentHeight}px</span></div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Feature Flags</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isLandscapeMode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Landscape Mode
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isPortraitMode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Portrait Mode
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${hasNotch ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Has Notch
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${hasHomeIndicator ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Home Indicator
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isSmallScreen ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            Small Screen
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isTallScreen ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            Tall Screen
          </div>
        </div>
      </div>

      {/* Dynamic Styles Preview */}
      <div className="bg-indigo-50 p-3 rounded-lg">
        <h3 className="font-semibold text-indigo-900 mb-2">Dynamic Styles</h3>
        <div className="space-y-2 text-sm">
          <div>Button Size: <span className="font-mono">{buttonSizes.width}×{buttonSizes.height}px</span></div>
          <div>Icon Size: <span className="font-mono">{buttonSizes.icon}px</span></div>
          <div>Text Size: <span className="font-mono">{getTextSize()}</span></div>
          <div>Padding: <span className="font-mono">{getPadding()}</span></div>
          <div>Show Labels: <span className="font-mono">{styles.navigation.showLabels ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-pink-50 p-3 rounded-lg">
        <h3 className="font-semibold text-pink-900 mb-2">Live Preview</h3>
        <div className="flex items-center justify-center space-x-4">
          <div 
            className="bg-blue-500 rounded-full flex items-center justify-center text-white font-bold"
            style={{ 
              width: `${buttonSizes.width}px`, 
              height: `${buttonSizes.height}px` 
            }}
          >
            <span style={{ fontSize: `${buttonSizes.icon}px` }}>🏠</span>
          </div>
          <div 
            className="bg-green-500 rounded-full flex items-center justify-center text-white font-bold"
            style={{ 
              width: `${buttonSizes.width}px`, 
              height: `${buttonSizes.height}px` 
            }}
          >
            <span style={{ fontSize: `${buttonSizes.icon}px` }}>⚽</span>
          </div>
          <div 
            className="bg-purple-500 rounded-full flex items-center justify-center text-white font-bold"
            style={{ 
              width: `${buttonSizes.width}px`, 
              height: `${buttonSizes.height}px` 
            }}
          >
            <span style={{ fontSize: `${buttonSizes.icon}px` }}>🛒</span>
          </div>
        </div>
        {styles.navigation.showLabels && (
          <div className="flex justify-center space-x-4 mt-2">
            <span className={getTextSize()}>Home</span>
            <span className={getTextSize()}>Sports</span>
            <span className={getTextSize()}>Store</span>
          </div>
        )}
      </div>

      {/* CSS Variables */}
      <div className="bg-yellow-50 p-3 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">CSS Variables</h3>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono">
          <div>--safe-area-top: {metrics.safeAreaInsets.top}px</div>
          <div>--safe-area-bottom: {metrics.safeAreaInsets.bottom}px</div>
          <div>--safe-area-left: {metrics.safeAreaInsets.left}px</div>
          <div>--safe-area-right: {metrics.safeAreaInsets.right}px</div>
          <div>--viewport-height: {metrics.viewportHeight}px</div>
          <div>--viewport-width: {metrics.viewportWidth}px</div>
          <div>--header-total-height: {metrics.headerHeight}px</div>
          <div>--footer-total-height: {metrics.footerHeight}px</div>
        </div>
      </div>
    </div>
  );
};

export default DynamicLayoutTest;