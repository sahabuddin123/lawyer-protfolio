import React from 'react';
import { Card } from '@/components/ui/Card';
import { LazyImage } from '@/components/ui/LazyImage';
import { Images, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface GalleryCardProps {
  coverUrl: string;
  title: string;
  photoCount: number;
  date?: string;
  onClick?: () => void;
  className?: string;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  coverUrl,
  title,
  photoCount,
  date,
  onClick,
  className,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn('group overflow-hidden cursor-pointer relative', className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
        <LazyImage
          src={coverUrl}
          alt={title}
          aspectRatio="4/3"
          className="group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-primary via-background-primary/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Floating Photo Count Badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full text-xs text-text-primary flex items-center gap-1.5">
          <Images className="w-3.5 h-3.5 text-gold-primary" />
          <span className="font-mono">{photoCount} photos</span>
        </div>

        {/* Overlay Content */}
        <div className="absolute bottom-0 inset-x-0 p-6">
          {date && (
            <div className="flex items-center gap-1.5 text-xs text-text-subtle font-mono mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          )}

          <h3 className="text-lg font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors leading-snug">
            {title}
          </h3>
        </div>
      </div>
    </Card>
  );
};
