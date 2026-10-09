import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/i18n';
import { videosApi } from '@/api/videos';
import { VideoItem, VideoCategory } from '@/types/video';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Play,
  RotateCcw,
  Tv,
  Calendar,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const VideosPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  // State
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Categories
  useEffect(() => {
    videosApi.getCategories().then((res) => {
      if (res.data) {
        setCategories(res.data);
      }
    }).catch(() => {});
  }, []);

  // Load Videos
  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await videosApi.getVideosList({
        search: debouncedSearch || undefined,
        platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: currentPage,
        per_page: 9,
      });

      setVideos(res.data || []);
      if (res.meta) {
        const metaAny = res.meta as any;
        const lastPage = metaAny.last_page ?? metaAny.pagination?.last_page ?? 1;
        const total = metaAny.total ?? metaAny.pagination?.total ?? 0;
        setTotalPages(lastPage);
        setTotalCount(total);
      }
    } catch {
      setError(
        locale === 'bn'
          ? 'ভিডিও তালিকা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Unable to load video archive records. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedPlatform, selectedCategory, currentPage, locale]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedPlatform('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  // Find Featured Video (for top hero display on page 1 with no filters)
  const isDefaultView = !debouncedSearch && selectedPlatform === 'all' && selectedCategory === 'all' && currentPage === 1;
  const featuredVideo = isDefaultView ? videos.find((v) => v.is_featured) : null;
  const gridVideos = featuredVideo ? videos.filter((v) => v.id !== featuredVideo.id) : videos;

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24">
      <SeoHead
        title={
          locale === 'bn'
            ? 'ভিডিও ও সম্প্রচার আর্কাইভ | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Legal Video Analysis & Broadcasts | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'টেলিভিশন গোলটেবিল আলোচনা, আইনি সম্মেলন এবং উচ্চ আদালত প্রক্রিয়া সংশ্লিষ্ট রেকর্ডকৃত ভিডিও সংকলন।'
            : 'Curated repository of televised panel discussions, judicial roundtables, Supreme Court constitutional dialogues, and academic addresses.'
        }
        canonical="/videos"
        robots={debouncedSearch || selectedPlatform !== 'all' || selectedCategory !== 'all' ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'ভিডিও আর্কাইভ' : 'Videos', path: '/videos' },
        ]}
      />
      {/* Editorial Header */}
      <PageHeader
        title={locale === 'bn' ? 'ভিডিও ও সম্প্রচার আর্কাইভ' : 'Broadcast Archive & Legal Dialogues'}
        eyebrow={locale === 'bn' ? 'ভিডিও লাইব্রেরি' : 'Video Library'}
        description={
          locale === 'bn'
            ? 'টেলিভিশন গোলটেবিল আলোচনা, আইনি সম্মেলন এবং উচ্চ আদালত প্রক্রিয়া সংশ্লিষ্ট রেকর্ডকৃত ভিডিও সংকলন।'
            : 'Curated repository of televised panel discussions, judicial roundtables, Supreme Court constitutional dialogues, and academic addresses.'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Search & Platform Filter Bar */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 sm:p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  locale === 'bn' ? 'শিরোনাম বা কীওয়ার্ড খুঁজুন...' : 'Search broadcasts, lectures...'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-legal-gold transition-colors"
              />
            </div>

            {/* Platform Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              {[
                { key: 'all', label: locale === 'bn' ? 'সকল প্ল্যাটফর্ম' : 'All Platforms' },
                { key: 'youtube', label: 'YouTube' },
                { key: 'vimeo', label: 'Vimeo' },
                { key: 'external', label: locale === 'bn' ? 'অন্যান্য ব্রডকাস্ট' : 'External' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(p.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                    selectedPlatform === p.key
                      ? 'bg-legal-gold text-black font-semibold shadow-md shadow-legal-gold/10'
                      : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills (if categories exist) */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80 text-xs">
              <span className="text-neutral-500 font-mono text-[11px] uppercase tracking-wider mr-1">
                {locale === 'bn' ? 'বিভাগ:' : 'Category:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-200 text-black font-medium'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {locale === 'bn' ? 'সকল' : 'All'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-neutral-200 text-black font-medium'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {typeof cat.name === 'string' ? cat.name : (cat.name as any)?.en || 'Category'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FEATURED VIDEO HERO BANNER (When present on page 1) */}
        {featuredVideo && !loading && (
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-legal-gold/30 rounded-xl overflow-hidden shadow-2xl p-6 sm:p-8 relative group">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Thumbnail with Click to Open */}
              <div
                className="w-full lg:w-3/5 aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 relative cursor-pointer"
                onClick={() => navigate(`/videos/${featuredVideo.slug}`)}
              >
                {featuredVideo.thumbnail?.url ? (
                  <img
                    src={featuredVideo.thumbnail.url}
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-800">
                    <Tv className="w-20 h-20 stroke-1" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Big Centered Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-legal-gold text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {featuredVideo.duration && (
                  <div className="absolute bottom-3 right-3 bg-black/90 px-2.5 py-1 rounded text-xs font-mono text-white border border-neutral-800">
                    {featuredVideo.duration}
                  </div>
                )}
              </div>

              {/* Metadata & Synopsis */}
              <div className="w-full lg:w-2/5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="gold" size="sm">
                    {locale === 'bn' ? 'বিশেষ সম্প্রচার' : 'Featured Broadcast'}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {featuredVideo.platform.toUpperCase()}
                  </Badge>
                </div>

                <h3
                  onClick={() => navigate(`/videos/${featuredVideo.slug}`)}
                  className="text-2xl sm:text-3xl font-serif text-white hover:text-legal-gold transition-colors cursor-pointer leading-tight"
                >
                  {featuredVideo.title}
                </h3>

                {featuredVideo.description && (
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3 font-sans">
                    {featuredVideo.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-800/80">
                  {featuredVideo.date && (
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{featuredVideo.date}</span>
                    </span>
                  )}
                  {featuredVideo.category && (
                    <span>{featuredVideo.category.name}</span>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate(`/videos/${featuredVideo.slug}`)}
                    variant="primary"
                    className="flex items-center space-x-2"
                  >
                    <span>{locale === 'bn' ? 'সম্পূর্ণ আলোচনা দেখুন' : 'Watch Broadcast'}</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden animate-pulse h-80"
              />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-200">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadVideos}>
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
            </Button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && gridVideos.length === 0 && !featuredVideo && (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-12 text-center space-y-4">
            <Tv className="w-12 h-12 text-neutral-600 mx-auto stroke-1" />
            <div className="space-y-1">
              <h4 className="text-base font-serif text-white">
                {locale === 'bn' ? 'কোনো ভিডিও পাওয়া যায়নি' : 'No video broadcasts found'}
              </h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                {locale === 'bn'
                  ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সম্প্রচার বর্তমানে বিদ্যমান নেই।'
                  : 'No verified video records matched the chosen filters. Try clearing search filters.'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
            </Button>
          </div>
        )}

        {/* VIDEO GRID */}
        {!loading && !error && gridVideos.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => navigate(`/videos/${video.slug}`)}
                  className="bg-neutral-900/70 border border-neutral-800 rounded-lg overflow-hidden hover:border-legal-gold/40 transition-all duration-300 flex flex-col cursor-pointer group hover:shadow-xl hover:shadow-black/50"
                >
                  {/* Aspect Video Poster */}
                  <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                    {video.thumbnail?.url ? (
                      <img
                        src={video.thumbnail.url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-800">
                        <Play className="w-10 h-10 fill-current opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Centered Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-legal-gold/90 text-black flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-legal-gold transition-all">
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    {/* Platform Tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono uppercase text-legal-gold">
                        {video.platform}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/90 px-2 py-0.5 rounded text-[11px] font-mono text-white border border-neutral-800">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {video.category && (
                        <span className="text-[11px] font-mono text-neutral-400">
                          {video.category.name}
                        </span>
                      )}
                      <h4 className="text-base font-serif text-white group-hover:text-legal-gold transition-colors line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                      {video.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-500">
                      <span>{video.date || '—'}</span>
                      <span className="text-legal-gold group-hover:underline flex items-center space-x-1">
                        <span>{locale === 'bn' ? 'দেখুন' : 'Watch'}</span>
                        <Play className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-neutral-800 text-xs font-mono text-neutral-400">
                <span>
                  {locale === 'bn' ? `মোট ${totalCount} টি ভিডিও` : `Showing ${videos.length} of ${totalCount} videos`}
                </span>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                  </Button>

                  <span className="px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center space-x-1"
                  >
                    <span>{locale === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
