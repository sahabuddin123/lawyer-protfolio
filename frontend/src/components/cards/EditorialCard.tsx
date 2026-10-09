import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LazyImage } from '@/components/ui/LazyImage';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EditorialCardProps {
  eyebrow?: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  quote?: string;
  authorOrDate?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  eyebrow,
  title,
  excerpt,
  imageUrl,
  quote,
  authorOrDate,
  ctaText = 'Read Editorial',
  onCtaClick,
  className,
}) => {
  return (
    <Card className={cn('overflow-hidden grid grid-cols-1 lg:grid-cols-12 group', className)}>
      {imageUrl && (
        <div className="lg:col-span-5 relative overflow-hidden bg-surface-elevated min-h-[260px]">
          <LazyImage
            src={imageUrl}
            alt={title}
            aspectRatio="auto"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent lg:hidden" />
        </div>
      )}

      <div className={cn('p-8 md:p-10 flex flex-col justify-between', imageUrl ? 'lg:col-span-7' : 'lg:col-span-12')}>
        <div>
          {eyebrow && (
            <div className="mb-4">
              <Badge variant="gold" size="sm">
                {eyebrow}
              </Badge>
            </div>
          )}

          <h3 className="text-2xl md:text-3xl font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors mb-4 leading-tight">
            {title}
          </h3>

          {quote && (
            <blockquote className="border-l-2 border-gold-primary pl-4 my-4 italic text-sm text-text-secondary">
              "{quote}"
            </blockquote>
          )}

          <p className="text-sm md:text-base text-text-muted leading-relaxed mb-6">
            {excerpt}
          </p>
        </div>

        <div className="pt-6 border-t border-border-subtle/60 flex items-center justify-between">
          {authorOrDate && (
            <span className="text-xs font-mono text-text-subtle">{authorOrDate}</span>
          )}

          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gold-primary group-hover:text-gold-hover transition-colors cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </Card>
  );
};
