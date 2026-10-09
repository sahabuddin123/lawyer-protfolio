import React, { useState, useEffect, useCallback } from 'react';
import { practiceAreaApi } from '@/api/practiceAreas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { PracticeAreaIcon, APPROVED_PRACTICE_ICONS } from '@/components/icons/PracticeAreaIcon';
import { PracticeArea, PracticeAreaFormData, PracticeAreaStatus } from '@/types/practiceArea';
import {
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Scale,
  Info,
  AlertTriangle,
} from 'lucide-react';

export const PracticeAreasManager: React.FC = () => {
  const { showToast } = useToast();

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PracticeArea | null>(null);
  const [isDeleting, setIsDeleting] = useState<PracticeArea | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    short_desc_en: '',
    short_desc_bn: '',
    full_desc_en: '',
    full_desc_bn: '',
    icon_name: 'scale',
    status: 'draft' as PracticeAreaStatus,
    is_featured: false,
    sort_order: 0,
    seo_title_en: '',
    seo_title_bn: '',
    meta_desc_en: '',
    meta_desc_bn: '',
    canonical_url: '',
    robots: 'index, follow',
  });

  const fetchPracticeAreas = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (featuredFilter === 'featured') params.is_featured = true;

      const res = await practiceAreaApi.getAdminPracticeAreas(params);
      if (res.success) {
        setPracticeAreas(res.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin practice areas:', err);
      showToast({
        type: 'error',
        title: 'Error loading practice areas',
        message: err.message || 'Unable to retrieve administrative list.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, featuredFilter, showToast]);

  useEffect(() => {
    fetchPracticeAreas();
  }, [fetchPracticeAreas]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title_en: '',
      title_bn: '',
      slug: '',
      short_desc_en: '',
      short_desc_bn: '',
      full_desc_en: '',
      full_desc_bn: '',
      icon_name: 'scale',
      status: 'draft',
      is_featured: false,
      sort_order: practiceAreas.length + 1,
      seo_title_en: '',
      seo_title_bn: '',
      meta_desc_en: '',
      meta_desc_bn: '',
      canonical_url: '',
      robots: 'index, follow',
    });
    setActiveTab('basic');
    setContentLang('en');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: PracticeArea) => {
    setEditingItem(item);
    const titleObj = (typeof item.title === 'object' && item.title) ? item.title : { en: String(item.title || ''), bn: '' };
    const shortObj = (typeof item.short_description === 'object' && item.short_description) ? item.short_description : { en: String(item.short_description || ''), bn: '' };
    const fullObj = (typeof item.full_description === 'object' && item.full_description) ? item.full_description : { en: String(item.full_description || ''), bn: '' };
    const seoObj = item.seo;

    setFormData({
      title_en: titleObj.en || '',
      title_bn: titleObj.bn || '',
      slug: item.slug || '',
      short_desc_en: shortObj.en || '',
      short_desc_bn: shortObj.bn || '',
      full_desc_en: fullObj.en || '',
      full_desc_bn: fullObj.bn || '',
      icon_name: item.icon_name || 'scale',
      status: (item.status as PracticeAreaStatus) || 'draft',
      is_featured: Boolean(item.is_featured),
      sort_order: item.sort_order || 0,
      seo_title_en: typeof seoObj?.seo_title === 'object' ? seoObj.seo_title.en || '' : String(seoObj?.seo_title || ''),
      seo_title_bn: typeof seoObj?.seo_title === 'object' ? seoObj.seo_title.bn || '' : '',
      meta_desc_en: typeof seoObj?.meta_description === 'object' ? seoObj.meta_description.en || '' : String(seoObj?.meta_description || ''),
      meta_desc_bn: typeof seoObj?.meta_description === 'object' ? seoObj.meta_description.bn || '' : '',
      canonical_url: seoObj?.canonical_url || '',
      robots: seoObj?.robots || 'index, follow',
    });
    setActiveTab('basic');
    setContentLang('en');
    setIsEditorOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title_en: val };
      if (!editingItem) {
        // Auto-generate slug for new records
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en.trim()) {
      showToast({ type: 'info', title: 'Validation', message: 'English Title is required.' });
      return;
    }

    if (!formData.slug.trim()) {
      showToast({ type: 'info', title: 'Validation', message: 'Slug identifier is required.' });
      return;
    }

    if (!formData.short_desc_en.trim()) {
      showToast({ type: 'info', title: 'Validation', message: 'Short description (English) is required.' });
      return;
    }

    if (!formData.full_desc_en.trim()) {
      showToast({ type: 'info', title: 'Validation', message: 'Full description (English) is required.' });
      return;
    }

    try {
      setIsSaving(true);

      const payload: PracticeAreaFormData = {
        title: {
          en: formData.title_en.trim(),
          bn: formData.title_bn.trim() || formData.title_en.trim(),
        },
        slug: formData.slug.trim().toLowerCase(),
        short_description: {
          en: formData.short_desc_en.trim(),
          bn: formData.short_desc_bn.trim() || formData.short_desc_en.trim(),
        },
        full_description: {
          en: formData.full_desc_en.trim(),
          bn: formData.full_desc_bn.trim() || formData.full_desc_en.trim(),
        },
        icon_name: formData.icon_name || 'scale',
        status: formData.status,
        is_featured: formData.is_featured,
        sort_order: Number(formData.sort_order) || 0,
        seo: {
          seo_title: {
            en: formData.seo_title_en.trim(),
            bn: formData.seo_title_bn.trim() || formData.seo_title_en.trim(),
          },
          meta_description: {
            en: formData.meta_desc_en.trim(),
            bn: formData.meta_desc_bn.trim() || formData.meta_desc_en.trim(),
          },
          canonical_url: formData.canonical_url.trim() || undefined,
          robots: formData.robots || 'index, follow',
        },
      };

      if (editingItem) {
        await practiceAreaApi.updatePracticeArea(editingItem.id, payload);
        showToast({
          type: 'success',
          title: 'Practice Area Updated',
          message: `Updated "${formData.title_en}" successfully.`,
        });
      } else {
        await practiceAreaApi.createPracticeArea(payload);
        showToast({
          type: 'success',
          title: 'Practice Area Created',
          message: `Created "${formData.title_en}" successfully.`,
        });
      }

      setIsEditorOpen(false);
      fetchPracticeAreas();
    } catch (err: any) {
      console.error('Failed to save practice area:', err);
      showToast({
        type: 'error',
        title: 'Error saving practice area',
        message: err.response?.data?.message || err.message || 'Validation or network failure.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;

    try {
      await practiceAreaApi.deletePracticeArea(isDeleting.id);
      showToast({
        type: 'success',
        title: 'Practice Area Deleted',
        message: 'Record removed successfully.',
      });
      setIsDeleting(null);
      fetchPracticeAreas();
    } catch (err: any) {
      console.error('Failed to delete practice area:', err);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.response?.data?.message || 'Unable to delete practice area.',
      });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= practiceAreas.length) return;

    const reordered = [...practiceAreas];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setPracticeAreas(reordered);

    try {
      const ids = reordered.map((item) => item.id);
      await practiceAreaApi.reorderPracticeAreas(ids);
      showToast({
        type: 'success',
        title: 'Reordered',
        message: 'Updated practice areas display order.',
      });
    } catch (err: any) {
      console.error('Failed to reorder:', err);
      fetchPracticeAreas();
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'draft':
        return <Badge variant="gold">Draft</Badge>;
      case 'archived':
        return <Badge variant="neutral">Archived</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Draft'}</Badge>;
    }
  };

  const resolveItemTitle = (item: PracticeArea): string => {
    if (typeof item.title === 'string') return item.title;
    return item.title?.en || item.title?.bn || 'Untitled Domain';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-xl font-serif-editorial font-bold text-text-primary flex items-center space-x-2">
            <Scale className="w-5 h-5 text-gold-primary" />
            <span>Practice Areas & Jurisdictions</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Manage Supreme Court jurisdictional domains, bilingual briefs, icons, and SEO metadata.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Practice Area</span>
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <Card className="p-4 bg-surface-card border-border-subtle">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description or slug..."
              className="w-full bg-surface-base border border-border-subtle rounded-md pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-gold-primary"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
            >
              <option value="all">All Domains</option>
              <option value="featured">Featured Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Table / Content */}
      <Card className="overflow-hidden bg-surface-card border-border-subtle">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted animate-pulse">
            Loading practice areas records...
          </div>
        ) : practiceAreas.length === 0 ? (
          <div className="p-12 text-center">
            <Info className="w-8 h-8 text-gold-primary/60 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-text-primary mb-1">No Practice Areas Found</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
              {searchQuery || statusFilter !== 'all' || featuredFilter !== 'all'
                ? 'No items matched your current filter query.'
                : 'No practice areas have been added yet. Click New Practice Area above to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle/80 bg-surface-elevated/40 text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4 w-28 text-center">Icon</th>
                  <th className="py-3 px-4 w-28">Status</th>
                  <th className="py-3 px-4 w-24 text-center">Featured</th>
                  <th className="py-3 px-4 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 text-xs">
                {practiceAreas.map((item, index) => (
                  <tr key={item.id} className="hover:bg-surface-elevated/30 transition-colors">
                    {/* Order column */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'up')}
                          className="text-text-muted hover:text-gold-primary disabled:opacity-20 p-0.5"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-[11px] text-text-muted font-bold">
                          {item.sort_order}
                        </span>
                        <button
                          disabled={index === practiceAreas.length - 1}
                          onClick={() => handleMoveOrder(index, 'down')}
                          className="text-text-muted hover:text-gold-primary disabled:opacity-20 p-0.5"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text-primary text-sm">
                        {resolveItemTitle(item)}
                      </div>
                      <div className="font-mono text-[11px] text-text-muted mt-0.5">
                        /practice-areas/{item.slug}
                      </div>
                    </td>

                    {/* Icon */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border-subtle flex items-center justify-center mx-auto text-gold-primary">
                        <PracticeAreaIcon name={item.icon_name} className="w-4 h-4" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                    {/* Featured */}
                    <td className="py-3.5 px-4 text-center">
                      {item.is_featured ? (
                        <span className="inline-flex items-center text-amber-400" title="Featured domain">
                          <Sparkles className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-text-muted/40 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {item.status === 'published' && (
                          <a
                            href={`/practice-areas/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-text-muted hover:text-gold-primary rounded hover:bg-surface-elevated transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-text-muted hover:text-gold-primary rounded hover:bg-surface-elevated transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setIsDeleting(item)}
                          className="p-1.5 text-text-muted hover:text-red-400 rounded hover:bg-surface-elevated transition-colors"
                          title="Delete"
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

      {/* 4. Create / Edit Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingItem ? 'Edit Practice Area' : 'Create Practice Area'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'basic'
                  ? 'bg-gold-primary text-background-base'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              1. Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'content'
                  ? 'bg-gold-primary text-background-base'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              2. Descriptions & Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'seo'
                  ? 'bg-gold-primary text-background-base'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              3. SEO Metadata
            </button>
          </div>

          {/* TAB 1: Basic Information */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Title (English) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Constitutional & Writ Advocacy"
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Title (Bangla)
                  </label>
                  <input
                    type="text"
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    placeholder="e.g. সাংবিধানিক ও রিট মামলা"
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Slug (URL Identifier) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. constitutional-writ-advocacy"
                  className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-gold-primary"
                />
                {editingItem && editingItem.status === 'published' && editingItem.slug !== formData.slug && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 inline" />
                    Changing published slug will automatically create a 301 Permanent Redirect.
                  </p>
                )}
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">
                  Select Icon Indicator
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {APPROVED_PRACTICE_ICONS.map((iconItem) => (
                    <button
                      type="button"
                      key={iconItem.key}
                      onClick={() => setFormData({ ...formData, icon_name: iconItem.key })}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                        formData.icon_name === iconItem.key
                          ? 'border-gold-primary bg-gold-primary/10 text-gold-hover'
                          : 'border-border-subtle bg-surface-base text-text-muted hover:border-border-subtle/80'
                      }`}
                    >
                      <PracticeAreaIcon name={iconItem.key} className="w-4 h-4" />
                      <span className="text-[10px] truncate max-w-full font-sans">
                        {iconItem.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-subtle">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PracticeAreaStatus })}
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="archived">Archived (Unlisted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-border-subtle bg-surface-base text-gold-primary focus:ring-gold-primary/20"
                    />
                    <span className="text-xs font-medium text-text-primary">
                      Feature on Home / Priority
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Descriptions & Content */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs text-text-muted">Bilingual Text Editing:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setContentLang('en')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      contentLang === 'en'
                        ? 'bg-gold-primary text-background-base'
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    English Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentLang('bn')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      contentLang === 'bn'
                        ? 'bg-gold-primary text-background-base'
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    Bangla Content
                  </button>
                </div>
              </div>

              {contentLang === 'en' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Short Description (English Excerpt) <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.short_desc_en}
                      onChange={(e) => setFormData({ ...formData, short_desc_en: e.target.value })}
                      placeholder="Concise 1-2 sentence excerpt displayed on cards and search results..."
                      className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Full Jurisdictional Description (English HTML) <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={10}
                      required
                      value={formData.full_desc_en}
                      onChange={(e) => setFormData({ ...formData, full_desc_en: e.target.value })}
                      placeholder="<p>Full treatise, legal scope, precedent frameworks, and case types...</p>"
                      className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Short Description (Bangla Excerpt)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.short_desc_bn}
                      onChange={(e) => setFormData({ ...formData, short_desc_bn: e.target.value })}
                      placeholder="কার্ড ও তালিকায় প্রদর্শিত সংক্ষিপ্ত পরিচিতি..."
                      className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Full Jurisdictional Description (Bangla HTML)
                    </label>
                    <textarea
                      rows={10}
                      value={formData.full_desc_bn}
                      onChange={(e) => setFormData({ ...formData, full_desc_bn: e.target.value })}
                      placeholder="<p>আইনি পরিধি, রিট এখতিয়ার ও সুপ্রিম কোর্ট প্র্যাকটিস সংক্রান্ত বিস্তারিত বিবরণ...</p>"
                      className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: SEO Metadata */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Meta Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title_en}
                    onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                    placeholder="e.g. Constitutional Law | Advocate Nijam Uddin"
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Meta Title (Bangla)
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title_bn}
                    onChange={(e) => setFormData({ ...formData, seo_title_bn: e.target.value })}
                    placeholder="e.g. সাংবিধানিক আইন | অ্যাডভোকেট নিজাম উদ্দিন"
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Meta Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_desc_en}
                    onChange={(e) => setFormData({ ...formData, meta_desc_en: e.target.value })}
                    placeholder="SEO description for search snippets..."
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Meta Description (Bangla)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_desc_bn}
                    onChange={(e) => setFormData({ ...formData, meta_desc_bn: e.target.value })}
                    placeholder="সার্চ ইঞ্জিনের জন্য বাংলা বিবরণ..."
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Canonical URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://nijamuddin.com/practice-areas/..."
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Robots Instruction
                  </label>
                  <input
                    type="text"
                    value={formData.robots}
                    onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                    placeholder="index, follow"
                    className="w-full bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Practice Area'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(isDeleting)}
        onClose={() => setIsDeleting(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-text-primary">
              {isDeleting ? resolveItemTitle(isDeleting) : ''}
            </strong>
            ? This will soft-delete the record and remove it from the public directory.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border-subtle">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
