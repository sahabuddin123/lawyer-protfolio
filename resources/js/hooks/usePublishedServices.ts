import { useState, useEffect } from 'react';
import { practiceAreaApi } from '@/api/practiceAreas';
import { useTranslation } from '@/i18n';

export interface ServiceNavItem {
  to: string;
  label: string;
  slug: string;
}

/**
 * Dynamically retrieves published services from the database for navigation menus.
 * Strictly guarantees that services are never hardcoded to 12.
 */
export function usePublishedServices(): ServiceNavItem[] {
  const { locale } = useTranslation();
  const [services, setServices] = useState<ServiceNavItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    practiceAreaApi
      .getPracticeAreas({ per_page: 50 })
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          const items = res.data.map((pa) => {
            const label =
              typeof pa.title === 'string'
                ? pa.title
                : pa.title?.[locale] || pa.title?.en || pa.slug;
            return {
              to: `/practice-areas/${pa.slug}`,
              label,
              slug: pa.slug,
            };
          });
          setServices(items);
        }
      })
      .catch((err) => {
        console.warn('Unable to load navigation services:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return services;
}
