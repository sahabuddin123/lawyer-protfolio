import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { CaseCard } from '@/components/cards/CaseCard';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { courtroomApi } from '@/api/courtroom';
import { CourtroomExperience } from '@/types/courtroom';
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle, Gavel } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const CourtroomPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [experiences, setExperiences] = useState<CourtroomExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
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

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
        per_page: 9,
      };

      if (debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
      }

      if (selectedCourt !== 'all') {
        params.court = selectedCourt;
      }

      if (selectedYear !== 'all') {
        params.year = selectedYear;
      }

      const response = await courtroomApi.getCourtroomExperiences(params);

      if (response.success) {
        setExperiences(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.last_page || 1);
          setTotalCount(response.meta.total || 0);
        }
      } else {
        setError(response.message || 'Failed to load courtroom experiences.');
      }
    } catch (err: any) {
      console.error('Failed to fetch courtroom experiences:', err);
      setError(
        err?.response?.data?.message ||
          'A secure connection error occurred while querying the courtroom archive.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCourt, selectedYear, locale]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const resolveText = (text: any): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[locale] || text.en || '';
  };

  const courtOptions = [
    { value: 'all', label: locale === 'bn' ? 'সকল আদালত' : 'All Courts' },
    { value: 'Supreme Court - Appellate Division', label: locale === 'bn' ? 'আপিল বিভাগ' : 'Appellate Division' },
    { value: 'Supreme Court - High Court Division', label: locale === 'bn' ? 'হাইকোর্ট বিভাগ' : 'High Court Division' },
    { value: 'District & Sessions Court', label: locale === 'bn' ? 'জেলা ও দায়রা আদালত' : 'District & Sessions' },
    { value: 'Special Tribunals', label: locale === 'bn' ? 'বিশেষ ট্রাইব্যুনাল' : 'Special Tribunals' },
  ];

  return (
    <div className="min-h-screen bg-background-base text-text-primary pb-24">
      <SeoHead
        title={
          locale === 'bn'
            ? 'আদালতকক্ষের অভিজ্ঞতা ও নজির | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Courtroom Experience & Advocacy | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'বাংলাদেশ সুপ্রিম কোর্ট ও অধস্তন আদালতে প্রতিনিধিত্ব করা উল্লেখযোগ্য মামলা ও আইনি যুক্তিতর্কের দলিল।'
            : 'Documented litigation portfolio, advocacy representations, and legal arguments before the Supreme Court of Bangladesh and subordinate courts.'
        }
        canonical="/courtroom"
        robots={debouncedSearch || selectedCourt !== 'all' || selectedYear !== 'all' ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'কোর্টরুম অভিজ্ঞতা' : 'Courtroom Experience', path: '/courtroom' },
        ]}
      />
      {/* Editorial Header */}
      <PageHeader
        eyebrow={locale === 'bn' ? 'বিচারিক কার্যবিবরণী' : 'Judicial Practice'}
        title={
          locale === 'bn'
            ? 'আদালতকক্ষের অভিজ্ঞতা ও নজির'
            : 'Notable Courtroom Experiences'
        }
        description={
          locale === 'bn'
            ? 'বাংলাদেশ সুপ্রিম কোর্ট ও অধস্তন আদালতে প্রতিনিধিত্ব করা উল্লেখযোগ্য মামলা ও আইনি যুক্তিতর্কের দলিল।'
            : 'Documented litigation portfolio, advocacy representations, and legal arguments before the Supreme Court of Bangladesh and subordinate courts.'
        }
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Search & Filter Toolbar */}
        <div className="bg-surface-elevated/40 border border-border-subtle rounded-xl p-4 sm:p-6 mb-12 backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
              <input
                type="text"
                placeholder={
                  locale === 'bn'
                    ? 'মামলার শিরোনাম, নম্বর বা সারসংক্ষেপ অনুসন্ধান...'
                    : 'Search cases by title, case number, or legal summary...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-gold-primary transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle hover:text-text-primary"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gold-primary hidden sm:inline-block" />
                <select
                  value={selectedCourt}
                  onChange={(e) => {
                    setSelectedCourt(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-surface-base border border-border-subtle rounded-lg text-xs py-2 px-3 text-text-primary focus:outline-none focus:border-gold-primary"
                >
                  {courtOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedCourt !== 'all' || selectedYear !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCourt('all');
                    setSelectedYear('all');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-text-muted hover:text-gold-primary underline transition-colors px-2"
                >
                  {locale === 'bn' ? 'ফিল্টার সাফ করুন' : 'Clear Filters'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content State Handling */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-surface-elevated/40 border border-border-subtle rounded-xl p-6 h-80 animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="w-20 h-5 bg-surface-elevated rounded mb-4" />
                  <div className="w-3/4 h-6 bg-surface-elevated rounded mb-3" />
                  <div className="w-full h-16 bg-surface-elevated rounded" />
                </div>
                <div className="w-1/3 h-4 bg-surface-elevated rounded pt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto my-12 p-8 text-center bg-surface-elevated/30 border border-status-error/30 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
            <h3 className="text-lg font-serif-editorial font-bold text-text-primary mb-2">
              {locale === 'bn' ? 'তথ্য লোড করতে ব্যর্থ' : 'Unable to Load Archive'}
            </h3>
            <p className="text-sm text-text-muted mb-6">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchExperiences}>
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Query'}
            </Button>
          </div>
        ) : experiences.length === 0 ? (
          <div className="max-w-lg mx-auto my-16 p-10 text-center bg-surface-elevated/20 border border-border-subtle rounded-2xl">
            <Gavel className="w-12 h-12 text-gold-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-serif-editorial font-semibold text-text-primary mb-2">
              {locale === 'bn' ? 'কোনো মামলার রেকর্ড পাওয়া যায়নি' : 'No Courtroom Records Found'}
            </h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              {searchTerm || selectedCourt !== 'all'
                ? locale === 'bn'
                  ? 'বর্তমান ফিল্টারের সাথে মিলে এমন কোনো মামলার রেকর্ড পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                  : 'No documented cases matched your current search parameters. Try adjusting your search term or court selection.'
                : locale === 'bn'
                ? 'বর্তমানে কোনো মামলার বিবরণ সংরক্ষিত নেই। অনুগ্রহ করে পরবর্তীতে চেক করুন।'
                : 'No published case studies are currently displayed in this archive category.'}
            </p>
            {(searchTerm || selectedCourt !== 'all') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCourt('all');
                  setCurrentPage(1);
                }}
              >
                {locale === 'bn' ? 'ফিল্টার সাফ করুন' : 'Clear All Filters'}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Grid of Case Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((experience) => {
                const title = resolveText(experience.title);
                const summary = resolveText(experience.summary);
                const legalArea = resolveText(experience.legal_area);
                const imageUrl = experience.featured_image?.url;

                return (
                  <CaseCard
                    key={experience.id}
                    title={title}
                    court={experience.court}
                    year={experience.year}
                    legalArea={legalArea}
                    caseNumber={experience.case_number || undefined}
                    summary={summary}
                    imageUrl={imageUrl}
                    onReadCase={() => navigate(`/courtroom/${experience.slug}`)}
                  />
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-between border-t border-border-subtle pt-6">
                <div className="text-xs text-text-muted">
                  {locale === 'bn' ? (
                    <>
                      মোট <span className="font-semibold text-text-primary">{totalCount}</span> টি রেকর্ডের মধ্যে পৃষ্ঠা{' '}
                      <span className="font-semibold text-text-primary">{currentPage}</span> / {totalPages}
                    </>
                  ) : (
                    <>
                      Showing page <span className="font-semibold text-text-primary">{currentPage}</span> of{' '}
                      <span className="font-semibold text-text-primary">{totalPages}</span> ({totalCount} verified cases)
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="flex items-center gap-1"
                  >
                    <span>{locale === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
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
