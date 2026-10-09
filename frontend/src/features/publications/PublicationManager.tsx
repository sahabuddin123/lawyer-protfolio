import React, { useState, useEffect, useCallback } from 'react';
import { publicationsApi } from '@/api/publications';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { Publication, ContentStatus, VisibilityTier } from '@/types';
import { TaxonomyCategory, TaxonomyTag } from '@/types/publication';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  BookOpen,
  ExternalLink,
  Download,
  Star,
  ArrowUpDown,
} from 'lucide-react';

const PUBLICATION_TYPES = [
  { value: 'book', label: 'Book / Treatise' },
  { value: 'journal_article', label: 'Journal Article' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'conference_paper', label: 'Conference Paper' },
  { value: 'legal_article', label: 'Legal Article' },
  { value: 'case_note', label: 'Case Note' },
  { value: 'law_review', label: 'Law Review' },
  { value: 'legal_opinion', label: 'Legal Opinion' },
  { value: 'book_chapter', label: 'Book Chapter' },
  { value: 'report', label: 'Legal Report' },
  { value: 'other', label: 'Other Document' },
];

export const PublicationManager: React.FC = () => {
  const { showToast } = useToast();

  const [publications, setPublications] = useState<Publication[]>([]);
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
  const [editingItem, setEditingItem] = useState<Publication | null>(null);
  const [isDeleting, setIsDeleting] = useState<Publication | null>(null);
  const [previewItem, setPreviewItem] = useState<Publication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'source' | 'media' | 'publishing' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    publication_type: 'book',
    category_id: '' as string | number,
    author_en: '',
    author_bn: '',
    publication_name_en: '',
    publication_name_bn: '',
    publication_date: '',
    excerpt_en: '',
    excerpt_bn: '',
    content_en: '',
    content_bn: '',
    cover_image_id: '' as string | number,
    pdf_media_id: '' as string | number,
    external_url: '',
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
      const [pubRes, catRes, tagRes] = await Promise.all([
        publicationsApi.getAdminPublications({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? (statusFilter as ContentStatus) : undefined,
          visibility: visibilityFilter !== 'all' ? (visibilityFilter as VisibilityTier) : undefined,
          publication_type: typeFilter !== 'all' ? typeFilter : undefined,
          category_id: categoryFilter !== 'all' ? Number(categoryFilter) : undefined,
          per_page: 50,
        }),
        publicationsApi.getCategories('publications'),
        publicationsApi.getTags(),
      ]);

      if (pubRes.success) {
        setPublications(pubRes.data || []);
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
      if (tagRes.success) {
        setTags(tagRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load publications:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Unable to retrieve publications.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, visibilityFilter, typeFilter, categoryFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title_en: '',
      title_bn: '',
      slug: '',
      publication_type: 'book',
      category_id: '',
      author_en: '',
      author_bn: '',
      publication_name_en: '',
      publication_name_bn: '',
      publication_date: '',
      excerpt_en: '',
      excerpt_bn: '',
      content_en: '',
      content_bn: '',
      cover_image_id: '',
      pdf_media_id: '',
      external_url: '',
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

  const getEn = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.en || '';
  };

  const getBn = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return '';
    return val.bn || '';
  };

  const handleOpenEdit = (item: Publication) => {
    setEditingItem(item);
    setFormData({
      title_en: getEn(item.title),
      title_bn: getBn(item.title),
      slug: item.slug,
      publication_type: item.publication_type || 'book',
      category_id: item.category_id || '',
      author_en: getEn(item.author),
      author_bn: getBn(item.author),
      publication_name_en: getEn(item.publication_name),
      publication_name_bn: getBn(item.publication_name),
      publication_date: item.publication_date ? item.publication_date.substring(0, 10) : '',
      excerpt_en: getEn(item.excerpt),
      excerpt_bn: getBn(item.excerpt),
      content_en: getEn(item.content),
      content_bn: getBn(item.content),
      cover_image_id: item.cover_image_id || (item.cover_image as any)?.id || '',
      pdf_media_id: item.pdf_media_id || (item.pdf_media as any)?.id || '',
      external_url: item.external_url || '',
      visibility: item.visibility || 'public',
      status: item.status || 'draft',
      is_featured: !!item.is_featured,
      sort_order: item.sort_order || 0,
      tags: item.tags ? (item.tags as any[]).map((t) => t.id) : [],
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
    if (!formData.title_en.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Publication Title (English) is required.' });
      return;
    }
    if (!formData.publication_type.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Publication type is required.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: {
          en: formData.title_en.trim(),
          ...(formData.title_bn.trim() ? { bn: formData.title_bn.trim() } : {}),
        },
        slug: formData.slug.trim() || generateSlug(formData.title_en),
        publication_type: formData.publication_type,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        publication_date: formData.publication_date || null,
        visibility: formData.visibility,
        status: formData.status,
        is_featured: formData.is_featured,
        sort_order: Number(formData.sort_order) || 0,
        tags: formData.tags,
      };

      if (formData.author_en.trim() || formData.author_bn.trim()) {
        payload.author = {
          en: formData.author_en.trim(),
          ...(formData.author_bn.trim() ? { bn: formData.author_bn.trim() } : {}),
        };
      } else {
        payload.author = null;
      }

      if (formData.publication_name_en.trim() || formData.publication_name_bn.trim()) {
        payload.publication_name = {
          en: formData.publication_name_en.trim(),
          ...(formData.publication_name_bn.trim() ? { bn: formData.publication_name_bn.trim() } : {}),
        };
      } else {
        payload.publication_name = null;
      }

      if (formData.excerpt_en.trim() || formData.excerpt_bn.trim()) {
        payload.excerpt = {
          en: formData.excerpt_en.trim(),
          ...(formData.excerpt_bn.trim() ? { bn: formData.excerpt_bn.trim() } : {}),
        };
      } else {
        payload.excerpt = null;
      }

      if (formData.content_en.trim() || formData.content_bn.trim()) {
        payload.content = {
          en: formData.content_en.trim(),
          ...(formData.content_bn.trim() ? { bn: formData.content_bn.trim() } : {}),
        };
      } else {
        payload.content = null;
      }

      if (formData.external_url.trim()) {
        payload.external_url = formData.external_url.trim();
      } else {
        payload.external_url = null;
      }

      if (formData.cover_image_id) {
        payload.cover_image_id = Number(formData.cover_image_id);
      } else {
        payload.cover_image_id = null;
      }

      if (formData.pdf_media_id) {
        payload.pdf_media_id = Number(formData.pdf_media_id);
      } else {
        payload.pdf_media_id = null;
      }

      // SEO
      if (formData.seo_title_en || formData.meta_desc_en || formData.canonical_url) {
        payload.seo = {
          seo_title: {
            en: formData.seo_title_en,
            ...(formData.seo_title_bn ? { bn: formData.seo_title_bn } : {}),
          },
          meta_description: {
            en: formData.meta_desc_en,
            ...(formData.meta_desc_bn ? { bn: formData.meta_desc_bn } : {}),
          },
          canonical_url: formData.canonical_url || null,
        };
      }

      let res;
      if (editingItem) {
        res = await publicationsApi.updatePublication(editingItem.id, payload);
      } else {
        res = await publicationsApi.createPublication(payload);
      }

      if (res.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: editingItem
            ? 'Publication updated successfully.'
            : 'Publication created successfully.',
        });
        setIsEditorOpen(false);
        loadData();
      } else {
        showToast({
          type: 'error',
          title: 'Save Failed',
          message: res.message || 'Failed to save publication.',
        });
      }
    } catch (err: any) {
      console.error('Save publication error:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Operation failed.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      const res = await publicationsApi.deletePublication(isDeleting.id);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Deleted',
          message: 'Publication record soft deleted successfully.',
        });
        setIsDeleting(null);
        loadData();
      } else {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: res.message || 'Failed to delete record.',
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to delete publication.',
      });
    }
  };

  const handlePreview = async (item: Publication) => {
    try {
      const res = await publicationsApi.previewPublication(item.id);
      if (res.success && res.data) {
        setPreviewItem(res.data);
      } else {
        showToast({ type: 'error', title: 'Preview Error', message: res.message || 'Failed to generate preview.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Preview Error', message: err.message || 'Preview generation failed.' });
    }
  };

  const handleReorder = async () => {
    try {
      const orderedIds = publications.map((p) => p.id);
      const res = await publicationsApi.reorderPublications(orderedIds);
      if (res.success) {
        showToast({ type: 'success', title: 'Reordered', message: 'Publications order ranks updated.' });
        loadData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to reorder publications.' });
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= publications.length) return;
    const items = [...publications];
    const temp = items[index];
    items[index] = items[target];
    items[target] = temp;
    setPublications(items);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-legal-gold" />
            Publications & Treatises Archive
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage books, journal papers, law reviews, conference proceedings, and monographs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReorder}
            className="text-neutral-300 border-neutral-700 hover:border-legal-gold"
          >
            <ArrowUpDown className="w-4 h-4 mr-1 text-legal-gold" />
            Save Order
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="bg-legal-gold hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Publication
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 pl-9 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-legal-gold"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
            >
              <option value="all">All Types</option>
              {PUBLICATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{getEn(c.name)}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Publications Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-neutral-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-legal-gold border-t-transparent mb-3" />
            <p className="text-xs">Loading publications repository...</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="py-16 text-center text-neutral-500">
            <BookOpen className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-400">No publications found</p>
            <p className="text-xs mt-1">Adjust filters or create a new publication record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Source / Publisher</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Access</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {publications.map((item, index) => {
                  const titleEn = getEn(item.title);
                  const titleBn = getBn(item.title);
                  const sourceName = getEn(item.publication_name);
                  const authorName = getEn(item.author);

                  return (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveItem(index, 'up')}
                            className="p-1 hover:text-legal-gold disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <span className="font-mono text-neutral-400">{item.sort_order}</span>
                          <button
                            type="button"
                            disabled={index === publications.length - 1}
                            onClick={() => moveItem(index, 'down')}
                            className="p-1 hover:text-legal-gold disabled:opacity-30"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          {item.is_featured && (
                            <Star className="w-3.5 h-3.5 text-legal-gold fill-legal-gold" />
                          )}
                          <span>{titleEn}</span>
                        </div>
                        {titleBn && (
                          <div className="text-[11px] text-neutral-400 font-serif mt-0.5">
                            {titleBn}
                          </div>
                        )}
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          /{item.slug} {authorName && `• ${authorName}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 bg-neutral-800 rounded text-[11px] text-neutral-300">
                          {item.publication_type?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {sourceName || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">
                        {item.publication_date ? item.publication_date.substring(0, 10) : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            item.status === 'published'
                              ? 'success'
                              : item.status === 'draft'
                              ? 'outline'
                              : 'neutral'
                          }
                          className="capitalize text-[10px]"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.visibility === 'public' ? (
                          <span className="inline-flex items-center text-emerald-400 text-[10px] gap-1">
                            <Unlock className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-400 text-[10px] gap-1">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePreview(item)}
                            title="Preview Dossier"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {item.has_pdf && (
                            <a
                              href={publicationsApi.getAdminDownloadUrl(item.id)}
                              target="_blank"
                              rel="noreferrer"
                              title="Download Attached PDF"
                              className="p-1.5 text-neutral-400 hover:text-legal-gold hover:bg-neutral-800 rounded transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Publication"
                            className="p-1.5 text-neutral-400 hover:text-legal-gold hover:bg-neutral-800 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDeleting(item)}
                            title="Soft Delete"
                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <Modal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          title={editingItem ? 'Edit Publication Dossier' : 'New Publication Record'}
          size="xl"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Modal Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex space-x-2">
                {[
                  { key: 'basic', label: 'Basic Info' },
                  { key: 'content', label: 'Editorial Content' },
                  { key: 'source', label: 'Source & Publisher' },
                  { key: 'media', label: 'Documents & Media' },
                  { key: 'publishing', label: 'Publishing' },
                  { key: 'seo', label: 'SEO' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                      activeTab === tab.key
                        ? 'bg-legal-gold text-black font-semibold'
                        : 'text-neutral-400 hover:text-white bg-neutral-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`px-2 py-0.5 text-[11px] rounded transition ${
                    contentLang === 'en' ? 'bg-neutral-800 text-legal-gold font-bold' : 'text-neutral-400'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('bn')}
                  className={`px-2 py-0.5 text-[11px] rounded transition ${
                    contentLang === 'bn' ? 'bg-neutral-800 text-legal-gold font-bold' : 'text-neutral-400'
                  }`}
                >
                  BN (বাংলা)
                </button>
              </div>
            </div>

            {/* Tab 1: Basic Info */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentLang === 'en' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Title (English) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            title_en: val,
                            ...(!editingItem ? { slug: generateSlug(val) } : {}),
                          }));
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="e.g. Treatise on Constitutional Jurisprudence"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Title (Bangla - বাংলা)
                      </label>
                      <input
                        type="text"
                        value={formData.title_bn}
                        onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="e.g. সংবিধান সংক্রান্ত তত্ত্ব ও প্রয়োগ"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      URL Slug <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                      required
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Published slug changes automatically create 301 permanent redirects.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Publication Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.publication_type}
                      onChange={(e) => setFormData({ ...formData, publication_type: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      {PUBLICATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{getEn(c.name)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Publication Date</label>
                    <input
                      type="date"
                      value={formData.publication_date}
                      onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                </div>

                {/* Author Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentLang === 'en' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Author (English)</label>
                      <input
                        type="text"
                        value={formData.author_en}
                        onChange={(e) => setFormData({ ...formData, author_en: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="e.g. Advocate Nijam Uddin"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        Leave blank if unassigned. Do not fabricate co-authors or honorifics.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Author (Bangla - বাংলা)</label>
                      <input
                        type="text"
                        value={formData.author_bn}
                        onChange={(e) => setFormData({ ...formData, author_bn: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="e.g. অ্যাডভোকেট নিজাম উদ্দিন"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Associated Tags</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-neutral-950 border border-neutral-800 rounded">
                      {tags.map((tag) => {
                        const isSelected = formData.tags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                tags: isSelected
                                  ? formData.tags.filter((id) => id !== tag.id)
                                  : [...formData.tags, tag.id],
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] transition ${
                              isSelected
                                ? 'bg-legal-gold text-black font-semibold'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {getEn(tag.name)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Editorial Content */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {contentLang === 'en' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Editorial Excerpt / Abstract (English)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.excerpt_en}
                        onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="Concise overview or editorial abstract..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Full Content / Table of Contents / Chapters (English HTML/Text)
                      </label>
                      <textarea
                        rows={10}
                        value={formData.content_en}
                        onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                        placeholder="Comprehensive text, sections, quotations, references (HTML supported, sanitized)..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        সারসংক্ষেপ (বাংলা - Bengali Excerpt)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.excerpt_bn}
                        onChange={(e) => setFormData({ ...formData, excerpt_bn: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="প্রকাশনার সংক্ষিপ্ত বিবরণ..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        পূর্ণাঙ্গ বিষয়বস্তু (বাংলা - Bengali Content)
                      </label>
                      <textarea
                        rows={10}
                        value={formData.content_bn}
                        onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                        placeholder="পূর্ণাঙ্গ বিশ্লেষণ, অধ্যায় বা ধারা..."
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab 3: Source & Publisher */}
            {activeTab === 'source' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentLang === 'en' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Publication Source / Journal / Publisher (English)
                      </label>
                      <input
                        type="text"
                        value={formData.publication_name_en}
                        onChange={(e) => setFormData({ ...formData, publication_name_en: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="e.g. Bangladesh Supreme Court Bar Journal"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        উৎস / জার্নাল / প্রকাশক (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={formData.publication_name_bn}
                        onChange={(e) => setFormData({ ...formData, publication_name_bn: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                        placeholder="e.g. সুপ্রিম কোর্ট বার জার্নাল"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      External URL / DOI Link
                    </label>
                    <input
                      type="url"
                      value={formData.external_url}
                      onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                      placeholder="https://journal.example.com/article/123"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Must start with http:// or https://. javascript: and data: URIs are rejected.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Media & Documents */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Cover Image Media ID
                    </label>
                    <input
                      type="number"
                      value={formData.cover_image_id}
                      onChange={(e) => setFormData({ ...formData, cover_image_id: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                      placeholder="e.g. 102"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      ID from Media Library for front cover or book spine artwork.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Document / PDF Media ID
                    </label>
                    <input
                      type="number"
                      value={formData.pdf_media_id}
                      onChange={(e) => setFormData({ ...formData, pdf_media_id: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                      placeholder="e.g. 205"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Media ID for downloadable PDF monograph or research paper.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Publishing & Visibility */}
            {activeTab === 'publishing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      <option value="draft">Draft (Private back-office)</option>
                      <option value="published">Published (Live public)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Visibility <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as VisibilityTier })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    >
                      <option value="public">Public (Visible to all visitors)</option>
                      <option value="private">Private (Restricted / Internal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Display Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-neutral-800 bg-neutral-950 text-legal-gold focus:ring-legal-gold w-4 h-4"
                      />
                      <span>Feature on Publications overview and hero carousel</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: SEO Metadata */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">SEO Title (English)</label>
                    <input
                      type="text"
                      value={formData.seo_title_en}
                      onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">SEO Title (Bangla)</label>
                    <input
                      type="text"
                      value={formData.seo_title_bn}
                      onChange={(e) => setFormData({ ...formData, seo_title_bn: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Meta Description (English)</label>
                    <textarea
                      rows={2}
                      value={formData.meta_desc_en}
                      onChange={(e) => setFormData({ ...formData, meta_desc_en: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Meta Description (Bangla)</label>
                    <textarea
                      rows={2}
                      value={formData.meta_desc_bn}
                      onChange={(e) => setFormData({ ...formData, meta_desc_bn: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-legal-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Canonical URL</label>
                  <input
                    type="url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-legal-gold"
                    placeholder="https://nijamuddin.com/publications/example"
                  />
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                className="text-neutral-400 border-neutral-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
                className="bg-legal-gold hover:bg-yellow-500 text-black font-semibold"
              >
                {isSaving ? 'Saving...' : editingItem ? 'Update Publication' : 'Create Publication'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title="Editorial Dossier Preview"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-amber-950/30 border border-amber-600/30 text-amber-200 px-3 py-2 rounded text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>Editorial Preview Mode</strong> — Search engine indexing strictly barred (<code>X-Robots-Tag: noindex, nofollow</code>).
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase text-amber-400 border-amber-500/40">
                {previewItem.status}
              </Badge>
            </div>

            <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-800 space-y-4">
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-legal-gold">
                  {previewItem.publication_type?.replace(/_/g, ' ')}
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  {getEn(previewItem.title)}
                </h2>
                {getBn(previewItem.title) && (
                  <p className="text-sm font-serif text-neutral-400 mt-1">
                    {getBn(previewItem.title)}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
                  {previewItem.author && <span>By {getEn(previewItem.author)}</span>}
                  {previewItem.publication_name && <span>Published in: {getEn(previewItem.publication_name)}</span>}
                  {previewItem.publication_date && <span>Date: {previewItem.publication_date}</span>}
                </div>
              </div>

              {previewItem.excerpt && (
                <div className="text-neutral-300 text-sm italic bg-neutral-900/60 p-4 rounded border-l-2 border-legal-gold">
                  {getEn(previewItem.excerpt)}
                </div>
              )}

              {previewItem.content && (
                <div
                  className="prose prose-invert prose-sm max-w-none text-neutral-300"
                  dangerouslySetInnerHTML={{ __html: getEn(previewItem.content) }}
                />
              )}

              {previewItem.external_url && (
                <div className="pt-2">
                  <a
                    href={previewItem.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-legal-gold hover:underline gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit External Source: {previewItem.external_url}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewItem(null)}
                className="text-neutral-400 border-neutral-700"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <Modal
          isOpen={!!isDeleting}
          onClose={() => setIsDeleting(null)}
          title="Confirm Soft Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-neutral-300">
              Are you sure you want to delete publication: <strong className="text-white">{getEn(isDeleting.title)}</strong>?
            </p>
            <p className="text-[11px] text-neutral-500">
              This action soft deletes the record. Public routes will return 404 and cache will be invalidated immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleting(null)}
                className="text-neutral-400 border-neutral-700"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-red-700"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
