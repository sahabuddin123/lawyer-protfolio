import React from 'react';
import { Card } from '@/components/ui/Card';
import { Award, GraduationCap, Scale, ShieldCheck } from 'lucide-react';
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
  const isCourt = category === 'court';

  const verificationText = isCourt
    ? 'Supreme Court Enrolment'
    : isAcademic
    ? 'University Record Verified'
    : 'Certified Professional Standing';

  return (
    <Card
      withTopGoldBorder
      className={cn('p-6 md:p-7 flex flex-col justify-between h-full bg-surface/90 hover:bg-surface-elevated/40 border border-border-subtle hover:border-gold-border/70 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl group', className)}
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-gold-primary group-hover:border-gold-border/60 transition-colors">
            {isAcademic ? (
              <GraduationCap className="w-5 h-5" />
            ) : isCourt ? (
              <Scale className="w-5 h-5" />
            ) : (
              <Award className="w-5 h-5" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {year && <span className="text-xs font-mono text-text-subtle">{year}</span>}
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              {category}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors mb-2 leading-snug">
          {title}
        </h3>

        <p className="text-sm text-text-muted mb-4 font-normal">
          {institution}
        </p>

        {credentialId && (
          <div className="inline-block text-[11px] font-mono text-text-subtle bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle/80 mb-2">
            Roll / Reg: {credentialId}
          </div>
        )}
      </div>

      {isVerified && (
        <div className="pt-4 mt-4 border-t border-border-subtle/60 flex items-center gap-1.5 text-xs text-emerald-400/90 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{verificationText}</span>
        </div>
      )}
    </Card>
  );
};
