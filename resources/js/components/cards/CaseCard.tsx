import React from 'react';
import { Card } from '@/components/ui/Card';
import { LazyImage } from '@/components/ui/LazyImage';
import { ArrowRight, Compass } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CaseCardProps {
  title: string;
  court: string;
  year: number | string;
  legalArea: string;
  caseNumber?: string;
  summary: string;
  imageUrl?: string;
  onReadCase?: () => void;
  className?: string;
  badgeLabel?: string;
  actionLabel?: string;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  title,
  court,
  year,
  legalArea,
  caseNumber,
  summary,
  imageUrl,
  onReadCase,
  className,
  badgeLabel = 'Practice Guide',
  actionLabel = 'Explore Guide',
}) => {
  return (
    <Card className={cn('flex flex-col h-full group border border-border-subtle hover:border-gold-border/70 hover:shadow-xl transition-all duration-300', className)}>
      {imageUrl && (
        <div className="relative overflow-hidden border-b border-border-subtle">
          <LazyImage
            src={imageUrl}
            alt={title}
            aspectRatio="16/9"
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-xs font-mono font-medium text-amber-300 bg-slate-950/80 backdrop-blur-sm border border-amber-500/30 px-2.5 py-1 rounded-md">
              {court}
            </span>
          </div>
        </div>
      )}

      <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
        <div>
          {!imageUrl && (
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
                {court}
              </span>
              <span className="text-xs font-mono text-text-subtle">{year}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="text-gold-primary font-semibold tracking-wide">{legalArea}</span>
            {caseNumber && (
              <>
                <span className="text-text-subtle">•</span>
                <span className="text-text-subtle font-mono text-[11px] bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle/80">
                  {caseNumber}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors mb-3 leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6 font-normal">
            {summary}
          </p>
        </div>

        <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-subtle font-medium">
            <Compass className="w-3.5 h-3.5 text-gold-secondary shrink-0" />
            <span>{badgeLabel}</span>
          </div>

          <button
            type="button"
            onClick={onReadCase}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-primary group-hover:text-gold-hover hover:underline transition-colors cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </Card>
  );
};
