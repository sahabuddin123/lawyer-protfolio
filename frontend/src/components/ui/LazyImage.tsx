import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { ImageOff } from 'lucide-react';

export type AspectRatioType = '1/1' | '16/9' | '4/3' | '3/4' | '2/3' | 'auto';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: AspectRatioType;
  objectPosition?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  aspectRatio = 'auto',
  objectPosition = 'center',
  className,
  fallbackSrc,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses: Record<AspectRatioType, string> = {
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '2/3': 'aspect-[2/3]',
    'auto': '',
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-elevated',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Dark Shimmer Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface-hover to-surface animate-pulse" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface p-4 text-center">
          <ImageOff className="w-8 h-8 text-text-subtle mb-2" aria-hidden="true" />
          <span className="text-xs text-text-muted">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          style={{ objectPosition }}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
};
