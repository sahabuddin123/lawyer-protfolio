import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PracticeAreaIcon } from '@/components/icons/PracticeAreaIcon';
import { useTranslation } from '@/i18n';
import { practiceAreaApi } from '@/api/practiceAreas';
import { PracticeArea } from '@/types/practiceArea';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Building,
  Scale,
  AlertCircle,
  FileCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const PracticeAreaDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [practiceArea, setPracticeArea] = useState<PracticeArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArea = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await practiceAreaApi.getPracticeAreaBySlug(slug);
        if (response.success && response.data) {
          setPracticeArea(response.data);
        } else {
          setError(response.message || 'Practice area not found.');
        }
      } catch (err: any) {
        console.error('Failed to load practice area detail:', err);
        setError(
          err?.response?.data?.message ||
            'The requested legal practice domain could not be found or has not been published.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArea();
  }, [slug, locale]);

  const resolveText = (text: any): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[locale] || text.en || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-base text-text-primary py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="w-48 h-4 bg-surface-elevated rounded mb-8" />
          <div className="w-3/4 h-12 bg-surface-elevated rounded mb-6" />
          <div className="w-full h-6 bg-surface-elevated rounded mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="w-full h-32 bg-surface-elevated rounded" />
              <div className="w-full h-64 bg-surface-elevated rounded" />
            </div>
            <div className="space-y-6">
              <div className="w-full h-48 bg-surface-elevated rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !practiceArea) {
    return (
      <div className="min-h-screen bg-background-base text-text-primary flex items-center justify-center px-4">
        <SeoHead
          title={locale === 'bn' ? 'কার্যক্ষেত্রটি পাওয়া যায়নি | চেম্বার' : 'Practice Domain Not Found | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="max-w-md w-full bg-surface-card border border-border-subtle rounded-lg p-8 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-gold-primary mx-auto mb-4" />
          <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-2">
            {locale === 'bn' ? 'কার্যক্ষেত্রটি পাওয়া যায়নি' : 'Practice Domain Not Found'}
          </h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {error || (locale === 'bn' ? 'অনুরোধকৃত প্র্যাকটিস এরিয়াটি সক্রিয় নেই।' : 'The requested practice area is not published or does not exist.')}
          </p>
          <Button variant="secondary" onClick={() => navigate('/practice-areas')}>
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            <span>{locale === 'bn' ? 'সকল প্র্যাকটিস ডোমেন' : 'Back to Practice Areas'}</span>
          </Button>
        </div>
      </div>
    );
  }

  const title = resolveText(practiceArea.title);
  const shortDesc = resolveText(practiceArea.short_description);
  const fullDesc = resolveText(practiceArea.full_description);

  return (
    <div className="min-h-screen bg-background-base text-text-primary selection:bg-gold-primary/20 selection:text-gold-hover pb-24">
      <SeoHead
        title={`${title} | ${locale === 'bn' ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Chambers of Advocate Nijam Uddin (Haq)'}`}
        description={shortDesc || (locale === 'bn' ? `${title} সংক্রান্ত বিশেষায়িত আইনি সেবা ও প্রতিনিধিত্ব।` : `Specialized legal representation in ${title} by Advocate Nijam Uddin (Haq).`)}
        canonical={`/practice-areas/${slug}`}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'প্র্যাকটিস এরিয়া' : 'Practice Areas', path: '/practice-areas' },
          { name: title, path: `/practice-areas/${slug}` },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LegalService',
          name: `${title} — Chambers of Advocate Nijam Uddin (Haq)`,
          description: shortDesc,
          url: `https://nijamuddin.com/practice-areas/${slug}`,
          provider: {
            '@type': 'Person',
            name: 'Advocate Nijam Uddin (Haq)',
            jobTitle: 'Advocate, Supreme Court of Bangladesh',
          },
        }}
      />
      {/* 1. Breadcrumbs */}
      <div className="border-b border-border-subtle bg-surface-base/80 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-text-muted">
          <nav className="flex items-center space-x-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold-primary transition-colors">
              {locale === 'bn' ? 'মূলপাতা' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/40" />
            <Link to="/practice-areas" className="hover:text-gold-primary transition-colors">
              {locale === 'bn' ? 'প্র্যাকটিস এরিয়া' : 'Practice Areas'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/40" />
            <span className="text-gold-primary font-medium truncate max-w-xs sm:max-w-md">
              {title}
            </span>
          </nav>

          <Link
            to="/practice-areas"
            className="hidden sm:inline-flex items-center text-xs text-text-muted hover:text-gold-primary transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            <span>{locale === 'bn' ? 'সকল ক্ষেত্র' : 'View All'}</span>
          </Link>
        </div>
      </div>

      {/* 2. Hero Header */}
      <div className="bg-gradient-to-b from-surface-elevated/40 via-surface-card/20 to-transparent border-b border-border-subtle/60 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-gold-border/60 flex items-center justify-center text-gold-primary shadow-sm">
                <PracticeAreaIcon name={practiceArea.icon_name} className="w-6 h-6" />
              </div>

              {practiceArea.is_featured && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-primary/10 border border-gold-border text-gold-hover">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {locale === 'bn' ? 'অগ্রাধিকার ক্ষেত্র' : 'Featured Domain'}
                </span>
              )}

              <span className="text-xs uppercase tracking-widest font-mono text-gold-primary/90">
                {locale === 'bn' ? 'আইনি কার্যক্ষেত্র' : 'Jurisdictional Domain'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold text-text-primary tracking-tight leading-tight mb-6">
              {title}
            </h1>

            {shortDesc && (
              <p className="text-base sm:text-lg text-text-muted leading-relaxed font-light border-l-2 border-gold-primary pl-4">
                {shortDesc}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Full Editorial Description */}
          <main className="lg:col-span-8">
            <article className="bg-surface-card border border-border-subtle rounded-lg p-6 sm:p-10 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gold-primary uppercase tracking-widest mb-6 pb-4 border-b border-border-subtle/80">
                <Scale className="w-4 h-4" />
                <span>{locale === 'bn' ? 'আইনি পরিধি ও বিশ্লেষণ' : 'Legal Framework & Jurisdictional Analysis'}</span>
              </div>

              {fullDesc ? (
                <div
                  className="prose prose-invert prose-gold max-w-none text-text-muted leading-relaxed text-sm sm:text-base space-y-5"
                  dangerouslySetInnerHTML={{ __html: fullDesc }}
                />
              ) : (
                <p className="text-sm text-text-muted italic">
                  {locale === 'bn'
                    ? 'বিস্তারিত বিবরণ শীঘ্রই সংযুক্ত করা হবে।'
                    : 'Detailed jurisdictional analysis and case scopes will be published shortly.'}
                </p>
              )}
            </article>

            {/* Back Navigation Bar */}
            <div className="mt-8 flex items-center justify-between">
              <Button variant="secondary" onClick={() => navigate('/practice-areas')}>
                <ChevronLeft className="w-4 h-4 mr-1.5" />
                <span>{locale === 'bn' ? 'সকল প্র্যাকটিস এরিয়ায় ফিরে যান' : 'Back to Practice Areas'}</span>
              </Button>
            </div>
          </main>

          {/* Right Column: Jurisdictional Chambers & Profile Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 1. Chamber Jurisdiction Card */}
            <div className="bg-surface-card border border-border-subtle rounded-lg p-6">
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-gold-primary uppercase tracking-wider mb-4">
                <Building className="w-4 h-4" />
                <span>{locale === 'bn' ? 'সুপ্রিম কোর্ট অধিক্ষেত্র' : 'Judicial Jurisdiction'}</span>
              </div>
              <h4 className="text-base font-serif-editorial font-bold text-text-primary mb-2">
                {locale === 'bn' ? 'বাংলাদেশ সুপ্রিম কোর্ট' : 'Supreme Court of Bangladesh'}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                {locale === 'bn'
                  ? 'হাইকোর্ট বিভাগ এবং আপিল বিভাগে আইনি প্রতিনিধিত্ব, রিট আবেদন ও বিশেষ আইনি পর্যালোচনা।'
                  : 'Authoritative advocacy across High Court Division and Appellate Division proceedings.'}
              </p>
              <div className="space-y-2 text-xs text-text-muted/90 pt-3 border-t border-border-subtle">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-3.5 h-3.5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'রিট ও সাংবিধানিক প্রতিকার' : 'Constitutional & Writ Relief'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-3.5 h-3.5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'আপিল ও রিভিশন দায়ের' : 'Appellate & Revision Advocacy'}</span>
                </div>
              </div>
            </div>

            {/* 2. Advocate Verified Pedigree Card */}
            <div className="bg-surface-card border border-border-subtle rounded-lg p-6">
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-gold-primary uppercase tracking-wider mb-4">
                <Shield className="w-4 h-4" />
                <span>{locale === 'bn' ? 'আইনজীবী পরিচিতি' : 'Lead Counsel'}</span>
              </div>
              <h4 className="text-lg font-serif-editorial font-bold text-text-primary mb-1">
                Nijam Uddin (Haq)
              </h4>
              <p className="text-xs text-gold-hover font-medium mb-3">
                {locale === 'bn'
                  ? 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট'
                  : 'Advocate, Supreme Court of Bangladesh'}
              </p>
              <p className="text-xs text-text-muted leading-relaxed mb-5">
                {locale === 'bn'
                  ? 'বাংলাদেশ বার কাউন্সিলে তালিকাভুক্ত আইনজীবী। এলএল.বি. (অনার্স), এলএল.এম., চট্টগ্রাম বিশ্ববিদ্যালয়।'
                  : 'Enrolled / Certified with Bangladesh Bar Council. LL.B. (Honours), LL.M., University of Chittagong.'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/about')}
              >
                <span>{locale === 'bn' ? 'পূর্ণাঙ্গ প্রোফাইল ও সনদ' : 'View Full Profile & Pedigree'}</span>
              </Button>
            </div>

            {/* 3. Chamber Advisory Inquiry CTA */}
            <div className="bg-gradient-to-br from-surface-elevated to-surface-card border border-gold-border/70 rounded-lg p-6 shadow-sm">
              <h4 className="text-base font-serif-editorial font-bold text-text-primary mb-2">
                {locale === 'bn' ? 'আইনি পরামর্শ ও চেম্বার যোগাযোগ' : 'Chamber Consultation'}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed mb-5">
                {locale === 'bn'
                  ? 'এই বিষয়ে কোনো আইনি বিরোধ বা মামলার পরামর্শের জন্য চেম্বারে যোগাযোগ করুন।'
                  : 'For tailored case analysis or jurisdictional advice regarding this domain, submit a chamber inquiry.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigate('/about#contact');
                }}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{locale === 'bn' ? 'পরামর্শের জন্য যোগাযোগ' : 'Inquire with Chamber'}</span>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
