import React from 'react';
import { Card } from '@/components/ui/Card';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PracticeAreaCardProps {
  number: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const PracticeAreaCard: React.FC<PracticeAreaCardProps> = ({
  number,
  title,
  description,
  icon,
  href,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <Card
      withTopGoldBorder
      onClick={handleClick}
      className={cn('p-8 flex flex-col justify-between h-full cursor-pointer group', className)}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-mono tracking-wider text-gold-primary font-semibold">
            {typeof number === 'number' ? String(number).padStart(2, '0') : number}
          </span>
          {icon && (
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center text-gold-primary group-hover:border-gold-border group-hover:bg-gold-subtle transition-all">
              {icon}
            </div>
          )}
        </div>

        <h3 className="text-xl font-serif-editorial font-semibold text-text-primary group-hover:text-gold-hover transition-colors mb-3 leading-snug">
          {title}
        </h3>

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-border-subtle/60 flex items-center justify-between text-xs font-medium text-gold-primary tracking-wider uppercase">
        <span>Explore Domain</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Card>
  );
};
