import React, { useRef, useEffect, ReactNode } from 'react';

interface SwipeGestureHandlerProps {
  children: ReactNode;
  onSwipeBack?: () => void;
  enabled?: boolean;
  threshold?: number;
}

const SwipeGestureHandler: React.FC<SwipeGestureHandlerProps> = ({
  children,
  onSwipeBack,
  enabled = true,
  threshold = 100
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || !onSwipeBack) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isDragging.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX.current;
        const deltaY = Math.abs(touch.clientY - startY.current);
        
        // Only start dragging if horizontal movement is greater than vertical
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
          isDragging.current = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = Math.abs(touch.clientY - startY.current);

      // Check if it's a valid swipe (horizontal movement > vertical movement)
      if (Math.abs(deltaX) > deltaY && deltaX > threshold) {
        // Swipe right (back gesture)
        onSwipeBack();
      }

      isDragging.current = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onSwipeBack, threshold]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
};

export default SwipeGestureHandler;