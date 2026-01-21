

import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * OptimizedImage component for better image loading and optimization
 * Handles lazy loading, error states, and loading placeholders
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Handle image load error
  const handleError = () => {
    setError(true);
    setIsLoaded(true); // Consider it "loaded" even if it's an error
  };

  // Placeholder image for errors
  const fallbackSrc = '/placeholder.svg';

  return (
    <div className="relative" style={{ width, height }}>
      {!isLoaded && (
        <Skeleton 
          className={`absolute inset-0 ${className}`} 
          style={{ width: '100%', height: '100%' }}
        />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
      />
    </div>
  );
};

export default OptimizedImage;
