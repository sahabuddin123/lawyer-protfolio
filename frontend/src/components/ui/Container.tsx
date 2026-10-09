import React from 'react';
import { cn } from '@/utils/cn';

export type ContainerSize = 'default' | 'wide' | 'prose';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  wide?: boolean;
  prose?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'default',
  wide = false,
  prose = false,
  className,
  as: Component = 'div',
  ...props
}) => {
  const effectiveSize: ContainerSize = wide ? 'wide' : prose ? 'prose' : size;

  const sizeStyles: Record<ContainerSize, string> = {
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    prose: 'max-w-3xl',
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border',
        sizeStyles[effectiveSize],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
