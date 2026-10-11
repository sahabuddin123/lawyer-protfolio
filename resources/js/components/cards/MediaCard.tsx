import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Newspaper, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface MediaCardProps {
  mediaName: string;
  title: string;
  date: string;
  description: string;
  articleUrl?: string;
  onReadMore?: () => void;
  className?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  mediaName,
  title,
  date,
  description,
  articleUrl,
  onReadMore,
  className,
}) => {
  return (
    <Card className={cn('p-6 flex flex-col justify-between h-full group', className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-surface-elevated border border-border-subtle flex items-center justify-center text-gold-primary">
              <Newspaper className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-text-primary tracking-wide">
              {mediaName}
            </span>
          </div>
          <span className="text-xs font-mono text-text-subtle">{date}</span>
        </div>

        <h3 className="text-lg font-serif-editorial font-semibold text-text-primary group-hover:text-gold-hover transition-colors mb-3 leading-snug line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6">
          {description}
        </p>
      </div>

      <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
        <Badge variant="neutral" size="sm">
          National Press
        </Badge>

        {articleUrl ? (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-primary hover:text-gold-hover transition-colors"
          >
            <span>View Coverage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            type="button"
            onClick={onReadMore}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-primary hover:text-gold-hover transition-colors cursor-pointer"
          >
            <span>Read Summary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </Card>
  );
};
