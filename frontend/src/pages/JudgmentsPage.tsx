import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/i18n';
import { judgmentsApi } from '@/api/judgments';
import { practiceAreaApi } from '@/api/practiceAreas';
import { JudgmentReview } from '@/types';
import { PracticeArea } from '@/types/practiceArea';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Scale,
  Calendar,
  FileText,
  ArrowRight,
} from 'lucide-react';

export const JudgmentsPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  const [judgments, setJudgments] = useState<JudgmentReview[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>('all');
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

  // Load Practice Areas for filtering
  useEffect(() => {
    const loadPracticeAreas = async () => {
      try {
        const res = await practiceAreaApi.getPracticeAreas({ per_page: 50 });
        if (res.success && res.data) {
          setPracticeAreas(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch practice areas for filter:', err);
      }
    };
    loadPracticeAreas();
  }, []);

  const fetchJudgments = useCallback(async () => {
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

      if (selectedCourt !== 'all') {
        params.court = selectedCourt;
      }

      if (selectedPracticeArea !== 'all') {
        params.practice_area = selectedPracticeArea;
      }

      const response = await judgmentsApi.getJudgments(params);

      if (response.success) {
        setJudgments(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.last_page || 1);
          setTotalCount(response.meta.total || 0);
        }
      } else {
        setError(response.message || 'Failed to load judgment reviews.');
      }
    } catch (err: any) {
      console.error('Failed to fetch judgment reviews:', err);
      setError(
        err?.response?.data?.message ||
          (locale === 'bn'
            ? 'আদালতের রায় পর্যালোচনা সংগ্রহ প্রদর্শনে সমস্যা হয়েছে।'
            : 'A secure connection error occurred while retrieving landmark judgment reviews.')
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCourt, selectedPracticeArea, locale]);

  useEffect(() => {
    fetchJudgments();
  }, [fetchJudgments]);

  const resolveText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val.en || val.bn || '';
  };

  const courts = [
    { value: 'all', label: locale === 'bn' ? 'সকল আদালত' : 'All Courts' },
    { value: 'Appellate Division', label: locale === 'bn' ? 'আপিল বিভাগ' : 'Appellate Division' },
    { value: 'High Court Division', label: locale === 'bn' ? 'হাইকোর্ট বিভাগ' : 'High Court Division' },
    { value: 'Supreme Court', label: locale === 'bn' ? 'সুপ্রিম কোর্ট' : 'Supreme Court' },
  ];

  return (
    <div className="min-h-screen bg-judicial-bg text-white pb-24">
      {/* Editorial Page Header */}
      <PageHeader
        title={locale === 'bn' ? 'যুগান্তকারী রায় ও পর্যালোচনা' : 'Landmark Judgment Reviews'}
        description={
          locale === 'bn'
            ? 'বাংলাদেশ সুপ্রিম কোর্টের গুরুত্বপূর্ণ সিদ্ধান্তসমূহ, আইনি অনুসিদ্ধান্ত এবং ব্যবহারিক প্রয়োগের বিশ্লেষণ।'
            : 'Authoritative analyses of Supreme Court decisions, ratio decidendi holding, and judicial precedent impact.'
        }
        eyebrow={locale === 'bn' ? 'বিচারিক نظির' : 'Judicial Precedents'}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 max-w-7xl">
        {/* Search & Multi-Filter Controls */}
        <div className="bg-judicial-card/60 border border-judicial-border rounded-2xl p-6 backdrop-blur-md shadow-2xl mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  locale === 'bn'
                    ? 'মামলার নাম, নজির সাইটেশন বা আদালত অনুসন্ধান করুন...'
                    : 'Search by case title, law report citation, or court...'
                }
                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-judicial-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>

            {/* Court Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedCourt}
                onChange={(e) => {
                  setSelectedCourt(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Court"
                className="w-full py-3 px-4 bg-black/50 border border-judicial-border rounded-xl text-white focus:outline-none focus:border-gold transition-colors text-sm"
              >
                {courts.map((court) => (
                  <option key={court.value} value={court.value}>
                    {court.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Practice Area Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedPracticeArea}
                onChange={(e) => {
                  setSelectedPracticeArea(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Practice Area"
                className="w-full py-3 px-4 bg-black/50 border border-judicial-border rounded-xl text-white focus:outline-none focus:border-gold transition-colors text-sm"
              >
                <option value="all">
                  {locale === 'bn' ? 'সকল প্র্যাকটিস ক্ষেত্র' : 'All Practice Areas'}
                </option>
                {practiceAreas.map((pa) => (
                  <option key={pa.id} value={pa.slug}>
                    {resolveText(pa.title)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mb-4" />
            <p className="text-gray-400 font-serif">
              {locale === 'bn'
                ? 'আইনি নথি লোড হচ্ছে...'
                : 'Retrieving authoritative judicial dossier...'}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-red-200 mb-2">
              {locale === 'bn' ? 'তথ্য প্রাপ্তিতে ব্যর্থতা' : 'Data Retrieval Error'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <Button variant="secondary" onClick={() => fetchJudgments()}>
              {locale === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Query'}
            </Button>
          </div>
        ) : judgments.length === 0 ? (
          /* Authoritative Empty State */
          <div className="bg-judicial-card/30 border border-dashed border-judicial-border rounded-2xl p-16 text-center max-w-2xl mx-auto my-12">
            <Scale className="w-16 h-16 text-gold/40 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-3">
              {locale === 'bn' ? 'কোনো রায় পাওয়া যায়নি' : 'No Judgment Reviews Available'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
              {debouncedSearch || selectedCourt !== 'all' || selectedPracticeArea !== 'all'
                ? locale === 'bn'
                  ? 'আপনার অনুসন্ধানের ফিল্টারের সাথে মিলে এমন কোনো প্রকাশিত রায় পর্যালোচনা খুঁজে পাওয়া যায়নি।'
                  : 'No verified judgment monographs match your selected criteria. Please broaden your search parameters.'
                : locale === 'bn'
                ? 'বর্তমানে কোনো বিচারিক পর্যালোচনা প্রকাশিত নেই। অনুমোদিত প্রশাসক শীঘ্রই বিশ্লেষণ প্রকাশ করবেন।'
                : 'There are currently no published judgment reviews in this directory. Content will appear once verified by the advocate.'}
            </p>
          </div>
        ) : (
          <>
            {/* Grid of Judgment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {judgments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/judgments/${item.slug}`)}
                  className="group bg-judicial-card/50 border border-judicial-border hover:border-gold/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-gold/5 cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header meta badge & citation */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-block px-2.5 py-1 bg-gold/10 border border-gold/30 rounded text-gold font-mono text-xs font-semibold">
                        {item.citation}
                      </span>
                      {item.practice_area && (
                        <Badge variant="outline" className="text-xs">
                          {resolveText(item.practice_area.title)}
                        </Badge>
                      )}
                    </div>

                    {/* Case Name */}
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                      {resolveText(item.case_name)}
                    </h3>

                    {/* Court and Date */}
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{item.court}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold/70" />
                        {item.judgment_date ? item.judgment_date.substring(0, 10) : 'Date unrecorded'}
                      </span>
                    </div>

                    {/* Summary Snippet */}
                    <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                      {resolveText(item.summary)}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-6 mt-6 border-t border-judicial-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      {item.has_pdf && (
                        <span className="flex items-center gap-1 text-gold/90 font-mono">
                          <FileText className="w-3.5 h-3.5" />
                          PDF
                        </span>
                      )}
                    </div>
                    <span className="text-gold flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                      {locale === 'bn' ? 'বিস্তারিত রায়' : 'Read Review'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Accessible Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-between bg-judicial-card/40 border border-judicial-border rounded-xl px-6 py-4">
                <span className="text-sm text-gray-400 font-serif">
                  {locale === 'bn'
                    ? `মোট ${totalCount} টি রায়ের মধ্যে পৃষ্ঠা ${currentPage} / ${totalPages}`
                    : `Page ${currentPage} of ${totalPages} (${totalCount} decisions reviewed)`}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {locale === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="flex items-center gap-1"
                  >
                    {locale === 'bn' ? 'পরবর্তী' : 'Next'}
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
