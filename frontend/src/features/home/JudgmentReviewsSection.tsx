import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Scale, Calendar, Gavel } from 'lucide-react';
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
              className="p-6 md:p-8 flex flex-col justify-between h-full group hover:border-gold-border/80 transition-all border border-border-subtle"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold" size="sm">
                      {review.court}
                    </Badge>
                    {review.citation && (
                      <span className="text-xs font-mono font-semibold text-gold-secondary px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
                        {review.citation}
                      </span>
                    )}
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
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
                    {summary}
                  </p>
                )}

                {/* Strict Boundary: Court's Decision vs Author's Analysis */}
                <div className="space-y-3 pt-2">
                  {courtDecision && (
                    <div className="p-3.5 rounded bg-surface-elevated/70 border border-border-subtle/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                        <Gavel className="w-3.5 h-3.5 text-text-muted" />
                        <span>{locale === 'bn' ? 'আদালতের সিদ্ধান্ত' : "Court's Decision"}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {courtDecision}
                      </p>
                    </div>
                  )}

                  {authorAnalysis && (
                    <div className="p-3.5 rounded bg-gold-subtle/30 border border-gold-border/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-gold-primary font-semibold">
                        <Scale className="w-3.5 h-3.5 text-gold-primary" />
                        <span>{locale === 'bn' ? 'আইনজীবীর বিশ্লেষণ' : "Author's Jurisprudential Analysis"}</span>
                      </div>
                      <p className="text-xs text-text-primary leading-relaxed line-clamp-2">
                        {authorAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/judgments/${review.slug}`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="px-0 hover:bg-transparent text-gold-primary hover:text-gold-hover"
                >
                  {t.common.viewDetails}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </HomeSectionWrapper>
  );
};
