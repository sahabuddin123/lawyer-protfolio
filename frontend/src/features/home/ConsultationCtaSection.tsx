import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { HomeConsultationCtaData } from '@/types/home';
import type { HomepageSection } from '@/types/cms';

export interface ConsultationCtaSectionProps {
  cta: HomeConsultationCtaData;
  sectionConfig?: HomepageSection;
  settings?: Record<string, any>;
}

export const ConsultationCtaSection: React.FC<ConsultationCtaSectionProps> = ({
  cta,
  sectionConfig,
  settings,
}) => {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.contactEyebrow;
  const title =
    resolveLocalized(cta.title, locale) ||
    resolveLocalized(sectionConfig?.title, locale) ||
    t.sections.contactTitle;
  const description =
    resolveLocalized(cta.description, locale) ||
    resolveLocalized(sectionConfig?.content, locale) ||
    t.sections.contactDescription;

  const phone = cta.phone || settings?.contact?.phone || t.identity.phone;
  const email = cta.email || settings?.contact?.email || t.identity.email;
  const chamberAddress =
    resolveLocalized(cta.chamber_address, locale) ||
    settings?.contact?.office_address ||
    t.identity.supremeCourtChamber;
  const officeHours =
    resolveLocalized(cta.office_hours, locale) ||
    settings?.contact?.office_hours ||
    (locale === 'bn' ? 'রবিবার - বৃহস্পতিবার: বিকাল ৪টা - রাত ৯টা' : 'Sunday - Thursday: 4:00 PM - 9:00 PM');

  const buttonLabel =
    resolveLocalized(cta.button_label, locale) ||
    t.sections.scheduleConsultation ||
    t.nav.bookConsultation;

  return (
    <section id="consultation-cta" className="py-20 md:py-28 bg-background-secondary border-t border-border-subtle relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Container wide>
        <Card className="p-8 sm:p-12 md:p-16 border border-gold-border/60 bg-gradient-to-br from-surface-elevated via-surface to-background-primary shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-subtle/40 border border-gold-border/60">
                <ShieldCheck className="w-4 h-4 text-gold-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-gold-primary font-mono">
                  {eyebrow}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-editorial font-bold text-text-primary leading-tight">
                {title}
              </h2>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-normal max-w-2xl">
                {description}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/contact')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {buttonLabel}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/contact')}
                >
                  {locale === 'bn' ? 'চেম্বার যোগাযোগের বিবরণ' : 'Chamber Contact Details'}
                </Button>
              </div>

              <p className="text-xs text-text-subtle font-mono pt-2">
                {t.forms.consultationNotice}
              </p>
            </div>

            {/* Right Information Grid */}
            <div className="lg:col-span-5 bg-surface-card p-6 sm:p-8 rounded-lg border border-border-subtle space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gold-primary font-semibold border-b border-border-subtle pb-3">
                {locale === 'bn' ? 'চেম্বার সচিবালয়' : 'Chamber Secretariat'}
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                      {locale === 'bn' ? 'চেম্বার ঠিকানা' : 'Chamber Address'}
                    </p>
                    <p className="text-text-muted mt-0.5">{chamberAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gold-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                      {locale === 'bn' ? 'সরাসরি ফোন' : 'Direct Telephone'}
                    </p>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="text-text-primary font-mono hover:text-gold-hover transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gold-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                      {locale === 'bn' ? 'ইমেইল যোগাযোগ' : 'Chamber Registry Email'}
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="text-text-primary font-mono hover:text-gold-hover transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                      {locale === 'bn' ? 'পরামর্শ সময়সূচি' : 'Consultation Hours'}
                    </p>
                    <p className="text-text-muted mt-0.5 font-mono text-xs">{officeHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
};
