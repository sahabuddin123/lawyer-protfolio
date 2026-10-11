import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cmsApi } from '@/api/cms';
import { HomeSectionRenderer } from '@/features/home';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Container } from '@/components/ui/Container';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import { SeoHead } from '@/components/seo/SeoHead';
import type { PublicHomepageData } from '@/types/home';

export const HomePage: React.FC = () => {
  const { t, locale } = useTranslation();
  const outletContext = useOutletContext<{ openConsultation?: () => void }>() || {};

  const [data, setData] = useState<PublicHomepageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const homeData = await cmsApi.getPublicHome();
      setData(homeData);
    } catch (err: any) {
      console.error('Failed to load homepage data:', err);
      setError(
        locale === 'bn'
          ? 'হোমপেজ ডাটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Unable to securely retrieve homepage judicial records. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  const seoTitle =
    resolveLocalized(data?.seo?.seo_title, locale) ||
    resolveLocalized(data?.settings?.general?.site_title, locale) ||
    `${t.identity.lawyerName} | ${t.identity.designation}`;

  const seoDescription =
    resolveLocalized(data?.seo?.meta_description, locale) ||
    resolveLocalized(data?.hero?.short_bio, locale) ||
    t.sections.heroSummary;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: 'Advocate Nijam Uddin (Haq)',
        jobTitle: 'Advocate, Supreme Court of Bangladesh',
        alumniOf: 'University of Chittagong',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://nijamuddin.com',
      },
      {
        '@type': 'LegalService',
        name: 'Chambers of Advocate Nijam Uddin (Haq)',
        telephone: data?.settings?.contact?.phone || '+880 1819-000000',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Supreme Court Bar Association Building',
          addressLocality: 'Dhaka',
          addressCountry: 'BD',
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col pt-24 pb-20 space-y-16">
        <SeoHead
          title={seoTitle}
          description={seoDescription}
          canonical="/"
          ogType="website"
        />
        {/* Hero Skeleton */}
        <Container wide>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Skeleton width="180px" height="28px" className="rounded-full" />
              <Skeleton width="90%" height="56px" />
              <Skeleton width="60%" height="32px" />
              <Skeleton width="100%" height="80px" />
              <div className="flex gap-4 pt-4">
                <Skeleton width="200px" height="48px" className="rounded" />
                <Skeleton width="160px" height="48px" className="rounded" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <Skeleton width="100%" height="480px" className="rounded-lg" />
            </div>
          </div>
        </Container>

        {/* Section Skeleton */}
        <Container wide>
          <div className="space-y-4 mb-8">
            <Skeleton width="140px" height="20px" />
            <Skeleton width="340px" height="36px" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton width="100%" height="220px" className="rounded-lg" />
            <Skeleton width="100%" height="220px" className="rounded-lg" />
            <Skeleton width="100%" height="220px" className="rounded-lg" />
          </div>
        </Container>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] bg-background-primary flex items-center justify-center p-6">
        <SeoHead
          title={seoTitle}
          description={seoDescription}
          canonical="/"
          ogType="website"
        />
        <ErrorState
          title={locale === 'bn' ? 'হোমপেজ তথ্য লোড করা যায়নি' : 'Homepage Transmission Error'}
          message={error || (locale === 'bn' ? 'অপ্রত্যাশিত সমস্যা দেখা দিয়েছে।' : 'An unexpected error occurred.')}
          onRetry={fetchHomepageData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary selection:bg-gold-primary/20 selection:text-gold-hover">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonical="/"
        ogType="website"
        ogImage={data.hero?.hero_image?.url || data.hero?.avatar?.url || '/images/hero/hero-lawyer.webp'}
        structuredData={data.structured_data || defaultStructuredData}
      />
      <HomeSectionRenderer
        data={data}
        onConsultationClick={outletContext.openConsultation}
      />
    </div>
  );
};
