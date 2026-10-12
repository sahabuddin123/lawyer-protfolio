import React, { useState } from 'react';
import { cn } from '@/utils/cn';

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
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
        setHasError(false);
      }
    }
  }, [currentSrc]);

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
    setHasError(false);
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center border border-amber-500/20">
          <div className="w-16 h-16 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 shadow-sm">
            <span className="font-serif text-xl font-bold tracking-wider">NH</span>
          </div>
          <span className="font-serif text-sm text-slate-200 font-bold block">{alt || 'Advocate Nijam Uddin'}</span>
          <span className="text-[11px] text-amber-400/80 uppercase font-mono tracking-wider mt-1">Supreme Court of Bangladesh</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={currentSrc}
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
