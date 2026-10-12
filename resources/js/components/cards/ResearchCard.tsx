import React from 'react';
import { Card } from '@/components/ui/Card';
import { BookOpen, Calendar, ArrowRight, PenTool } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ResearchCardProps {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime?: string;
  author?: string;
  onReadArticle?: () => void;
  className?: string;
  actionLabel?: string;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({
  category,
  title,
  excerpt,
  date,
  readTime,
  author,
  onReadArticle,
  className,
  actionLabel = 'Read Article',
}) => {
  return (
    <Card className={cn('p-7 md:p-8 flex flex-col justify-between h-full group bg-surface/90 hover:bg-surface-elevated/40 border border-border-subtle hover:border-gold-border/70 hover:shadow-xl transition-all duration-300 rounded-xl', className)}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
            {category}
          </span>
          {date && (
            <div className="flex items-center gap-1.5 text-xs text-text-subtle font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors mb-3 leading-snug">
          {title}
        </h3>

        {author && (
          <div className="flex items-center gap-1.5 text-xs text-gold-secondary mb-3">
            <PenTool className="w-3.5 h-3.5 text-gold-primary shrink-0" />
            <span className="font-medium">{author}</span>
          </div>
        )}

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6 font-normal">
          {excerpt}
        </p>
      </div>

      <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
        {readTime ? (
          <div className="flex items-center gap-1.5 text-xs text-text-subtle">
            <BookOpen className="w-3.5 h-3.5 text-gold-primary" />
            <span>{readTime}</span>
          </div>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={onReadArticle}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-primary group-hover:text-gold-hover hover:underline transition-colors cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </Card>
  );
};
