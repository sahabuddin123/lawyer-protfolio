import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LazyImage } from '@/components/ui/LazyImage';
import { Download, ExternalLink, BookMarked } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PublicationCardProps {
  coverUrl?: string;
  title: string;
  publicationType: string;
  publicationName?: string;
  date: string;
  author: string;
  onReadMore?: () => void;
  pdfUrl?: string;
  className?: string;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  coverUrl,
  title,
  publicationType,
  publicationName,
  date,
  author,
  onReadMore,
  pdfUrl,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col sm:flex-row overflow-hidden group', className)}>
      {coverUrl ? (
        <div className="sm:w-48 shrink-0 overflow-hidden bg-surface-elevated border-b sm:border-b-0 sm:border-r border-border-subtle">
          <LazyImage
            src={coverUrl}
            alt={title}
            aspectRatio="3/4"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="sm:w-40 shrink-0 bg-surface-elevated flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-border-subtle text-gold-primary">
          <BookMarked className="w-12 h-12 stroke-[1.2]" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="gold" size="sm">
              {publicationType}
            </Badge>
            <span className="text-xs font-mono text-text-subtle">{date}</span>
          </div>

          <h3 className="text-lg font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors mb-2 leading-snug">
            {title}
          </h3>

          {publicationName && (
            <p className="text-xs text-text-secondary italic mb-1 font-serif-editorial">
              Published in: {publicationName}
            </p>
          )}

          <p className="text-xs text-text-muted mb-4">
            Authored by <span className="text-gold-secondary font-medium">{author}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onReadMore}
            className="text-xs font-semibold tracking-wider uppercase text-gold-primary hover:text-gold-hover inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Treatise</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-gold-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
