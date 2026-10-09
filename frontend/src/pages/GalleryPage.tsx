import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/i18n';
import { galleryApi } from '@/api/gallery';
import { GalleryAlbumItem, GalleryCategory } from '@/types/gallery';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  Calendar,
  Image as ImageIcon,
  Layers,
  Star,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const GalleryPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  // State
  const [albums, setAlbums] = useState<GalleryAlbumItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Load albums
  const loadAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await galleryApi.getGalleryList({
        search: debouncedSearch || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: currentPage,
      });

      const items = res.data || [];
      setAlbums(items);

      if (res.meta) {
        const metaAny = res.meta as any;
        const lastPage = metaAny.last_page ?? 1;
        const total = metaAny.total ?? items.length;
        setTotalPages(lastPage);
        setTotalCount(total);
      }

      // Collect categories from returned items if not populated
      if (categories.length === 0 && items.length > 0) {
        const cats: GalleryCategory[] = [];
        items.forEach((item) => {
          if (item.category && !cats.some((c) => c.slug === item.category!.slug)) {
            cats.push({
              id: item.category.id,
              name: item.category.name,
              slug: item.category.slug,
            });
          }
        });
        setCategories(cats);
      }
    } catch {
      setError(
        locale === 'bn'
          ? 'গ্যালারি অ্যালবাম লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Failed to load photo gallery albums. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, currentPage, locale, categories.length]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const featuredAlbum = albums.find((a) => a.is_featured);
  const standardAlbums = albums.filter((a) => a.id !== featuredAlbum?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <SeoHead
        title={
          locale === 'bn'
            ? 'আলোকচিত্র ও ফটো গ্যালারি | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Judicial Gallery & Photo Archives | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'সুপ্রিম কোর্ট, আইনি সেমিনার, বার অ্যাসোসিয়েশন এবং চেম্বার কার্যনির্বাহী কার্যক্রমের আলোকচিত্র ভাণ্ডার।'
            : 'A curated visual archive documenting Supreme Court appearances, academic lectures, bar association functions, and chamber convocations.'
        }
        canonical="/gallery"
        robots={debouncedSearch || selectedCategory !== 'all' ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'গ্যালারি' : 'Gallery', path: '/gallery' },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <PageHeader
          eyebrow={locale === 'bn' ? 'আলোকচিত্র সংগ্রহশালা' : 'Visual Documentation'}
          title={locale === 'bn' ? 'আলোকচিত্র ও ফটো গ্যালারি' : 'Photographic & Event Archive'}
          description={
            locale === 'bn'
              ? 'সুপ্রিম কোর্ট, আইনি সেমিনার, বার অ্যাসোসিয়েশন এবং চেম্বার কার্যনির্বাহী কার্যক্রমের আলোকচিত্র ভাণ্ডার।'
              : 'A curated visual archive documenting Supreme Court appearances, academic lectures, bar association functions, and chamber convocations.'
          }
        />

        {/* Featured Hero Album Spotlight (if available on page 1) */}
        {!loading && featuredAlbum && currentPage === 1 && !debouncedSearch && selectedCategory === 'all' && (
          <div
            onClick={() => navigate(`/gallery/${featuredAlbum.slug}`)}
            className="cursor-pointer group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 transition-all duration-300 shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[320px] overflow-hidden bg-slate-950">
                {featuredAlbum.cover_image_url ? (
                  <img
                    src={featuredAlbum.cover_image_url}
                    alt={featuredAlbum.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-700" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="gold" className="flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {locale === 'bn' ? 'বিশেষ অ্যালবাম' : 'Featured Album'}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-950/80 backdrop-blur-sm text-xs">
                    <Layers className="w-3 h-3 mr-1 inline" />
                    {featuredAlbum.image_count} {locale === 'bn' ? 'ছবি' : 'photos'}
                  </Badge>
                </div>
              </div>

              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {featuredAlbum.category && (
                      <span className="text-amber-400 font-medium">
                        {featuredAlbum.category.name}
                      </span>
                    )}
                    {featuredAlbum.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {featuredAlbum.event_date}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {featuredAlbum.title}
                  </h2>

                  {featuredAlbum.description && (
                    <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed">
                      {featuredAlbum.description}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {locale === 'bn' ? 'সম্পূর্ণ অ্যালবাম দেখতে ক্লিক করুন' : 'Click to view gallery'}
                  </span>
                  <span className="text-sm text-amber-500 font-semibold group-hover:translate-x-1 transition-transform">
                    {locale === 'bn' ? 'অ্যালবাম দেখুন →' : 'View Album →'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={
                  locale === 'bn' ? 'অ্যালবাম অনুসন্ধান করুন...' : 'Search albums by title or topic...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Total Count */}
            <div className="text-xs text-slate-400 font-mono self-end md:self-center">
              {totalCount} {locale === 'bn' ? 'টি অ্যালবাম পাওয়া গেছে' : 'albums cataloged'}
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                {locale === 'bn' ? 'বিভাগ:' : 'Category:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {locale === 'bn' ? 'সকল বিভাগ' : 'All Categories'}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === c.slug
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-slate-800/60" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-slate-200">{error}</p>
            <Button variant="ghost" onClick={loadAlbums} className="inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && albums.length === 0 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-serif text-slate-300">
              {locale === 'bn' ? 'কোনো অ্যালবাম পাওয়া যায়নি' : 'No albums found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {locale === 'bn'
                ? 'আপনার নির্বাচিত অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো অ্যালবাম নেই।'
                : 'No photographic records match the selected category or search filter.'}
            </p>
          </div>
        )}

        {/* Album Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(currentPage === 1 && !debouncedSearch && selectedCategory === 'all'
              ? standardAlbums
              : albums
            ).map((album) => {
              const coverUrl = album.cover_image_url || album.cover_image?.url;

              return (
                <div
                  key={album.id}
                  onClick={() => navigate(`/gallery/${album.slug}`)}
                  className="cursor-pointer group bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={album.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-slate-700" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-slate-950/80 backdrop-blur-sm text-slate-200 text-xs px-2.5 py-1 rounded-md font-mono border border-slate-800">
                          {album.image_count} {locale === 'bn' ? 'ছবি' : 'photos'}
                        </span>
                      </div>
                      {album.is_featured && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        {album.category && (
                          <span className="text-amber-400 font-medium">
                            {album.category.name}
                          </span>
                        )}
                        {album.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {album.event_date}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                        {album.title}
                      </h3>

                      {album.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {locale === 'bn' ? 'অ্যালবাম দেখুন' : 'View collection'}
                    </span>
                    <span className="text-amber-500 font-semibold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
            </Button>

            <span className="text-xs text-slate-400 font-mono px-3">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1"
            >
              {locale === 'bn' ? 'পরবর্তী' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
