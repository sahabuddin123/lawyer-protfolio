import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ResearchCard } from '@/components/cards/ResearchCard';
import { useTranslation } from '@/i18n';
import { researchApi } from '@/api/research';
import { LegalResearch } from '@/types';
import {
  ChevronLeft,
  Calendar,
  User,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
  Share2,
  Clock,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const ResearchDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [research, setResearch] = useState<LegalResearch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResearch = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await researchApi.getResearchBySlug(slug);
        if (response.success && response.data) {
          setResearch(response.data);
        } else {
          setError(response.message || 'Legal research monograph not found.');
        }
      } catch (err: any) {
        console.error('Failed to load legal research detail:', err);
        setError(
          err?.response?.data?.message ||
            (locale === 'bn'
              ? 'অনুরোধকৃত গবেষণা নিবন্ধটি খুঁজে পাওয়া যায়নি বা এটি এখনও প্রকাশিত হয়নি।'
              : 'The requested legal research monograph could not be found or has not been published.')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [slug, locale]);

  const resolveText = (text: any): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[locale] || text.en || '';
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
      <div className="min-h-screen bg-background-base text-text-primary py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse space-y-6">
          <div className="w-36 h-4 bg-surface-elevated rounded" />
          <div className="w-3/4 h-10 bg-surface-elevated rounded" />
          <div className="flex gap-4">
            <div className="w-24 h-4 bg-surface-elevated rounded" />
            <div className="w-32 h-4 bg-surface-elevated rounded" />
          </div>
          <div className="w-full h-24 bg-surface-elevated rounded" />
          <div className="space-y-3 pt-6">
            <div className="w-full h-4 bg-surface-elevated rounded" />
            <div className="w-full h-4 bg-surface-elevated rounded" />
            <div className="w-5/6 h-4 bg-surface-elevated rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className="min-h-screen bg-background-base text-text-primary py-24 flex items-center justify-center">
        <SeoHead
          title={locale === 'bn' ? 'গবেষণা পাওয়া যায়নি | চেম্বার' : 'Monograph Not Found | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="max-w-md mx-auto px-6 text-center">
          <AlertCircle className="w-16 h-16 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-serif-editorial font-bold text-text-primary mb-3">
            {locale === 'bn' ? 'গবেষণা পাওয়া যায়নি' : 'Monograph Not Found'}
          </h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            {error ||
              (locale === 'bn'
                ? 'অনুরোধ করা আইনি গবেষণা উন্মুক্ত নয় বা অপসারিত হয়েছে।'
                : 'The requested legal research monograph could not be found or is not available for public discovery.')}
          </p>
          <Button variant="primary" onClick={() => navigate('/research')}>
            {locale === 'bn' ? 'গবেষণা আর্কাইভে ফিরুন' : 'Return to Research Archive'}
          </Button>
        </div>
      </div>
    );
  }

  const title = resolveText(research.title);
  const excerpt = resolveText(research.excerpt);
  const content = resolveText(research.content);
  const author = resolveText(research.author);
  const categoryName = research.category ? resolveText(research.category.name) : null;
  const researchDate = research.research_date
    ? research.research_date.split('T')[0]
    : research.published_at
    ? research.published_at.split('T')[0]
    : null;
  const readTime = research.read_time_minutes
    ? `${research.read_time_minutes} ${locale === 'bn' ? 'মিনিট পাঠ' : 'min read'}`
    : null;

  return (
    <article className="min-h-screen bg-background-base text-text-primary pb-24">
      <SeoHead
        title={`${title} | ${locale === 'bn' ? 'আইনি গবেষণা | অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Legal Research | Advocate Nijam Uddin (Haq)'}`}
        description={excerpt || (locale === 'bn' ? `${title} — আইনি গবেষণা ও বিশ্লেষণমূলক নিবন্ধ।` : `Legal research monograph and statutory analysis on ${title}.`)}
        canonical={`/research/${slug}`}
        ogType="article"
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'আইনি গবেষণা' : 'Legal Research', path: '/research' },
          { name: title, path: `/research/${slug}` },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: excerpt,
          datePublished: researchDate,
          author: {
            '@type': 'Person',
            name: author || 'Advocate Nijam Uddin (Haq)',
          },
          url: `https://nijamuddin.com/research/${slug}`,
        }}
      />
      {/* Editorial Breadcrumbs & Actions Header */}
      <div className="border-b border-border-subtle/80 bg-background-elevated/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
          <Link
            to="/research"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-gold-primary hover:text-gold-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{locale === 'bn' ? 'সকল গবেষণা নিবন্ধ' : 'Back to Research'}</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-text-subtle hover:text-text-primary transition-colors cursor-pointer"
              title="Copy Treatise Link"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{locale === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'শেয়ার' : 'Share'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Header Metadata */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {categoryName && (
              <Badge variant="outline" size="sm">
                {categoryName}
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {research.research_type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold text-text-primary leading-tight tracking-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-text-subtle font-mono border-y border-border-subtle/60 py-3">
            {author && (
              <div className="flex items-center gap-1.5 text-text-primary font-medium">
                <User className="w-3.5 h-3.5 text-gold-primary" />
                <span>{locale === 'bn' ? `লেখক: ${author}` : `By ${author}`}</span>
              </div>
            )}

            {researchDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-primary" />
                <span>{researchDate}</span>
              </div>
            )}

            {readTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-primary" />
                <span>{readTime}</span>
              </div>
            )}

            {research.view_count !== undefined && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Eye className="w-3.5 h-3.5" />
                <span>{research.view_count} {locale === 'bn' ? 'পাঠ' : 'views'}</span>
              </div>
            )}
          </div>
        </header>

        {/* Executive Excerpt Callout */}
        {excerpt && (
          <div className="p-6 md:p-8 rounded-xl bg-background-elevated/70 border-l-4 border-gold-primary shadow-xl">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-primary mb-2">
              {locale === 'bn' ? 'সারসংক্ষেপ ও আইনি সিদ্ধান্ত' : 'Executive Abstract & Legal Ratio'}
            </h2>
            <p className="text-base sm:text-lg text-text-primary/95 font-serif-editorial italic leading-relaxed">
              &quot;{excerpt}&quot;
            </p>
          </div>
        )}

        {/* Featured Image */}
        {research.featured_image && research.featured_image.url && (
          <div className="rounded-xl overflow-hidden border border-border-subtle shadow-2xl">
            <img
              src={research.featured_image.url}
              alt={title}
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Full Rich Text Content */}
        {content && (
          <div
            className="prose prose-invert lg:prose-lg max-w-none text-text-muted leading-relaxed font-sans pt-2 border-t border-border-subtle/50 prose-headings:font-serif-editorial prose-headings:text-text-primary prose-a:text-gold-primary prose-blockquote:border-l-gold-primary prose-blockquote:text-text-primary"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Tags Cloud */}
        {research.tags && research.tags.length > 0 && (
          <div className="pt-6 border-t border-border-subtle/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-text-subtle mr-2">
              {locale === 'bn' ? 'ট্যাগসমূহ:' : 'Subject Tags:'}
            </span>
            {research.tags.map((tag) => {
              const tagName = resolveText(tag.name);
              return (
                <Link
                  key={tag.id}
                  to={`/research?tag=${tag.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-background-elevated hover:bg-neutral-800 text-text-muted hover:text-gold-primary border border-border-subtle transition-colors"
                >
                  #{tagName}
                </Link>
              );
            })}
          </div>
        )}

        {/* PDF Download Card */}
        {research.has_pdf && (
          <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-r from-background-elevated to-neutral-900 border border-gold-primary/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gold-primary">
                <FileText className="w-5 h-5" />
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                  {locale === 'bn' ? 'সম্পূর্ণ গবেষণা নথি' : 'Authoritative Legal PDF Monograph'}
                </span>
              </div>
              <h3 className="text-base font-serif-editorial font-bold text-text-primary">
                {research.pdf_media && (research.pdf_media as any).original_name
                  ? (research.pdf_media as any).original_name
                  : `${title}.pdf`}
              </h3>
              <p className="text-xs text-text-subtle">
                {locale === 'bn'
                  ? 'উদ্ধৃতি ও রেফারেন্সের জন্য সম্পূর্ণ গবেষণাপত্রটি পিডিএফ ফরম্যাটে সংরক্ষণ করুন।'
                  : 'Download the complete verified paper formatted for legal citations and academic records.'}
              </p>
            </div>

            <a
              href={`/api/v1/research/${research.slug}/download`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gold-primary text-black font-semibold text-xs tracking-wider uppercase hover:bg-gold-hover transition-all shadow-lg shadow-gold-primary/10 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{locale === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download Monograph'}</span>
            </a>
          </div>
        )}

        {/* External URL Reference (if present) */}
        {research.external_url && (
          <div className="text-xs font-mono text-text-subtle flex items-center gap-1.5 pt-2">
            <span>{locale === 'bn' ? 'বহিরাগত প্রকাশনা লিংক:' : 'External Publication Record:'}</span>
            <a
              href={research.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-primary hover:text-gold-hover inline-flex items-center gap-1 underline"
            >
              <span>{research.external_url}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Related Research Section */}
        {research.related_research && research.related_research.length > 0 && (
          <section className="pt-12 border-t border-border-subtle/80 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-gold-primary">
                {locale === 'bn' ? 'সম্পর্কিত আইনি অধ্যয়ন' : 'Related Jurisprudence'}
              </span>
              <h2 className="text-2xl font-serif-editorial font-bold text-text-primary mt-1">
                {locale === 'bn' ? 'সম্পর্কিত অন্যান্য গবেষণা' : 'Further Monographs & Treatises'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {research.related_research.map((item) => {
                const catTitle = item.category
                  ? resolveText(item.category.name)
                  : item.research_type.replace('_', ' ').toUpperCase();
                const relTitle = resolveText(item.title);
                const relExcerpt = resolveText(item.excerpt);
                const relAuthor = resolveText(item.author);
                const dateStr = item.research_date
                  ? item.research_date.split('T')[0]
                  : item.published_at
                  ? item.published_at.split('T')[0]
                  : '';

                return (
                  <ResearchCard
                    key={item.id}
                    category={catTitle}
                    title={relTitle}
                    excerpt={relExcerpt}
                    date={dateStr}
                    author={relAuthor}
                    onReadArticle={() => navigate(`/research/${item.slug}`)}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
