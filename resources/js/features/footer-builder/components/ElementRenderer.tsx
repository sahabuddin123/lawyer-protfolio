import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Scale,
  Award,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  ExternalLink,
  Globe,
  AlertCircle,
} from 'lucide-react';
import type { FooterElement, BilingualText } from '../types';

interface ElementRendererProps {
  element: FooterElement;
  locale: 'en' | 'bn';
  isBuilderMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Icon resolver helper
const renderIcon = (name?: string, className: string = 'w-4 h-4') => {
  switch (name?.toLowerCase()) {
    case 'scale':
      return <Scale className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'mappin':
    case 'location':
      return <MapPin className={className} />;
    case 'phone':
      return <Phone className={className} />;
    case 'mail':
    case 'email':
      return <Mail className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'external':
      return <ExternalLink className={className} />;
    default:
      return null;
  }
};

// Social icon SVGs for verified platforms
const renderSocialIcon = (platform: string, className: string = 'w-4 h-4') => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    default:
      return <Globe className={className} />;
  }
};

const resolveText = (value: BilingualText | string | undefined, locale: 'en' | 'bn'): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value.en || value.bn || '';
};

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  locale,
  isBuilderMode = false,
  isSelected = false,
  onSelect,
}) => {
  const { type, content, settings } = element;

  const currentYear = new Date().getFullYear();

  // Handle element selection wrapper if in builder mode
  const wrapWithBuilderControls = (child: React.ReactNode) => {
    if (!isBuilderMode) return <>{child}</>;

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        className={`relative group transition-all rounded-md cursor-pointer ${
          isSelected
            ? 'ring-2 ring-amber-500 bg-amber-500/5 ring-offset-2 ring-offset-slate-900 shadow-md'
            : 'hover:ring-1 hover:ring-amber-400/50 hover:bg-slate-800/40'
        }`}
      >
        {isSelected && (
          <div className="absolute -top-3.5 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950 uppercase tracking-widest z-20 shadow-xs">
            {type.replace('_', ' ')}
          </div>
        )}
        <div className="p-1">{child}</div>
      </div>
    );
  };

  switch (type) {
    // 1. Site Identity (Branding)
    case 'site_identity': {
      const lawyerName = resolveText(content.lawyer_name, locale) || 'Advocate Nijam Uddin (Haq)';
      const designation = resolveText(content.designation, locale) || 'Advocate, Supreme Court of Bangladesh';
      const hasEmblem = content.has_emblem !== false;

      return wrapWithBuilderControls(
        <div className="flex items-center gap-3">
          {hasEmblem && (
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Scale className="w-5 h-5 stroke-[1.8]" />
            </div>
          )}
          <div>
            <span className="font-serif font-bold text-base sm:text-lg text-slate-100 block tracking-wide">
              {lawyerName}
            </span>
            <span className="text-xs text-amber-400/90 font-mono block">
              {designation}
            </span>
          </div>
        </div>
      );
    }

    // 2. Heading
    case 'heading': {
      const headingText = resolveText(content.text || content.heading || content.title, locale);
      const color = settings.color || '#D97706';
      const fontSize = settings.font_size || 'text-xs';
      const fontWeight = settings.font_weight || 'font-semibold';
      const letterSpacing = settings.letter_spacing || 'tracking-widest';
      const textTransform = settings.text_transform || 'uppercase';

      return wrapWithBuilderControls(
        <h4
          style={{ color }}
          className={`${fontSize} ${fontWeight} ${letterSpacing} ${textTransform} block`}
        >
          {headingText || 'SECTION HEADING'}
        </h4>
      );
    }

    // 3. Paragraph
    case 'paragraph': {
      const paraText = resolveText(content.text, locale);
      const fontSize = settings.font_size || 'text-xs sm:text-sm';
      const textColor = settings.text_color || settings.color || '#94A3B8';

      return wrapWithBuilderControls(
        <p
          style={{ color: textColor }}
          className={`${fontSize} leading-relaxed font-normal`}
        >
          {paraText || 'Add paragraph content in English and Bangla from the settings inspector.'}
        </p>
      );
    }

    // 4. Custom Link Group / Navigation Menu
    case 'custom_link_group':
    case 'navigation_menu': {
      const items = content.items || [];

      return wrapWithBuilderControls(
        <ul className="space-y-2.5 text-xs">
          {items.map((item, idx) => {
            const label = resolveText(item.label, locale);
            const url = item.url || '#';
            const iconName = item.icon;
            const isExternal = url.startsWith('http');

            return (
              <li key={idx}>
                {isExternal ? (
                  <a
                    href={url}
                    target={item.target || '_blank'}
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-400"
                  >
                    {iconName && renderIcon(iconName, 'w-3.5 h-3.5 text-amber-400 shrink-0')}
                    <span>{label}</span>
                  </a>
                ) : (
                  <NavLink
                    to={url}
                    className="hover:text-amber-400 transition-colors flex items-center gap-2 text-slate-400"
                  >
                    {iconName && renderIcon(iconName, 'w-3.5 h-3.5 text-amber-400 shrink-0')}
                    <span>{label}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      );
    }

    // 5. Chambers List (Strictly preserves Supreme Court Chamber & Chattogram Chamber)
    case 'chambers_list': {
      const chambers = content.chambers || [
        {
          id: 'supreme_court',
          name: { en: 'Supreme Court Chamber', bn: 'সুপ্রিম কোর্ট চেম্বার' },
          address: {
            en: 'Room 312, Supreme Court Bar Association Building, Dhaka',
            bn: 'কক্ষ ৩১২, সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ভবন, ঢাকা',
          },
          map_url: 'https://maps.google.com/?q=Supreme+Court+Bar+Association+Building+Dhaka',
        },
        {
          id: 'chattogram',
          name: { en: 'Chattogram Chamber', bn: 'চট্টগ্রাম চেম্বার' },
          address: {
            en: 'Court Hill, Kotwali, Chattogram',
            bn: 'কোর্ট হিল, কোতোয়ালী, চট্টগ্রাম',
          },
          map_url: 'https://maps.google.com/?q=Court+Hill+Kotwali+Chattogram',
        },
      ];

      return wrapWithBuilderControls(
        <div className="space-y-3 text-xs text-slate-400">
          {chambers.map((ch, idx) => {
            const chName = resolveText(ch.name, locale);
            const chAddress = resolveText(ch.address, locale);

            return (
              <div key={ch.id || idx} className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-100 font-medium block">{chName}</span>
                    {ch.map_url && (
                      <a
                        href={ch.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400/80 hover:text-amber-300 underline inline-flex items-center gap-0.5"
                      >
                        [Map]
                      </a>
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">
                    {chAddress}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 6. Contact Group (Phone & Email with tel: and mailto: validation)
    case 'contact_group': {
      const phone = content.phone || '+880 1819-000000';
      const email = content.email || 'chambers@nijamuddin.com';
      const isPlaceholder = content.is_phone_placeholder ?? phone.includes('000000');

      return wrapWithBuilderControls(
        <div className="space-y-2 pt-1 text-xs">
          {phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="font-mono text-slate-200 hover:text-amber-400 transition-colors"
              >
                {phone}
              </a>
              {isPlaceholder && isBuilderMode && (
                <span
                  title="Suspected placeholder phone number. Please verify canonical record."
                  className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-400 rounded flex items-center gap-1"
                >
                  <AlertCircle className="w-2.5 h-2.5" />
                  Verify
                </span>
              )}
            </div>
          )}

          {email && (
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="font-mono text-slate-200 hover:text-amber-400 transition-colors"
              >
                {email}
              </a>
            </div>
          )}
        </div>
      );
    }

    // 7. Social Icons Group
    case 'social_group': {
      const profiles = content.profiles || [
        { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com', is_active: true },
        { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com', is_active: true },
        { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com', is_active: true },
      ];

      const validProfiles = profiles.filter(
        (p) => p.is_active !== false && p.url && p.url !== '#' && p.url.startsWith('http')
      );

      return wrapWithBuilderControls(
        <div className="flex items-center gap-3 pt-1">
          {validProfiles.map((p, idx) => (
            <a
              key={idx}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.label || p.platform}
              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-all hover:scale-105"
            >
              {renderSocialIcon(p.platform, 'w-4 h-4')}
            </a>
          ))}
        </div>
      );
    }

    // 8. Divider
    case 'divider': {
      const color = settings.color || 'rgba(217, 119, 6, 0.3)';
      const withEmblem = content.with_emblem !== false;

      return wrapWithBuilderControls(
        <div className="relative py-4 flex items-center justify-center w-full">
          <div
            className="w-full h-px"
            style={{ backgroundColor: color }}
          />
          {withEmblem && (
            <div className="absolute px-3 bg-slate-900 border border-amber-500/40 rounded-full py-0.5 text-amber-400 text-xs shadow-xs">
              <Scale className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
          )}
        </div>
      );
    }

    // 9. Spacer
    case 'spacer': {
      const height = settings.height || '2rem';
      return wrapWithBuilderControls(
        <div style={{ height }} className="w-full flex items-center justify-center">
          {isBuilderMode && (
            <span className="text-[10px] text-slate-600 font-mono select-none">
              — Spacer ({height}) —
            </span>
          )}
        </div>
      );
    }

    // 10. Legal Disclaimer
    case 'legal_disclaimer': {
      const disclaimer = resolveText(
        content.text,
        locale
      ) ||
        'Legal Disclaimer: The materials provided on this platform are for general informational purposes only and do not constitute formal legal counsel. Prior results do not guarantee a similar outcome.';
      const color = settings.color || '#64748B';
      const fontSize = settings.font_size || 'text-[11px]';

      return wrapWithBuilderControls(
        <p
          style={{ color }}
          className={`${fontSize} leading-relaxed max-w-4xl font-light`}
        >
          {disclaimer}
        </p>
      );
    }

    // 11. Legal Links & Copyright Strip
    case 'legal_links': {
      const prefix = resolveText(content.copyright_prefix, locale) || '© {year} Advocate Nijam Uddin (Haq). All rights reserved.';
      const resolvedPrefix = prefix.replace('{year}', currentYear.toString());
      const links = content.links || [
        { label: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' }, url: '#privacy' },
        { label: { en: 'Terms of Engagement', bn: 'শর্তাবলী ও নিয়মাবলী' }, url: '#terms' },
      ];

      return wrapWithBuilderControls(
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2 w-full">
          <span>{resolvedPrefix}</span>
          <div className="flex items-center space-x-6">
            {links.map((lnk: any, idx: number) => {
              const label = resolveText(lnk.label, locale);
              const url = lnk.url || '#';
              return (
                <React.Fragment key={idx}>
                  <a
                    href={url}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {label}
                  </a>
                  {idx < links.length - 1 && <span>•</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    // 12. Back to Top Button
    case 'back_to_top': {
      const label = resolveText(content.text, locale) || 'Back to top';
      const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      return wrapWithBuilderControls(
        <button
          type="button"
          onClick={handleScrollTop}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs transition-colors cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      );
    }

    // Default Fallback
    default:
      return wrapWithBuilderControls(
        <div className="p-2 border border-dashed border-slate-700 text-xs text-slate-500 rounded">
          Unsupported Element: {type}
        </div>
      );
  }
};
