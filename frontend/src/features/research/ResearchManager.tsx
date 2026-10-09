import React, { useState, useEffect, useCallback } from 'react';
import { researchApi } from '@/api/research';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { LegalResearch, ResearchType, ContentStatus, VisibilityTier } from '@/types';
import { TaxonomyCategory, TaxonomyTag } from '@/types/research';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  FileText,
  Lock,
  Unlock,
  Star,
  Eye,
  Calendar,
  User,
} from 'lucide-react';

export const ResearchManager: React.FC = () => {
  const { showToast } = useToast();

  const [researches, setResearches] = useState<LegalResearch[]>([]);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [tags, setTags] = useState<TaxonomyTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LegalResearch | null>(null);
  const [isDeleting, setIsDeleting] = useState<LegalResearch | null>(null);
  const [previewItem, setPreviewItem] = useState<LegalResearch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'media' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Quick Category / Tag Creation State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagNameEn, setNewTagNameEn] = useState('');
  const [newTagNameBn, setNewTagNameBn] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    research_type: 'article' as ResearchType,
    category_id: '' as string | number,
    tags: [] as number[],
    author_en: '',
    author_bn: '',
    excerpt_en: '',
    excerpt_bn: '',
    content_en: '',
    content_bn: '',
    research_date: '',
    featured_image_id: '' as string | number,
    pdf_media_id: '' as string | number,
    external_url: '',
    visibility: 'public' as VisibilityTier,
    status: 'draft' as ContentStatus,
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
      const [resRes, catRes, tagRes] = await Promise.all([
        researchApi.getAdminResearches({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
          research_type: typeFilter !== 'all' ? typeFilter : undefined,
          category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
          per_page: 50,
        }),
        researchApi.getAdminCategories('research'),
        researchApi.getAdminTags(),
      ]);

      if (resRes.success) {
        setResearches(resRes.data || []);
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
      if (tagRes.success) {
        setTags(tagRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load legal research data:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Unable to retrieve research monographs.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, visibilityFilter, typeFilter, categoryFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title_en: '',
      title_bn: '',
      slug: '',
      research_type: 'article',
      category_id: categories.length > 0 ? categories[0].id : '',
      tags: [],
      author_en: '',
      author_bn: '',
      excerpt_en: '',
      excerpt_bn: '',
      content_en: '',
      content_bn: '',
      research_date: new Date().toISOString().split('T')[0],
      featured_image_id: '',
      pdf_media_id: '',
      external_url: '',
      visibility: 'public',
      status: 'draft',
      is_featured: false,
      sort_order: 0,
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

  const handleOpenEdit = async (item: LegalResearch) => {
    try {
      setIsLoading(true);
      const res = await researchApi.getAdminResearch(item.id);
      if (!res.success || !res.data) {
        throw new Error('Failed to fetch full research details.');
      }
      const data = res.data;
      setEditingItem(data);

      const titleEn = typeof data.title === 'object' ? data.title.en : data.title || '';
      const titleBn = typeof data.title === 'object' ? data.title.bn : '';

      const authorEn = typeof data.author === 'object' ? data.author.en : data.author || '';
      const authorBn = typeof data.author === 'object' ? data.author.bn : '';

      const excerptEn = typeof data.excerpt === 'object' ? data.excerpt.en : data.excerpt || '';
      const excerptBn = typeof data.excerpt === 'object' ? data.excerpt.bn : '';

      const contentEn = typeof data.content === 'object' ? data.content.en : data.content || '';
      const contentBn = typeof data.content === 'object' ? data.content.bn : '';

      const seo = data.seo || data.seo_meta;
      const tagIds = Array.isArray(data.tags) ? data.tags.map((t: any) => t.id) : [];

      setFormData({
        title_en: titleEn,
        title_bn: titleBn,
        slug: data.slug || '',
        research_type: data.research_type || 'article',
        category_id: data.category_id || (data.category?.id ?? ''),
        tags: tagIds,
        author_en: authorEn,
        author_bn: authorBn,
        excerpt_en: excerptEn,
        excerpt_bn: excerptBn,
        content_en: contentEn,
        content_bn: contentBn,
        research_date: data.research_date ? data.research_date.split('T')[0] : '',
        featured_image_id: data.featured_image_id || (data.featured_image?.id ?? ''),
        pdf_media_id: data.pdf_media_id || (data.pdf_media?.id ?? ''),
        external_url: data.external_url || '',
        visibility: data.visibility || 'public',
        status: data.status || 'draft',
        is_featured: !!data.is_featured,
        sort_order: data.sort_order ?? 0,
        seo_title_en: seo?.seo_title?.en || '',
        seo_title_bn: seo?.seo_title?.bn || '',
        meta_desc_en: seo?.meta_description?.en || '',
        meta_desc_bn: seo?.meta_description?.bn || '',
        canonical_url: seo?.canonical_url || '',
      });

      setActiveTab('basic');
      setContentLang('en');
      setIsEditorOpen(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Unable to open research editor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en || !formData.slug || !formData.author_en) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Title (EN), Slug, and Author (EN) are required.',
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload: any = {
        title: {
          en: formData.title_en,
          bn: formData.title_bn || undefined,
        },
        slug: formData.slug.toLowerCase().trim(),
        research_type: formData.research_type,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        author: {
          en: formData.author_en,
          bn: formData.author_bn || undefined,
        },
        excerpt: {
          en: formData.excerpt_en || '',
          bn: formData.excerpt_bn || undefined,
        },
        content: {
          en: formData.content_en || '',
          bn: formData.content_bn || undefined,
        },
        research_date: formData.research_date || null,
        featured_image_id: formData.featured_image_id ? Number(formData.featured_image_id) : null,
        pdf_media_id: formData.pdf_media_id ? Number(formData.pdf_media_id) : null,
        external_url: formData.external_url ? formData.external_url.trim() : null,
        visibility: formData.visibility,
        status: formData.status,
        is_featured: formData.is_featured,
        sort_order: Number(formData.sort_order) || 0,
      };

      if (formData.seo_title_en || formData.meta_desc_en) {
        payload.seo = {
          seo_title: {
            en: formData.seo_title_en,
            bn: formData.seo_title_bn || undefined,
          },
          meta_description: {
            en: formData.meta_desc_en,
            bn: formData.meta_desc_bn || undefined,
          },
          canonical_url: formData.canonical_url || null,
        };
      }

      if (editingItem) {
        await researchApi.updateResearch(editingItem.id, payload);
        showToast({
          type: 'success',
          title: 'Updated',
          message: 'Legal research monograph updated successfully.',
        });
      } else {
        await researchApi.createResearch(payload);
        showToast({
          type: 'success',
          title: 'Created',
          message: 'Legal research monograph created successfully.',
        });
      }

      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Save error:', err);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save research monograph.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;

    try {
      setIsSaving(true);
      await researchApi.deleteResearch(isDeleting.id);
      showToast({
        type: 'success',
        title: 'Deleted',
        message: 'Legal research deleted successfully.',
      });
      setIsDeleting(null);
      loadData();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete research.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatNameEn.trim()) return;
    try {
      const res = await researchApi.createCategory({
        name: { en: newCatNameEn.trim(), bn: newCatNameBn.trim() || undefined },
        type: 'research',
        is_active: true,
      });
      if (res.success && res.data) {
        setCategories((prev) => [...prev, res.data]);
        setFormData((prev) => ({ ...prev, category_id: res.data.id }));
        setNewCatNameEn('');
        setNewCatNameBn('');
        setIsCreatingCategory(false);
        showToast({ type: 'success', title: 'Category Created', message: 'Category created successfully.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to create category.' });
    }
  };

  const handleCreateTag = async () => {
    if (!newTagNameEn.trim()) return;
    try {
      const res = await researchApi.createTag({
        name: { en: newTagNameEn.trim(), bn: newTagNameBn.trim() || undefined },
      });
      if (res.success && res.data) {
        setTags((prev) => [...prev, res.data]);
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, res.data.id],
        }));
        setNewTagNameEn('');
        setNewTagNameBn('');
        setIsCreatingTag(false);
        showToast({ type: 'success', title: 'Tag Created', message: 'Tag created successfully.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to create tag.' });
    }
  };

  const toggleTag = (tagId: number) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((id) => id !== tagId) : [...prev.tags, tagId],
      };
    });
  };

  const handleOpenPreview = async (item: LegalResearch) => {
    try {
      const res = await researchApi.previewResearch(item.id);
      if (res.success && res.data) {
        setPreviewItem(res.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Preview Error', message: err.message || 'Failed to load preview.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-serif text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-legal-gold" />
            Legal Research & Monographs
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage peer-reviewed treatises, comparative constitutional analyses, and statutory studies.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Monograph</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, author, slug..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-legal-gold"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {typeof cat.name === 'object' ? cat.name.en : cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">All Research Types</option>
            <option value="article">Article</option>
            <option value="case_analysis">Case Analysis</option>
            <option value="research_paper">Research Paper</option>
            <option value="constitutional_analysis">Constitutional Analysis</option>
            <option value="statutory_analysis">Statutory Analysis</option>
            <option value="legal_opinion">Legal Opinion</option>
            <option value="commentary">Commentary</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">All Visibilities</option>
            <option value="public">Public</option>
            <option value="private">Private (Restricted)</option>
          </select>
        </div>
      </div>

      {/* Researches Data Table */}
      <div className="bg-neutral-900/40 rounded-lg border border-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            Loading legal research monographs...
          </div>
        ) : researches.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p>No legal research records found.</p>
            <p className="text-xs text-neutral-600 mt-1">
              Click &quot;New Research Monograph&quot; above to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Title & Classification</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Research Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">PDF</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {researches.map((item) => {
                  const titleStr = typeof item.title === 'object' ? item.title.en : item.title;
                  const authorStr = typeof item.author === 'object' ? item.author.en : item.author;
                  const catStr = item.category
                    ? (typeof item.category.name === 'object' ? item.category.name.en : item.category.name)
                    : '—';

                  return (
                    <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                        <div className="flex items-center gap-1.5">
                          {item.is_featured && (
                            <Star className="w-3.5 h-3.5 text-legal-gold fill-legal-gold shrink-0" />
                          )}
                          <span className="truncate">{titleStr}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-neutral-500">/{item.slug}</span>
                          <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase">
                            {item.research_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">{catStr}</td>
                      <td className="py-3.5 px-4 text-neutral-400">{authorStr || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                        {item.research_date ? item.research_date.split('T')[0] : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            item.status === 'published'
                              ? 'success'
                              : item.status === 'draft'
                              ? 'neutral'
                              : 'outline'
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                            item.visibility === 'public' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {item.visibility === 'public' ? (
                            <Unlock className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          {item.visibility}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.pdf_media_id || item.pdf_media ? (
                          <a
                            href={`/api/v1/admin/research/${item.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-legal-gold hover:text-white transition-colors"
                            title="Download Attached PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          className="p-1 text-neutral-400 hover:text-legal-gold transition-colors"
                          title="Preview Draft"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-neutral-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeleting(item)}
                          className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {isEditorOpen && (
        <Modal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          title={editingItem ? 'Edit Research Monograph' : 'New Research Monograph'}
          size="xl"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-neutral-800 gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'basic'
                    ? 'border-legal-gold text-legal-gold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                1. General & Author
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'content'
                    ? 'border-legal-gold text-legal-gold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                2. Excerpt & Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'media'
                    ? 'border-legal-gold text-legal-gold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                3. Media & PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'seo'
                    ? 'border-legal-gold text-legal-gold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                4. Publishing & SEO
              </button>
            </div>

            {/* Tab 1: General & Author */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Title (English) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title_en}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title_en: val,
                          slug: editingItem
                            ? prev.slug
                            : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        }));
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="e.g. Constitutional Review and Judicial Oversight"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Title (Bangla)
                    </label>
                    <input
                      type="text"
                      value={formData.title_bn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title_bn: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="যেমন: সাংবিধানিক পর্যালোচনা ও বিচারিক পর্যবেক্ষণ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      URL Slug <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-legal-gold focus:outline-none focus:border-legal-gold"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Published slug updates automatically generate a 301 permanent redirect.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Research Classification <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.research_type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, research_type: e.target.value as ResearchType }))
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      <option value="article">Article</option>
                      <option value="case_analysis">Case Analysis</option>
                      <option value="research_paper">Research Paper</option>
                      <option value="constitutional_analysis">Constitutional Analysis</option>
                      <option value="statutory_analysis">Statutory Analysis</option>
                      <option value="legal_opinion">Legal Opinion</option>
                      <option value="commentary">Commentary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-300">Category</label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                        className="text-[10px] text-legal-gold hover:underline"
                      >
                        {isCreatingCategory ? 'Cancel' : '+ New Category'}
                      </button>
                    </div>

                    {isCreatingCategory ? (
                      <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded space-y-2">
                        <input
                          type="text"
                          placeholder="Category Name (EN)"
                          value={newCatNameEn}
                          onChange={(e) => setNewCatNameEn(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Category Name (BN, Optional)"
                          value={newCatNameBn}
                          onChange={(e) => setNewCatNameBn(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white"
                        />
                        <Button type="button" size="sm" onClick={handleCreateCategory}>
                          Save Category
                        </Button>
                      </div>
                    ) : (
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      >
                        <option value="">No Category Selected</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {typeof cat.name === 'object' ? cat.name.en : cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Research / Publication Date
                    </label>
                    <input
                      type="date"
                      value={formData.research_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, research_date: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Author Name (EN) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author_en}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author_en: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="e.g. Nijam Uddin (Haq)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Author Name (BN)
                    </label>
                    <input
                      type="text"
                      value={formData.author_bn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author_bn: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="যেমন: নিজাম উদ্দিন (হক)"
                    />
                  </div>
                </div>

                {/* Tags Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-neutral-300">Research Tags</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingTag(!isCreatingTag)}
                      className="text-[10px] text-legal-gold hover:underline"
                    >
                      {isCreatingTag ? 'Cancel' : '+ New Tag'}
                    </button>
                  </div>

                  {isCreatingTag && (
                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded mb-2 space-y-2">
                      <input
                        type="text"
                        placeholder="Tag Name (EN)"
                        value={newTagNameEn}
                        onChange={(e) => setNewTagNameEn(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Tag Name (BN, Optional)"
                        value={newTagNameBn}
                        onChange={(e) => setNewTagNameBn(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white"
                      />
                      <Button type="button" size="sm" onClick={handleCreateTag}>
                        Save Tag
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-neutral-950 border border-neutral-800 rounded min-h-[42px]">
                    {tags.length === 0 ? (
                      <span className="text-xs text-neutral-500">No tags available.</span>
                    ) : (
                      tags.map((tag) => {
                        const selected = formData.tags.includes(tag.id);
                        const tagName = typeof tag.name === 'object' ? tag.name.en : tag.name;
                        return (
                          <button
                            type="button"
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                              selected
                                ? 'bg-legal-gold text-black font-semibold'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                            }`}
                          >
                            {tagName}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Excerpt & Content */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <span className="text-xs text-neutral-400">Editing Language:</span>
                  <button
                    type="button"
                    onClick={() => setContentLang('en')}
                    className={`px-2.5 py-1 rounded text-xs ${
                      contentLang === 'en'
                        ? 'bg-legal-gold text-black font-semibold'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentLang('bn')}
                    className={`px-2.5 py-1 rounded text-xs ${
                      contentLang === 'bn'
                        ? 'bg-legal-gold text-black font-semibold'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    বাংলা (BN)
                  </button>
                </div>

                {contentLang === 'en' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Executive Excerpt (English)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.excerpt_en}
                        onChange={(e) => setFormData((prev) => ({ ...prev, excerpt_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold leading-relaxed"
                        placeholder="Concise legal summary of the research questions and authoritative findings..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Full Research Monograph Body (English HTML / Rich Text)
                      </label>
                      <textarea
                        rows={12}
                        value={formData.content_en}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold leading-relaxed"
                        placeholder="<h2>1. Introduction</h2><p>Legal treatise text, citations, and analysis...</p>"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Executive Excerpt (Bangla)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.excerpt_bn}
                        onChange={(e) => setFormData((prev) => ({ ...prev, excerpt_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold leading-relaxed"
                        placeholder="গবেষণার সারসংক্ষেপ এবং বিশ্লেষণমূলক সিদ্ধান্ত..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Full Research Monograph Body (Bangla HTML)
                      </label>
                      <textarea
                        rows={12}
                        value={formData.content_bn}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold leading-relaxed"
                        placeholder="<h2>১. ভূমিকা</h2><p>আইনি গবেষণা ও বিচারিক বিশ্লেষণমূলক প্রবন্ধের বিবরণ...</p>"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab 3: Media & PDF */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Featured Image Media ID
                    </label>
                    <input
                      type="number"
                      value={formData.featured_image_id}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, featured_image_id: e.target.value }))
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="e.g. 1"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Centralized media asset ID for research cover image.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      PDF Document Media ID
                    </label>
                    <input
                      type="number"
                      value={formData.pdf_media_id}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pdf_media_id: e.target.value }))
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="e.g. 2"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Centralized media asset ID for downloadable PDF treatise.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    External Reference / Journal URL
                  </label>
                  <input
                    type="url"
                    value={formData.external_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, external_url: e.target.value }))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    placeholder="https://lawjournal.example.org/treatises/123"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Optional link to official publication registry or law review monograph.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Publishing & SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Editorial Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, status: e.target.value as ContentStatus }))
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      <option value="draft">Draft (Restricted to Admins)</option>
                      <option value="published">Published (Public Discovery)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Visibility Tier <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, visibility: e.target.value as VisibilityTier }))
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      <option value="public">Public (Visible to All)</option>
                      <option value="private">Private (Restricted / Internal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-neutral-800 bg-neutral-950 text-legal-gold focus:ring-legal-gold"
                    />
                    <label htmlFor="is_featured" className="text-xs text-white font-medium cursor-pointer">
                      Featured Monograph (Promoted on Homepage & Hub)
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Sort Order Weight
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-legal-gold">
                    Search Engine Optimization (SEO) Metadata
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Meta Title (EN)
                      </label>
                      <input
                        type="text"
                        value={formData.seo_title_en}
                        onChange={(e) => setFormData((prev) => ({ ...prev, seo_title_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Meta Title (BN)
                      </label>
                      <input
                        type="text"
                        value={formData.seo_title_bn}
                        onChange={(e) => setFormData((prev) => ({ ...prev, seo_title_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Meta Description (EN)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.meta_desc_en}
                        onChange={(e) => setFormData((prev) => ({ ...prev, meta_desc_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Meta Description (BN)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.meta_desc_bn}
                        onChange={(e) => setFormData((prev) => ({ ...prev, meta_desc_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, canonical_url: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                      placeholder="https://nijamuddin.com/research/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingItem ? 'Update Monograph' : 'Create Monograph'}
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
          title="Confirm Monograph Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete research monograph:{' '}
              <strong className="text-white">
                {typeof isDeleting.title === 'object' ? isDeleting.title.en : isDeleting.title}
              </strong>
              ? This action will soft-delete the record and purge public cached entries.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleting(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={isSaving}
              >
                {isSaving ? 'Deleting...' : 'Confirm Deletion'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Draft Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title="Administrative Draft Preview"
          size="xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/30 border border-amber-600/40 rounded flex items-center justify-between text-xs text-amber-200">
              <span>⚠ Preview Mode: Protected with X-Robots-Tag noindex, nofollow</span>
              <Badge variant="outline" size="sm">
                {previewItem.status}
              </Badge>
            </div>

            <div className="border border-neutral-800 p-6 rounded-lg bg-neutral-950 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-legal-gold">
                  {previewItem.research_type.replace('_', ' ')}
                </span>
                {previewItem.category && (
                  <Badge variant="outline" size="sm">
                    {typeof previewItem.category.name === 'object'
                      ? previewItem.category.name.en
                      : previewItem.category.name}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-serif text-white">
                {typeof previewItem.title === 'object' ? previewItem.title.en : previewItem.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                {previewItem.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-legal-gold" />
                    By{' '}
                    {typeof previewItem.author === 'object'
                      ? previewItem.author.en
                      : previewItem.author}
                  </span>
                )}
                {previewItem.research_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-legal-gold" />
                    {previewItem.research_date.split('T')[0]}
                  </span>
                )}
              </div>

              {previewItem.excerpt && (
                <div className="p-4 bg-neutral-900/60 border-l-2 border-legal-gold text-xs text-neutral-300 italic leading-relaxed">
                  {typeof previewItem.excerpt === 'object'
                    ? previewItem.excerpt.en
                    : previewItem.excerpt}
                </div>
              )}

              <div
                className="prose prose-invert prose-xs max-w-none text-neutral-300 pt-4 border-t border-neutral-800"
                dangerouslySetInnerHTML={{
                  __html:
                    typeof previewItem.content === 'object'
                      ? previewItem.content.en
                      : previewItem.content || '',
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
