import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Scale } from 'lucide-react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  src?: string;
  alt: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
  withGoldBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  initials,
  size = 'md',
  className,
  withGoldBorder = true,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeStyles: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-surface-elevated text-text-primary font-serif-editorial select-none transition-all',
        withGoldBorder && 'ring-2 ring-gold-border hover:ring-gold-primary/80',
        sizeStyles[size],
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : initials ? (
        <span className="font-semibold tracking-wider text-gold-primary">{initials}</span>
      ) : (
        <Scale className="w-1/2 h-1/2 text-gold-primary/70" aria-hidden="true" />
      )}
    </div>
  );
};
