import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { X, Scale, Globe, Phone, Mail, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { drawerVariants, backdropVariants } from '@/utils/motion';
import { Button } from '@/components/ui/Button';
import { usePublishedServices } from '@/hooks/usePublishedServices';

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  const toggleSection = (key: string) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  // Submenu items
  const chamberSubItems = [
    { to: '/about', label: t.nav.aboutUs || 'About Us' },
    { to: '/about#team', label: t.nav.teamAssociates || 'Team & Associates' },
  ];

  const dynamicServices = usePublishedServices();
  const servicesSubItems = dynamicServices.length > 0 ? dynamicServices : [
    { to: '/practice-areas', label: locale === 'bn' ? 'সকল প্র্যাকটিস এরিয়া' : 'All Practice Areas' },
  ];

  const resourcesSubItems = [
    { to: '/courtroom', label: t.nav.stories || 'Stories' },
    { to: '/research', label: t.nav.research || 'Research' },
    { to: '/judgments', label: t.nav.precedents || 'Precedents' },
    { to: '/videos', label: t.nav.videos || 'Videos' },
  ];

  const gallerySubItems = [
    { to: '/gallery', label: t.nav.photos || 'Photos' },
    { to: '/videos', label: t.nav.videos || 'Videos' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
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

            {/* Navigation Links Accordion */}
            <nav className="p-6 space-y-1.5 flex-1 overflow-y-auto">
              {/* 1. Home */}
              <NavLink
                to="/"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gold-subtle text-gold-primary font-semibold border-l-2 border-gold-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`
                }
              >
                <span>{t.nav.home}</span>
              </NavLink>

              {/* 2. Our Chamber (Accordion) */}
              <div className="rounded-md overflow-hidden bg-surface/30">
                <button
                  type="button"
                  onClick={() => toggleSection('chamber')}
                  className="w-full flex items-center justify-between py-3 px-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span>{t.nav.ourChamber || 'Our Chamber'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold-primary transition-transform duration-200 ${
                      expandedSection === 'chamber' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSection === 'chamber' && (
                  <div className="pl-4 pr-2 pb-2 space-y-1 bg-surface-elevated/50">
                    {chamberSubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="block py-2 px-3 rounded text-xs font-medium text-text-muted hover:text-gold-hover hover:bg-surface transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Services (Accordion) */}
              <div className="rounded-md overflow-hidden bg-surface/30">
                <button
                  type="button"
                  onClick={() => toggleSection('services')}
                  className="w-full flex items-center justify-between py-3 px-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span>{t.nav.services || 'Services'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold-primary transition-transform duration-200 ${
                      expandedSection === 'services' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSection === 'services' && (
                  <div className="pl-4 pr-2 pb-2 space-y-1 bg-surface-elevated/50 max-h-60 overflow-y-auto">
                    <Link
                      to="/practice-areas"
                      onClick={onClose}
                      className="block py-2 px-3 rounded text-xs font-semibold text-gold-primary hover:bg-surface transition-colors border-b border-border-subtle"
                    >
                      {locale === 'bn' ? 'সকল প্র্যাকটিস এরিয়া →' : 'All Practice Areas →'}
                    </Link>
                    {servicesSubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="block py-1.5 px-3 rounded text-xs font-medium text-text-muted hover:text-gold-hover hover:bg-surface transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Resources (Accordion) */}
              <div className="rounded-md overflow-hidden bg-surface/30">
                <button
                  type="button"
                  onClick={() => toggleSection('resources')}
                  className="w-full flex items-center justify-between py-3 px-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span>{t.nav.resources || 'Resources'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold-primary transition-transform duration-200 ${
                      expandedSection === 'resources' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSection === 'resources' && (
                  <div className="pl-4 pr-2 pb-2 space-y-1 bg-surface-elevated/50">
                    {resourcesSubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="block py-2 px-3 rounded text-xs font-medium text-text-muted hover:text-gold-hover hover:bg-surface transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Gallery (Accordion) */}
              <div className="rounded-md overflow-hidden bg-surface/30">
                <button
                  type="button"
                  onClick={() => toggleSection('gallery')}
                  className="w-full flex items-center justify-between py-3 px-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span>{t.nav.gallery || 'Gallery'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold-primary transition-transform duration-200 ${
                      expandedSection === 'gallery' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSection === 'gallery' && (
                  <div className="pl-4 pr-2 pb-2 space-y-1 bg-surface-elevated/50">
                    {gallerySubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="block py-2 px-3 rounded text-xs font-medium text-text-muted hover:text-gold-hover hover:bg-surface transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Our Clients */}
              <Link
                to="/about#clients"
                onClick={onClose}
                className="flex items-center justify-between py-3 px-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <span>{t.nav.ourClients || 'Our Clients'}</span>
              </Link>

              {/* 7. Contact Us */}
              <NavLink
                to="/contact"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gold-subtle text-gold-primary font-semibold border-l-2 border-gold-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`
                }
              >
                <span>{t.nav.contactUs || t.nav.contact || 'Contact Us'}</span>
              </NavLink>
            </nav>

            {/* Drawer Footer & CTA */}
            <div className="p-6 border-t border-border-subtle bg-surface/50 space-y-4">
              {/* 8. Book Consultation */}
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
