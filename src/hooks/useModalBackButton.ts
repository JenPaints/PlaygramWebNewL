import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { isMobileApp } from '../utils/mobileDetection';

interface UseModalBackButtonProps {
  isOpen: boolean;
  onClose: () => void;
  priority?: number; // Higher priority modals handle back button first
}

export const useModalBackButton = ({ 
  isOpen, 
  onClose, 
  priority = 0 
}: UseModalBackButtonProps) => {
  useEffect(() => {
    if (!isMobileApp() || !isOpen) return;

    const handleBackButton = () => {
      console.log('🔙 Modal back button pressed, closing modal');
      onClose();
      return true; // Prevent default back action
    };

    // Add back button listener with priority
    App.addListener('backButton', handleBackButton);

    return () => {
      App.removeAllListeners();
    };
  }, [isOpen, onClose]);
};