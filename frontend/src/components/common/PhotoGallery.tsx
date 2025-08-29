import React, { useState, useEffect } from 'react';
import { Icon, Icons } from './Icons';

interface PhotoGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  currentIndex?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images,
  isOpen,
  onClose,
  currentIndex = 0
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setActiveIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
          break;
        case 'ArrowRight':
          setActiveIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, images.length, onClose]);

  const goToPrevious = () => {
    setActiveIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const goToNext = () => {
    setActiveIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <Icon icon={Icons.FiX} className="w-8 h-8" />
      </button>

      {/* Photo counter */}
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-lg z-10">
        {activeIndex + 1} / {images.length}
      </div>

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={images[activeIndex]}
          alt={`Gallery ${activeIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <Icon icon={Icons.FiChevronLeft} className="w-12 h-12" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <Icon icon={Icons.FiChevronRight} className="w-12 h-12" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                index === activeIndex 
                  ? 'border-white opacity-100' 
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default PhotoGallery;
