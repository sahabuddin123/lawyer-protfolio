import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LazyImage } from '@/components/ui/LazyImage';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, ShieldCheck, Scale, Award } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { HomeAboutPreviewData } from '@/types/home';
import type { HomepageSection } from '@/types/cms';

export interface AboutPreviewSectionProps {
  about: HomeAboutPreviewData;
  sectionConfig?: HomepageSection;
}

export const AboutPreviewSection: React.FC<AboutPreviewSectionProps> = ({
  about,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.aboutEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.aboutTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.aboutDescription;

  const name = resolveLocalized(about.name, locale) || t.identity.lawyerName;
  const professionalTitle =
    resolveLocalized(about.professional_title || about.title, locale) ||
    t.identity.designation;
  const bio =
    resolveLocalized(about.short_bio, locale) ||
    resolveLocalized(about.full_bio_preview, locale) ||
    t.sections.heroSummary;
  const philosophy = resolveLocalized(about.philosophy, locale);

  const photoUrl =
    about.court_robes_photo?.variants?.medium ||
    about.court_robes_photo?.url ||
    about.avatar?.variants?.medium ||
    about.avatar?.url ||
    '/images/portrait-nijamuddin.jpg';

  return (
    <HomeSectionWrapper
      id="about"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewFullProfile}
      actionUrl="/about"
    >
      <Card className="overflow-hidden border border-border-subtle bg-surface-card shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Portrait Column */}
          <div className="lg:col-span-5 relative bg-surface-elevated min-h-[380px] lg:min-h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-border-subtle">
            <LazyImage
              src={photoUrl}
              alt={name}
              aspectRatio="auto"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-primary/80 via-transparent to-transparent lg:hidden" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge variant="gold" size="sm">
                Supreme Court Bar
              </Badge>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-gold-primary tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Legal Standing</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif-editorial font-bold text-text-primary leading-tight">
                {name}
              </h3>

              <p className="text-sm md:text-base font-serif-editorial italic text-gold-secondary font-medium">
                {professionalTitle}
              </p>

              <p className="text-sm md:text-base text-text-muted leading-relaxed font-normal">
                {bio}
              </p>

              {philosophy && (
                <blockquote className="border-l-2 border-gold-primary pl-4 py-1 italic text-sm text-text-secondary bg-surface-elevated/40 rounded-r">
                  "{philosophy}"
                </blockquote>
              )}
            </div>

            {/* Quick Institutional Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    {locale === 'bn' ? 'হাইকোর্ট প্র্যাকটিস' : 'High Court Division'}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {locale === 'bn'
                      ? 'সাংবিধানিক রিট ও আপিল শুনানি'
                      : 'Constitutional writs & appellate briefs'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    {locale === 'bn' ? 'অ্যাকাডেমিক যোগ্যতা' : 'Academic Credentials'}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {locale === 'bn'
                      ? 'এলএল.বি. (অনার্স), এলএল.এম., চট্টগ্রাম বিশ্ববিদ্যালয়'
                      : 'LL.B. (Honours), LL.M., Univ. of Chittagong'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/about')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t.sections.viewFullProfile}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </HomeSectionWrapper>
  );
};
