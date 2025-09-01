import React, { useEffect, ReactNode } from 'react';
import { initializeSafeArea, getSafeAreaInsets } from '../../utils/safeAreaUtils';
import { isMobileApp } from '../../utils/mobileDetection';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

/**
 * MobileLayout component that handles safe areas and native mobile styling
 */
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className = '',
  hasHeader = true,
  hasFooter = true
}) => {
  useEffect(() => {
    if (!isMobileApp()) return;

    // Initialize safe area handling
    const cleanup = initializeSafeArea();
    
    // Log safe area insets for debugging
    const insets = getSafeAreaInsets();
    console.log('📱 Safe Area Insets:', insets);

    return cleanup;
  }, []);

  if (!isMobileApp()) {
    // For web/desktop, use regular layout
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {children}
      </div>
    );
  }

  // For mobile app, use native layout with safe areas
  return (
    <div className={`native-mobile-container ${className}`}>
      {children}
    </div>
  );
};

interface MobileContentProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

/**
 * MobileContent component that provides proper content area with safe areas
 */
export const MobileContent: React.FC<MobileContentProps> = ({
  children,
  className = '',
  scrollable = true
}) => {
  const contentClasses = [
    'native-content',
    scrollable ? 'mobile-scroll' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={contentClasses}>
      {children}
    </div>
  );
};

interface MobileHeaderProps {
  children: ReactNode;
  className?: string;
  transparent?: boolean;
}

/**
 * MobileHeader component with proper safe area handling
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  children,
  className = '',
  transparent = false
}) => {
  const headerClasses = [
    'native-header',
    transparent ? 'bg-transparent' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <div className="native-header-content">
        {children}
      </div>
    </div>
  );
};

interface MobileFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * MobileFooter component with proper safe area handling
 */
export const MobileFooter: React.FC<MobileFooterProps> = ({
  children,
  className = ''
}) => {
  const footerClasses = [
    'native-footer',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={footerClasses}>
      {children}
    </div>
  );
};

export default MobileLayout;