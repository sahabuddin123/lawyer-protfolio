import React, { ReactNode } from 'react';

interface AdminContentProps {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}

export const AdminContent: React.FC<AdminContentProps> = ({
  children,
  className = '',
  wide = false,
}) => {
  return (
    <div
      className={`w-full mx-auto p-4 sm:p-6 lg:p-8 transition-all ${
        wide ? 'max-w-[1600px]' : 'max-w-7xl'
      } ${className}`}
    >
      {children}
    </div>
  );
};
