import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs', className)}>
      <ol className="flex items-center space-x-2 text-text-subtle">
        <li>
          <a
            href="/"
            className="flex items-center hover:text-gold-primary transition-colors"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </a>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-border-medium" aria-hidden="true" />
              </li>
              <li>
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className="font-medium text-gold-primary tracking-wide"
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className="hover:text-text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
