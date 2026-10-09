import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center justify-center gap-1.5 my-8 select-none', className)}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
        className="w-9 h-9 rounded flex items-center justify-center border border-border-subtle bg-surface text-text-primary hover:border-gold-border hover:text-gold-primary disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Page ${page}`}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-9 h-9 rounded font-mono text-xs font-semibold transition-all cursor-pointer',
              isCurrent
                ? 'bg-gold-primary text-background-primary border border-gold-primary shadow-gold-sm'
                : 'border border-border-subtle bg-surface text-text-secondary hover:border-gold-border hover:text-gold-primary'
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
        className="w-9 h-9 rounded flex items-center justify-center border border-border-subtle bg-surface text-text-primary hover:border-gold-border hover:text-gold-primary disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
