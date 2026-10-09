import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { MobileNavigation } from './MobileNavigation';
import { Scale, Globe, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HeaderProps {
  onConsultationClick?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onConsultationClick, className }) => {
  const { t, locale, toggleLocale } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryNavItems = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/practice-areas', label: t.nav.practiceAreas },
    { to: '/courtroom', label: t.nav.courtroom },
    { to: '/research', label: t.nav.research },
    { to: '/judgments', label: t.nav.judgments },
    { to: '/publications', label: t.nav.publications },
    { to: '/media', label: t.nav.media },
    { to: '/videos', label: t.nav.videos },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-background-primary/95 backdrop-blur-md border-b border-border-subtle shadow-dark-card py-3.5'
            : 'bg-transparent py-5 sm:py-6',
          className
        )}
      >
        <Container wide>
          <div className="flex items-center justify-between">
            {/* Judicial Emblem & Identity */}
            <NavLink
              to="/"
              className="flex items-center gap-3.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary rounded p-1"
            >
              <div className="w-10 h-10 rounded-full bg-surface-elevated border border-gold-border/70 flex items-center justify-center text-gold-primary group-hover:border-gold-primary group-hover:shadow-gold-sm transition-all shrink-0">
                <Scale className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel font-bold text-base sm:text-lg text-text-primary tracking-wide leading-tight group-hover:text-gold-hover transition-colors">
                  {t.identity.lawyerName}
                </span>
                <span className="text-[11px] text-gold-secondary tracking-wider uppercase font-medium">
                  {locale === 'bn' ? 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট' : 'Advocate, Supreme Court of Bangladesh'}
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5" aria-label="Main Navigation">
              {primaryNavItems.slice(0, 7).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 rounded text-xs font-medium tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none',
                      isActive ? 'text-gold-primary font-semibold' : 'text-text-secondary'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-3 h-[2px] bg-gold-primary rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-subtle bg-surface text-xs font-semibold text-text-secondary hover:border-gold-border hover:text-gold-primary transition-all cursor-pointer select-none"
                aria-label={t.nav.switchLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-gold-primary" />
                <span className="uppercase">{locale === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>

              {/* Consultation CTA */}
              <Button
                variant="primary"
                size="sm"
                onClick={onConsultationClick}
              >
                {t.nav.bookConsultation}
              </Button>
            </div>

            {/* Mobile / Tablet Actions */}
            <div className="flex items-center gap-2 xl:hidden">
              <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border-subtle bg-surface text-xs font-semibold text-text-secondary hover:text-gold-primary transition-colors cursor-pointer"
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5 text-gold-primary" />
                <span className="font-mono uppercase">{locale === 'en' ? 'বাং' : 'EN'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                className="p-2 rounded-lg border border-border-subtle bg-surface text-text-primary hover:border-gold-border hover:text-gold-primary transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Accessible Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onConsultationClick={onConsultationClick}
      />
    </>
  );
};
