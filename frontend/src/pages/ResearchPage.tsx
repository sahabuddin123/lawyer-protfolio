import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResearchCard } from '@/components/cards/ResearchCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/i18n';
import { researchApi } from '@/api/research';
import { LegalResearch } from '@/types';
import { TaxonomyCategory } from '@/types/research';
import { Search, ChevronLeft, ChevronRight, AlertCircle, BookOpen, FileText } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const ResearchPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [researches, setResearches] = useState<LegalResearch[]>([]);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
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

  // Load Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await researchApi.getPublicCategories('research');
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch research categories:', err);
      }
    };
    loadCategories();
  }, []);

  const fetchResearches = useCallback(async () => {
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

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      const response = await researchApi.getResearches(params);

      if (response.success) {
        setResearches(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.last_page || 1);
          setTotalCount(response.meta.total || 0);
        }
      } else {
        setError(response.message || 'Failed to load legal research monographs.');
      }
    } catch (err: any) {
      console.error('Failed to fetch legal research:', err);
      setError(
        err?.response?.data?.message ||
          (locale === 'bn'
            ? 'আইনি গবেষণা সংগ্রহ প্রদর্শনে ত্রুটি ঘটেছে।'
            : 'A secure connection error occurred while querying the legal research monograph archive.')
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, selectedType, locale]);

  useEffect(() => {
    fetchResearches();
  }, [fetchResearches]);

  const resolveText = (text: any): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[locale] || text.en || '';
  };

  const researchTypes = [
    { value: 'all', label: locale === 'bn' ? 'সকল প্রকার' : 'All Types' },
    { value: 'article', label: locale === 'bn' ? 'নিবন্ধ' : 'Article' },
    { value: 'case_analysis', label: locale === 'bn' ? 'মামলা বিশ্লেষণ' : 'Case Analysis' },
    { value: 'research_paper', label: locale === 'bn' ? 'গবেষণা পত্র' : 'Research Paper' },
    { value: 'constitutional_analysis', label: locale === 'bn' ? 'সাংবিধানিক বিশ্লেষণ' : 'Constitutional Analysis' },
    { value: 'statutory_analysis', label: locale === 'bn' ? 'সংবিধিবদ্ধ বিশ্লেষণ' : 'Statutory Analysis' },
    { value: 'legal_opinion', label: locale === 'bn' ? 'আইনি মতামত' : 'Legal Opinion' },
    { value: 'commentary', label: locale === 'bn' ? 'পর্যালোচনা' : 'Commentary' },
  ];

  return (
    <div className="min-h-screen bg-background-base text-text-primary pb-24">
      <SeoHead
        title={
          locale === 'bn'
            ? 'আইনি গবেষণা ও প্রবন্ধ | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Legal Research & Papers | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'সাংবিধানিক অনুচ্ছেদ, সংবিধিবদ্ধ আইনের ব্যাখ্যা এবং তুলনামূলক আইনশাস্ত্রের ওপর সুপ্রিম কোর্ট আইনজীবী নিজাম উদ্দিন (হক)-এর গবেষণামূলক রচনা ও পর্যালোচনা।'
            : 'Authoritative treatises, statutory analyses, and peer-reviewed jurisprudence examining constitutional doctrine, procedural reforms, and judicial interpretation in Bangladesh.'
        }
        canonical="/research"
        robots={debouncedSearch || selectedCategory !== 'all' || selectedType !== 'all' ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'আইনি গবেষণা' : 'Legal Research', path: '/research' },
        ]}
      />
      {/* Editorial Page Header */}
      <PageHeader
        eyebrow={locale === 'bn' ? 'আইন গবেষণা ও পাণ্ডিত্য' : 'Jurisprudential Scholarship'}
        title={locale === 'bn' ? 'আইনি গবেষণা ও বিশ্লেষণমূলক নিবন্ধ' : 'Legal Research & Monographs'}
        description={
          locale === 'bn'
            ? 'সাংবিধানিক অনুচ্ছেদ, সংবিধিবদ্ধ আইনের ব্যাখ্যা এবং তুলনামূলক আইনশাস্ত্রের ওপর সুপ্রিম কোর্ট আইনজীবী নিজাম উদ্দিন (হক)-এর গবেষণামূলক রচনা ও পর্যালোচনা।'
            : 'Authoritative treatises, statutory analyses, and peer-reviewed jurisprudence examining constitutional doctrine, procedural reforms, and judicial interpretation in Bangladesh.'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        {/* Search & Filter Toolbar */}
        <div className="bg-background-elevated/70 backdrop-blur-md p-6 rounded-xl border border-border-subtle/80 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-subtle">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  locale === 'bn'
                    ? 'শিরোনাম, বিষয় বা লেখক দিয়ে গবেষণা খুঁজুন...'
                    : 'Search research papers, topics, authors...'
                }
                className="w-full bg-background-base/90 border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-subtle focus:outline-none focus:border-gold-primary transition-colors font-sans"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-background-base/90 border border-border-subtle rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-primary transition-colors cursor-pointer"
              >
                <option value="all">
                  {locale === 'bn' ? 'সকল বিভাগ' : 'All Categories'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {resolveText(cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Research Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-background-base/90 border border-border-subtle rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-primary transition-colors cursor-pointer"
              >
                {researchTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory !== 'all' || selectedType !== 'all' || debouncedSearch.trim()) && (
            <div className="mt-4 pt-4 border-t border-border-subtle/50 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-text-subtle font-mono">
                {locale === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}
              </span>

              {selectedCategory !== 'all' && (
                <Badge variant="outline" size="sm">
                  {selectedCategory}
                </Badge>
              )}

              {selectedType !== 'all' && (
                <Badge variant="outline" size="sm">
                  {selectedType.replace('_', ' ')}
                </Badge>
              )}

              {debouncedSearch.trim() && (
                <Badge variant="outline" size="sm">
                  &quot;{debouncedSearch}&quot;
                </Badge>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSearchTerm('');
                  setDebouncedSearch('');
                  setCurrentPage(1);
                }}
                className="text-gold-primary hover:text-gold-hover underline ml-2 cursor-pointer font-medium"
              >
                {locale === 'bn' ? 'ফিল্টার সাফ করুন' : 'Clear Filters'}
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200 font-medium">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchResearches}
                className="mt-3 text-xs border-red-500/40 text-red-300 hover:bg-red-950/40"
              >
                {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {/* Content Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border-subtle bg-background-elevated/40 animate-pulse h-72 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-neutral-800 rounded w-24" />
                    <div className="h-4 bg-neutral-800 rounded w-16" />
                  </div>
                  <div className="h-6 bg-neutral-800 rounded w-3/4" />
                  <div className="h-4 bg-neutral-800 rounded w-full" />
                  <div className="h-4 bg-neutral-800 rounded w-5/6" />
                </div>
                <div className="h-4 bg-neutral-800 rounded w-28" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && researches.length === 0 && (
          <div className="text-center py-20 px-4 rounded-xl border border-dashed border-border-subtle/80 bg-background-elevated/20">
            <BookOpen className="w-12 h-12 text-gold-primary/40 mx-auto mb-4" />
            <h3 className="text-lg font-serif-editorial font-bold text-text-primary mb-2">
              {locale === 'bn' ? 'কোনো গবেষণা পাওয়া যায়নি' : 'No Research Monographs Found'}
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              {locale === 'bn'
                ? 'আপনার অনুসন্ধান বা নির্বাচিত ফিল্টারের সাথে মিলে যায় এমন কোনো আইনি গবেষণা বা বিশ্লেষণ এই মুহূর্তে নেই।'
                : 'No published legal research monographs match your current search or taxonomy filter criteria.'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
                setSearchTerm('');
                setDebouncedSearch('');
                setCurrentPage(1);
              }}
            >
              {locale === 'bn' ? 'সকল গবেষণা দেখুন' : 'View All Monographs'}
            </Button>
          </div>
        )}

        {/* Research Grid */}
        {!loading && !error && researches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researches.map((item) => {
              const catTitle = item.category
                ? resolveText(item.category.name)
                : item.research_type.replace('_', ' ').toUpperCase();
              const title = resolveText(item.title);
              const excerpt = resolveText(item.excerpt);
              const author = resolveText(item.author);
              const dateStr = item.research_date
                ? item.research_date.split('T')[0]
                : item.published_at
                ? item.published_at.split('T')[0]
                : '';
              const readTime = item.read_time_minutes
                ? `${item.read_time_minutes} ${locale === 'bn' ? 'মিনিট' : 'min read'}`
                : undefined;

              return (
                <div key={item.id} className="relative group">
                  <ResearchCard
                    category={catTitle}
                    title={title}
                    excerpt={excerpt}
                    date={dateStr}
                    readTime={readTime}
                    author={author}
                    onReadArticle={() => navigate(`/research/${item.slug}`)}
                  />

                  {item.has_pdf && (
                    <div
                      className="absolute top-4 right-4 z-10 pointer-events-none"
                      title={locale === 'bn' ? 'পিডিএফ সংযুক্তি আছে' : 'PDF Document Attached'}
                    >
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-gold-primary/20 text-gold-primary border border-gold-primary/30">
                        <FileText className="w-3 h-3" />
                        PDF
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Toolbar */}
        {!loading && !error && totalPages > 1 && (
          <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-text-subtle font-mono">
              {locale === 'bn'
                ? `পৃষ্ঠা ${currentPage} / ${totalPages} (মোট ${totalCount}টি গবেষণা)`
                : `Showing Page ${currentPage} of ${totalPages} (${totalCount} Total Monographs)`}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1"
              >
                <span>{locale === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
