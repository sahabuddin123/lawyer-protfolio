import React from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { GoldDivider } from '@/components/ui/Divider';
import { useTranslation } from '@/i18n';
import { Scale, MapPin, Phone, Mail, Award, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, locale } = useTranslation();

  const practiceAreaLinks = [
    { label: locale === 'bn' ? 'সাংবিধানিক ও রিট মামলা' : 'Constitutional & Writ Petitions', href: '/practice-areas' },
    { label: locale === 'bn' ? 'দেওয়ানি ও বাণিজ্যিক মোকদ্দমা' : 'Civil & Commercial Litigation', href: '/practice-areas' },
    { label: locale === 'bn' ? 'কোম্পানি ও কর্পোরেট পরামর্শ' : 'Corporate & Commercial Advisory', href: '/practice-areas' },
    { label: locale === 'bn' ? 'সুপ্রিম কোর্ট আপিল ও রিভিশন' : 'Supreme Court Appellate Review', href: '/practice-areas' },
    { label: locale === 'bn' ? 'ব্যাংকিং ও অর্থঋণ আইন' : 'Banking & Financial Securities', href: '/practice-areas' },
  ];

  const quickLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.about, href: '/about' },
    { label: t.nav.courtroom, href: '/courtroom' },
    { label: t.nav.judgments, href: '/judgments' },
    { label: t.nav.research, href: '/research' },
    { label: t.nav.publications, href: '/publications' },
    { label: t.nav.contact, href: '/contact' },
  ];

  return (
    <footer className="bg-background-secondary border-t border-border-subtle pt-16 pb-12 text-text-secondary text-sm">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12">
          {/* Column 1: Identity & Chambers Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-primary shrink-0">
                <Scale className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-cinzel font-bold text-base sm:text-lg text-text-primary block tracking-wide">
                  {t.identity.lawyerName}
                </span>
                <span className="text-xs text-gold-secondary font-mono block">
                  {t.identity.designation}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-normal">
              {t.footer.aboutExcerpt}
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gold-primary">
                <Award className="w-4 h-4 shrink-0" />
                <span>{t.identity.qualifications}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                <span>{t.identity.barCouncilStatus}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-primary">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className="hover:text-gold-hover transition-colors block text-text-muted"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Practice Areas */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-primary">
              {t.footer.legalPractices}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {practiceAreaLinks.map((link, idx) => (
                <li key={idx}>
                  <NavLink
                    to={link.href}
                    className="hover:text-gold-hover transition-colors block text-text-muted"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Chamber Addresses */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-primary">
              {t.footer.chambersContact}
            </h4>

            <div className="space-y-3 text-xs text-text-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-primary block font-medium">Supreme Court Chamber</span>
                  <span>{t.identity.supremeCourtChamber}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-primary block font-medium">Chattogram Chamber</span>
                  <span>{t.identity.chittagongChamber}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-gold-primary shrink-0" />
                <span className="font-mono text-text-primary">{t.identity.phone}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-primary shrink-0" />
                <span className="font-mono text-text-primary">{t.identity.email}</span>
              </div>
            </div>
          </div>
        </div>

        <GoldDivider withEmblem />

        {/* Legal Disclaimer & Bottom Strip */}
        <div className="pt-6 space-y-4">
          <p className="text-[11px] text-text-subtle leading-relaxed max-w-4xl">
            {t.footer.legalDisclaimer}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-subtle pt-2">
            <span>{t.footer.copyright}</span>
            <div className="flex items-center space-x-6">
              <a href="#privacy" className="hover:text-gold-primary transition-colors">
                {t.footer.privacyPolicy}
              </a>
              <span>•</span>
              <a href="#terms" className="hover:text-gold-primary transition-colors">
                {t.footer.termsOfService}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
