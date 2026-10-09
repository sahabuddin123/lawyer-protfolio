import React, { useState, useEffect, useCallback } from 'react';
import { courtroomApi } from '@/api/courtroom';
import { practiceAreaApi } from '@/api/practiceAreas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import {
  CourtroomExperience,
  CourtroomExperienceFormData,
  CourtroomStatus,
  CourtroomVisibility,
} from '@/types/courtroom';
import { PracticeArea } from '@/types/practiceArea';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Gavel,
  FileText,
  Lock,
  Unlock,
  Download,
  Layers,
} from 'lucide-react';

export const CourtroomManager: React.FC = () => {
  const { showToast } = useToast();

  const [experiences, setExperiences] = useState<CourtroomExperience[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourtroomExperience | null>(null);
  const [isDeleting, setIsDeleting] = useState<CourtroomExperience | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'documents' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Document Management inside modal
  const [docTitleEn, setDocTitleEn] = useState('');
  const [docTitleBn, setDocTitleBn] = useState('');
  const [docType, setDocType] = useState('Judgment');
  const [docMediaId, setDocMediaId] = useState<number>(1);
  const [docIsConfidential, setDocIsConfidential] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    case_number: '',
    court: 'Supreme Court of Bangladesh - High Court Division',
    case_type: 'Writ Petition',
    year: new Date().getFullYear(),
    practice_area_id: '' as string | number,
    role_en: 'Counsel',
    role_bn: 'আইনজীবী',
    legal_area_en: 'Constitutional Law',
    legal_area_bn: 'সাংবিধানিক আইন',
    summary_en: '',
    summary_bn: '',
    description_en: '',
    description_bn: '',
    issues_en: '',
    issues_bn: '',
    arguments_en: '',
    arguments_bn: '',
    outcome_en: '',
    outcome_bn: '',
    judgment_date: '',
    visibility: 'public' as CourtroomVisibility,
    status: 'draft' as CourtroomStatus,
    is_featured: false,
    sort_order: 0,
    seo_title_en: '',
    seo_title_bn: '',
    meta_desc_en: '',
    meta_desc_bn: '',
    canonical_url: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [expRes, paRes] = await Promise.all([
        courtroomApi.getAdminCourtroomExperiences({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
          court: courtFilter !== 'all' ? courtFilter : undefined,
          per_page: 50,
        }),
        practiceAreaApi.getPracticeAreas({ per_page: 50 }),
      ]);

      if (expRes.success) {
        setExperiences(expRes.data || []);
      }
      if (paRes.success) {
        setPracticeAreas(paRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch courtroom experiences:', err);
      showToast({
        type: 'error',
        title: 'Query Failed',
        message: 'Could not load courtroom experiences from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, visibilityFilter, courtFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title_en: '',
      title_bn: '',
      slug: '',
      case_number: '',
      court: 'Supreme Court of Bangladesh - High Court Division',
      case_type: 'Writ Petition',
      year: new Date().getFullYear(),
      practice_area_id: '',
      role_en: 'Counsel',
      role_bn: 'আইনজীবী',
      legal_area_en: 'Constitutional Law',
      legal_area_bn: 'সাংবিধানিক আইন',
      summary_en: '',
      summary_bn: '',
      description_en: '',
      description_bn: '',
      issues_en: '',
      issues_bn: '',
      arguments_en: '',
      arguments_bn: '',
      outcome_en: '',
      outcome_bn: '',
      judgment_date: '',
      visibility: 'public',
      status: 'draft',
      is_featured: false,
      sort_order: experiences.length,
      seo_title_en: '',
      seo_title_bn: '',
      meta_desc_en: '',
      meta_desc_bn: '',
      canonical_url: '',
    });
    setActiveTab('basic');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = async (item: CourtroomExperience) => {
    try {
      setIsLoading(true);
      const res = await courtroomApi.getAdminCourtroomExperience(item.id);
      const detail = res.data;
      setEditingItem(detail);

      const title = detail.title as any;
      const summary = detail.summary as any;
      const desc = detail.description as any;
      const issues = detail.issues as any;
      const args = detail.arguments as any;
      const outcome = detail.outcome as any;
      const legalArea = detail.legal_area as any;
      const role = detail.role as any;
      const seo = detail.seo as any;

      setFormData({
        title_en: title?.en || (typeof title === 'string' ? title : ''),
        title_bn: title?.bn || '',
        slug: detail.slug,
        case_number: detail.case_number || '',
        court: detail.court,
        case_type: detail.case_type,
        year: detail.year,
        practice_area_id: detail.practice_area_id || '',
        role_en: role?.en || (typeof role === 'string' ? role : 'Counsel'),
        role_bn: role?.bn || 'আইনজীবী',
        legal_area_en: legalArea?.en || (typeof legalArea === 'string' ? legalArea : 'Law'),
        legal_area_bn: legalArea?.bn || '',
        summary_en: summary?.en || (typeof summary === 'string' ? summary : ''),
        summary_bn: summary?.bn || '',
        description_en: desc?.en || (typeof desc === 'string' ? desc : ''),
        description_bn: desc?.bn || '',
        issues_en: issues?.en || '',
        issues_bn: issues?.bn || '',
        arguments_en: args?.en || '',
        arguments_bn: args?.bn || '',
        outcome_en: outcome?.en || '',
        outcome_bn: outcome?.bn || '',
        judgment_date: detail.judgment_date || '',
        visibility: detail.visibility || 'public',
        status: detail.status || 'draft',
        is_featured: !!detail.is_featured,
        sort_order: detail.sort_order || 0,
        seo_title_en: seo?.seo_title?.en || '',
        seo_title_bn: seo?.seo_title?.bn || '',
        meta_desc_en: seo?.meta_description?.en || '',
        meta_desc_bn: seo?.meta_description?.bn || '',
        canonical_url: seo?.canonical_url || '',
      });

      setActiveTab('basic');
      setIsEditorOpen(true);
    } catch (err: any) {
      console.error('Failed to load courtroom item:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not load complete courtroom experience details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = () => {
    if (!formData.title_en) return;
    const generated = formData.title_en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en.trim() || !formData.slug.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Failed',
        message: 'English Title and URL Slug are required.',
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload: CourtroomExperienceFormData = {
        title: { en: formData.title_en, bn: formData.title_bn },
        slug: formData.slug,
        case_number: formData.case_number.trim() || null,
        court: formData.court,
        case_type: formData.case_type,
        year: Number(formData.year),
        practice_area_id: formData.practice_area_id ? Number(formData.practice_area_id) : null,
        legal_area: { en: formData.legal_area_en, bn: formData.legal_area_bn },
        role: { en: formData.role_en, bn: formData.role_bn },
        summary: { en: formData.summary_en, bn: formData.summary_bn },
        description: { en: formData.description_en, bn: formData.description_bn },
        issues: formData.issues_en || formData.issues_bn ? { en: formData.issues_en, bn: formData.issues_bn } : undefined,
        arguments: formData.arguments_en || formData.arguments_bn ? { en: formData.arguments_en, bn: formData.arguments_bn } : undefined,
        outcome: formData.outcome_en || formData.outcome_bn ? { en: formData.outcome_en, bn: formData.outcome_bn } : undefined,
        judgment_date: formData.judgment_date || null,
        visibility: formData.visibility,
        status: formData.status,
        is_featured: formData.is_featured,
        sort_order: Number(formData.sort_order),
        seo: {
          seo_title: { en: formData.seo_title_en, bn: formData.seo_title_bn },
          meta_description: { en: formData.meta_desc_en, bn: formData.meta_desc_bn },
          canonical_url: formData.canonical_url || undefined,
        },
      };

      if (editingItem) {
        await courtroomApi.updateCourtroomExperience(editingItem.id, payload);
        showToast({
          type: 'success',
          title: 'Case Experience Updated',
          message: 'Courtroom record updated and cache purged.',
        });
      } else {
        await courtroomApi.createCourtroomExperience(payload);
        showToast({
          type: 'success',
          title: 'Case Experience Created',
          message: 'New courtroom experience drafted successfully.',
        });
      }

      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Failed to save courtroom experience:', err);
      const msg = err?.response?.data?.message || 'Failed to save courtroom experience.';
      showToast({ type: 'error', title: 'Save Failed', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await courtroomApi.deleteCourtroomExperience(isDeleting.id);
      showToast({
        type: 'success',
        title: 'Case Deleted',
        message: 'The courtroom record has been removed.',
      });
      setIsDeleting(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete case:', err);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Unable to remove this courtroom record.',
      });
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!docTitleEn.trim()) {
      showToast({ type: 'error', title: 'Validation', message: 'Document Title EN is required.' });
      return;
    }

    try {
      setIsAddingDoc(true);
      await courtroomApi.addCaseDocument(editingItem.id, {
        title: { en: docTitleEn, bn: docTitleBn },
        document_type: docType,
        media_id: Number(docMediaId),
        is_confidential: docIsConfidential,
        sort_order: (editingItem.documents?.length || 0) + 1,
      });

      showToast({ type: 'success', title: 'Document Added', message: 'Legal document attached to case.' });
      setDocTitleEn('');
      setDocTitleBn('');
      // Reload current editing item
      const res = await courtroomApi.getAdminCourtroomExperience(editingItem.id);
      setEditingItem(res.data);
    } catch (err: any) {
      console.error('Failed to attach document:', err);
      showToast({ type: 'error', title: 'Attachment Failed', message: 'Could not attach document.' });
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!editingItem) return;
    try {
      await courtroomApi.deleteCaseDocument(docId);
      showToast({ type: 'success', title: 'Document Removed', message: 'Attachment deleted.' });
      const res = await courtroomApi.getAdminCourtroomExperience(editingItem.id);
      setEditingItem(res.data);
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      showToast({ type: 'error', title: 'Error', message: 'Could not delete document.' });
    }
  };

  const resolveItemTitle = (item: CourtroomExperience): string => {
    const t = item.title as any;
    if (typeof t === 'string') return t;
    return t?.en || t?.bn || item.slug;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-elevated/40 border border-border-subtle p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-serif-editorial font-bold text-text-primary flex items-center gap-2">
            <Gavel className="w-5 h-5 text-gold-primary" />
            <span>Courtroom Experiences & Precedents</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Manage litigation portfolio, judicial bench representation, and verified legal briefs.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Draft Experience</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-elevated/20 border border-border-subtle p-4 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by case title, case number, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-gold-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-base border border-border-subtle rounded-lg text-xs py-1.5 px-3 text-text-primary"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="bg-surface-base border border-border-subtle rounded-lg text-xs py-1.5 px-3 text-text-primary"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <select
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
          className="bg-surface-base border border-border-subtle rounded-lg text-xs py-1.5 px-3 text-text-primary"
        >
          <option value="all">All Courts</option>
          <option value="Supreme Court of Bangladesh - High Court Division">High Court Division</option>
          <option value="Supreme Court of Bangladesh - Appellate Division">Appellate Division</option>
        </select>
      </div>

      {/* Table List */}
      <Card className="overflow-hidden border-border-subtle">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted text-sm animate-pulse">
            Querying judicial case archive...
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel className="w-10 h-10 text-gold-muted/40 mx-auto mb-3" />
            <p className="text-sm text-text-muted">No courtroom experiences found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/60 text-text-subtle uppercase border-b border-border-subtle font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Case Title & Forum</th>
                  <th className="py-3 px-4">Case Identifier</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Practice Domain</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status / Visibility</th>
                  <th className="py-3 px-4 text-center">Documents</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-text-primary">
                {experiences.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium max-w-xs">
                      <div className="font-semibold text-text-primary truncate">{resolveItemTitle(item)}</div>
                      <div className="text-[11px] text-text-subtle truncate flex items-center gap-1 mt-0.5">
                        <span>{item.court}</span>
                        <span>•</span>
                        <span>{item.case_type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-text-muted">
                      {item.case_number || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gold-primary">
                      {item.year}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {item.practice_area ? (
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Layers className="w-3 h-3 text-gold-primary" />
                          <span>{(item.practice_area.title as any)?.en || item.practice_area.slug}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-text-subtle">
                      {(item.role as any)?.en || 'Counsel'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={item.status === 'published' ? 'gold' : 'neutral'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                        <Badge
                          variant={item.visibility === 'public' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {item.visibility}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated text-text-muted text-[11px]">
                        {item.documents?.length ?? item.documents_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'published' && item.visibility === 'public' && (
                          <a
                            href={`/courtroom/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-text-subtle hover:text-gold-primary hover:bg-surface-elevated transition-colors"
                            title="Preview Public Case"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-surface-elevated transition-colors"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeleting(item)}
                          className="p-1.5 rounded-lg text-text-subtle hover:text-status-error hover:bg-surface-elevated transition-colors"
                          title="Delete Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Editor Modal */}
      {isEditorOpen && (
        <Modal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          title={editingItem ? 'Edit Courtroom Experience' : 'Draft Judicial Experience'}
          size="xl"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Modal Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'basic'
                      ? 'border-gold-primary text-gold-primary'
                      : 'border-transparent text-text-subtle hover:text-text-primary'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'content'
                      ? 'border-gold-primary text-gold-primary'
                      : 'border-transparent text-text-subtle hover:text-text-primary'
                  }`}
                >
                  Narrative & Submissions
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                      activeTab === 'documents'
                        ? 'border-gold-primary text-gold-primary'
                        : 'border-transparent text-text-subtle hover:text-text-primary'
                    }`}
                  >
                    Documents ({editingItem.documents?.length || 0})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'seo'
                      ? 'border-gold-primary text-gold-primary'
                      : 'border-transparent text-text-subtle hover:text-text-primary'
                  }`}
                >
                  SEO & Indexing
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-surface-base border border-border-subtle p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`px-2 py-0.5 rounded ${
                    contentLang === 'en' ? 'bg-gold-primary text-surface-base font-bold' : 'text-text-subtle'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('bn')}
                  className={`px-2 py-0.5 rounded ${
                    contentLang === 'bn' ? 'bg-gold-primary text-surface-base font-bold' : 'text-text-subtle'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* TAB: Basic Information */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentLang === 'en' ? (
                    <div>
                      <label className="text-xs font-medium text-text-primary block mb-1">
                        Case Title (EN) <span className="text-status-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                        placeholder="e.g. Constitutional Challenge to Administrative Directive"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-text-primary block mb-1">
                        মামলার শিরোনাম (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={formData.title_bn}
                        onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                        placeholder="মামলার বাংলা শিরোনাম"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-text-primary">
                        URL Slug <span className="text-status-error">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateSlug}
                        className="text-[10px] text-gold-primary hover:underline"
                      >
                        Generate from Title
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs font-mono text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="e.g. constitutional-challenge-directive"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Case Identifier / Number
                    </label>
                    <input
                      type="text"
                      value={formData.case_number}
                      onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs font-mono text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="e.g. Writ Petition No. 1024 of 2023"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Court / Forum <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.court}
                      onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="Supreme Court of Bangladesh - High Court Division"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Case Type <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.case_type}
                      onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="Writ Petition, Criminal Revision, etc."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Year <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs font-mono text-text-primary focus:border-gold-primary focus:outline-none"
                      min={1900}
                      max={2100}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Judgment Date
                    </label>
                    <input
                      type="date"
                      value={formData.judgment_date}
                      onChange={(e) => setFormData({ ...formData, judgment_date: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Associated Practice Area
                    </label>
                    <select
                      value={formData.practice_area_id}
                      onChange={(e) => setFormData({ ...formData, practice_area_id: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                    >
                      <option value="">None (Independent Case)</option>
                      {practiceAreas.map((pa) => (
                        <option key={pa.id} value={pa.id}>
                          {(pa.title as any)?.en || pa.slug}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Advocate Role ({contentLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={contentLang === 'en' ? formData.role_en : formData.role_bn}
                      onChange={(e) =>
                        contentLang === 'en'
                          ? setFormData({ ...formData, role_en: e.target.value })
                          : setFormData({ ...formData, role_bn: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="e.g. Lead Counsel, Appearing Advocate"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Legal Area ({contentLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={contentLang === 'en' ? formData.legal_area_en : formData.legal_area_bn}
                      onChange={(e) =>
                        contentLang === 'en'
                          ? setFormData({ ...formData, legal_area_en: e.target.value })
                          : setFormData({ ...formData, legal_area_bn: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="e.g. Constitutional Law, Admiralty Law"
                    />
                  </div>
                </div>

                {/* Status & Visibility Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border-subtle">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CourtroomStatus })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                    >
                      <option value="draft">Draft (Restricted)</option>
                      <option value="published">Published (Public)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as CourtroomVisibility })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                    >
                      <option value="public">Public (Open for listings)</option>
                      <option value="private">Private (Restricted / Confidential)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-border-subtle text-gold-primary focus:ring-gold-primary"
                      />
                      <span>Featured Landmark</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Narrative & Submissions */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-primary block mb-1">
                    Executive Case Summary ({contentLang.toUpperCase()}) <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={contentLang === 'en' ? formData.summary_en : formData.summary_bn}
                    onChange={(e) =>
                      contentLang === 'en'
                        ? setFormData({ ...formData, summary_en: e.target.value })
                        : setFormData({ ...formData, summary_bn: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                    placeholder="Brief 2-3 sentence judicial overview..."
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-primary block mb-1">
                    Detailed Narrative & Background ({contentLang.toUpperCase()}) <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={contentLang === 'en' ? formData.description_en : formData.description_bn}
                    onChange={(e) =>
                      contentLang === 'en'
                        ? setFormData({ ...formData, description_en: e.target.value })
                        : setFormData({ ...formData, description_bn: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none font-mono"
                    placeholder="Full factual matrix and legal proceedings (HTML allowed)..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Legal Issues ({contentLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={4}
                      value={contentLang === 'en' ? formData.issues_en : formData.issues_bn}
                      onChange={(e) =>
                        contentLang === 'en'
                          ? setFormData({ ...formData, issues_en: e.target.value })
                          : setFormData({ ...formData, issues_bn: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="Substantive questions of law..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Arguments & Precedents ({contentLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={4}
                      value={contentLang === 'en' ? formData.arguments_en : formData.arguments_bn}
                      onChange={(e) =>
                        contentLang === 'en'
                          ? setFormData({ ...formData, arguments_en: e.target.value })
                          : setFormData({ ...formData, arguments_bn: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="Advocacy submissions presented before the Bench..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Judicial Outcome / Order ({contentLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={4}
                      value={contentLang === 'en' ? formData.outcome_en : formData.outcome_bn}
                      onChange={(e) =>
                        contentLang === 'en'
                          ? setFormData({ ...formData, outcome_en: e.target.value })
                          : setFormData({ ...formData, outcome_bn: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="Final disposition, judgment direction, or rule..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Documents */}
            {activeTab === 'documents' && editingItem && (
              <div className="space-y-6">
                <div className="border border-border-subtle rounded-xl p-4 bg-surface-elevated/20">
                  <h4 className="text-xs font-semibold text-text-primary mb-3">
                    Attached Case Documents & Orders
                  </h4>

                  {editingItem.documents && editingItem.documents.length > 0 ? (
                    <div className="space-y-2">
                      {editingItem.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-surface-base border border-border-subtle text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gold-primary" />
                            <div>
                              <div className="font-medium text-text-primary">
                                {(doc.title as any)?.en || (typeof doc.title === 'string' ? doc.title : 'Document')}
                              </div>
                              <div className="text-[10px] text-text-subtle font-mono flex items-center gap-2">
                                <span>{doc.document_type || 'Order'}</span>
                                <span>•</span>
                                <span>Downloads: {doc.download_count || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {doc.is_confidential ? (
                              <Badge variant="outline" size="sm" className="flex items-center gap-1 text-amber-400 border-amber-400/40">
                                <Lock className="w-3 h-3" />
                                <span>Confidential</span>
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm" className="flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                <span>Public</span>
                              </Badge>
                            )}

                            <a
                              href={`/api/v1/admin/case-documents/${doc.id}/download`}
                              className="p-1 rounded text-text-subtle hover:text-gold-primary"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1 rounded text-text-subtle hover:text-status-error"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-subtle py-4 text-center">
                      No documents currently attached to this case experience.
                    </p>
                  )}
                </div>

                {/* Attach New Document Form */}
                <div className="border border-border-subtle rounded-xl p-4 bg-surface-elevated/40 space-y-3">
                  <h4 className="text-xs font-semibold text-text-primary">Attach New Document</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-text-subtle block mb-1">Title (EN)</label>
                      <input
                        type="text"
                        value={docTitleEn}
                        onChange={(e) => setDocTitleEn(e.target.value)}
                        placeholder="e.g. Certified Copy of Final Judgment"
                        className="w-full px-3 py-1.5 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-subtle block mb-1">Title (BN)</label>
                      <input
                        type="text"
                        value={docTitleBn}
                        onChange={(e) => setDocTitleBn(e.target.value)}
                        placeholder="নথির বাংলা শিরোনাম"
                        className="w-full px-3 py-1.5 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-text-subtle block mb-1">Document Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      >
                        <option value="Judgment">Judgment</option>
                        <option value="Order">Court Order</option>
                        <option value="Petition">Petition Brief</option>
                        <option value="Written Submission">Written Submission</option>
                        <option value="Other">Other Legal Paper</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-text-subtle block mb-1">Media ID</label>
                      <input
                        type="number"
                        value={docMediaId}
                        onChange={(e) => setDocMediaId(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-surface-base border border-border-subtle rounded-lg text-xs font-mono text-text-primary focus:border-gold-primary focus:outline-none"
                        min={1}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={docIsConfidential}
                          onChange={(e) => setDocIsConfidential(e.target.checked)}
                          className="rounded border-border-subtle text-gold-primary focus:ring-gold-primary"
                        />
                        <span>Confidential (Internal Only)</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddDocument}
                      disabled={isAddingDoc}
                    >
                      {isAddingDoc ? 'Attaching...' : 'Attach Document'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SEO & Indexing */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Meta Title (EN)
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title_en}
                      onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="e.g. Constitutional Writ Representation | Nijam Uddin"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Meta Title (BN)
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title_bn}
                      onChange={(e) => setFormData({ ...formData, seo_title_bn: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="বাংলা মেটা শিরোনাম"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Meta Description (EN)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.meta_desc_en}
                      onChange={(e) => setFormData({ ...formData, meta_desc_en: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="Concise overview for search engine SERP snippets..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-primary block mb-1">
                      Meta Description (BN)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.meta_desc_bn}
                      onChange={(e) => setFormData({ ...formData, meta_desc_bn: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                      placeholder="বাংলা মেটা বিবরণ..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-primary block mb-1">
                    Canonical URL Override
                  </label>
                  <input
                    type="url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-base border border-border-subtle rounded-lg text-xs text-text-primary focus:border-gold-primary focus:outline-none"
                    placeholder="https://nijamuddin.com/courtroom/canonical-slug"
                  />
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                {isSaving ? 'Persisting...' : editingItem ? 'Update Experience' : 'Save Experience'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <Modal
          isOpen={!!isDeleting}
          onClose={() => setIsDeleting(null)}
          title="Confirm Case Removal"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-muted leading-relaxed">
              Are you sure you wish to delete courtroom experience{' '}
              <strong className="text-text-primary">
                "{resolveItemTitle(isDeleting)}"
              </strong>
              ? This action will soft-delete the record and purge public caches.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleting(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-status-error border-status-error/40 hover:bg-status-error/10"
                onClick={handleDelete}
              >
                Delete Case
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
