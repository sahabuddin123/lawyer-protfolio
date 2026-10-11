import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { MobileNavigation } from './MobileNavigation';
import { usePublishedServices } from '@/hooks/usePublishedServices';
import { Scale, Globe, Menu, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HeaderProps {
  onConsultationClick?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onConsultationClick, className }) => {
  const { t, locale, toggleLocale } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleDropdown = (key: string) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  // 1. Chamber sub-items
  const chamberSubItems = [
    { to: '/about', label: t.nav.aboutUs || 'About Us' },
    { to: '/about#team', label: t.nav.teamAssociates || 'Team & Associates' },
  ];

  // 2. Dynamic Services from database
  const dynamicServices = usePublishedServices();
  const servicesSubItems = dynamicServices.length > 0 ? dynamicServices : [
    { to: '/practice-areas', label: locale === 'bn' ? 'সকল প্র্যাকটিস এরিয়া' : 'All Practice Areas' },
  ];

  // 3. Resources sub-items
  const resourcesSubItems = [
    { to: '/courtroom', label: t.nav.stories || 'Stories' },
    { to: '/research', label: t.nav.research || 'Research' },
    { to: '/judgments', label: t.nav.precedents || 'Precedents' },
    { to: '/videos', label: t.nav.videos || 'Videos' },
  ];

  // 4. Gallery sub-items
  const gallerySubItems = [
    { to: '/gallery', label: t.nav.photos || 'Photos' },
    { to: '/videos', label: t.nav.videos || 'Videos' },
  ];

  const isChamberActive = location.pathname === '/about';
  const isServicesActive = location.pathname.startsWith('/practice-areas');
  const isResourcesActive =
    location.pathname.startsWith('/courtroom') ||
    location.pathname.startsWith('/research') ||
    location.pathname.startsWith('/judgments');
  const isGalleryActive = location.pathname.startsWith('/gallery') || location.pathname.startsWith('/videos');

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
            <nav
              ref={navRef}
              className="hidden xl:flex items-center space-x-1 lg:space-x-1.5"
              aria-label="Main Navigation"
            >
              {/* 1. Home */}
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    'px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary',
                    isActive ? 'text-gold-primary font-bold' : 'text-text-secondary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{t.nav.home}</span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gold-primary rounded-full" />
                    )}
                  </>
                )}
              </NavLink>

              {/* 2. Our Chamber (Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('chamber')}
                onMouseLeave={() => setActiveDropdown((prev) => (prev === 'chamber' ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('chamber')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'chamber'}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary cursor-pointer',
                    isChamberActive ? 'text-gold-primary font-bold' : 'text-text-secondary'
                  )}
                >
                  <span>{t.nav.ourChamber || 'Our Chamber'}</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      activeDropdown === 'chamber' && 'rotate-180 text-gold-primary'
                    )}
                  />
                  {isChamberActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gold-primary rounded-full" />
                  )}
                </button>

                {activeDropdown === 'chamber' && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-1.5 w-48 bg-background-primary/95 backdrop-blur-md border border-gold-border/40 rounded-lg shadow-dark-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {chamberSubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-3 py-2 rounded text-xs font-medium text-text-secondary hover:text-gold-hover hover:bg-surface-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Services (Dropdown / Mega menu) */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown((prev) => (prev === 'services' ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('services')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'services'}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary cursor-pointer',
                    isServicesActive ? 'text-gold-primary font-bold' : 'text-text-secondary'
                  )}
                >
                  <span>{t.nav.services || 'Services'}</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      activeDropdown === 'services' && 'rotate-180 text-gold-primary'
                    )}
                  />
                  {isServicesActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gold-primary rounded-full" />
                  )}
                </button>

                {activeDropdown === 'services' && (
                  <div
                    role="menu"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[520px] bg-background-primary/95 backdrop-blur-md border border-gold-border/40 rounded-lg shadow-dark-modal p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="grid grid-cols-2 gap-1 pb-2 mb-2 border-b border-border-subtle">
                      {servicesSubItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          onClick={() => setActiveDropdown(null)}
                          className="px-2.5 py-2 rounded text-xs font-medium text-text-secondary hover:text-gold-hover hover:bg-surface-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-1 text-center">
                      <Link
                        to="/practice-areas"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center text-xs font-semibold text-gold-primary hover:text-gold-hover transition-colors"
                      >
                        {locale === 'bn' ? 'সকল আইনি সেবাসমূহ দেখুন →' : 'View All Practice Areas →'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Resources (Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('resources')}
                onMouseLeave={() => setActiveDropdown((prev) => (prev === 'resources' ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('resources')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'resources'}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary cursor-pointer',
                    isResourcesActive ? 'text-gold-primary font-bold' : 'text-text-secondary'
                  )}
                >
                  <span>{t.nav.resources || 'Resources'}</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      activeDropdown === 'resources' && 'rotate-180 text-gold-primary'
                    )}
                  />
                  {isResourcesActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gold-primary rounded-full" />
                  )}
                </button>

                {activeDropdown === 'resources' && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-1.5 w-48 bg-background-primary/95 backdrop-blur-md border border-gold-border/40 rounded-lg shadow-dark-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {resourcesSubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-3 py-2 rounded text-xs font-medium text-text-secondary hover:text-gold-hover hover:bg-surface-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Gallery (Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('gallery')}
                onMouseLeave={() => setActiveDropdown((prev) => (prev === 'gallery' ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('gallery')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'gallery'}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary cursor-pointer',
                    isGalleryActive ? 'text-gold-primary font-bold' : 'text-text-secondary'
                  )}
                >
                  <span>{t.nav.gallery || 'Gallery'}</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      activeDropdown === 'gallery' && 'rotate-180 text-gold-primary'
                    )}
                  />
                  {isGalleryActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gold-primary rounded-full" />
                  )}
                </button>

                {activeDropdown === 'gallery' && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-1.5 w-44 bg-background-primary/95 backdrop-blur-md border border-gold-border/40 rounded-lg shadow-dark-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {gallerySubItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-3 py-2 rounded text-xs font-medium text-text-secondary hover:text-gold-hover hover:bg-surface-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary"
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
                className="px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary text-text-secondary"
              >
                <span>{t.nav.ourClients || 'Our Clients'}</span>
              </Link>

              {/* 7. Contact Us */}
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  cn(
                    'px-2.5 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors relative hover:text-gold-hover select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary',
                    isActive ? 'text-gold-primary font-bold' : 'text-text-secondary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{t.nav.contactUs || t.nav.contact || 'Contact Us'}</span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-gold-primary rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-subtle bg-surface text-xs font-semibold text-text-secondary hover:border-gold-border hover:text-gold-primary transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary"
                aria-label={t.nav.switchLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-gold-primary" />
                <span className="uppercase">{locale === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>

              {/* 8. Consultation CTA — Prominent */}
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
