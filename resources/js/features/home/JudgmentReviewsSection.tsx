import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Scale, Calendar, Gavel, UserCheck } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { JudgmentReview } from '@/types/judgment';
import type { HomepageSection } from '@/types/cms';

export interface JudgmentReviewsSectionProps {
  judgmentReviews: JudgmentReview[];
  sectionConfig?: HomepageSection;
}

export const JudgmentReviewsSection: React.FC<JudgmentReviewsSectionProps> = ({
  judgmentReviews,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  if (!judgmentReviews || judgmentReviews.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.judgmentsEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.judgmentsTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.judgmentsDescription;

  return (
    <HomeSectionWrapper
      id="judgments"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewAllJudgments}
      actionUrl="/judgments"
      className="bg-background-secondary"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {judgmentReviews.map((review) => {
          const caseName = resolveLocalized(review.case_name, locale);
          const summary = resolveLocalized(review.summary, locale);
          const courtDecision = resolveLocalized(review.court_decision, locale);
          const authorAnalysis = resolveLocalized(review.author_analysis, locale);

          return (
            <Card
              key={review.id}
              className="p-7 md:p-8 flex flex-col justify-between h-full group bg-surface/90 hover:bg-surface-elevated/40 border border-border-subtle hover:border-gold-border/80 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl relative overflow-hidden"
            >
              {/* Subtle ambient corner glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-5 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {review.citation && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-md shadow-sm">
                        <Gavel className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {review.citation}
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800">
                      {review.court}
                    </span>
                  </div>

                  {review.judgment_date && (
                    <div className="flex items-center gap-1.5 text-xs text-text-subtle font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{review.judgment_date}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl md:text-2xl font-serif-editorial font-bold text-text-primary group-hover:text-gold-hover transition-colors leading-snug">
                  {caseName}
                </h3>

                {summary && (
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-3 font-normal">
                    {summary}
                  </p>
                )}

                {/* Precedent Breakdown: Court Decision vs Author Jurisprudential Analysis */}
                <div className="space-y-3 pt-1">
                  {courtDecision && (
                    <div className="p-3.5 rounded-lg bg-surface-elevated/80 border border-border-subtle/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                        <Gavel className="w-3.5 h-3.5 text-amber-400" />
                        <span>{locale === 'bn' ? 'আদালতের সিদ্ধান্ত ও মূল নীতি' : "Court's Precedent & Ratio"}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {courtDecision}
                      </p>
                    </div>
                  )}

                  {authorAnalysis && (
                    <div className="p-3.5 rounded-lg bg-gold-subtle/30 border border-gold-border/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-gold-primary font-semibold">
                        <Scale className="w-3.5 h-3.5 text-gold-primary" />
                        <span>{locale === 'bn' ? 'আইনজীবীর বিশ্লেষণ' : "Chamber Analysis & Significance"}</span>
                      </div>
                      <p className="text-xs text-text-primary leading-relaxed line-clamp-2">
                        {authorAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-xs text-gold-secondary font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-gold-primary" />
                  <span>Advocate Nijam Uddin (Haq)</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/judgments/${review.slug}`)}
                  rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                  className="px-0 hover:bg-transparent text-gold-primary hover:text-gold-hover font-semibold"
                >
                  {locale === 'bn' ? 'সম্পূর্ণ বিশ্লেষণ দেখুন' : 'Read Precedent Analysis'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
