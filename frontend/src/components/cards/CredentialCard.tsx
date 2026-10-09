import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Award, GraduationCap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CredentialCardProps {
  category: 'academic' | 'court' | 'professional' | 'certification';
  title: string;
  institution: string;
  year?: string;
  credentialId?: string;
  isVerified?: boolean;
  className?: string;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  category,
  title,
  institution,
  year,
  credentialId,
  isVerified = true,
  className,
}) => {
  const isAcademic = category === 'academic';

  return (
    <Card withTopGoldBorder className={cn('p-6 md:p-8 flex flex-col justify-between h-full', className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-gold-primary">
            {isAcademic ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
          </div>

          <div className="flex items-center gap-2">
            {year && <span className="text-xs font-mono text-text-subtle">{year}</span>}
            <Badge variant="gold" size="sm">
              {category}
            </Badge>
          </div>
        </div>

        <h3 className="text-lg font-serif-editorial font-bold text-text-primary mb-2 leading-snug">
          {title}
        </h3>

        <p className="text-sm text-text-muted mb-4 font-normal">
          {institution}
        </p>

        {credentialId && (
          <p className="text-xs font-mono text-text-subtle">
            Registration / Roll: {credentialId}
          </p>
        )}
      </div>

      {isVerified && (
        <div className="pt-4 mt-4 border-t border-border-subtle/60 flex items-center gap-1.5 text-xs text-status-success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-medium">Verified by Bar Council / University Records</span>
        </div>
      )}
    </Card>
  );
};
