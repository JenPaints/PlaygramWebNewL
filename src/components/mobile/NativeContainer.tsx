/**
 * Native Container Component
 * Provides a native-styled container with safe area handling and native mobile features
 */

import React, { useEffect } from 'react';
import { useNativeMobile } from '../../hooks/useNativeMobile';
import '../../styles/native.css';

export interface NativeContainerProps {
  children: React.ReactNode;
  className?: string;
  statusBarStyle?: 'light' | 'dark';
  statusBarBackgroundColor?: string;
  enableSafeArea?: boolean;
  enableKeyboardHandling?: boolean;
  lockOrientation?: 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Native Container Component
 * Automatically handles safe areas, status bar, and native mobile features
 */
export function NativeContainer({
  children,
  className = '',
  statusBarStyle = 'dark',
  statusBarBackgroundColor,
  enableSafeArea = true,
  enableKeyboardHandling = true,
  lockOrientation,
  theme = 'auto'
}: NativeContainerProps) {
  const {
    isNative,
    isInitialized,
    safeAreaInsets,
    isKeyboardOpen,
    initialize,
    setStatusBarStyle,
    lockOrientation: lockOrientationFn,
    setDarkTheme,
    setLightTheme
  } = useNativeMobile({
    autoInitialize: true,
    config: {
      statusBarStyle,
      statusBarBackgroundColor,
      enableSafeArea,
      keyboardResize: 'native',
      lockOrientation: lockOrientation as any
    }
  });

  // Handle theme changes
  useEffect(() => {
    if (!isInitialized) return;

    if (theme === 'dark') {
      setDarkTheme();
    } else if (theme === 'light') {
      setLightTheme();
    } else if (theme === 'auto') {
      // Auto theme based on system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        setDarkTheme();
      } else {
        setLightTheme();
      }
    }
  }, [theme, isInitialized, setDarkTheme, setLightTheme]);

  // Handle orientation lock
  useEffect(() => {
    if (!isInitialized || !lockOrientation) return;
    lockOrientationFn(lockOrientation as any);
  }, [lockOrientation, isInitialized, lockOrientationFn]);

  const containerClasses = [
    'native-container',
    enableSafeArea ? 'safe-area-horizontal' : '',
    enableKeyboardHandling ? 'keyboard-aware' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Status bar overlay for transparent status bars */}
      {isNative && enableSafeArea && (
        <div className="status-bar-overlay" />
      )}
      
      {children}
      
      {/* Keyboard spacer */}
      {enableKeyboardHandling && (
        <div className="keyboard-spacer" />
      )}
    </div>
  );
}

/**
 * Native Header Component
 */
export interface NativeHeaderProps {
  children: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function NativeHeader({ children, className = '', transparent = false }: NativeHeaderProps) {
  const headerClasses = [
    'native-header',
    transparent ? 'bg-transparent border-transparent' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      {children}
    </header>
  );
}

/**
 * Native Content Component
 */
export interface NativeContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function NativeContent({ children, className = '', scrollable = true }: NativeContentProps) {
  const contentClasses = [
    'native-content',
    scrollable ? 'native-scroll' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <main className={contentClasses}>
      {children}
    </main>
  );
}

/**
 * Native Footer Component
 */
export interface NativeFooterProps {
  children: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function NativeFooter({ children, className = '', transparent = false }: NativeFooterProps) {
  const footerClasses = [
    'native-footer',
    transparent ? 'bg-transparent border-transparent' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses}>
      {children}
    </footer>
  );
}

/**
 * Native Button Component
 */
export interface NativeButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function NativeButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}: NativeButtonProps) {
  const buttonClasses = [
    'native-button',
    `native-button-${variant}`,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * Native Input Component
 */
export interface NativeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function NativeInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  disabled = false,
  autoFocus = false
}: NativeInputProps) {
  const inputClasses = [
    'native-input',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={inputClasses}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
}

/**
 * Native Card Component
 */
export interface NativeCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NativeCard({ children, className = '', onClick }: NativeCardProps) {
  const cardClasses = [
    'native-card',
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
}

/**
 * Native List Item Component
 */
export interface NativeListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  showDivider?: boolean;
}

export function NativeListItem({
  children,
  className = '',
  onClick,
  showDivider = true
}: NativeListItemProps) {
  const itemClasses = [
    'native-list-item',
    onClick ? 'cursor-pointer' : '',
    !showDivider ? 'border-b-0' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses} onClick={onClick}>
      {children}
    </div>
  );
}

/**
 * Native Divider Component
 */
export interface NativeDividerProps {
  className?: string;
}

export function NativeDivider({ className = '' }: NativeDividerProps) {
  return <div className={`native-divider ${className}`} />;
}

/**
 * Safe Area Debug Component (for development)
 */
export function SafeAreaDebug() {
  const { safeAreaInsets, isNative } = useNativeMobile();

  if (!isNative) {
    return (
      <div className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded text-xs z-50">
        Not running on native platform
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded text-xs z-50">
      <div>Safe Area Insets:</div>
      <div>Top: {safeAreaInsets.top}px</div>
      <div>Bottom: {safeAreaInsets.bottom}px</div>
      <div>Left: {safeAreaInsets.left}px</div>
      <div>Right: {safeAreaInsets.right}px</div>
    </div>
  );
}

export default NativeContainer;