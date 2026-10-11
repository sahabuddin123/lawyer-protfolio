import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { videosApi } from '@/api/videos';
import { VideoDetailItem } from '@/types/video';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Play,
  ExternalLink,
  Share2,
  AlertCircle,
  Tv,
  ArrowRight,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const VideoDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [video, setVideo] = useState<VideoDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setIsPlaying(false);

    videosApi.getVideoBySlug(slug)
      .then((res) => {
        if (res.data) {
          setVideo(res.data);
        } else {
          setError(locale === 'bn' ? 'ভিডিওটি পাওয়া যায়নি।' : 'Video not found or unavailable.');
        }
      })
      .catch((err: any) => {
        // If 301 redirect returned by API
        if (err.response?.status === 301 && err.response?.data?.redirect_url) {
          const target = err.response.data.redirect_url;
          navigate(target, { replace: true });
          return;
        }

        setError(
          locale === 'bn'
            ? 'ভিডিওটি পাওয়া যায়নি বা এটি বর্তমানে অপ্রকাশিত।'
            : 'Video record not found or is currently private/unpublished.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, locale, navigate]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="w-32 h-6 bg-neutral-900 rounded animate-pulse" />
          <div className="aspect-video bg-neutral-900 rounded-xl animate-pulse" />
          <div className="h-10 bg-neutral-900 rounded w-3/4 animate-pulse" />
          <div className="h-24 bg-neutral-900 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 flex items-center justify-center p-4">
        <SeoHead
          title={locale === 'bn' ? 'ভিডিও পাওয়া যায়নি | চেম্বার' : 'Broadcast Unavailable | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-legal-gold mx-auto" />
          <h2 className="text-xl font-serif text-white">
            {locale === 'bn' ? 'ভিডিও পাওয়া যায়নি' : 'Broadcast Unavailable'}
          </h2>
          <p className="text-xs text-neutral-400">
            {error || (locale === 'bn' ? 'অনুরোধকৃত ভিডিওটি বিদ্যমান নেই।' : 'The requested video does not exist.')}
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={() => navigate('/videos')}>
              {locale === 'bn' ? 'ভিডিও আর্কাইভে ফিরে যান' : 'Return to Video Archive'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const defaultVideoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: video.thumbnail?.url || 'https://nijamuddin.com/images/hero/hero-lawyer.webp',
    uploadDate: video.published_date || video.date || new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24">
      <SeoHead
        title={`${video.title} | ${locale === 'bn' ? 'ভিডিও আর্কাইভ | অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Legal Video | Advocate Nijam Uddin (Haq)'}`}
        description={video.description || (locale === 'bn' ? `${video.title} — আইনি আলোচনা ও ভিডিও সম্প্রচার।` : `Televised legal discussion and judicial commentary: ${video.title}.`)}
        canonical={`/videos/${slug}`}
        ogType="video.other"
        ogImage={video.thumbnail?.url}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'ভিডিও আর্কাইভ' : 'Videos', path: '/videos' },
          { name: video.title, path: `/videos/${slug}` },
        ]}
        structuredData={video.structured_data || defaultVideoSchema}
      />

      {/* Breadcrumb Bar */}
      <div className="border-b border-neutral-900 bg-neutral-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center space-x-2 truncate">
            <Link to="/videos" className="hover:text-legal-gold transition-colors flex items-center space-x-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'ভিডিও লাইব্রেরি' : 'Video Library'}</span>
            </Link>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-300 truncate">{video.title}</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center space-x-1.5 hover:text-legal-gold transition-colors ml-4 flex-shrink-0"
            title="Share Video Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? (locale === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (locale === 'bn' ? 'শেয়ার' : 'Share')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* VIDEO EMBED / CLICK-TO-LOAD PLAYER */}
        <div className="aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl relative">
          {video.embed_url && isPlaying ? (
            <iframe
              src={`${video.embed_url}?autoplay=1`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* High-Performance Click-To-Load Poster (No Third-Party Scripts Until Click) */
            <div
              className="w-full h-full relative cursor-pointer group"
              onClick={() => {
                if (video.embed_url) {
                  setIsPlaying(true);
                } else {
                  window.open(video.video_url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {video.thumbnail?.url ? (
                <img
                  src={video.thumbnail.url}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-800">
                  <Tv className="w-24 h-24 stroke-1" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 group-hover:via-transparent transition-colors" />

              {/* Centered Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-legal-gold text-black flex items-center justify-center shadow-2xl shadow-legal-gold/20 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current translate-x-1" />
                </div>
              </div>

              {/* Poster Platform Banner */}
              <div className="absolute top-4 left-4">
                <Badge variant="gold" size="sm">
                  {video.platform.toUpperCase()}
                </Badge>
              </div>

              {/* Duration on Poster */}
              {video.duration && (
                <div className="absolute bottom-4 right-4 bg-black/90 px-3 py-1 rounded text-xs font-mono text-white border border-neutral-800">
                  {video.duration}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TITLE & METADATA SECTION */}
        <div className="space-y-4 border-b border-neutral-800 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono uppercase text-legal-gold">
              {video.platform}
            </span>
            {video.category && (
              <Badge variant="outline" size="sm">
                {video.category.name}
              </Badge>
            )}
            {video.is_featured && (
              <Badge variant="gold" size="sm">
                {locale === 'bn' ? 'বিশেষ প্রদর্শনী' : 'Featured'}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-wide leading-tight">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400">
            {video.date && (
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                <span>{video.date}</span>
              </div>
            )}
            {video.duration && (
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-600" />
                <span>{video.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION / SYNOPSIS */}
        {video.description && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              {locale === 'bn' ? 'আলোচনার বিষয়বস্তু ও সারসংক্ষেপ' : 'Broadcast Summary & Legal Notes'}
            </h3>
            <div className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans space-y-4">
              {video.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* EXTERNAL WATCH CTA */}
        {video.external_watch_url && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-serif text-white">
                {locale === 'bn' ? 'মূল সম্প্রচার উৎসে সরাসরি দেখুন' : 'Watch on Broadcaster Platform'}
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {locale === 'bn'
                  ? 'এই আলোচনাটি সরাসরি মূল চ্যানেলে দেখতে নিচের বোতামে ক্লিক করুন।'
                  : 'Navigate directly to the official broadcaster platform to view comments and related episodes.'}
              </p>
            </div>

            <a
              href={video.external_watch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-950 hover:bg-neutral-900 text-legal-gold border border-legal-gold/40 hover:border-legal-gold rounded text-xs font-mono transition-colors self-start sm:self-auto"
            >
              <span>{locale === 'bn' ? 'ব্রডকাস্টার সাইটে খুলুন' : 'Open Broadcaster'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* TAGS */}
        {video.tags && video.tags.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 mr-2">Tags:</span>
            {video.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-400 font-mono"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* RELATED VIDEOS SECTION */}
        {video.related_videos && video.related_videos.length > 0 && (
          <div className="pt-10 border-t border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-legal-gold uppercase tracking-wider">
                  {locale === 'bn' ? 'সম্পর্কিত সম্প্রচার' : 'Related Recordings'}
                </span>
                <h3 className="text-xl font-serif text-white mt-0.5">
                  {locale === 'bn' ? 'আরও ভিডিও আলোচনা' : 'More Video Broadcasts'}
                </h3>
              </div>

              <Link
                to="/videos"
                className="text-xs font-mono text-legal-gold hover:underline flex items-center space-x-1"
              >
                <span>{locale === 'bn' ? 'সকল দেখুন' : 'View All'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {video.related_videos.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/videos/${rel.slug}`)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden hover:border-legal-gold/40 transition-colors cursor-pointer group flex flex-col"
                >
                  <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                    {rel.thumbnail?.url ? (
                      <img
                        src={rel.thumbnail.url}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                        <Play className="w-8 h-8 fill-current" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                      {rel.duration || rel.platform}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h5 className="text-sm font-serif text-white group-hover:text-legal-gold transition-colors line-clamp-2">
                      {rel.title}
                    </h5>
                    <div className="pt-2 text-[11px] font-mono text-neutral-500">
                      {rel.date || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
