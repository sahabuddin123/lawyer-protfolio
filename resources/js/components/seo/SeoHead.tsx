import React, { useEffect } from 'react';
import { useTranslation } from '@/i18n';

export interface BreadcrumbItem {
  name: string;
  url?: string;
  path?: string;
}

export interface SeoHeadProps {
  title: string;
  description?: string;
  canonical?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile' | 'video.other' | string;
  ogImage?: string;
  robots?: string;
  breadcrumbs?: BreadcrumbItem[];
  structuredData?: Record<string, any>;
  publishedTime?: string;
  author?: string;
  section?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description = 'Advocate Nijam Uddin (Haq) provides principled legal representation across the Supreme Court of Bangladesh, specializing in constitutional writ petitions and appellate litigation.',
  canonical,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/images/portrait-nijamuddin.jpg',
  robots = 'index, follow',
  breadcrumbs,
  structuredData,
  publishedTime,
  author = 'Advocate Nijam Uddin (Haq)',
  section,
}) => {
  const { locale } = useTranslation();

  useEffect(() => {
    // 1. Document Title
    const formattedTitle = title.includes('Nijam Uddin')
      ? title
      : `${title} | Advocate Nijam Uddin (Haq)`;
    document.title = formattedTitle;

    // Helper for upserting meta tags
    const setMetaTag = (attribute: 'name' | 'property', value: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper for upserting link tags
    const setLinkTag = (rel: string, href: string, attributes?: Record<string, string>) => {
      let selector = `link[rel="${rel}"]`;
      if (attributes?.hreflang) {
        selector += `[hreflang="${attributes.hreflang}"]`;
      }
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (attributes) {
          Object.entries(attributes).forEach(([k, v]) => element?.setAttribute(k, v));
        }
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);

    // 3. Normalized Canonical & Hreflang
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const canonicalTarget = canonical || canonicalUrl;
    const resolvedCanonical = canonicalTarget
      ? (canonicalTarget.startsWith('http') ? canonicalTarget : `${origin}${canonicalTarget}`)
      : `${origin}${pathname}`;

    setLinkTag('canonical', resolvedCanonical);
    setLinkTag('alternate', resolvedCanonical, { hreflang: 'en' });
    setLinkTag('alternate', `${resolvedCanonical}?lang=bn`, { hreflang: 'bn' });
    setLinkTag('alternate', resolvedCanonical, { hreflang: 'x-default' });

    // 4. Open Graph Tags
    const resolvedOgImage = ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`;
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', resolvedCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', resolvedOgImage);
    setMetaTag('property', 'og:site_name', 'Advocate Nijam Uddin (Haq) — Supreme Court of Bangladesh');
    setMetaTag('property', 'og:locale', locale === 'bn' ? 'bn_BD' : 'en_US');

    if (publishedTime) {
      setMetaTag('property', 'article:published_time', publishedTime);
    }
    if (author) {
      setMetaTag('property', 'article:author', author);
    }
    if (section) {
      setMetaTag('property', 'article:section', section);
    }

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', resolvedOgImage);

    // 6. Structured Data Injection
    const scriptId = 'page-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (scriptElement) {
      scriptElement.remove();
    }

    // Compile composite Schema.org graph
    const schemaGraph: Array<Record<string, any>> = [];

    if (structuredData) {
      if (structuredData['@graph']) {
        schemaGraph.push(...structuredData['@graph']);
      } else {
        schemaGraph.push(structuredData);
      }
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      schemaGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => {
          const crumbPath = crumb.url || crumb.path || '/';
          return {
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumbPath.startsWith('http') ? crumbPath : `${origin}${crumbPath}`,
          };
        }),
      });
    }

    if (schemaGraph.length > 0) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      scriptElement.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': schemaGraph,
      });
      document.head.appendChild(scriptElement);
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [
    title,
    description,
    canonical,
    canonicalUrl,
    ogType,
    ogImage,
    robots,
    breadcrumbs,
    structuredData,
    publishedTime,
    author,
    section,
    locale,
  ]);

  return null;
};
