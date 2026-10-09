import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LazyImage } from '@/components/ui/LazyImage';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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
}) => {
  return (
    <Card className={cn('flex flex-col h-full group', className)}>
      {imageUrl && (
        <div className="relative overflow-hidden border-b border-border-subtle">
          <LazyImage
            src={imageUrl}
            alt={title}
            aspectRatio="16/9"
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="gold" size="sm">
              {court}
            </Badge>
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {!imageUrl && (
            <div className="flex items-center justify-between mb-4">
              <Badge variant="gold" size="sm">
                {court}
              </Badge>
              <span className="text-xs font-mono text-text-subtle">{year}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <span className="text-gold-primary font-medium">{legalArea}</span>
            {caseNumber && (
              <>
                <span>•</span>
                <span className="font-mono text-text-subtle">{caseNumber}</span>
              </>
            )}
          </div>

          <h3 className="text-lg font-serif-editorial font-semibold text-text-primary group-hover:text-gold-hover transition-colors mb-3 leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6">
            {summary}
          </p>
        </div>

        <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-subtle">
            <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
            <span>Advocate Briefed</span>
          </div>

          <button
            type="button"
            onClick={onReadCase}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-primary group-hover:text-gold-hover hover:underline transition-colors cursor-pointer"
          >
            <span>Read Case</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </Card>
  );
};
