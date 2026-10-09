import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CaseCard } from '@/components/cards/CaseCard';
import { useTranslation } from '@/i18n';
import { courtroomApi } from '@/api/courtroom';
import { CourtroomExperience } from '@/types/courtroom';
import {
  ChevronLeft,
  Gavel,
  Scale,
  Calendar,
  Building,
  FileText,
  Download,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CourtroomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<CourtroomExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await courtroomApi.getCourtroomExperienceBySlug(slug);
        if (response.success && response.data) {
          setExperience(response.data);
        } else {
          setError(response.message || 'Courtroom experience record not found.');
        }
      } catch (err: any) {
        console.error('Failed to load courtroom detail:', err);
        setError(
          err?.response?.data?.message ||
            'The requested courtroom experience could not be found or has not been published.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
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

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-background-base text-text-primary py-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <AlertCircle className="w-16 h-16 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-serif-editorial font-bold text-text-primary mb-3">
            {locale === 'bn' ? 'মামলা খুঁজে পাওয়া যায়নি' : 'Record Not Found'}
          </h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            {error ||
              (locale === 'bn'
                ? 'অনুরোধ করা বিচারিক মামলার বিবরণ উন্মুক্ত নয় বা অপসারিত হয়েছে।'
                : 'The requested judicial record could not be found or has been withdrawn from public view.')}
          </p>
          <Button variant="primary" onClick={() => navigate('/courtroom')}>
            {locale === 'bn' ? 'আদালতকক্ষ আর্কাইভে ফিরুন' : 'Return to Courtroom'}
          </Button>
        </div>
      </div>
    );
  }

  const title = resolveText(experience.title);
  const summary = resolveText(experience.summary);
  const description = resolveText(experience.description);
  const issues = resolveText(experience.issues);
  const argumentsText = resolveText(experience.arguments);
  const outcome = resolveText(experience.outcome);
  const legalArea = resolveText(experience.legal_area);
  const role = resolveText(experience.role);
  const practiceAreaTitle = experience.practice_area ? resolveText(experience.practice_area.title) : null;

  return (
    <div className="min-h-screen bg-background-base text-text-primary pb-32">
      {/* Top Breadcrumb & Return Bar */}
      <div className="border-b border-border-subtle bg-surface-base/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/courtroom"
            className="inline-flex items-center gap-2 text-xs font-medium text-text-muted hover:text-gold-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{locale === 'bn' ? 'সকল মামলা ও অভিজ্ঞতা' : 'All Courtroom Experiences'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated border border-border-subtle text-text-subtle font-mono">
              {experience.court}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-primary font-mono">
              {experience.year}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-primary">
              {legalArea}
            </span>
            {experience.case_number && (
              <>
                <span className="text-text-subtle">•</span>
                <span className="text-xs font-mono text-text-subtle">
                  {experience.case_number}
                </span>
              </>
            )}
            <span className="text-text-subtle">•</span>
            <span className="text-xs font-medium text-text-muted">
              {experience.case_type}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold text-text-primary leading-tight mb-6">
            {title}
          </h1>

          {/* Advocate Role Callout */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-surface-elevated/60 border border-gold-primary/20 text-text-primary text-sm mb-6">
            <Briefcase className="w-4 h-4 text-gold-primary" />
            <span className="text-xs text-text-muted">{locale === 'bn' ? 'অ্যাডভোকেটের ভূমিকা:' : 'Advocate Role:'}</span>
            <span className="font-semibold text-gold-primary">{role}</span>
          </div>

          {summary && (
            <p className="text-lg text-text-muted leading-relaxed max-w-4xl font-light">
              {summary}
            </p>
          )}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Dossier Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Case Background / Detailed Narrative */}
            {description && (
              <section className="bg-surface-elevated/20 border border-border-subtle rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-4 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'মামলার প্রেক্ষাপট ও বিবরণ' : 'Case Background & Narrative'}</span>
                </h2>
                <div
                  className="prose prose-invert prose-gold max-w-none text-text-muted leading-relaxed text-sm sm:text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </section>
            )}

            {/* Legal Issues */}
            {issues && (
              <section className="bg-surface-elevated/20 border border-border-subtle rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-4 flex items-center gap-2.5">
                  <Scale className="w-5 h-5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'মূল আইনি প্রশ্নসমূহ' : 'Substantive Legal Issues'}</span>
                </h2>
                <div
                  className="prose prose-invert prose-gold max-w-none text-text-muted leading-relaxed text-sm sm:text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: issues }}
                />
              </section>
            )}

            {/* Arguments & Submissions */}
            {argumentsText && (
              <section className="bg-surface-elevated/20 border border-border-subtle rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-4 flex items-center gap-2.5">
                  <Gavel className="w-5 h-5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'উপস্থাপিত যুক্তি ও আইনি সিদ্ধান্ত' : 'Submissions & Advocacy Arguments'}</span>
                </h2>
                <div
                  className="prose prose-invert prose-gold max-w-none text-text-muted leading-relaxed text-sm sm:text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: argumentsText }}
                />
              </section>
            )}

            {/* Outcome & Order */}
            {outcome && (
              <section className="bg-surface-elevated/30 border border-gold-primary/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-4 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'আদালতের আদেশ / রায়' : 'Judicial Outcome & Disposition'}</span>
                </h2>
                <div
                  className="prose prose-invert prose-gold max-w-none text-text-muted leading-relaxed text-sm sm:text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: outcome }}
                />
              </section>
            )}

            {/* Public Documents Section */}
            {experience.documents && experience.documents.length > 0 && (
              <section className="bg-surface-elevated/20 border border-border-subtle rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-serif-editorial font-bold text-text-primary mb-6 flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-gold-primary" />
                  <span>{locale === 'bn' ? 'প্রকাশিত নথি ও আদেশপত্র' : 'Public Court Orders & Briefs'}</span>
                </h2>
                <div className="space-y-3">
                  {experience.documents.map((doc) => {
                    const docTitle = resolveText(doc.title);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-base border border-border-subtle hover:border-gold-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gold-primary" />
                          <div>
                            <h4 className="text-sm font-medium text-text-primary">{docTitle}</h4>
                            <span className="text-xs text-text-subtle font-mono">
                              {doc.document_type || 'Legal Document'}
                            </span>
                          </div>
                        </div>

                        <a
                          href={doc.download_url}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gold-primary/10 text-gold-primary hover:bg-gold-primary/20 border border-gold-primary/30 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{locale === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Metadata Column */}
          <div className="space-y-8">
            {/* Judicial Details Card */}
            <div className="bg-surface-elevated/30 border border-border-subtle rounded-2xl p-6 space-y-5">
              <h3 className="text-base font-serif-editorial font-bold text-text-primary border-b border-border-subtle pb-3">
                {locale === 'bn' ? 'মামলার তথ্যপঞ্জি' : 'Case Specifications'}
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-text-subtle block mb-1">{locale === 'bn' ? 'আদালত' : 'Forum / Court'}</span>
                  <span className="text-text-primary font-medium text-sm flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gold-primary" />
                    {experience.court}
                  </span>
                </div>

                <div>
                  <span className="text-text-subtle block mb-1">{locale === 'bn' ? 'মামলার ধরন' : 'Case Type'}</span>
                  <span className="text-text-primary font-medium text-sm">{experience.case_type}</span>
                </div>

                {experience.case_number && (
                  <div>
                    <span className="text-text-subtle block mb-1">{locale === 'bn' ? 'মামলা নম্বর' : 'Case Identifier'}</span>
                    <span className="text-text-primary font-mono text-sm">{experience.case_number}</span>
                  </div>
                )}

                <div>
                  <span className="text-text-subtle block mb-1">{locale === 'bn' ? 'বছর' : 'Year'}</span>
                  <span className="text-text-primary font-mono text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-primary" />
                    {experience.year}
                  </span>
                </div>

                {experience.judgment_date && (
                  <div>
                    <span className="text-text-subtle block mb-1">{locale === 'bn' ? 'রায়ের তারিখ' : 'Judgment Date'}</span>
                    <span className="text-text-primary font-mono text-sm">{experience.judgment_date}</span>
                  </div>
                )}

                <div>
                  <span className="text-text-subtle block mb-1">{locale === 'bn' ? 'আইনি ক্ষেত্র' : 'Legal Field'}</span>
                  <span className="text-gold-primary font-medium text-sm">{legalArea}</span>
                </div>
              </div>

              {/* Related Practice Area Link */}
              {experience.practice_area && (
                <div className="pt-4 border-t border-border-subtle">
                  <span className="text-xs text-text-subtle block mb-2">
                    {locale === 'bn' ? 'সম্পর্কিত প্র্যাকটিস এরিয়া' : 'Related Practice Area'}
                  </span>
                  <Link
                    to={`/practice-areas/${experience.practice_area.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-gold-primary hover:text-gold-hover transition-colors group"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{practiceAreaTitle}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Courtroom Experiences */}
        {experience.related_experiences && experience.related_experiences.length > 0 && (
          <section className="mt-24 pt-12 border-t border-border-subtle">
            <h2 className="text-2xl font-serif-editorial font-bold text-text-primary mb-8">
              {locale === 'bn' ? 'সম্পর্কিত অন্যান্য মামলা ও অভিজ্ঞতা' : 'Related Judicial Engagements'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experience.related_experiences.map((rel) => (
                <CaseCard
                  key={rel.id}
                  title={resolveText(rel.title)}
                  court={rel.court}
                  year={rel.year}
                  legalArea={resolveText(rel.legal_area)}
                  caseNumber={rel.case_number || undefined}
                  summary={resolveText(rel.summary)}
                  onReadCase={() => navigate(`/courtroom/${rel.slug}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
