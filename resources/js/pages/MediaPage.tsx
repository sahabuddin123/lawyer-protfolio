import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { mediaApi } from '@/api/media';
import { MediaPress, MediaAppearance } from '@/types';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Newspaper,
  Tv,
  Calendar,
  ArrowRight,
  RotateCcw,
  Star,
  Layers,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const MediaPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'all' | 'press' | 'appearances'>('all');

  // Unified Overview Data (for 'all' tab)
  const [featuredPress, setFeaturedPress] = useState<MediaPress[]>([]);
  const [featuredAppearances, setFeaturedAppearances] = useState<MediaAppearance[]>([]);
  const [latestPress, setLatestPress] = useState<MediaPress[]>([]);
  const [latestAppearances, setLatestAppearances] = useState<MediaAppearance[]>([]);

  // Tab-specific Paginated Data (for 'press' or 'appearances' tabs)
  const [tabItems, setTabItems] = useState<(MediaPress | MediaAppearance)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'all') {
        const res = await mediaApi.getUnifiedMedia({
          search: debouncedSearch || undefined,
        });

        if (res.data) {
          setFeaturedPress(res.data.featured_press || []);
          setFeaturedAppearances(res.data.featured_appearances || []);
          setLatestPress(res.data.latest_press || []);
          setLatestAppearances(res.data.latest_appearances || []);
        }
      } else if (activeTab === 'press') {
        const res = await mediaApi.getPressList({
          search: debouncedSearch || undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          year: selectedYear !== 'all' ? selectedYear : undefined,
          page: currentPage,
          per_page: 9,
        });

        setTabItems(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.last_page);
          setTotalCount(res.meta.total);
        }
      } else if (activeTab === 'appearances') {
        const res = await mediaApi.getAppearancesList({
          search: debouncedSearch || undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          year: selectedYear !== 'all' ? selectedYear : undefined,
          page: currentPage,
          per_page: 9,
        });

        setTabItems(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.last_page);
          setTotalCount(res.meta.total);
        }
      }
    } catch {
      setError(
        locale === 'bn'
          ? 'মিডিয়া রেকর্ড লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Failed to load media records. Please verify connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, selectedType, selectedYear, currentPage, locale]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedType('all');
    setSelectedYear('all');
    setCurrentPage(1);
  };

  const getResolvedString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val['en'] || '';
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <SeoHead
        title={
          locale === 'bn'
            ? 'মিডিয়া উপস্থিতি ও সংবাদ বিশ্লেষণ | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Press & Media Coverage | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'জাতীয় সংবাদপত্র, আইন সাময়িকী ও টেলিভিশন টকশোতে অ্যাডভোকেট নিজাম উদ্দিনের সংবিধান ও আইনের শাসন বিষয়ক সাক্ষাৎকার এবং বিশ্লেষণ।'
            : 'A comprehensive archive of legal analyses, editorial columns, newspaper interviews, and television broadcast appearances on rule of law and constitutional jurisprudence.'
        }
        canonical="/media"
        robots={debouncedSearch || selectedType !== 'all' ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'মিডিয়া' : 'Media', path: '/media' },
        ]}
      />
      {/* Header */}
      <PageHeader
        title={
          locale === 'bn'
            ? 'মিডিয়া উপস্থিতি ও সংবাদ বিশ্লেষণ'
            : 'Media Commentary & Press Analysis'
        }
        eyebrow={locale === 'bn' ? 'জাতীয় বক্তব্য ও সমসাময়িক ভাষ্য' : 'National Discourse & Public Record'}
        description={
          locale === 'bn'
            ? 'জাতীয় সংবাদপত্র, আইন সাময়িকী ও টেলিভিশন টকশোতে অ্যাডভোকেট নিজাম উদ্দিনের সংবিধান ও আইনের শাসন বিষয়ক সাক্ষাৎকার এবং বিশ্লেষণ।'
            : 'A comprehensive archive of legal analyses, editorial columns, newspaper interviews, and television broadcast appearances on rule of law and constitutional jurisprudence.'
        }
        breadcrumbs={
          <nav className="flex items-center gap-2 text-xs text-neutral-400">
            <a href="/" className="hover:text-gold-primary transition-colors">
              {locale === 'bn' ? 'হোম' : 'Home'}
            </a>
            <span>/</span>
            <span className="text-gold-primary">
              {locale === 'bn' ? 'মিডিয়া' : 'Media'}
            </span>
          </nav>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 gap-8 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`pb-4 font-serif text-sm md:text-base transition-colors flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-[#D4A017] text-[#D4A017] font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            {locale === 'bn' ? 'সকল মিডিয়া' : 'All Media'}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('press'); setCurrentPage(1); setSelectedType('all'); }}
            className={`pb-4 font-serif text-sm md:text-base transition-colors flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'press'
                ? 'border-[#D4A017] text-[#D4A017] font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            {locale === 'bn' ? 'সংবাদ ও প্রিন্ট মিডিয়া' : 'Press & Print Media'}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('appearances'); setCurrentPage(1); setSelectedType('all'); }}
            className={`pb-4 font-serif text-sm md:text-base transition-colors flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'appearances'
                ? 'border-[#D4A017] text-[#D4A017] font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            {locale === 'bn' ? 'টেলিভিশন ও সম্প্রচার' : 'Electronic Media & Broadcasts'}
          </button>
        </div>

        {/* Filter Controls (for Press & Appearances) */}
        {activeTab !== 'all' && (
          <div className="bg-neutral-900/60 border border-neutral-800 p-4 md:p-6 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'press'
                    ? locale === 'bn' ? 'শিরোনাম বা সংবাদপত্র দিয়ে খুঁজুন...' : 'Search articles by title or source...'
                    : locale === 'bn' ? 'অনুষ্ঠান বা চ্যানেল দিয়ে খুঁজুন...' : 'Search appearances by program or channel...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                className="bg-neutral-950 border border-neutral-800 text-sm rounded px-3 py-2 text-neutral-300 focus:outline-none focus:border-[#D4A017]"
              >
                <option value="all">{locale === 'bn' ? 'সকল ধরন' : 'All Types'}</option>
                {activeTab === 'press' ? (
                  <>
                    <option value="newspaper">Newspaper Article</option>
                    <option value="magazine">Magazine Feature</option>
                    <option value="online_news">Online News</option>
                    <option value="editorial">Editorial / Column</option>
                    <option value="press_release">Press Release</option>
                  </>
                ) : (
                  <>
                    <option value="tv">Television Broadcast</option>
                    <option value="talk_show">TV Talk Show</option>
                    <option value="roundtable">Panel Discussion</option>
                    <option value="interview">Interview</option>
                    <option value="radio">Radio</option>
                  </>
                )}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                className="bg-neutral-950 border border-neutral-800 text-sm rounded px-3 py-2 text-neutral-300 focus:outline-none focus:border-[#D4A017]"
              >
                <option value="all">{locale === 'bn' ? 'সকল বছর' : 'All Years'}</option>
                {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {(searchTerm || selectedType !== 'all' || selectedYear !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-neutral-400 hover:text-[#D4A017] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {locale === 'bn' ? 'রিসেট' : 'Reset'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800 rounded-lg flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-neutral-900/60 border border-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* TAB 1: ALL MEDIA (OVERVIEW WITH FEATURED SECTIONS) */}
        {!loading && !error && activeTab === 'all' && (
          <div className="space-y-16">
            {/* Featured Highlights (if any) */}
            {(featuredPress.length > 0 || featuredAppearances.length > 0) && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Star className="w-5 h-5 text-[#D4A017] fill-[#D4A017]" />
                  <h2 className="text-xl font-serif text-neutral-100">
                    {locale === 'bn' ? 'প্রধান মিডিয়া ও সম্প্রচার হাইলাইটস' : 'Featured Media Highlights'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredPress.map((item) => {
                    const title = getResolvedString(item.title);
                    const source = getResolvedString(item.media_name || item.source);
                    const desc = getResolvedString(item.description);

                    return (
                      <div
                        key={`fp-${item.id}`}
                        onClick={() => navigate(`/media/press/${item.slug}`)}
                        className="group bg-neutral-900/80 border border-[#D4A017]/40 hover:border-[#D4A017] rounded-lg p-6 cursor-pointer transition-all hover:bg-neutral-900 relative flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#D4A017] font-semibold tracking-wider uppercase">
                              {source}
                            </span>
                            <span className="text-neutral-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.published_date || item.date || '—'}
                            </span>
                          </div>

                          <h3 className="text-lg font-serif text-neutral-100 group-hover:text-[#D4A017] transition-colors leading-snug">
                            {title}
                          </h3>

                          {desc && (
                            <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-[#D4A017] font-medium">
                          <span>{locale === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read Article Analysis'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}

                  {featuredAppearances.map((item) => {
                    const title = getResolvedString(item.title);
                    const channel = getResolvedString(item.channel || item.source);
                    const program = getResolvedString(item.program);
                    const desc = getResolvedString(item.description);

                    return (
                      <div
                        key={`fa-${item.id}`}
                        onClick={() => navigate(`/media/appearances/${item.slug}`)}
                        className="group bg-neutral-900/80 border border-[#D4A017]/40 hover:border-[#D4A017] rounded-lg p-6 cursor-pointer transition-all hover:bg-neutral-900 relative flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#D4A017] font-semibold tracking-wider uppercase">
                              {channel} — {program}
                            </span>
                            <span className="text-neutral-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.broadcast_date || item.date || '—'}
                            </span>
                          </div>

                          <h3 className="text-lg font-serif text-neutral-100 group-hover:text-[#D4A017] transition-colors leading-snug">
                            {title}
                          </h3>

                          {desc && (
                            <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-[#D4A017] font-medium">
                          <span>{locale === 'bn' ? 'টকশো বিবরণী ও লিংক' : 'View Broadcast Dialogue'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Latest Press Articles */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#D4A017]" />
                  <h2 className="text-xl font-serif text-neutral-100">
                    {locale === 'bn' ? 'সাম্প্রতিক সংবাদ ও প্রকাশনা' : 'Recent Press & Print Coverage'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('press')}
                  className="text-xs text-[#D4A017] hover:underline flex items-center gap-1"
                >
                  {locale === 'bn' ? 'সকল সংবাদ দেখুন' : 'View All Press'}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {latestPress.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-neutral-900/40 rounded-lg">
                  {locale === 'bn' ? 'কোনো সংবাদ প্রকাশনা পাওয়া যায়নি।' : 'No press articles available yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestPress.map((item) => {
                    const title = getResolvedString(item.title);
                    const source = getResolvedString(item.media_name || item.source);
                    const desc = getResolvedString(item.description);

                    return (
                      <div
                        key={`lp-${item.id}`}
                        onClick={() => navigate(`/media/press/${item.slug}`)}
                        className="group bg-neutral-900/40 border border-neutral-800 hover:border-[#D4A017]/80 rounded-lg p-5 cursor-pointer transition-all hover:bg-neutral-900 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#D4A017] font-medium">{source}</span>
                            <span className="text-neutral-500">{item.published_date || item.date}</span>
                          </div>
                          <h4 className="font-serif text-base text-neutral-100 group-hover:text-[#D4A017] transition-colors line-clamp-2">
                            {title}
                          </h4>
                          {desc && (
                            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 group-hover:text-[#D4A017] transition-colors">
                          <span>{locale === 'bn' ? 'বিস্তারিত' : 'Read Article'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Latest Electronic Appearances */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#D4A017]" />
                  <h2 className="text-xl font-serif text-neutral-100">
                    {locale === 'bn' ? 'টেলিভিশন টকশো ও সাক্ষাৎকার' : 'Television & Broadcast Archive'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('appearances')}
                  className="text-xs text-[#D4A017] hover:underline flex items-center gap-1"
                >
                  {locale === 'bn' ? 'সকল সম্প্রচার দেখুন' : 'View All Broadcasts'}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {latestAppearances.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-neutral-900/40 rounded-lg">
                  {locale === 'bn' ? 'কোনো সম্প্রচার রেকর্ড পাওয়া যায়নি।' : 'No broadcast appearances available yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestAppearances.map((item) => {
                    const title = getResolvedString(item.title);
                    const channel = getResolvedString(item.channel || item.source);
                    const program = getResolvedString(item.program);
                    const desc = getResolvedString(item.description);

                    return (
                      <div
                        key={`la-${item.id}`}
                        onClick={() => navigate(`/media/appearances/${item.slug}`)}
                        className="group bg-neutral-900/40 border border-neutral-800 hover:border-[#D4A017]/80 rounded-lg p-5 cursor-pointer transition-all hover:bg-neutral-900 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#D4A017] font-medium">{channel}</span>
                            <span className="text-neutral-500">{item.broadcast_date || item.date}</span>
                          </div>
                          <div className="text-xs text-neutral-400 font-medium">Program: {program}</div>
                          <h4 className="font-serif text-base text-neutral-100 group-hover:text-[#D4A017] transition-colors line-clamp-2">
                            {title}
                          </h4>
                          {desc && (
                            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 group-hover:text-[#D4A017] transition-colors">
                          <span>{locale === 'bn' ? 'বিস্তারিত' : 'View Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2 & 3: PAGINATED PRESS OR APPEARANCES GRID */}
        {!loading && !error && activeTab !== 'all' && (
          <div className="space-y-8">
            {tabItems.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 bg-neutral-900/40 border border-neutral-800 rounded-lg">
                <AlertCircle className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                <p>
                  {locale === 'bn'
                    ? 'কোনো তথ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।'
                    : 'No media records match your filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tabItems.map((item) => {
                  const title = getResolvedString(item.title);
                  const isPress = activeTab === 'press';
                  const source = isPress
                    ? getResolvedString((item as MediaPress).media_name || (item as MediaPress).source)
                    : getResolvedString((item as MediaAppearance).channel || (item as MediaAppearance).source);
                  const date = isPress
                    ? (item as MediaPress).published_date || (item as MediaPress).date
                    : (item as MediaAppearance).broadcast_date || (item as MediaAppearance).date;
                  const desc = getResolvedString(item.description);

                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(isPress ? `/media/press/${item.slug}` : `/media/appearances/${item.slug}`)}
                      className="group bg-neutral-900/60 border border-neutral-800 hover:border-[#D4A017] rounded-lg p-6 cursor-pointer transition-all hover:bg-neutral-900 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#D4A017] font-semibold uppercase tracking-wider">
                            {source}
                          </span>
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {date || '—'}
                          </span>
                        </div>

                        {!isPress && (item as MediaAppearance).program && (
                          <div className="text-xs text-neutral-400 font-medium">
                            Program: {getResolvedString((item as MediaAppearance).program)}
                          </div>
                        )}

                        <h3 className="text-lg font-serif text-neutral-100 group-hover:text-[#D4A017] transition-colors leading-snug">
                          {title}
                        </h3>

                        {desc && (
                          <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                            {desc}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-[#D4A017] font-medium">
                        <span>{isPress ? (locale === 'bn' ? 'বিশ্লেষণ পড়ুন' : 'Read Analysis') : (locale === 'bn' ? 'আলোচনা দেখুন' : 'View Dialogue')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
                <span className="text-xs text-neutral-400">
                  {locale === 'bn'
                    ? `পৃষ্ঠা ${currentPage} / ${totalPages} (মোট ${totalCount} টি)`
                    : `Page ${currentPage} of ${totalPages} (${totalCount} total entries)`}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1"
                  >
                    {locale === 'bn' ? 'পরবর্তী' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
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
