import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselImage {
  _id: string;
  title?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  description?: string;
  isActive: boolean;
  order: number;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  imageClassName?: string;
  height?: string;
}

const CarouselSkeleton: React.FC<{ height?: string }> = ({ height = "h-64" }) => {
  return (
    <div className={`relative ${height} bg-gray-200 rounded-lg overflow-hidden animate-pulse`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      
      {/* Skeleton dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-300 rounded-full" />
        ))}
      </div>
      
      {/* Skeleton arrows */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-300 rounded-full" />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-300 rounded-full" />
    </div>
  );
};

export const Carousel: React.FC<CarouselProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
  imageClassName = "",
  height = "h-64"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Filter active images and sort by order
  const activeImages = images.filter(img => img.isActive).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeImages.length > 0) {
      setIsLoading(false);
    }
  }, [activeImages]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || activeImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === activeImages.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, activeImages.length]);

  // Preload images (both desktop and mobile)
  useEffect(() => {
    const imageUrls = activeImages.map(img => img.imageUrl).join(',');
    const mobileUrls = activeImages.map(img => img.mobileImageUrl || '').join(',');
    
    activeImages.forEach((image) => {
      // Preload desktop image
      const desktopImg = new Image();
      desktopImg.onload = () => {
        setLoadedImages(prev => {
          const newSet = new Set(prev);
          newSet.add(image.imageUrl);
          return newSet;
        });
      };
      desktopImg.src = image.imageUrl;
      
      // Preload mobile image if available
      if (image.mobileImageUrl) {
        const mobileImg = new Image();
        mobileImg.onload = () => {
          setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(image.mobileImageUrl!);
            return newSet;
          });
        };
        mobileImg.src = image.mobileImageUrl;
      }
    });
  }, [activeImages.length]); // Only depend on length, not the entire array

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? activeImages.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === activeImages.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageClick = (image: CarouselImage) => {
    if (image.linkUrl) {
      window.open(image.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Show skeleton while loading or if no images
  if (isLoading || activeImages.length === 0) {
    return <CarouselSkeleton height={height} />;
  }

  return (
    <div className={`relative ${height} ${className} overflow-hidden rounded-lg group`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Desktop Image */}
          <img
            src={activeImages[currentIndex]?.imageUrl}
            alt={activeImages[currentIndex]?.title || 'Carousel image'}
            className={`w-full h-full object-cover cursor-pointer ${imageClassName} hidden sm:block ${
              loadedImages.has(activeImages[currentIndex]?.imageUrl) ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-300`}
            onClick={() => handleImageClick(activeImages[currentIndex])}
            loading="lazy"
          />
          
          {/* Mobile Image (fallback to desktop if not provided) */}
          <img
            src={activeImages[currentIndex]?.mobileImageUrl || activeImages[currentIndex]?.imageUrl}
            alt={activeImages[currentIndex]?.title || 'Carousel image'}
            className={`w-full h-full object-cover cursor-pointer ${imageClassName} block sm:hidden ${
              loadedImages.has(activeImages[currentIndex]?.mobileImageUrl || activeImages[currentIndex]?.imageUrl) ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-300`}
            onClick={() => handleImageClick(activeImages[currentIndex])}
            loading="lazy"
          />
          
          {/* Image overlay with title and description */}
          {(activeImages[currentIndex]?.title || activeImages[currentIndex]?.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              {activeImages[currentIndex]?.title && (
                <h3 className="text-white text-xl font-bold mb-2">
                  {activeImages[currentIndex].title}
                </h3>
              )}
              {activeImages[currentIndex]?.description && (
                <p className="text-white/90 text-sm">
                  {activeImages[currentIndex].description}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showArrows && activeImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && activeImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;