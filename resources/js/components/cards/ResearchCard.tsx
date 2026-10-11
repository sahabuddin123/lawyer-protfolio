import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
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
}) => {
  return (
    <Card className={cn('p-6 md:p-8 flex flex-col justify-between h-full group', className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" size="sm">
            {category}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-text-subtle font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
        </div>

        <h3 className="text-xl font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors mb-3 leading-snug">
          {title}
        </h3>

        {author && (
          <p className="text-xs text-gold-secondary font-medium tracking-wide uppercase mb-3">
            By {author}
          </p>
        )}

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-gold-primary group-hover:text-gold-hover transition-colors cursor-pointer"
        >
          <span>Read Treatise</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </Card>
  );
};
