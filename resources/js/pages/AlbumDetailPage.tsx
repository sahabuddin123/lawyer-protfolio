import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/i18n';
import { galleryApi } from '@/api/gallery';
import { GalleryAlbumDetailItem, GalleryImageItem } from '@/types/gallery';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Layers,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  Maximize2,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const AlbumDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<GalleryAlbumDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  // Load Album Detail
  const loadAlbum = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await galleryApi.getAlbumBySlug(slug);
      if (res.data) {
        setAlbum(res.data);
      } else {
        setError(locale === 'bn' ? 'অ্যালবাম পাওয়া যায়নি।' : 'Gallery album not found.');
      }
    } catch (err: any) {
      if (err?.response?.status === 301 && err?.response?.data?.redirect_url) {
        navigate(err.response.data.redirect_url, { replace: true });
        return;
      }
      setError(
        locale === 'bn'
          ? 'অ্যালবামটি পাওয়া যায়নি অথবা প্রকাশ করা হয়নি।'
          : 'Album not found or not currently publicly available.'
      );
    } finally {
      setLoading(false);
    }
  }, [slug, locale, navigate]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  useEffect(() => {
    if (album) {
      document.title = album.seo?.meta_title || `${album.title} | Advocate Nijam Uddin`;
    }
  }, [album]);

  // Open Lightbox
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  // Close Lightbox & Return Focus
  const handleCloseLightbox = useCallback(() => {
    if (lightboxIndex !== null && thumbnailRefs.current[lightboxIndex]) {
      thumbnailRefs.current[lightboxIndex]?.focus();
    }
    setLightboxIndex(null);
  }, [lightboxIndex]);

  // Navigate Lightbox
  const handleNext = useCallback(() => {
    if (!album || lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev! + 1) % album.images.length));
  }, [album, lightboxIndex]);

  const handlePrev = useCallback(() => {
    if (!album || lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! === 0 ? album.images.length - 1 : prev! - 1));
  }, [album, lightboxIndex]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleCloseLightbox, handleNext, handlePrev]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading gallery album...</p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-20">
        <SeoHead
          title={locale === 'bn' ? 'অ্যালবাম পাওয়া যায়নি | চেম্বার' : 'Album Not Available | Chambers'}
          robots="noindex, nofollow"
        />
        <div className="max-w-xl mx-auto px-4 text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-slate-100">
            {locale === 'bn' ? 'অ্যালবাম পাওয়া যায়নি' : 'Album Not Available'}
          </h2>
          <p className="text-sm text-slate-400">{error}</p>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/gallery')}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {locale === 'bn' ? 'গ্যালারিতে ফিরুন' : 'Back to Gallery'}
            </Button>
            <Button variant="primary" onClick={loadAlbum}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentLightboxImage: GalleryImageItem | null =
    lightboxIndex !== null && album.images ? album.images[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <SeoHead
        title={`${album.title} | ${locale === 'bn' ? 'আলোকচিত্র সংগ্রহ | অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Judicial Gallery | Advocate Nijam Uddin (Haq)'}`}
        description={album.description || (locale === 'bn' ? `${album.title} অ্যালবামের আলোকচিত্র সংগ্রহ।` : `Official photograph archive: ${album.title}.`)}
        canonical={`/gallery/${slug}`}
        ogType="article"
        ogImage={album.cover_image_url || undefined}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'গ্যালারি' : 'Gallery', path: '/gallery' },
          { name: album.title, path: `/gallery/${slug}` },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: album.title,
          description: album.description,
          url: `https://nijamuddin.com/gallery/${slug}`,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            {locale === 'bn' ? 'হোম' : 'Home'}
          </Link>
          <span>/</span>
          <Link to="/gallery" className="hover:text-amber-400 transition-colors">
            {locale === 'bn' ? 'গ্যালারি' : 'Gallery'}
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-xs">{album.title}</span>
        </nav>

        {/* Album Header */}
        <div className="border-b border-slate-800 pb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {album.category && <Badge variant="gold">{album.category.name}</Badge>}
            {album.event_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {album.event_date}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              {album.images.length} {locale === 'bn' ? 'টি ছবি' : 'photographs'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 tracking-tight">
            {album.title}
          </h1>

          {album.description && (
            <p className="text-base text-slate-300 max-w-4xl leading-relaxed">
              {album.description}
            </p>
          )}
        </div>

        {/* Photo Masonry / Grid */}
        {album.images.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
            {locale === 'bn'
              ? 'এই অ্যালবামে এখনও কোনো ছবি সংযুক্ত করা হয়নি।'
              : 'No photographs currently available in this album.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.images.map((image, index) => {
              const caption = image.caption || image.alt_text || 'Chamber photograph';

              return (
                <button
                  key={image.id}
                  ref={(el) => { thumbnailRefs.current[index] = el; }}
                  onClick={() => handleOpenLightbox(index)}
                  className="group relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 text-left"
                >
                  <img
                    src={image.url}
                    alt={image.alt_text || caption}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay & Caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-xs text-slate-200 line-clamp-2 font-medium">{caption}</p>
                    <span className="text-[10px] text-amber-400 mt-1 inline-flex items-center gap-1 font-mono">
                      <Maximize2 className="w-3 h-3" />
                      {locale === 'bn' ? 'বড় করে দেখুন' : 'Expand'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Related Albums Section */}
        {album.related_albums && album.related_albums.length > 0 && (
          <div className="pt-16 border-t border-slate-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              {locale === 'bn' ? 'সম্পর্কিত অন্যান্য অ্যালবাম' : 'Related Gallery Albums'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {album.related_albums.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/gallery/${rel.slug}`}
                  className="group bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-video bg-slate-950 overflow-hidden relative">
                    {rel.cover_image_url ? (
                      <img
                        src={rel.cover_image_url}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layers className="w-6 h-6 text-slate-700" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-serif font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {rel.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {rel.image_count} {locale === 'bn' ? 'ছবি' : 'photos'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accessible Lightbox Modal */}
      {lightboxIndex !== null && currentLightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox Viewer"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Counter & Close Button */}
          <div className="flex items-center justify-between text-slate-400 text-xs z-10">
            <span className="font-mono">
              {lightboxIndex + 1} / {album.images.length}
            </span>

            <button
              type="button"
              onClick={handleCloseLightbox}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Close Lightbox (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Photo Center */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Active Image */}
            <div className="max-w-5xl max-h-[75vh] flex items-center justify-center">
              <img
                src={currentLightboxImage.url}
                alt={currentLightboxImage.alt_text || currentLightboxImage.caption || 'Enlarged photo'}
                className="max-h-[75vh] max-w-full object-contain rounded shadow-2xl"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Next Photo (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Caption & Alt Text */}
          <div className="text-center max-w-2xl mx-auto z-10 space-y-1">
            {currentLightboxImage.caption && (
              <p className="text-sm font-medium text-slate-200">
                {currentLightboxImage.caption}
              </p>
            )}
            {currentLightboxImage.alt_text && (
              <p className="text-xs text-slate-400">
                {currentLightboxImage.alt_text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
