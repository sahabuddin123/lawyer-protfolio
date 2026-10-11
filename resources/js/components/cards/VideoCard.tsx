import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LazyImage } from '@/components/ui/LazyImage';
import { Play, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface VideoCardProps {
  thumbnailUrl?: string;
  title: string;
  category: string;
  duration?: string;
  date: string;
  isEducational?: boolean;
  actionLabel?: string;
  onPlay?: () => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  thumbnailUrl,
  title,
  category,
  duration,
  date,
  isEducational = false,
  actionLabel,
  onPlay,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col h-full group overflow-hidden cursor-pointer', className)} onClick={onPlay}>
      <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-surface-elevated via-surface to-background-secondary">
        {thumbnailUrl ? (
          <LazyImage
            src={thumbnailUrl}
            alt={title}
            aspectRatio="16/9"
            className="group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(212,160,23,0.08),_transparent_70%)]" />
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-primary/80 via-transparent to-black/30 group-hover:from-background-primary/60 transition-colors" />

        {/* Centered Indicator Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isEducational ? (
            <div className="w-14 h-14 rounded-full bg-surface-elevated/90 border border-gold-border/80 text-gold-primary flex items-center justify-center shadow-gold-md group-hover:scale-110 transition-all duration-300">
              <BookOpen className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-gold-primary/90 text-background-primary flex items-center justify-center shadow-gold-md group-hover:scale-110 group-hover:bg-gold-hover transition-all duration-300">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          )}
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3">
          <Badge variant="gold" size="sm">
            {category}
          </Badge>
        </div>

        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[11px] font-mono text-text-primary border border-white/10">
            {duration}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <h3 className="text-base sm:text-lg font-serif-editorial font-semibold text-text-primary group-hover:text-gold-hover transition-colors leading-snug line-clamp-2 mb-4">
          {title}
        </h3>

        <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-subtle font-mono">
          <span>{date}</span>
          <span className="text-gold-primary group-hover:underline">
            {actionLabel || (isEducational ? 'Explore Legal Topic' : 'Watch Broadcast')}
          </span>
        </div>
      </div>
    </Card>
  );
};
