import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { judgmentsApi } from '@/api/judgments';
import { JudgmentReview } from '@/types';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  Calendar,
  Scale,
  FileText,
  Download,
  AlertCircle,
  Share2,
  Bookmark,
  Gavel,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const JudgmentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { locale } = useTranslation();

  const [judgment, setJudgment] = useState<JudgmentReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchJudgmentDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const res = await judgmentsApi.getJudgmentBySlug(slug);
        if (res.success && res.data) {
          setJudgment(res.data);
        } else {
          setError(res.message || 'Judgment review not found.');
        }
      } catch (err: any) {
        console.error('Failed to fetch judgment review:', err);
        setError(
          err.response?.status === 404
            ? locale === 'bn'
              ? 'অনুরোধকৃত রায়ের পর্যালোচনা পাওয়া যায়নি বা এখনও প্রকাশিত হয়নি।'
              : 'The requested judgment review was not found or is currently unpublished.'
            : locale === 'bn'
            ? 'সার্ভার থেকে তথ্য লোড করতে সমস্যা হয়েছে।'
            : 'An error occurred while loading this judgment review dossier.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJudgmentDetail();
    window.scrollTo(0, 0);
  }, [slug, locale]);

  const resolveText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val.en || val.bn || '';
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-judicial-bg text-white py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mb-4" />
          <p className="text-gray-400 font-serif">
            {locale === 'bn' ? 'নথি লোড হচ্ছে...' : 'Opening judicial dossier...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !judgment) {
    return (
      <div className="min-h-screen bg-judicial-bg text-white py-24">
        <SeoHead
          title={locale === 'bn' ? 'নথি পাওয়া যায়নি | চেম্বার' : 'Judgment Review Not Found | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-red-200 mb-3">
              {locale === 'bn' ? 'নথি পাওয়া যায়নি' : 'Judgment Review Not Found'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <Button variant="secondary" onClick={() => navigate('/judgments')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {locale === 'bn' ? 'রায় নির্দেশিকায় ফিরুন' : 'Back to Judgments Directory'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const caseName = resolveText(judgment.case_name);
  const legalArea = resolveText(judgment.legal_area);
  const summary = resolveText(judgment.summary);
  const keyIssues = resolveText(judgment.key_issues);
  const courtDecision = resolveText(judgment.court_decision);
  const authorAnalysis = resolveText(judgment.author_analysis);
  const practicalSignificance = resolveText(judgment.practical_significance);
  const authorName = resolveText(judgment.author);

  return (
    <article className="min-h-screen bg-judicial-bg text-white pb-32">
      <SeoHead
        title={`${caseName} | ${locale === 'bn' ? 'রায় ও পর্যালোচনা | অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Judgment Review | Advocate Nijam Uddin (Haq)'}`}
        description={summary || (locale === 'bn' ? `${caseName} মামলার রায় পর্যালোচনা ও আইনি বিশ্লেষণ।` : `Authoritative review and legal analysis of ${caseName}.`)}
        canonical={`/judgments/${slug}`}
        ogType="article"
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'রায় ও পর্যালোচনা' : 'Judgments', path: '/judgments' },
          { name: caseName, path: `/judgments/${slug}` },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: caseName,
          description: summary,
          author: {
            '@type': 'Person',
            name: authorName || 'Advocate Nijam Uddin (Haq)',
          },
          url: `https://nijamuddin.com/judgments/${slug}`,
        }}
      />
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="border-b border-judicial-border/40 bg-black/20 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-5xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <Link to="/" className="hover:text-gold transition-colors">
              {locale === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <span>/</span>
            <Link to="/judgments" className="hover:text-gold transition-colors">
              {locale === 'bn' ? 'রায় ও পর্যালোচনা' : 'Judgments'}
            </Link>
            <span>/</span>
            <span className="text-gold truncate max-w-[200px] sm:max-w-xs">{caseName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-judicial-border hover:border-gold/50 text-gray-300 hover:text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-gold" />
              <span>{copied ? (locale === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (locale === 'bn' ? 'শেয়ার' : 'Share')}</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/judgments')}
              className="flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              {locale === 'bn' ? 'তালিকায় ফিরুন' : 'Back to Directory'}
            </Button>
          </div>
        </div>
      </div>

      {/* Case Header Dossier */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 max-w-5xl">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-gold/10 border border-gold/40 rounded-md text-gold font-mono text-sm font-bold tracking-wide">
              {judgment.citation}
            </span>
            {judgment.practice_area && (
              <Badge variant="outline">
                {resolveText(judgment.practice_area.title)}
              </Badge>
            )}
            {legalArea && (
              <span className="text-xs text-gray-400 font-serif">
                {legalArea}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {caseName}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-400 border-t border-b border-judicial-border/40 py-3 mt-6">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-gold" />
              <span className="text-gray-200">{judgment.court}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" />
              <span>
                {judgment.judgment_date
                  ? judgment.judgment_date.substring(0, 10)
                  : locale === 'bn'
                  ? 'তারিখ অনুপলব্ধ'
                  : 'Date unrecorded'}
              </span>
            </div>

            {authorName && (
              <div className="text-xs text-gray-400">
                {locale === 'bn' ? 'পর্যালোচক:' : 'Reviewed by:'}{' '}
                <span className="text-gold font-semibold">{authorName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Analysis Body */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-12">
        {/* 1. Judgment Summary */}
        <section className="bg-judicial-card/50 border border-judicial-border rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-gold mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            {locale === 'bn' ? 'মামলার সারসংক্ষেপ' : 'Case Summary'}
          </h2>
          <div
            className="text-base sm:text-lg text-gray-200 leading-relaxed font-serif prose-invert"
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </section>

        {/* 2. Key Legal Issues */}
        {keyIssues && (
          <section className="bg-black/30 border border-judicial-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-gold" />
              {locale === 'bn' ? 'প্রধান আইনি বিচার্য বিষয়সমূহ' : 'Key Legal Issues Framed'}
            </h2>
            <div
              className="text-sm sm:text-base text-gray-300 leading-relaxed prose-invert font-serif"
              dangerouslySetInnerHTML={{ __html: keyIssues }}
            />
          </section>
        )}

        {/* 3. COURT'S DECISION / RATIO DECIDENDI (Distinct Judicial Holding) */}
        <section className="bg-gradient-to-br from-gold/10 via-black/40 to-black/60 border-2 border-gold/50 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-5 pointer-events-none">
            <Gavel className="w-64 h-64 text-gold" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gold/20 rounded-xl text-gold border border-gold/40">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-bold font-mono">
                {locale === 'bn' ? 'অফিসিয়াল আদালতের সিদ্ধান্ত' : 'OFFICIAL COURT HOLDING'}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {locale === 'bn' ? 'আদালতের রায় ও অনুসিদ্ধান্ত (Ratio Decidendi)' : "Court's Decision & Ratio Decidendi"}
              </h2>
            </div>
          </div>

          <div className="text-xs text-gold/80 mb-6 bg-gold/10 px-4 py-2 rounded-lg border border-gold/20">
            {locale === 'bn'
              ? 'নিচের অংশটি আদালতের প্রদত্ত আনুষ্ঠানিক আদেশ এবং আইনি অনুসিদ্ধান্তের উদ্ধৃতি।'
              : 'The following text represents the authoritative judicial ruling delivered by the Bench.'}
          </div>

          <div
            className="text-base sm:text-lg text-gray-100 leading-relaxed font-serif prose-invert space-y-4"
            dangerouslySetInnerHTML={{ __html: courtDecision }}
          />
        </section>

        {/* 4. AUTHOR'S ANALYSIS & PRACTICAL COMMENTARY (Distinct Editorial Voice) */}
        <section className="bg-gradient-to-br from-blue-950/20 via-black/40 to-black/60 border-2 border-blue-500/40 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold font-mono">
                {locale === 'bn' ? 'আইনজ্ঞের বিশ্লেষণমূলক মন্তব্য' : "ADVOCATE'S DOCTRINAL COMMENTARY"}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {locale === 'bn' ? 'লেখকের বিশ্লেষণ ও মতামত' : "Author's Analysis & Commentary"}
              </h2>
            </div>
          </div>

          <div className="text-xs text-blue-300/80 mb-6 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
            {locale === 'bn'
              ? 'এটি আইনজ্ঞ অ্যাডভোকেট নিজাম উদ্দিনের বিশ্লেষণমূলক প্রাতিষ্ঠানিক মন্তব্য; এটি কোনো আদালতের আদেশ নয়।'
              : "This section contains professional doctrinal analysis by the legal author and is distinct from the court's decree."}
          </div>

          <div
            className="text-base sm:text-lg text-gray-200 leading-relaxed font-serif prose-invert space-y-4"
            dangerouslySetInnerHTML={{ __html: authorAnalysis }}
          />
        </section>

        {/* 5. Practical Significance */}
        {practicalSignificance && (
          <section className="bg-judicial-card/40 border border-judicial-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-gold mb-3">
              {locale === 'bn' ? 'ব্যবহারিক ও প্রয়োগিক তাৎপর্য' : 'Practical & Doctrinal Significance'}
            </h2>
            <div
              className="text-sm sm:text-base text-gray-300 leading-relaxed font-serif prose-invert"
              dangerouslySetInnerHTML={{ __html: practicalSignificance }}
            />
          </section>
        )}

        {/* 6. Judgment Document PDF Banner */}
        {judgment.has_pdf && judgment.pdf_download_url && (
          <section className="bg-black/50 border border-gold/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl text-gold">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {locale === 'bn' ? 'মূল রায় বা সার্টিফাইড অনুলিপি' : 'Complete Judgment Monograph (PDF)'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {locale === 'bn'
                    ? 'আদালতের আনুষ্ঠানিক রায় ও পূর্ণাঙ্গ নথির পিডিএফ কপি ডাউনলোড করুন।'
                    : 'Download the authoritative law report monograph or certified judicial text.'}
                </p>
              </div>
            </div>

            <a
              href={judgment.pdf_download_url}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-gold text-black font-semibold rounded-xl hover:bg-gold-light transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              {locale === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download Document'}
            </a>
          </section>
        )}

        {/* 7. Cross-Referenced Legal Research Paper */}
        {judgment.legal_research && (
          <section className="bg-judicial-card/30 border border-judicial-border rounded-2xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-gold" />
              <div>
                <span className="text-xs uppercase tracking-wider text-gold font-bold font-mono">
                  {locale === 'bn' ? 'সম্পর্কিত গবেষণা প্রবন্ধ' : 'REFERENCED LEGAL RESEARCH PAPER'}
                </span>
                <h4 className="text-base font-serif font-bold text-white mt-0.5">
                  {resolveText(judgment.legal_research.title)}
                </h4>
              </div>
            </div>
            <Link
              to={`/research/${judgment.legal_research.slug}`}
              className="text-gold text-xs font-semibold flex items-center gap-1 hover:underline whitespace-nowrap"
            >
              <span>{locale === 'bn' ? 'গবেষণা পড়ুন' : 'Read Treatise'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </section>
        )}

        {/* 8. Related Judgment Reviews */}
        {judgment.related_judgments && judgment.related_judgments.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-judicial-border/60">
            <h2 className="text-2xl font-serif font-bold text-white">
              {locale === 'bn' ? 'সম্পর্কিত যুগান্তকারী সিদ্ধান্তসমূহ' : 'Related Judicial Decisions'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {judgment.related_judgments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/judgments/${item.slug}`)}
                  className="bg-judicial-card/40 border border-judicial-border hover:border-gold/50 rounded-xl p-5 cursor-pointer transition-colors space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-gold font-mono text-xs font-semibold">{item.citation}</span>
                    <h3 className="font-serif font-bold text-white text-base mt-1 line-clamp-2">
                      {resolveText(item.case_name)}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-2">{resolveText(item.summary)}</p>
                  </div>
                  <div className="pt-2 text-gold text-xs font-semibold flex items-center gap-1">
                    <span>{locale === 'bn' ? 'রায় দেখুন' : 'View Decision'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  );
};
