import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PracticeAreaIcon } from '@/components/icons/PracticeAreaIcon';
import { useTranslation } from '@/i18n';
import { practiceAreaApi } from '@/api/practiceAreas';
import { PracticeArea } from '@/types/practiceArea';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Scale,
  AlertCircle,
  FileCheck,
  FileText,
  Users,
  BookOpen,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const PracticeAreaDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();
  const { openConsultation } = useOutletContext<{ openConsultation?: () => void }>() || {};

  const [practiceArea, setPracticeArea] = useState<PracticeArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchArea = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await practiceAreaApi.getPracticeAreaBySlug(slug);
        if (response.success && response.data) {
          setPracticeArea(response.data);
          // Expand first FAQ by default
          setExpandedFaqs({ 0: true });
        } else {
          setError(response.message || 'Practice area not found.');
        }
      } catch (err: any) {
        console.error('Failed to load practice area detail:', err);
        setError(
          err?.response?.data?.message ||
            (locale === 'bn'
              ? 'অনুরোধকৃত আইনি সেবাটি পাওয়া যায়নি অথবা এখনো প্রকাশিত হয়নি।'
              : 'The requested legal practice domain could not be found or has not been published.')
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

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAllFaqs = () => {
    const allExpanded =
      practiceArea?.faqs &&
      practiceArea.faqs.length > 0 &&
      practiceArea.faqs.every((_, i) => expandedFaqs[i]);

    if (allExpanded) {
      setExpandedFaqs({});
    } else {
      const newState: Record<number, boolean> = {};
      practiceArea?.faqs?.forEach((_, i) => {
        newState[i] = true;
      });
      setExpandedFaqs(newState);
    }
  };

  const handleConsultation = () => {
    if (openConsultation) {
      openConsultation();
    } else {
      navigate('/about#contact');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-base text-text-primary pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="w-48 h-4 bg-surface-elevated rounded mb-8" />
          <div className="w-3/4 h-12 bg-surface-elevated rounded mb-6" />
          <div className="w-full h-6 bg-surface-elevated rounded mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <div className="w-full h-48 bg-surface-elevated rounded" />
              <div className="w-full h-64 bg-surface-elevated rounded" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="w-full h-72 bg-surface-elevated rounded" />
              <div className="w-full h-64 bg-surface-elevated rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !practiceArea) {
    return (
      <div className="min-h-screen bg-background-base text-text-primary flex items-center justify-center px-4 pt-28 pb-16">
        <SeoHead
          title={locale === 'bn' ? 'আইনি সেবাটি পাওয়া যায়নি | চেম্বার' : 'Service Not Found | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="max-w-md w-full bg-surface-card border border-border-subtle rounded-lg p-8 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-gold-primary mx-auto mb-4" />
          <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-2">
            {locale === 'bn' ? 'আইনি সেবাটি পাওয়া যায়নি' : 'Service Not Found'}
          </h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {error ||
              (locale === 'bn'
                ? 'অনুরোধকৃত প্র্যাকটিস এরিয়াটি সক্রিয় নেই বা বিদ্যমান নেই।'
                : 'The requested service is not published or does not exist.')}
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/services')}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            {locale === 'bn' ? 'সকল আইনি সেবাসমূহ' : 'Back to Services'}
          </Button>
        </div>
      </div>
    );
  }

  const title = resolveText(practiceArea.title);
  const shortDesc = resolveText(practiceArea.short_description);
  const fullDesc = resolveText(practiceArea.full_description);
  const tagline = resolveText(practiceArea.tagline);
  const atGlance = practiceArea.at_a_glance;
  const assistanceList = practiceArea.areas_of_assistance || [];
  const concernsList = practiceArea.common_concerns || [];
  const processList = practiceArea.legal_process || [];
  const checklist = practiceArea.document_checklist || [];
  const faqs = practiceArea.faqs || [];
  const relatedServices = practiceArea.related_services || [];

  return (
    <div className="min-h-screen bg-background-base text-text-primary selection:bg-gold-primary/20 selection:text-gold-hover pb-16">
      <SeoHead
        title={`${title} | ${locale === 'bn' ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Chambers of Advocate Nijam Uddin (Haq)'}`}
        description={
          shortDesc ||
          (locale === 'bn'
            ? `${title} সংক্রান্ত বিশেষায়িত আইনি সেবা ও প্রতিনিধিত্ব।`
            : `Specialized legal representation in ${title} by Advocate Nijam Uddin (Haq).`)
        }
        canonical={`/services/${slug}`}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'আইনি সেবাসমূহ' : 'Services', path: '/services' },
          { name: title, path: `/services/${slug}` },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LegalService',
          name: `${title} — Chambers of Advocate Nijam Uddin (Haq)`,
          description: shortDesc,
          url: `https://nijamuddin.com/services/${slug}`,
          provider: {
            '@type': 'Person',
            name: 'Advocate Nijam Uddin (Haq)',
            jobTitle: 'Advocate, Supreme Court of Bangladesh',
          },
        }}
      />

      {/* 1. HERO SECTION WITH EMBLEM & BREADCRUMBS */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-background-secondary border-b border-border-subtle overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-xs text-text-muted mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold-primary transition-colors">
              {locale === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/40" />
            <Link to="/services" className="hover:text-gold-primary transition-colors">
              {locale === 'bn' ? 'আইনি সেবাসমূহ' : 'Services'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/40" />
            <span className="text-gold-primary font-medium truncate max-w-xs sm:max-w-md">
              {title}
            </span>
          </nav>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Title, Intro & Primary Action */}
            <div className="lg:col-span-8 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold text-white tracking-tight leading-tight">
                {title}
              </h1>

              {shortDesc && (
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-light">
                  {shortDesc}
                </p>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConsultation}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  className="shadow-xl group cursor-pointer"
                >
                  {locale === 'bn' ? 'পরামর্শের আবেদন করুন' : 'Request a Consultation'}
                </Button>
              </div>
            </div>

            {/* Right Column: Hero Visual Emblem & Tagline */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <div className="rounded-2xl border border-gold-border/60 bg-surface-elevated/70 backdrop-blur-md p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold-primary/20 to-gold-primary/5 border border-gold-border flex items-center justify-center text-gold-primary shadow-inner">
                  <PracticeAreaIcon name={practiceArea.icon_name} className="w-8 h-8" />
                </div>

                <p className="text-xs sm:text-sm font-serif-editorial font-medium text-slate-200 leading-snug">
                  {tagline ||
                    (locale === 'bn'
                      ? 'আইনি প্রক্রিয়া ও ন্যায্য অধিকারের সুরক্ষা'
                      : 'Protecting rights through fair legal process')}
                </p>

                <div className="w-16 h-0.5 bg-gold-primary/60 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: OVERVIEW, ASSISTANCE, CONCERNS, PROCESS, CHECKLIST */}
          <main className="lg:col-span-8 space-y-14">
            {/* Section 2 — Overview */}
            <section id="overview" aria-labelledby="overview-heading" className="space-y-4">
              <div>
                <h2 id="overview-heading" className="text-2xl sm:text-3xl font-serif-editorial font-bold text-text-primary">
                  {locale === 'bn' ? 'সারসংক্ষেপ ও আইনি প্রেক্ষাপট' : 'Overview'}
                </h2>
                <div className="w-12 h-0.5 bg-gold-primary mt-2" />
              </div>

              {fullDesc ? (
                <div
                  className="prose prose-invert prose-gold max-w-none text-text-muted leading-relaxed text-sm sm:text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: fullDesc }}
                />
              ) : (
                <p className="text-sm text-text-muted italic">
                  {locale === 'bn'
                    ? 'আইনি পরিধির বিস্তারিত বিবরণ শীঘ্রই সংযুক্ত করা হবে।'
                    : 'Detailed overview and framework will be updated shortly.'}
                </p>
              )}
            </section>

            {/* Section 3 — Areas of Assistance (6 Cards Grid) */}
            {assistanceList.length > 0 && (
              <section id="areas-of-assistance" aria-labelledby="assistance-heading" className="space-y-6">
                <div>
                  <h2 id="assistance-heading" className="text-2xl sm:text-3xl font-serif-editorial font-bold text-text-primary">
                    {locale === 'bn' ? 'যেসব ক্ষেত্রে আইনি সহায়তা' : 'Areas of Assistance'}
                  </h2>
                  <div className="w-12 h-0.5 bg-gold-primary mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {assistanceList.map((item, index) => (
                    <div
                      key={index}
                      className="bg-surface-card border border-border-subtle rounded-xl p-5 hover:border-gold-border/80 transition-all shadow-xs group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-surface-elevated text-gold-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <PracticeAreaIcon name={item.icon || 'file-text'} className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-serif-editorial font-bold text-text-primary mb-1.5 group-hover:text-gold-primary transition-colors">
                        {resolveText(item.title)}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                        {resolveText(item.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 5 — Common Legal Concerns (6 Checklist Items) */}
            {concernsList.length > 0 && (
              <section id="common-concerns" aria-labelledby="concerns-heading" className="space-y-6">
                <div>
                  <h2 id="concerns-heading" className="text-2xl sm:text-3xl font-serif-editorial font-bold text-text-primary">
                    {locale === 'bn' ? 'সাধারণ আইনি প্রশ্ন ও উদ্বেগ' : 'Common Legal Concerns'}
                  </h2>
                  <div className="w-12 h-0.5 bg-gold-primary mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {concernsList.map((concern, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3.5 rounded-lg bg-surface-card/60 border border-border-subtle/70"
                    >
                      <CheckCircle2 className="w-5 h-5 text-gold-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
                        {resolveText(concern.question)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 6 — Legal Process (General Overview) (5 Connected Steps) */}
            {processList.length > 0 && (
              <section id="legal-process" aria-labelledby="process-heading" className="space-y-6">
                <div>
                  <h2 id="process-heading" className="text-2xl sm:text-3xl font-serif-editorial font-bold text-text-primary">
                    {locale === 'bn' ? 'আইনি প্রক্রিয়া (সাধারণ রূপরেখা)' : 'Legal Process (General Overview)'}
                  </h2>
                  <div className="w-12 h-0.5 bg-gold-primary mt-2" />
                </div>

                <div className="relative rounded-2xl bg-surface-card border border-border-subtle p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-3 items-start relative">
                    {processList.map((step, index) => (
                      <div key={index} className="flex flex-col items-center text-center relative group">
                        {/* Step Icon Badge */}
                        <div className="w-12 h-12 rounded-full border border-gold-border/70 bg-surface-elevated text-gold-primary flex items-center justify-center font-bold text-sm shadow-sm group-hover:border-gold-primary transition-colors">
                          <PracticeAreaIcon name={step.icon || 'scale'} className="w-5 h-5" />
                        </div>

                        {/* Step Title */}
                        <h4 className="text-xs sm:text-sm font-serif-editorial font-bold text-text-primary mt-3 mb-1">
                          {step.step ? `${step.step}. ` : `${index + 1}. `}
                          {resolveText(step.title)}
                        </h4>

                        {/* Step Description */}
                        <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed">
                          {resolveText(step.description)}
                        </p>

                        {/* Arrow separator (hidden on mobile and last item) */}
                        {index < processList.length - 1 && (
                          <div className="hidden md:block absolute -right-3 top-5 text-gold-primary/40 pointer-events-none">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Section 7 — Document Checklist */}
            {checklist.length > 0 && (
              <section id="document-checklist" aria-labelledby="checklist-heading" className="space-y-6">
                <div>
                  <h2 id="checklist-heading" className="text-2xl sm:text-3xl font-serif-editorial font-bold text-text-primary">
                    {locale === 'bn' ? 'প্রারম্ভিক সভার জন্য প্রয়োজনীয় নথিপত্র' : 'Document Checklist for Consultation'}
                  </h2>
                  <div className="w-12 h-0.5 bg-gold-primary mt-2" />
                </div>

                <div className="rounded-xl bg-surface-card border border-border-subtle p-6 space-y-3">
                  <p className="text-xs sm:text-sm text-text-muted mb-4 italic">
                    {locale === 'bn'
                      ? 'মামলার প্রাথমিক পর্যালোচনার সুবিধার্থে সম্ভব হলে নিচের নথিপত্র সঙ্গে নিয়ে আসুন:'
                      : 'To facilitate a comprehensive preliminary legal review, please organize the following documents where available:'}
                  </p>
                  <ul className="space-y-2.5">
                    {checklist.map((doc, index) => (
                      <li key={index} className="flex items-start space-x-3 text-xs sm:text-sm text-text-primary">
                        <FileCheck className="w-4 h-4 text-gold-primary flex-shrink-0 mt-0.5" />
                        <span>{resolveText(doc.item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Contextual Consultation Prompt within Content */}
            <div className="rounded-xl border border-gold-border/60 bg-gradient-to-r from-surface-elevated to-surface-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-serif-editorial font-bold text-text-primary">
                  {locale === 'bn' ? 'এই বিষয়ে কোনো আইনি প্রশ্ন রয়েছে?' : 'Have specific questions regarding this area?'}
                </h4>
                <p className="text-xs text-text-muted">
                  {locale === 'bn'
                    ? 'আপনার মামলার নথিপত্র পর্যালোচনার জন্য সরাসরি চেম্বারে যোগাযোগ করুন।'
                    : 'Arrange a formal case review with the chamber for legal assessment.'}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConsultation}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                className="cursor-pointer flex-shrink-0"
              >
                {locale === 'bn' ? 'পরামর্শ বুক করুন' : 'Book Consultation'}
              </Button>
            </div>
          </main>

          {/* RIGHT COLUMN SIDEBAR: AT A GLANCE + FAQS + PEDIGREE */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Section 4 — At a Glance Card */}
            {atGlance && (
              <div className="bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-7 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-text-primary">
                    {locale === 'bn' ? 'এক নজরে' : 'At a Glance'}
                  </h3>
                  <div className="w-10 h-0.5 bg-gold-primary mt-1.5" />
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Area */}
                  {atGlance.area && (
                    <div className="flex items-start space-x-3 pb-3 border-b border-border-subtle/70">
                      <Scale className="w-4 h-4 text-gold-primary flex-shrink-0 mt-1" />
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                          {locale === 'bn' ? 'আইনি ক্ষেত্র' : 'Area'}
                        </span>
                        <span className="font-medium text-text-primary">{resolveText(atGlance.area)}</span>
                      </div>
                    </div>
                  )}

                  {/* Who It May Help */}
                  {atGlance.who_it_may_help && (
                    <div className="flex items-start space-x-3 pb-3 border-b border-border-subtle/70">
                      <Users className="w-4 h-4 text-gold-primary flex-shrink-0 mt-1" />
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                          {locale === 'bn' ? 'যাদের জন্য প্রাসঙ্গিক' : 'Who It May Help'}
                        </span>
                        <span className="font-medium text-text-primary">{resolveText(atGlance.who_it_may_help)}</span>
                      </div>
                    </div>
                  )}

                  {/* Related Matters */}
                  {atGlance.related_matters && (
                    <div className="flex items-start space-x-3 pb-3 border-b border-border-subtle/70">
                      <FileText className="w-4 h-4 text-gold-primary flex-shrink-0 mt-1" />
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                          {locale === 'bn' ? 'সংশ্লিষ্ট বিষয়সমূহ' : 'Related Matters'}
                        </span>
                        <span className="font-medium text-text-primary">{resolveText(atGlance.related_matters)}</span>
                      </div>
                    </div>
                  )}

                  {/* Jurisdiction */}
                  {atGlance.jurisdiction && (
                    <div className="flex items-start space-x-3 pb-3 border-b border-border-subtle/70">
                      <MapPin className="w-4 h-4 text-gold-primary flex-shrink-0 mt-1" />
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                          {locale === 'bn' ? 'আদালতের এখতিয়ার' : 'Jurisdiction'}
                        </span>
                        <span className="font-medium text-text-primary">{resolveText(atGlance.jurisdiction)}</span>
                      </div>
                    </div>
                  )}

                  {/* Depends On */}
                  {atGlance.depends_on && (
                    <div className="flex items-start space-x-3">
                      <BookOpen className="w-4 h-4 text-gold-primary flex-shrink-0 mt-1" />
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                          {locale === 'bn' ? 'যার ওপর নির্ভরশীল' : 'Depends On'}
                        </span>
                        <span className="font-medium text-text-primary">{resolveText(atGlance.depends_on)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 8 — Frequently Asked Questions (Accordion) */}
            {faqs.length > 0 && (
              <div className="bg-surface-card border border-border-subtle rounded-xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif-editorial font-bold text-text-primary">
                      {locale === 'bn' ? 'সাধারণ প্রশ্নোত্তর' : 'Frequently Asked Questions'}
                    </h3>
                    <div className="w-10 h-0.5 bg-gold-primary mt-1.5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = !!expandedFaqs[index];
                    return (
                      <div
                        key={index}
                        className="border border-border-subtle rounded-lg overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(index)}
                          className="w-full p-3.5 text-left flex items-start justify-between gap-3 bg-surface-elevated/40 hover:bg-surface-elevated/80 transition-colors cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-text-primary leading-snug">
                            {resolveText(faq.question)}
                          </span>
                          <span className="text-gold-primary flex-shrink-0 mt-0.5">
                            {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="p-3.5 bg-surface-base/50 text-xs text-text-muted leading-relaxed border-t border-border-subtle/60">
                            {resolveText(faq.answer)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={toggleAllFaqs}
                  className="inline-flex items-center text-xs font-semibold text-gold-hover hover:underline cursor-pointer pt-2"
                >
                  <span>{locale === 'bn' ? 'সকল প্রশ্নোত্তর দেখুন / সংক্ষেপ করুন' : 'View all FAQs / Toggle'}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            )}

            {/* Advocate Verified Pedigree Card */}
            <div className="bg-surface-card border border-border-subtle rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-gold-primary uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>{locale === 'bn' ? 'আইনজীবী পরিচিতি' : 'Lead Counsel'}</span>
              </div>
              <h4 className="text-lg font-serif-editorial font-bold text-text-primary">
                Advocate Nijam Uddin (Haq)
              </h4>
              <p className="text-xs text-gold-hover font-medium">
                {locale === 'bn' ? 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট' : 'Advocate, Supreme Court of Bangladesh'}
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                {locale === 'bn'
                  ? 'বাংলাদেশ বার কাউন্সিলে তালিকাভুক্ত আইনজীবী। এলএল.বি. (অনার্স), এলএল.এম., চট্টগ্রাম বিশ্ববিদ্যালয়।'
                  : 'Enrolled with Bangladesh Bar Council. LL.B. (Honours), LL.M., University of Chittagong.'}
              </p>
              <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => navigate('/about')}>
                <span>{locale === 'bn' ? 'পূর্ণাঙ্গ বিবরণ ও যোগ্যতা' : 'View Chamber Credentials'}</span>
              </Button>
            </div>
          </aside>
        </div>

        {/* Section 9 — Related Services Cards */}
        {relatedServices.length > 0 && (
          <section className="mt-16 sm:mt-20 pt-12 border-t border-border-subtle/80 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-text-primary">
                {locale === 'bn' ? 'সম্পর্কিত অন্যান্য আইনি সেবা' : 'Related Legal Practice Areas'}
              </h2>
              <div className="w-12 h-0.5 bg-gold-primary mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((rel: any) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/services/${rel.slug}`)}
                  className="rounded-xl bg-surface-card border border-border-subtle hover:border-gold-border/80 transition-all p-6 cursor-pointer group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-gold-primary group-hover:scale-105 transition-transform">
                      <PracticeAreaIcon name={rel.icon_name} className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-serif-editorial font-bold text-text-primary group-hover:text-gold-primary transition-colors">
                      {resolveText(rel.title)}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                      {resolveText(rel.short_description)}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border-subtle/60 flex items-center text-xs font-semibold text-gold-hover group-hover:translate-x-1 transition-transform">
                    <span>{locale === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
