import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { X, Scale, Globe, Phone, Mail, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { drawerVariants, backdropVariants } from '@/utils/motion';
import { Button } from '@/components/ui/Button';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onConsultationClick?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  onConsultationClick,
}) => {
  const { t, locale, toggleLocale } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape & trap scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/practice-areas', label: t.nav.practiceAreas },
    { to: '/courtroom', label: t.nav.courtroom },
    { to: '/judgments', label: t.nav.judgments },
    { to: '/research', label: t.nav.research },
    { to: '/publications', label: t.nav.publications },
    { to: '/media', label: t.nav.media },
    { to: '/videos', label: t.nav.videos },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-background-primary border-l border-border-subtle shadow-dark-modal flex flex-col justify-between overflow-y-auto z-10"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-primary">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-cinzel font-bold text-sm text-text-primary block tracking-wide">
                    {t.identity.lawyerName}
                  </span>
                  <span className="text-[10px] text-gold-secondary font-mono block">
                    Supreme Court of Bangladesh
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="p-2 rounded text-text-muted hover:text-gold-primary transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Language Switcher Bar */}
            <div className="px-6 py-3 bg-surface-elevated border-b border-border-subtle flex items-center justify-between">
              <span className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-gold-primary" />
                Language / ভাষা
              </span>
              <button
                type="button"
                onClick={toggleLocale}
                className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-surface border border-gold-border text-gold-primary hover:bg-gold-subtle transition-all cursor-pointer"
              >
                {locale === 'en' ? 'বাংলা সংস্করণ' : 'English Version'}
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-6 space-y-1 flex-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3 px-3 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gold-subtle text-gold-primary font-semibold border-l-2 border-gold-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                </NavLink>
              ))}
            </nav>

            {/* Drawer Footer & CTA */}
            <div className="p-6 border-t border-border-subtle bg-surface/50 space-y-4">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => {
                  onClose();
                  onConsultationClick?.();
                }}
              >
                {t.nav.bookConsultation}
              </Button>

              <div className="space-y-1.5 pt-2 text-xs text-text-subtle">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gold-primary" />
                  <span className="font-mono">{t.identity.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold-primary" />
                  <span className="font-mono">{t.identity.email}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
