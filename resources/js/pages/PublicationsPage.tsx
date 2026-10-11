import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { publicationsApi } from '@/api/publications';
import { Publication } from '@/types';
import { TaxonomyCategory, TaxonomyTag } from '@/types/publication';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Calendar,
  FileText,
  ExternalLink,
  ArrowRight,
  Download,
  User,
  RotateCcw,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const PublicationsPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [publications, setPublications] = useState<Publication[]>([]);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [tags, setTags] = useState<TaxonomyTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
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

  // Load Taxonomies
  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          publicationsApi.getCategories('publications'),
          publicationsApi.getTags(),
        ]);
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (tagRes.success && tagRes.data) {
          setTags(tagRes.data);
        }
      } catch (err) {
        console.warn('Could not fetch taxonomies for publication filters:', err);
      }
    };
    loadTaxonomies();
  }, []);

  const fetchPublications = useCallback(async () => {
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

      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedTag !== 'all') {
        params.tag = selectedTag;
      }

      const response = await publicationsApi.getPublications(params);

      if (response.success) {
        setPublications(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.last_page || 1);
          setTotalCount(response.meta.total || 0);
        }
      } else {
        setError(response.message || 'Failed to load publications repository.');
      }
    } catch (err: any) {
      console.error('Failed to fetch publications:', err);
      setError(
        err?.response?.data?.message ||
          (locale === 'bn'
            ? 'প্রকাশনা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
            : 'Unable to retrieve publications. Please check your connection and try again.')
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedType, selectedCategory, selectedTag, locale]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const resolveText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val.en || val.bn || '';
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedTag('all');
    setCurrentPage(1);
  };

  const publicationTypeLabels: Record<string, { en: string; bn: string }> = {
    book: { en: 'Book / Treatise', bn: 'বই / গ্রন্থ' },
    journal_article: { en: 'Journal Article', bn: 'জার্নাল প্রবন্ধ' },
    research_paper: { en: 'Research Paper', bn: 'গবেষণা পত্র' },
    conference_paper: { en: 'Conference Paper', bn: 'কনফারেন্স পেপার' },
    legal_article: { en: 'Legal Article', bn: 'আইনি নিবন্ধ' },
    case_note: { en: 'Case Note', bn: 'মামলা পর্যালোচনা' },
    law_review: { en: 'Law Review', bn: 'আইন সমীক্ষা' },
    legal_opinion: { en: 'Legal Opinion', bn: 'আইনি মতামত' },
    book_chapter: { en: 'Book Chapter', bn: 'পুস্তকাংশ' },
    report: { en: 'Legal Report', bn: 'আইনি প্রতিবেদন' },
    other: { en: 'Publication', bn: 'প্রকাশনা' },
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 py-16">
      <SeoHead
        title={
          locale === 'bn'
            ? 'আইনি প্রকাশনা ও গবেষণা মনোগ্রাফ | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Legal Publications & Books | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'বাংলাদেশ আইনশাস্ত্র ও সংবিধান সংক্রান্ত প্রকাশিত গ্রন্থ, জার্নাল প্রবন্ধ এবং আইনি সমীক্ষা।'
            : 'Published legal treatises, academic papers, monographs, and analytical studies on Bangladesh jurisprudence.'
        }
        canonical="/publications"
        robots={debouncedSearch || selectedType !== 'all' || selectedCategory !== 'all' || selectedTag !== 'all' ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'প্রকাশনা' : 'Publications', path: '/publications' },
        ]}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Editorial Page Header */}
        <PageHeader
          eyebrow={locale === 'bn' ? 'গ্রন্থপঞ্জি ও প্রাতিষ্ঠানিক গবেষণা' : 'Legal Treatises & Scholarship'}
          title={
            locale === 'bn'
              ? 'আইনি প্রকাশনা ও গবেষণা মনোগ্রাফ'
              : 'Publications & Legal Monograph Archive'
          }
          description={
            locale === 'bn'
              ? 'আইনশাস্ত্র, সাংবিধানিক অধিকার ও বিচারিক প্রক্রিয়ার ওপর প্রকাশিত গবেষণা গ্রন্থ, জার্নাল নিবন্ধ ও প্রাতিষ্ঠানিক প্রকাশনা।'
              : 'Comprehensive repository of authored treatises, peer-reviewed law journal contributions, judicial monographs, and substantive jurisprudential studies.'
          }
        />

        {/* Search & Filter Toolbar */}
        <div className="mt-12 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  locale === 'bn'
                    ? 'শিরোনাম, লেখক বা প্রকাশনা অনুসন্ধান করুন...'
                    : 'Search publications by title, author, or publisher...'
                }
                className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-legal-gold transition"
              />
            </div>

            {/* Type Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-legal-gold transition"
              >
                <option value="all">
                  {locale === 'bn' ? 'সকল প্রকাশনার ধরন' : 'All Publication Types'}
                </option>
                {Object.entries(publicationTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {locale === 'bn' ? label.bn : label.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="md:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-legal-gold transition"
              >
                <option value="all">
                  {locale === 'bn' ? 'সকল বিষয়' : 'All Categories'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug || cat.id}>
                    {resolveText(cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Selector */}
            <div className="md:col-span-2">
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-legal-gold transition"
              >
                <option value="all">
                  {locale === 'bn' ? 'সকল ট্যাগ' : 'All Tags'}
                </option>
                {tags.map((t) => (
                  <option key={t.id} value={t.slug || t.id}>
                    {resolveText(t.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="md:col-span-1 flex items-center justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={resetFilters}
                title={locale === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                className="w-full h-full border-neutral-800 hover:border-legal-gold text-neutral-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 gap-2 px-1">
          <div>
            {locale === 'bn' ? (
              <span>
                মোট <strong className="text-legal-gold font-mono">{totalCount}</strong> টি প্রকাশনা সংরক্ষিত
              </span>
            ) : (
              <span>
                Cataloged treatises: <strong className="text-legal-gold font-mono">{totalCount}</strong> published works
              </span>
            )}
          </div>
          {totalPages > 1 && (
            <div>
              {locale === 'bn' ? (
                <span>পৃষ্ঠা {currentPage} / {totalPages}</span>
              ) : (
                <span>Page {currentPage} of {totalPages}</span>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-legal-gold border-t-transparent mb-4" />
            <p className="text-sm font-serif text-neutral-400">
              {locale === 'bn' ? 'প্রকাশনা ভান্ডার অনুসন্ধান করা হচ্ছে...' : 'Retrieving publication dossiers...'}
            </p>
          </div>
        ) : error ? (
          <div className="mt-8 bg-red-950/20 border border-red-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-200">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchPublications}
              className="mt-4 border-red-500/40 text-red-200"
            >
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Retrieval'}
            </Button>
          </div>
        ) : publications.length === 0 ? (
          <div className="mt-12 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-16 text-center max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-white mb-2">
              {locale === 'bn' ? 'কোনো প্রকাশনা পাওয়া যায়নি' : 'No Publications Found'}
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              {locale === 'bn'
                ? 'আপনার প্রদত্ত শর্তে কোনো প্রকাশনা রেকর্ড খুঁজে পাওয়া যায়নি। অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন।'
                : 'No published works match your active query filters. Try adjusting your parameters or resetting filters.'}
            </p>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              {locale === 'bn' ? 'সব ফিল্টার মুছুন' : 'Clear All Filters'}
            </Button>
          </div>
        ) : (
          /* Publication Cards Grid */
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((item) => {
              const title = resolveText(item.title);
              const author = resolveText(item.author);
              const sourceName = resolveText(item.publication_name);
              const excerpt = resolveText(item.excerpt);
              const typeMeta = publicationTypeLabels[item.publication_type] || {
                en: item.publication_type,
                bn: item.publication_type,
              };

              return (
                <article
                  key={item.id}
                  onClick={() => navigate(`/publications/${item.slug}`)}
                  className="group cursor-pointer bg-neutral-900/50 hover:bg-neutral-900/90 border border-neutral-800 hover:border-legal-gold/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-legal-gold/5 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono tracking-wider uppercase text-legal-gold bg-legal-gold/10 px-2.5 py-0.5 rounded-full border border-legal-gold/20">
                        {locale === 'bn' ? typeMeta.bn : typeMeta.en}
                      </span>
                      {item.is_featured && (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {locale === 'bn' ? 'বিশেষ নির্বাচিত' : 'Featured'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-legal-gold transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>

                    {/* Author & Source Details */}
                    <div className="space-y-1.5 text-xs text-neutral-400 border-l border-neutral-800 pl-3">
                      {author && (
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <User className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                          <span className="font-medium truncate">{author}</span>
                        </div>
                      )}
                      {sourceName && (
                        <div className="flex items-center gap-1.5 text-neutral-400 italic">
                          <FileText className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                          <span className="truncate">{sourceName}</span>
                        </div>
                      )}
                      {item.publication_date && (
                        <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                          <span>{item.publication_date.substring(0, 10)}</span>
                        </div>
                      )}
                    </div>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {item.has_pdf && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-legal-gold bg-legal-gold/10 px-2 py-0.5 rounded border border-legal-gold/20">
                          <Download className="w-3 h-3" /> PDF
                        </span>
                      )}
                      {item.external_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                          <ExternalLink className="w-3 h-3" /> External
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-legal-gold group-hover:translate-x-1 transition-transform font-medium text-xs">
                      <span>{locale === 'bn' ? 'বিস্তারিত দেখুন' : 'Read Dossier'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="border-neutral-800 hover:border-legal-gold text-neutral-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
            </Button>

            <div className="flex items-center gap-1 font-mono text-xs">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                    currentPage === pg
                      ? 'bg-legal-gold text-black font-bold'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="border-neutral-800 hover:border-legal-gold text-neutral-300 disabled:opacity-40"
            >
              {locale === 'bn' ? 'পরবর্তী' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
