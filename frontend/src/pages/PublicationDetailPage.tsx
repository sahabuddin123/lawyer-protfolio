import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicationsApi } from '@/api/publications';
import { Publication } from '@/types';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  Share2,
  ArrowRight,
  ExternalLink,
  User,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export const PublicationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { locale } = useTranslation();

  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const res = await publicationsApi.getPublicationBySlug(slug);
        if (res.success && res.data) {
          setPublication(res.data);
        } else {
          setError(res.message || 'Publication treatise not found.');
        }
      } catch (err: any) {
        console.error('Failed to fetch publication:', err);
        setError(
          err.response?.status === 404
            ? locale === 'bn'
              ? 'অনুরোধকৃত প্রকাশনাটি পাওয়া যায়নি বা এখনও সর্বসাধারণের জন্য উন্মুক্ত করা হয়নি।'
              : 'The requested publication treatise was not found or is currently unpublished.'
            : locale === 'bn'
            ? 'সার্ভার থেকে তথ্য লোড করতে সমস্যা হয়েছে।'
            : 'An error occurred while loading this publication dossier.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
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

  const publicationTypeLabels: Record<string, { en: string; bn: string }> = {
    book: { en: 'Book / Treatise', bn: 'বই / গ্রন্থ' },
    journal_article: { en: 'Journal Article', bn: 'জার্নাল প্রবন্ধ' },
    research_paper: { en: 'Research Paper', bn: 'গবেষণা পত্র' },
    conference_paper: { en: 'Conference Paper', bn: 'কনফারেন্স পেপার' },
    legal_article: { en: 'Legal Article', bn: 'আইনি নিবন্ধ' },
    case_note: { en: 'Case Note', bn: 'মামলা পর্যালোচনা' },
    law_review: { en: 'Law Review', bn: 'আইন সমীক্ষা' },
    legal_opinion: { en: 'Legal Opinion', bn: 'আইনি মতামত' },
    book_chapter: { en: 'Book Chapter', bn: 'পুস্তকাংশ' },
    report: { en: 'Legal Report', bn: 'আইনি প্রতিবেদন' },
    other: { en: 'Publication', bn: 'প্রকাশনা' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-legal-gold border-t-transparent mb-4" />
          <p className="text-neutral-400 font-serif">
            {locale === 'bn' ? 'নথি খোলা হচ্ছে...' : 'Opening publication treatise...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-red-200 mb-3">
              {locale === 'bn' ? 'প্রকাশনা পাওয়া যায়নি' : 'Publication Treatise Not Found'}
            </h2>
            <p className="text-neutral-400 text-sm mb-6">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/publications')}
              className="border-neutral-700 text-neutral-300"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {locale === 'bn' ? 'প্রকাশনা তালিকায় ফিরে যান' : 'Back to Publications'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const title = resolveText(publication.title);
  const author = resolveText(publication.author);
  const sourceName = resolveText(publication.publication_name);
  const excerpt = resolveText(publication.excerpt);
  const content = resolveText(publication.content);
  const categoryName = publication.category ? resolveText(publication.category.name) : null;
  const typeMeta = publicationTypeLabels[publication.publication_type] || {
    en: publication.publication_type,
    bn: publication.publication_type,
  };

  return (
    <article className="min-h-screen bg-[#07090e] text-neutral-100 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-neutral-400 pb-8 border-b border-neutral-800"
        >
          <Link to="/" className="hover:text-legal-gold transition">
            {locale === 'bn' ? 'হোম' : 'Home'}
          </Link>
          <span className="text-neutral-600">/</span>
          <Link to="/publications" className="hover:text-legal-gold transition">
            {locale === 'bn' ? 'প্রকাশনাসমূহ' : 'Publications'}
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300 truncate max-w-xs">{title}</span>
        </nav>

        {/* Dossier Header */}
        <header className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono tracking-wider uppercase text-legal-gold bg-legal-gold/10 px-3 py-1 rounded-full border border-legal-gold/20">
              {locale === 'bn' ? typeMeta.bn : typeMeta.en}
            </span>
            {categoryName && (
              <span className="text-xs text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                {categoryName}
              </span>
            )}
            {publication.is_featured && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                {locale === 'bn' ? 'নির্বাচিত গবেষণা' : 'Featured Work'}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Metadata Card Bar */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            {author && (
              <div>
                <span className="text-neutral-500 uppercase font-mono tracking-wider text-[10px] block mb-1">
                  {locale === 'bn' ? 'লেখক / গবেষক' : 'Author'}
                </span>
                <span className="font-medium text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-legal-gold" />
                  {author}
                </span>
              </div>
            )}

            {sourceName && (
              <div>
                <span className="text-neutral-500 uppercase font-mono tracking-wider text-[10px] block mb-1">
                  {locale === 'bn' ? 'প্রকাশনা / জার্নাল' : 'Published Source'}
                </span>
                <span className="font-medium text-neutral-300 flex items-center gap-1.5 italic">
                  <FileText className="w-3.5 h-3.5 text-legal-gold" />
                  {sourceName}
                </span>
              </div>
            )}

            {publication.publication_date && (
              <div>
                <span className="text-neutral-500 uppercase font-mono tracking-wider text-[10px] block mb-1">
                  {locale === 'bn' ? 'প্রকাশনার তারিখ' : 'Publication Date'}
                </span>
                <span className="font-mono text-neutral-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-legal-gold" />
                  {publication.publication_date.substring(0, 10)}
                </span>
              </div>
            )}

            <div>
              <span className="text-neutral-500 uppercase font-mono tracking-wider text-[10px] block mb-1">
                {locale === 'bn' ? 'ডকুমেন্ট শেয়ার' : 'Share Treatise'}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-legal-gold hover:underline transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? (locale === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (locale === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image Banner (if available) */}
        {publication.cover_image && (
          <div className="mt-10 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl max-h-96 flex items-center justify-center bg-neutral-950">
            <img
              src={(publication.cover_image as any).url}
              alt={resolveText((publication.cover_image as any).alt_text) || title}
              className="w-full h-full object-cover max-h-96"
            />
          </div>
        )}

        {/* Abstract / Excerpt Callout */}
        {excerpt && (
          <section className="mt-10 bg-gradient-to-r from-neutral-900/90 to-neutral-900/40 border-l-4 border-legal-gold p-6 sm:p-8 rounded-r-2xl shadow-xl">
            <h2 className="text-xs uppercase font-mono tracking-widest text-legal-gold mb-2">
              {locale === 'bn' ? 'সারসংক্ষেপ / ভাবসংক্ষেপ' : 'Treatise Abstract / Summary'}
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed italic font-serif">
              "{excerpt}"
            </p>
          </section>
        )}

        {/* Full Editorial Content */}
        {content && (
          <section className="mt-12 prose prose-invert prose-lg max-w-none text-neutral-300 leading-relaxed font-sans border-t border-neutral-800/80 pt-10">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </section>
        )}

        {/* Documents & External Sources Action Box */}
        {(publication.has_pdf || publication.external_url) && (
          <section className="mt-12 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-legal-gold" />
                {locale === 'bn' ? 'যাচাইকৃত নথি ও প্রাসঙ্গিক সংযোগ' : 'Verified Documents & Citation Access'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'bn'
                  ? 'উক্ত প্রকাশনার অনুমোদিত সংস্করণ ডাউনলোড করুন অথবা প্রকাশকের অফিশিয়াল পোর্টালে যান।'
                  : 'Access authorized PDF monograph copy or navigate to the original publisher directory.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {publication.has_pdf && (
                <a
                  href={publicationsApi.getDownloadUrl(publication.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-legal-gold hover:bg-yellow-500 text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-legal-gold/10"
                >
                  <Download className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'সম্পূর্ণ PDF ডাউনলোড' : 'Download Full PDF'}</span>
                </a>
              )}

              {publication.external_url && (
                <a
                  href={publication.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-4 py-2.5 rounded-xl border border-neutral-700 transition"
                >
                  <ExternalLink className="w-4 h-4 text-legal-gold" />
                  <span>{locale === 'bn' ? 'প্রকাশক পোর্টালে দেখুন' : 'Visit Publisher Portal'}</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Tags Section */}
        {publication.tags && publication.tags.length > 0 && (
          <section className="mt-10 pt-6 border-t border-neutral-800 flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-neutral-500 mr-1" />
            <span className="text-xs text-neutral-500 mr-2">
              {locale === 'bn' ? 'ট্যাগসমূহ:' : 'Subject Tags:'}
            </span>
            {publication.tags.map((tag: any) => (
              <span
                key={tag.id}
                className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full"
              >
                #{resolveText(tag.name)}
              </span>
            ))}
          </section>
        )}

        {/* Related Publications */}
        {publication.related_publications && publication.related_publications.length > 0 && (
          <section className="mt-16 pt-12 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-legal-gold">
                  {locale === 'bn' ? 'সম্পর্কিত প্রকাশনা' : 'Related Treatises'}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  {locale === 'bn' ? 'অন্যান্য প্রাসঙ্গিক গবেষণা' : 'Further Jurisprudential Studies'}
                </h3>
              </div>
              <Link
                to="/publications"
                className="text-xs text-legal-gold hover:underline flex items-center gap-1 font-medium"
              >
                <span>{locale === 'bn' ? 'সকল প্রকাশনা' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {publication.related_publications.map((rel) => {
                const relTitle = resolveText(rel.title);
                const relSource = resolveText(rel.publication_name);
                return (
                  <Link
                    key={rel.id}
                    to={`/publications/${rel.slug}`}
                    className="group bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-legal-gold/40 rounded-xl p-5 transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-legal-gold">
                        {rel.publication_type?.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-white group-hover:text-legal-gold transition-colors mt-1 line-clamp-2">
                        {relTitle}
                      </h4>
                      {relSource && (
                        <p className="text-[11px] text-neutral-400 mt-2 truncate italic">
                          {relSource}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-legal-gold flex items-center gap-1">
                      <span>{locale === 'bn' ? 'পড়ুন' : 'Explore'}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back Button */}
        <div className="mt-16 text-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/publications')}
            className="border-neutral-800 text-neutral-300 hover:border-legal-gold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {locale === 'bn' ? 'প্রকাশনা ভান্ডারে ফিরে যান' : 'Back to Publications Archive'}
          </Button>
        </div>
      </div>
    </article>
  );
};
