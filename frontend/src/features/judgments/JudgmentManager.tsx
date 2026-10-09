import React, { useState, useEffect, useCallback } from 'react';
import { judgmentsApi } from '@/api/judgments';
import { practiceAreaApi } from '@/api/practiceAreas';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { JudgmentReview, ContentStatus, VisibilityTier } from '@/types';
import { PracticeArea } from '@/types/practiceArea';
import { TaxonomyCategory, TaxonomyTag } from '@/types/research';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Scale,
  FileText,
  Lock,
  Unlock,
  Eye,
  Calendar,
  Gavel,
  BookOpen,
} from 'lucide-react';

export const JudgmentManager: React.FC = () => {
  const { showToast } = useToast();

  const [judgments, setJudgments] = useState<JudgmentReview[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [tags, setTags] = useState<TaxonomyTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JudgmentReview | null>(null);
  const [isDeleting, setIsDeleting] = useState<JudgmentReview | null>(null);
  const [previewItem, setPreviewItem] = useState<JudgmentReview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'analysis' | 'media' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Form State
  const [formData, setFormData] = useState({
    case_name_en: '',
    case_name_bn: '',
    citation: '',
    slug: '',
    court: '',
    judgment_date: '',
    legal_area_en: '',
    legal_area_bn: '',
    summary_en: '',
    summary_bn: '',
    key_issues_en: '',
    key_issues_bn: '',
    court_decision_en: '',
    court_decision_bn: '',
    author_analysis_en: '',
    author_analysis_bn: '',
    practical_significance_en: '',
    practical_significance_bn: '',
    practice_area_id: '' as string | number,
    category_id: '' as string | number,
    legal_research_id: '' as string | number,
    author_en: '',
    author_bn: '',
    featured_image_id: '' as string | number,
    pdf_media_id: '' as string | number,
    visibility: 'public' as VisibilityTier,
    status: 'draft' as ContentStatus,
    is_featured: false,
    sort_order: 0,
    tags: [] as number[],
    seo_title_en: '',
    seo_title_bn: '',
    meta_desc_en: '',
    meta_desc_bn: '',
    canonical_url: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [jdgRes, paRes, catRes, tagRes] = await Promise.all([
        judgmentsApi.getAdminJudgments({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? (statusFilter as ContentStatus) : undefined,
          visibility: visibilityFilter !== 'all' ? (visibilityFilter as VisibilityTier) : undefined,
          court: courtFilter || undefined,
          practice_area_id: practiceAreaFilter !== 'all' ? Number(practiceAreaFilter) : undefined,
          per_page: 50,
        }),
        practiceAreaApi.getAdminPracticeAreas({ per_page: 100 }),
        judgmentsApi.getCategories('judgments'),
        judgmentsApi.getTags(),
      ]);

      if (jdgRes.success) {
        setJudgments(jdgRes.data || []);
      }
      if (paRes.success) {
        setPracticeAreas(paRes.data || []);
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
      if (tagRes.success) {
        setTags(tagRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load judgment reviews:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Unable to retrieve judgment reviews.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, visibilityFilter, courtFilter, practiceAreaFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      case_name_en: '',
      case_name_bn: '',
      citation: '',
      slug: '',
      court: 'Supreme Court of Bangladesh',
      judgment_date: '',
      legal_area_en: '',
      legal_area_bn: '',
      summary_en: '',
      summary_bn: '',
      key_issues_en: '',
      key_issues_bn: '',
      court_decision_en: '',
      court_decision_bn: '',
      author_analysis_en: '',
      author_analysis_bn: '',
      practical_significance_en: '',
      practical_significance_bn: '',
      practice_area_id: '',
      category_id: '',
      legal_research_id: '',
      author_en: '',
      author_bn: '',
      featured_image_id: '',
      pdf_media_id: '',
      visibility: 'public',
      status: 'draft',
      is_featured: false,
      sort_order: 0,
      tags: [],
      seo_title_en: '',
      seo_title_bn: '',
      meta_desc_en: '',
      meta_desc_bn: '',
      canonical_url: '',
    });
    setActiveTab('basic');
    setContentLang('en');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: JudgmentReview) => {
    setEditingItem(item);
    const getEn = (val: any) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val.en || '';
      return '';
    };
    const getBn = (val: any) => {
      if (!val) return '';
      if (typeof val === 'object') return val.bn || '';
      return '';
    };

    setFormData({
      case_name_en: getEn(item.case_name),
      case_name_bn: getBn(item.case_name),
      citation: item.citation || '',
      slug: item.slug || '',
      court: item.court || '',
      judgment_date: item.judgment_date ? item.judgment_date.substring(0, 10) : '',
      legal_area_en: getEn(item.legal_area),
      legal_area_bn: getBn(item.legal_area),
      summary_en: getEn(item.summary),
      summary_bn: getBn(item.summary),
      key_issues_en: getEn(item.key_issues),
      key_issues_bn: getBn(item.key_issues),
      court_decision_en: getEn(item.court_decision),
      court_decision_bn: getBn(item.court_decision),
      author_analysis_en: getEn(item.author_analysis),
      author_analysis_bn: getBn(item.author_analysis),
      practical_significance_en: getEn(item.practical_significance),
      practical_significance_bn: getBn(item.practical_significance),
      practice_area_id: item.practice_area_id || '',
      category_id: item.category_id || '',
      legal_research_id: item.legal_research_id || '',
      author_en: getEn(item.author),
      author_bn: getBn(item.author),
      featured_image_id: item.featured_image_id || '',
      pdf_media_id: item.pdf_media_id || '',
      visibility: item.visibility || 'public',
      status: item.status || 'draft',
      is_featured: !!item.is_featured,
      sort_order: item.sort_order || 0,
      tags: item.tags ? item.tags.map((t) => t.id) : [],
      seo_title_en: (item.seo?.seo_title as any)?.en || (item.seo_meta?.seo_title as any)?.en || '',
      seo_title_bn: (item.seo?.seo_title as any)?.bn || (item.seo_meta?.seo_title as any)?.bn || '',
      meta_desc_en: (item.seo?.meta_description as any)?.en || (item.seo_meta?.meta_description as any)?.en || '',
      meta_desc_bn: (item.seo?.meta_description as any)?.bn || (item.seo_meta?.meta_description as any)?.bn || '',
      canonical_url: item.seo?.canonical_url || item.seo_meta?.canonical_url || '',
    });
    setActiveTab('basic');
    setContentLang('en');
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.case_name_en.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Case Name (English) is required.' });
      return;
    }
    if (!formData.citation.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Citation is required.' });
      return;
    }
    if (!formData.court.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Court name is required.' });
      return;
    }
    if (!formData.summary_en.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Summary (English) is required.' });
      return;
    }
    if (!formData.court_decision_en.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: "Court's Decision (English) is required." });
      return;
    }
    if (!formData.author_analysis_en.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: "Author's Analysis (English) is required." });
      return;
    }

    try {
      setIsSaving(true);
      const generatedSlug = (
        formData.slug.trim() ||
        formData.case_name_en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );

      const payload: any = {
        case_name: { en: formData.case_name_en, bn: formData.case_name_bn || undefined },
        citation: formData.citation.trim(),
        slug: generatedSlug,
        court: formData.court.trim(),
        judgment_date: formData.judgment_date || null,
        legal_area: formData.legal_area_en ? { en: formData.legal_area_en, bn: formData.legal_area_bn || undefined } : undefined,
        summary: { en: formData.summary_en, bn: formData.summary_bn || undefined },
        key_issues: formData.key_issues_en ? { en: formData.key_issues_en, bn: formData.key_issues_bn || undefined } : undefined,
        court_decision: { en: formData.court_decision_en, bn: formData.court_decision_bn || undefined },
        author_analysis: { en: formData.author_analysis_en, bn: formData.author_analysis_bn || undefined },
        practical_significance: formData.practical_significance_en
          ? { en: formData.practical_significance_en, bn: formData.practical_significance_bn || undefined }
          : undefined,
        practice_area_id: formData.practice_area_id ? Number(formData.practice_area_id) : null,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        legal_research_id: formData.legal_research_id ? Number(formData.legal_research_id) : null,
        author: formData.author_en ? { en: formData.author_en, bn: formData.author_bn || undefined } : undefined,
        featured_image_id: formData.featured_image_id ? Number(formData.featured_image_id) : null,
        pdf_media_id: formData.pdf_media_id ? Number(formData.pdf_media_id) : null,
        visibility: formData.visibility,
        status: formData.status,
        is_featured: formData.is_featured,
        sort_order: Number(formData.sort_order) || 0,
        tags: formData.tags,
        seo: {
          seo_title: { en: formData.seo_title_en, bn: formData.seo_title_bn },
          meta_description: { en: formData.meta_desc_en, bn: formData.meta_desc_bn },
          canonical_url: formData.canonical_url || undefined,
        },
      };

      if (editingItem) {
        await judgmentsApi.updateJudgment(editingItem.id, payload);
        showToast({ type: 'success', title: 'Updated', message: 'Judgment review updated successfully.' });
      } else {
        await judgmentsApi.createJudgment(payload);
        showToast({ type: 'success', title: 'Created', message: 'Judgment review created successfully.' });
      }

      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Save failed:', err);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || err.message || 'Validation error while saving review.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await judgmentsApi.deleteJudgment(isDeleting.id);
      showToast({ type: 'success', title: 'Deleted', message: 'Judgment review soft-deleted.' });
      setIsDeleting(null);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Delete Failed', message: err.message || 'Failed to delete review.' });
    }
  };

  const handlePreview = async (item: JudgmentReview) => {
    try {
      const res = await judgmentsApi.previewJudgment(item.id);
      if (res.success && res.data) {
        setPreviewItem(res.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Preview Error', message: err.message || 'Could not load preview.' });
    }
  };

  const resolveText = (val: any) => {
    if (!val) return '—';
    if (typeof val === 'string') return val;
    return val.en || val.bn || '—';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-judicial-card/50 p-6 rounded-xl border border-judicial-border">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-gold" />
            Judgment Reviews Directory
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Publish authoritative reviews of Supreme Court landmark decisions, holding ratios, and practical analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Judgment Review
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 bg-judicial-card/30 p-4 rounded-xl border border-judicial-border">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search case name, citation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-judicial-border rounded-lg text-sm text-white focus:outline-none focus:border-gold"
          />
        </div>

        <input
          type="text"
          placeholder="Filter by Court..."
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
          aria-label="Filter by Court"
          className="bg-black/40 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
        />

        <select
          value={practiceAreaFilter}
          onChange={(e) => setPracticeAreaFilter(e.target.value)}
          aria-label="Filter by Practice Area"
          className="bg-black/40 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
        >
          <option value="all">All Practice Areas</option>
          {practiceAreas.map((pa) => (
            <option key={pa.id} value={pa.id}>
              {resolveText(pa.title)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          className="bg-black/40 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          aria-label="Filter by Visibility"
          className="bg-black/40 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="bg-judicial-card/50 rounded-xl border border-judicial-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading judgment reviews...</div>
        ) : judgments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-lg font-serif">No judgment reviews found.</p>
            <p className="text-sm mt-1">Click "New Judgment Review" to create your first review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/40 text-gray-400 border-b border-judicial-border text-xs uppercase font-serif">
                <tr>
                  <th className="px-4 py-3">Case Name & Citation</th>
                  <th className="px-4 py-3">Court & Date</th>
                  <th className="px-4 py-3">Practice Area</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="px-4 py-3">PDF</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-judicial-border/40">
                {judgments.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-serif font-bold text-white text-base">
                        {resolveText(item.case_name)}
                      </div>
                      <div className="text-gold text-xs font-mono mt-0.5">{item.citation}</div>
                      <div className="text-gray-500 text-xs">/judgments/{item.slug}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-200">{item.court}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gold" />
                        {item.judgment_date ? item.judgment_date.substring(0, 10) : 'Date unrecorded'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {item.practice_area ? (
                        <Badge variant="outline">{resolveText(item.practice_area.title)}</Badge>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          item.status === 'published'
                            ? 'success'
                            : item.status === 'draft'
                            ? 'neutral'
                            : 'outline'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-xs">
                        {item.visibility === 'public' ? (
                          <Unlock className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        {item.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {item.pdf_media_id ? (
                        <a
                          href={`/api/v1/admin/judgments/${item.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-gold hover:underline text-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(item)}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gold" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsDeleting(item)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingItem ? 'Edit Judgment Review' : 'Create Judgment Review'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-judicial-border gap-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`pb-2 px-3 font-serif transition-colors ${
                activeTab === 'basic' ? 'border-b-2 border-gold text-gold font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              1. Case Metadata
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className={`pb-2 px-3 font-serif transition-colors ${
                activeTab === 'analysis' ? 'border-b-2 border-gold text-gold font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              2. Legal Analysis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`pb-2 px-3 font-serif transition-colors ${
                activeTab === 'media' ? 'border-b-2 border-gold text-gold font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              3. Media & Files
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`pb-2 px-3 font-serif transition-colors ${
                activeTab === 'seo' ? 'border-b-2 border-gold text-gold font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              4. SEO & Indexing
            </button>
          </div>

          {/* TAB 1: BASIC */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Case Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.case_name_en}
                    onChange={(e) => setFormData({ ...formData, case_name_en: e.target.value })}
                    placeholder="e.g. State v. Ministry of Environment"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Case Name (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.case_name_bn}
                    onChange={(e) => setFormData({ ...formData, case_name_bn: e.target.value })}
                    placeholder="e.g. রাষ্ট্র বনাম পরিবেশ মন্ত্রণালয়"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Citation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.citation}
                    onChange={(e) => setFormData({ ...formData, citation: e.target.value })}
                    placeholder="e.g. 76 DLR (AD) 140"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Court *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.court}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    placeholder="e.g. Supreme Court of Bangladesh (Appellate Division)"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Judgment Date
                  </label>
                  <input
                    type="date"
                    value={formData.judgment_date}
                    onChange={(e) => setFormData({ ...formData, judgment_date: e.target.value })}
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. state-v-ministry-of-environment"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Related Practice Area
                  </label>
                  <select
                    value={formData.practice_area_id}
                    onChange={(e) => setFormData({ ...formData, practice_area_id: e.target.value })}
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">None / Independent</option>
                    {practiceAreas.map((pa) => (
                      <option key={pa.id} value={pa.id}>
                        {resolveText(pa.title)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Taxonomy Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {resolveText(c.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Taxonomy Tags Selection */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Taxonomy Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => {
                      const isSelected = formData.tags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? formData.tags.filter((id) => id !== t.id)
                              : [...formData.tags, t.id];
                            setFormData({ ...formData, tags: next });
                          }}
                          className={`px-2.5 py-1 rounded text-xs transition-colors ${
                            isSelected
                              ? 'bg-gold text-black font-semibold'
                              : 'bg-black/40 text-gray-300 border border-judicial-border hover:border-gold/50'
                          }`}
                        >
                          {resolveText(t.name)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Legal Area (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.legal_area_en}
                    onChange={(e) => setFormData({ ...formData, legal_area_en: e.target.value })}
                    placeholder="e.g. Constitutional Law"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Legal Area (BN)
                  </label>
                  <input
                    type="text"
                    value={formData.legal_area_bn}
                    onChange={(e) => setFormData({ ...formData, legal_area_bn: e.target.value })}
                    placeholder="e.g. সাংবিধানিক আইন"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Review Author (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.author_en}
                    onChange={(e) => setFormData({ ...formData, author_en: e.target.value })}
                    placeholder="e.g. Advocate Nijam Uddin"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Review Author (BN)
                  </label>
                  <input
                    type="text"
                    value={formData.author_bn}
                    onChange={(e) => setFormData({ ...formData, author_bn: e.target.value })}
                    placeholder="e.g. অ্যাডভোকেট নিজাম উদ্দিন"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as VisibilityTier })}
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-white">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-judicial-border bg-black/40 text-gold focus:ring-gold"
                    />
                    Featured on Overview
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-judicial-border/50">
                <span className="text-xs text-gray-400 font-serif">Language Editing Mode:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContentLang('en')}
                    className={`px-3 py-1 rounded text-xs font-serif ${
                      contentLang === 'en' ? 'bg-gold text-black font-bold' : 'bg-black/50 text-gray-300'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentLang('bn')}
                    className={`px-3 py-1 rounded text-xs font-serif ${
                      contentLang === 'bn' ? 'bg-gold text-black font-bold' : 'bg-black/50 text-gray-300'
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                </div>
              </div>

              {/* Case Summary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Judgment Summary ({contentLang.toUpperCase()}) *
                </label>
                <textarea
                  rows={3}
                  required={contentLang === 'en'}
                  value={contentLang === 'en' ? formData.summary_en : formData.summary_bn}
                  onChange={(e) =>
                    contentLang === 'en'
                      ? setFormData({ ...formData, summary_en: e.target.value })
                      : setFormData({ ...formData, summary_bn: e.target.value })
                  }
                  placeholder="Concise administrative summary of the factual matrix and dispute..."
                  className="w-full bg-black/50 border border-judicial-border rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Legal Issues */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Key Legal Issues ({contentLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={contentLang === 'en' ? formData.key_issues_en : formData.key_issues_bn}
                  onChange={(e) =>
                    contentLang === 'en'
                      ? setFormData({ ...formData, key_issues_en: e.target.value })
                      : setFormData({ ...formData, key_issues_bn: e.target.value })
                  }
                  placeholder="Primary points of law framed for consideration..."
                  className="w-full bg-black/50 border border-judicial-border rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* COURT'S DECISION */}
              <div className="border border-gold/40 bg-gold/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Gavel className="w-4 h-4 text-gold" />
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                    Court's Decision / Ratio Decidendi ({contentLang.toUpperCase()}) *
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Authoritative holding by the Court. Never conflate this official ruling with editorial opinion.
                </p>
                <textarea
                  rows={4}
                  required={contentLang === 'en'}
                  value={contentLang === 'en' ? formData.court_decision_en : formData.court_decision_bn}
                  onChange={(e) =>
                    contentLang === 'en'
                      ? setFormData({ ...formData, court_decision_en: e.target.value })
                      : setFormData({ ...formData, court_decision_bn: e.target.value })
                  }
                  placeholder="Official holding and ratio decidendi delivered by the Bench..."
                  className="w-full bg-black/50 border border-judicial-border rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold font-serif"
                />
              </div>

              {/* AUTHOR'S ANALYSIS */}
              <div className="border border-blue-500/30 bg-blue-500/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-blue-400">
                    Author's Analysis & Doctrinal Commentary ({contentLang.toUpperCase()}) *
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Editorial commentary by the Advocate/Senior Researcher. Must be distinguished from the Court's ruling.
                </p>
                <textarea
                  rows={4}
                  required={contentLang === 'en'}
                  value={contentLang === 'en' ? formData.author_analysis_en : formData.author_analysis_bn}
                  onChange={(e) =>
                    contentLang === 'en'
                      ? setFormData({ ...formData, author_analysis_en: e.target.value })
                      : setFormData({ ...formData, author_analysis_bn: e.target.value })
                  }
                  placeholder="Critical doctrinal analysis, comparative precedents, and judicial reasoning review..."
                  className="w-full bg-black/50 border border-judicial-border rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-400 font-serif"
                />
              </div>

              {/* Practical Significance */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Practical & Commercial Significance ({contentLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={
                    contentLang === 'en' ? formData.practical_significance_en : formData.practical_significance_bn
                  }
                  onChange={(e) =>
                    contentLang === 'en'
                      ? setFormData({ ...formData, practical_significance_en: e.target.value })
                      : setFormData({ ...formData, practical_significance_bn: e.target.value })
                  }
                  placeholder="Impact on pending litigation, transactional structuring, or corporate governance..."
                  className="w-full bg-black/50 border border-judicial-border rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & FILES */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Featured Media ID (Cover Image)
                  </label>
                  <input
                    type="number"
                    value={formData.featured_image_id}
                    onChange={(e) => setFormData({ ...formData, featured_image_id: e.target.value })}
                    placeholder="Media library asset ID"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use judicial card styling fallback.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Judgment PDF Media ID
                  </label>
                  <input
                    type="number"
                    value={formData.pdf_media_id}
                    onChange={(e) => setFormData({ ...formData, pdf_media_id: e.target.value })}
                    placeholder="PDF Document asset ID"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Secured PDF streamed with nosniff header. Accessible based on publication & visibility rules.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Related Research Paper ID
                </label>
                <input
                  type="number"
                  value={formData.legal_research_id}
                  onChange={(e) => setFormData({ ...formData, legal_research_id: e.target.value })}
                  placeholder="ID of referenced legal research article"
                  className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-gray-500 mt-1">Cross-link to a full doctrinal research paper if applicable.</p>
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Meta Title (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title_en}
                    onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                    placeholder="SEO title"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Meta Title (BN)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title_bn}
                    onChange={(e) => setFormData({ ...formData, seo_title_bn: e.target.value })}
                    placeholder="বাংলা এসইও শিরোনাম"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Meta Description (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.meta_desc_en}
                    onChange={(e) => setFormData({ ...formData, meta_desc_en: e.target.value })}
                    placeholder="Search snippet description"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg p-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Meta Description (BN)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.meta_desc_bn}
                    onChange={(e) => setFormData({ ...formData, meta_desc_bn: e.target.value })}
                    placeholder="বাংলা মেটা বিবরণ"
                    className="w-full bg-black/50 border border-judicial-border rounded-lg p-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                  placeholder="https://nijamuddin.com/judgments/case-slug"
                  className="w-full bg-black/50 border border-judicial-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-judicial-border">
            <Button variant="ghost" type="button" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingItem ? 'Update Review' : 'Create Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Draft Preview Modal */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title="Admin Draft Preview (Indexing Safeguard Active)"
        size="xl"
      >
        {previewItem && (
          <div className="space-y-6 text-gray-200">
            <div className="bg-amber-950/20 border border-amber-600/30 p-3 rounded-lg text-xs text-amber-300 flex items-center justify-between">
              <span>Preview Mode: Search engine indexing strictly blocked via X-Robots-Tag.</span>
              <Badge variant="outline">{previewItem.status}</Badge>
            </div>

            <div>
              <div className="text-gold font-mono text-sm">{previewItem.citation}</div>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">
                {resolveText(previewItem.case_name)}
              </h3>
              <div className="text-sm text-gray-400 mt-1">
                {previewItem.court} • {previewItem.judgment_date ? previewItem.judgment_date.substring(0, 10) : 'Date unrecorded'}
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-judicial-border">
              <h4 className="text-xs font-serif uppercase tracking-wider text-gold mb-2">Judgment Summary</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{resolveText(previewItem.summary)}</p>
            </div>

            {/* COURT'S DECISION */}
            <div className="border border-gold/40 bg-gold/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Gavel className="w-4 h-4 text-gold" />
                <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-gold">
                  COURT'S DECISION (RATIO DECIDENDI)
                </h4>
              </div>
              <div
                className="text-sm text-gray-200 leading-relaxed font-serif prose-invert"
                dangerouslySetInnerHTML={{ __html: resolveText(previewItem.court_decision) }}
              />
            </div>

            {/* AUTHOR'S ANALYSIS */}
            <div className="border border-blue-500/30 bg-blue-500/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-blue-400">
                  AUTHOR'S ANALYSIS & PRACTICAL COMMENTARY
                </h4>
              </div>
              <div
                className="text-sm text-gray-200 leading-relaxed font-serif prose-invert"
                dangerouslySetInnerHTML={{ __html: resolveText(previewItem.author_analysis) }}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-judicial-border">
              <Button variant="ghost" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        title="Confirm Soft Deletion"
        size="sm"
      >
        <div className="space-y-4 text-sm text-gray-300">
          <p>
            Are you sure you want to delete judgment review{' '}
            <span className="text-white font-bold">{isDeleting ? resolveText(isDeleting.case_name) : ''}</span>?
          </p>
          <p className="text-xs text-gray-400">
            This review will be soft-deleted and immediately evicted from all public caches.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-judicial-border">
            <Button variant="ghost" onClick={() => setIsDeleting(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
