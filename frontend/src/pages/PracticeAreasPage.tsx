import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PracticeAreaCard } from '@/components/cards/PracticeAreaCard';
import { PracticeAreaIcon } from '@/components/icons/PracticeAreaIcon';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { practiceAreaApi } from '@/api/practiceAreas';
import { PracticeArea } from '@/types/practiceArea';
import { Search, Sparkles, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const PracticeAreasPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'featured'>('all');
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

  const fetchPracticeAreas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
        per_page: 9,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (activeFilter === 'featured') {
        params.featured = true;
      }

      const response = await practiceAreaApi.getPracticeAreas(params);

      if (response.success) {
        setPracticeAreas(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.last_page || 1);
          setTotalCount(response.meta.total || 0);
        }
      } else {
        setError(response.message || 'Unable to load practice areas.');
      }
    } catch (err: any) {
      console.error('Failed to load practice areas:', err);
      setError(err?.response?.data?.message || 'A network error occurred while loading practice domains.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, activeFilter, locale]);

  useEffect(() => {
    fetchPracticeAreas();
  }, [fetchPracticeAreas]);

  const resolveText = (text: any): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[locale] || text.en || '';
  };

  return (
    <div className="min-h-screen bg-background-base text-text-primary selection:bg-gold-primary/20 selection:text-gold-hover pb-24">
      <SeoHead
        title={locale === 'bn' ? 'প্র্যাকটিস এরিয়া ও আইনি পরামর্শ | অ্যাডভোকেট নিজাম উদ্দিন (হক)' : 'Legal Practice Areas | Chambers of Advocate Nijam Uddin (Haq)'}
        description={
          locale === 'bn'
            ? 'বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট ও আপিল বিভাগের সাংবিধানিক, দেওয়ানি, বাণিজ্যিক ও রাজস্ব সংক্রান্ত বিশেষায়িত আইনি সেবা।'
            : 'Authoritative advocacy across constitutional writs, appellate review, commercial contracts, and high-stakes dispute resolution before the Supreme Court of Bangladesh.'
        }
        canonical="/practice-areas"
        robots={debouncedSearch ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'প্র্যাকটিস এরিয়া' : 'Practice Areas', path: '/practice-areas' },
        ]}
      />
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={locale === 'bn' ? 'আইনি বিশেষত্ব' : 'Jurisdictional Specializations'}
        title={locale === 'bn' ? 'প্র্যাকটিস এরিয়া ও আইনি পরামর্শ' : 'Practice Areas & Jurisdictional Domains'}
        description={
          locale === 'bn'
            ? 'বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট ও আপিল বিভাগের সাংবিধানিক, দেওয়ানি, বাণিজ্যিক ও রাজস্ব সংক্রান্ত বিশেষায়িত আইনি সেবা।'
            : 'Authoritative advocacy across constitutional writs, appellate review, commercial contracts, and high-stakes dispute resolution before the Supreme Court of Bangladesh.'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* 2. Control Bar: Search & Filter Tabs */}
        <div className="bg-surface-card border border-border-subtle p-4 sm:p-6 rounded-lg mb-12 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                locale === 'bn'
                  ? 'আইনি বিষয় বা প্র্যাকটিস অনুসন্ধান...'
                  : 'Search by legal area, writ, or keyword...'
              }
              className="w-full bg-surface-base border border-border-subtle rounded-md pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-gold-primary transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 border-t md:border-t-0 border-border-subtle pt-3 md:pt-0">
            <button
              onClick={() => {
                setActiveFilter('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                activeFilter === 'all'
                  ? 'bg-gold-primary text-background-base shadow-sm'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-elevated/80'
              }`}
            >
              {locale === 'bn' ? 'সকল প্র্যাকটিস' : 'All Domains'}
            </button>
            <button
              onClick={() => {
                setActiveFilter('featured');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md flex items-center space-x-1.5 transition-all ${
                activeFilter === 'featured'
                  ? 'bg-gold-primary text-background-base shadow-sm'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-elevated/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'বিশেষ অগ্রাধিকার' : 'Featured Only'}</span>
            </button>
          </div>
        </div>

        {/* 3. Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-lg bg-surface-card border border-border-subtle p-8 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="w-8 h-4 bg-surface-elevated rounded mb-6" />
                  <div className="w-3/4 h-6 bg-surface-elevated rounded mb-4" />
                  <div className="w-full h-4 bg-surface-elevated rounded mb-2" />
                  <div className="w-5/6 h-4 bg-surface-elevated rounded" />
                </div>
                <div className="w-1/3 h-4 bg-surface-elevated rounded pt-4 border-t border-border-subtle/40" />
              </div>
            ))}
          </div>
        )}

        {/* 4. Error State */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center max-w-xl mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-serif-editorial font-bold text-red-200 mb-2">
              {locale === 'bn' ? 'তথ্য লোড করা সম্ভব হয়নি' : 'Failed to Load Practice Areas'}
            </h3>
            <p className="text-sm text-text-muted mb-6">{error}</p>
            <Button variant="secondary" onClick={() => fetchPracticeAreas()}>
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
            </Button>
          </div>
        )}

        {/* 5. Empty State */}
        {!loading && !error && practiceAreas.length === 0 && (
          <div className="bg-surface-card border border-border-subtle rounded-lg p-12 text-center max-w-2xl mx-auto my-12">
            <div className="w-14 h-14 rounded-full bg-gold-subtle border border-gold-border flex items-center justify-center mx-auto mb-4 text-gold-primary">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-editorial font-bold text-text-primary mb-2">
              {locale === 'bn' ? 'কোনো প্র্যাকটিস এরিয়া পাওয়া যায়নি' : 'No Practice Areas Found'}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto mb-6">
              {debouncedSearch
                ? locale === 'bn'
                  ? 'আপনার অনুসন্ধান অনুযায়ী কোনো আইনি বিষয় পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।'
                  : 'No specialized legal domains matched your search criteria. Please try another term.'
                : locale === 'bn'
                ? 'বর্তমানে কোনো প্র্যাকটিস এরিয়া সক্রিয় নেই। বিস্তারিত তথ্যের জন্য চেম্বারে যোগাযোগ করুন।'
                : 'No specialized practice domains have been published yet. Please contact the chamber for specific legal counsel.'}
            </p>
            {debouncedSearch && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
              >
                {locale === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Clear Filters'}
              </Button>
            )}
          </div>
        )}

        {/* 6. Practice Area Cards Grid */}
        {!loading && !error && practiceAreas.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {practiceAreas.map((area, index) => {
                const itemNumber = (currentPage - 1) * 9 + index + 1;
                return (
                  <PracticeAreaCard
                    key={area.id}
                    number={itemNumber}
                    title={resolveText(area.title)}
                    description={resolveText(area.short_description)}
                    icon={<PracticeAreaIcon name={area.icon_name} className="w-5 h-5" />}
                    onClick={() => navigate(`/practice-areas/${area.slug}`)}
                  />
                );
              })}
            </div>

            {/* 7. Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-between border-t border-border-subtle pt-6">
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {locale === 'bn'
                    ? `মোট ${totalCount} টি বিষয়ের মধ্যে পাতা ${currentPage} (সর্বমোট ${totalPages})`
                    : `Page ${currentPage} of ${totalPages} (${totalCount} domains)`}
                </p>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>{locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <span>{locale === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
