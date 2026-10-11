import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { mediaApi } from '@/api/media';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Calendar,
  ExternalLink,
  Download,
  ArrowLeft,
  Newspaper,
  Tv,
  AlertCircle,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const MediaDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const res = await mediaApi.getMediaBySlug(slug);
        setItem(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(
            locale === 'bn'
              ? 'অনুরোধকৃত মিডিয়া রেকর্ডটি পাওয়া যায়নি বা এটি এখনও প্রকাশিত হয়নি।'
              : 'The requested media record was not found or is currently private.'
          );
        } else {
          setError(
            locale === 'bn'
              ? 'তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
              : 'Failed to retrieve media entry details. Please try again later.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug, locale]);

  const getResolvedString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val['en'] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-4 w-32 bg-neutral-800 rounded" />
          <div className="h-10 w-3/4 bg-neutral-800 rounded" />
          <div className="h-6 w-1/2 bg-neutral-800 rounded" />
          <div className="h-64 bg-neutral-900 rounded-lg mt-8" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 py-20">
        <SeoHead
          title={locale === 'bn' ? 'মিডিয়া রেকর্ড খুঁজে পাওয়া যায়নি | চেম্বার' : 'Media Record Not Found | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-serif text-neutral-100">
            {locale === 'bn' ? 'মিডিয়া রেকর্ড খুঁজে পাওয়া যায়নি' : 'Record Not Found'}
          </h1>
          <p className="text-neutral-400 text-sm">{error}</p>
          <Button variant="secondary" onClick={() => navigate('/media')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'bn' ? 'মিডিয়া তালিকায় ফিরে যান' : 'Back to Media Directory'}
          </Button>
        </div>
      </div>
    );
  }

  const isPress = item.kind === 'press' || !!item.media_name;
  const title = getResolvedString(item.title);
  const source = isPress
    ? getResolvedString(item.media_name || item.source)
    : getResolvedString(item.channel || item.source);
  const program = !isPress ? getResolvedString(item.program) : null;
  const description = getResolvedString(item.description);
  const date = item.published_date || item.broadcast_date || item.date;
  const externalUrl = item.article_url || item.video_url || item.external_url;

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24">
      <SeoHead
        title={`${title} | ${locale === 'bn' ? 'মিডিয়া কাভারেজ | অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Press & Media | Advocate Nijam Uddin (Haq)'}`}
        description={description || (locale === 'bn' ? `${title} — সংবাদ প্রকাশনা ও মিডিয়া উপস্থিতি।` : `National media coverage and legal commentary: ${title}.`)}
        canonical={`/media/${slug}`}
        ogType="article"
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'মিডিয়া' : 'Media', path: '/media' },
          { name: title, path: `/media/${slug}` },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: description,
          datePublished: date,
          url: `https://nijamuddin.com/media/${slug}`,
        }}
      />
      {/* Editorial Top Hero Bar */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-6">
            <button
              type="button"
              onClick={() => navigate('/media')}
              className="inline-flex items-center gap-1.5 hover:text-[#D4A017] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {locale === 'bn' ? 'মিডিয়া সংরক্ষণাগারে ফিরে যান' : 'Back to Media Archive'}
            </button>

            <span className="flex items-center gap-1.5 text-[#D4A017]">
              {isPress ? <Newspaper className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              {isPress
                ? (locale === 'bn' ? 'প্রেস ও সংবাদ বিশ্লেষণ' : 'Press & Print Analysis')
                : (locale === 'bn' ? 'টেলিভিশন ও সম্প্রচার সংলাপ' : 'Broadcast Dialogue')}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-[#D4A017] tracking-wider uppercase">
                {source}
              </span>
              {program && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-sm text-neutral-300 font-medium">{program}</span>
                </>
              )}
              {date && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    {date}
                  </span>
                </>
              )}
              <Badge variant="outline" className="capitalize text-xs">
                {(item.media_type || 'General').replace('_', ' ')}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-100 leading-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 space-y-10">
        {/* Callout Action Bar (External Link / Document) */}
        {(externalUrl || item.has_document) && (
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
                {isPress
                  ? (locale === 'bn' ? 'মূল প্রকাশনার উৎস' : 'Primary Source Publication')
                  : (locale === 'bn' ? 'সম্প্রচার লিঙ্ক ও নথিপত্র' : 'Broadcaster Video & Documentation')}
              </div>
              <p className="text-xs text-neutral-400">
                {isPress
                  ? (locale === 'bn' ? 'জাতীয় সংবাদপত্রের মূল প্রতিবেদনটি অনলাইনে পড়ুন।' : 'Access full external newspaper column or digital publication record.')
                  : (locale === 'bn' ? 'সম্প্রচারিত সাক্ষাৎকার বা আলোচনার ফুটেজটি দেখুন।' : 'Stream the original panel discussion or broadcast coverage.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#D4A017] text-black hover:bg-[#C59B27] px-4 py-2 rounded text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isPress
                    ? (locale === 'bn' ? 'মূল নিবন্ধ পড়ুন' : 'Read Full Original')
                    : (locale === 'bn' ? 'সম্প্রচার দেখুন' : 'Watch Broadcast')}
                </a>
              )}

              {item.has_document && (
                <a
                  href={isPress ? mediaApi.getPressDownloadUrl(item.slug) : mediaApi.getAppearanceDownloadUrl(item.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {locale === 'bn' ? 'সংযুক্ত কপি ডাউনলোড' : 'Download Press Clipping'}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Analytical Description / Content */}
        {description && (
          <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-serif uppercase tracking-widest text-[#D4A017] border-b border-neutral-800 pb-2">
              {locale === 'bn' ? 'বিষয়বস্তু ও সারসংক্ষেপ' : 'Dialogue & Subject Analysis'}
            </h2>
            <div className="text-neutral-300 text-base leading-relaxed whitespace-pre-line space-y-4">
              {description}
            </div>
          </div>
        )}

        {/* Related Items Section */}
        {item.related_items && item.related_items.length > 0 && (
          <div className="pt-8 border-t border-neutral-800 space-y-6">
            <h2 className="text-lg font-serif text-neutral-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#D4A017] inline-block rounded" />
              {locale === 'bn' ? 'সম্পর্কিত মিডিয়া ও বিশ্লেষণ' : 'Related Media & Commentary'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {item.related_items.map((rel: any) => {
                const relTitle = getResolvedString(rel.title);
                const relSource = getResolvedString(rel.media_name || rel.channel || rel.source);

                return (
                  <div
                    key={rel.id}
                    onClick={() => navigate(isPress ? `/media/press/${rel.slug}` : `/media/appearances/${rel.slug}`)}
                    className="p-4 bg-neutral-900/40 border border-neutral-800 hover:border-[#D4A017] rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="text-xs text-[#D4A017] font-medium">{relSource}</div>
                    <h4 className="text-sm font-serif text-neutral-200 group-hover:text-[#D4A017] transition-colors mt-1 line-clamp-2">
                      {relTitle}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
