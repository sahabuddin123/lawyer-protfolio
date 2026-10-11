import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { AdminPageHeader, AdminEmptyState, AdminConfirmationDialog } from '@/components/admin';
import { FileText, Plus, Search, Globe, ExternalLink, Eye, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import type { Page, ContentStatus } from '@/types';

export const PagesManager: React.FC = () => {
  const { showToast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');
  const [isSaving, setIsSaving] = useState(false);

  // Preview State
  const [previewPage, setPreviewPage] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'bn'>('en');

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    content_en: '',
    content_bn: '',
    status: 'draft' as ContentStatus,
    seo_title_en: '',
    seo_title_bn: '',
    meta_description_en: '',
    meta_description_bn: '',
    canonical_url: '',
    robots: 'index, follow',
  });

  useEffect(() => {
    fetchPages();
  }, [searchQuery, statusFilter]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const res: any = await cmsApi.getAdminPages({
        q: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const pageList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setPages(pageList);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error loading pages',
        message: err.message || 'Failed to retrieve CMS pages list.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData({
      title_en: '',
      title_bn: '',
      slug: '',
      content_en: '',
      content_bn: '',
      status: 'draft',
      seo_title_en: '',
      seo_title_bn: '',
      meta_description_en: '',
      meta_description_bn: '',
      canonical_url: '',
      robots: 'index, follow',
    });
    setContentLang('en');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setEditingPage(page);
    const titleEn = typeof page.title === 'object' ? (page.title as any)?.en || '' : page.title;
    const titleBn = typeof page.title === 'object' ? (page.title as any)?.bn || '' : '';
    const contentEn = typeof page.content === 'object' ? (page.content as any)?.en || '' : page.content;
    const contentBn = typeof page.content === 'object' ? (page.content as any)?.bn || '' : '';

    const pageSeo = ((page as any).seo || (page as any).seo_meta || {}) as any;

    setFormData({
      title_en: titleEn,
      title_bn: titleBn,
      slug: page.slug,
      content_en: contentEn,
      content_bn: contentBn,
      status: page.status,
      seo_title_en: pageSeo.seo_title?.en || pageSeo.meta_title?.en || '',
      seo_title_bn: pageSeo.seo_title?.bn || pageSeo.meta_title?.bn || '',
      meta_description_en: pageSeo.meta_description?.en || '',
      meta_description_bn: pageSeo.meta_description?.bn || '',
      canonical_url: pageSeo.canonical_url || '',
      robots: pageSeo.robots || 'index, follow',
    });
    setContentLang('en');
    setIsEditorOpen(true);
  };

  const handleOpenPreview = async (page: Page) => {
    try {
      setPreviewLoading(true);
      setIsPreviewOpen(true);
      setPreviewLang('en');
      const data = await cmsApi.previewAdminPage(page.id);
      setPreviewPage(data);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Preview Failed',
        message: err.message || 'Could not generate draft page preview.',
      });
      setIsPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const next = { ...prev, title_en: val };
      if (!editingPage) {
        next.slug = val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en || !formData.slug) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both an English title and a URL slug.',
      });
      return;
    }

    try {
      setIsSaving(true);
      const seoData = {
        seo_title: { en: formData.seo_title_en, bn: formData.seo_title_bn },
        meta_description: { en: formData.meta_description_en, bn: formData.meta_description_bn },
        canonical_url: formData.canonical_url,
        robots: formData.robots,
      };

      const payload = {
        title: { en: formData.title_en, bn: formData.title_bn },
        slug: formData.slug,
        content: { en: formData.content_en, bn: formData.content_bn },
        status: formData.status,
        seo: seoData,
        seo_meta: {
          meta_title: seoData.seo_title,
          meta_description: seoData.meta_description,
          canonical_url: seoData.canonical_url,
          robots: seoData.robots,
        },
      };

      if (editingPage) {
        await cmsApi.updateAdminPage(editingPage.id, payload);
        showToast({
          type: 'success',
          title: 'Page Updated',
          message: `Page '${formData.title_en}' has been successfully updated.`,
        });
      } else {
        await cmsApi.createAdminPage(payload);
        showToast({
          type: 'success',
          title: 'Page Created',
          message: `New page '${formData.title_en}' created.`,
        });
      }

      setIsEditorOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Operation Failed',
        message: err.message || 'Failed to save page.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingPage) return;
    try {
      setIsDeleting(true);
      await cmsApi.deleteAdminPage(deletingPage.id);
      showToast({
        type: 'success',
        title: 'Page Deleted',
        message: `Page '/${deletingPage.slug}' was removed.`,
      });
      setDeletingPage(null);
      fetchPages();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete page.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Static Pages & Policy Briefs"
        description="Author and publish institutional legal pages, practice disclaimers, policy briefs, and regulatory notices."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <FileText className="w-3 h-3 text-amber-600" />
            <span>{(Array.isArray(pages) ? pages.length : 0)} Pages</span>
          </span>
        }
        actions={
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </Button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pages by slug or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing {(Array.isArray(pages) ? pages.length : 0)} configured pages
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading institutional pages...</span>
        </div>
      ) : (!Array.isArray(pages) || pages.length === 0) ? (
        <AdminEmptyState
          title="No Pages Found"
          description={
            searchQuery || statusFilter !== 'all'
              ? `No institutional pages matching the selected filters were located.`
              : 'No static pages configured yet. Create disclaimers, about briefs, or terms of representation.'
          }
          actionLabel="+ Create New Page"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title (English)</th>
                  <th className="py-3 px-4">URL Route</th>
                  <th className="py-3 px-4">Translations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(pages) ? pages : []).map((p) => {
                  const titleEn = typeof p.title === 'object' ? (p.title as any)?.en || p.slug : p.title;
                  const hasBn = typeof p.title === 'object' && Boolean((p.title as any)?.bn);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{titleEn}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-amber-700">/{p.slug}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-2.5 h-2.5" /> EN
                          </span>
                          {hasBn ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" /> BN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-2.5 h-2.5" /> BN Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-50 border border-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
                          title="Preview draft or published page"
                        >
                          <Eye className="w-3 h-3 text-amber-600" />
                          <span>Preview</span>
                        </button>
                        {p.status === 'published' && (
                          <a
                            href={`/pages/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium transition-colors"
                            title="Live Public Route"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            <span>Live</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPage(p)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Draft Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewPage ? `Preview: /${previewPage.slug}` : 'Page Preview'}
        size="lg"
      >
        {previewLoading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Generating secure draft preview...</span>
          </div>
        ) : previewPage ? (
          <div className="space-y-4">
            {/* Simulation Header */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-semibold text-amber-900">
                  Authenticated Draft Simulation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-amber-200">
                  robots: {previewPage.seo?.robots || 'noindex, nofollow'}
                </span>
              </div>
              <div className="flex space-x-1 bg-white p-0.5 rounded-lg border border-amber-200">
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    previewLang === 'en'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('bn')}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    previewLang === 'bn'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Preview Document View */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-700 tracking-wider">
                  /{previewPage.slug}
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  {typeof previewPage.title === 'object'
                    ? previewPage.title[previewLang] || previewPage.title.en || 'Untitled'
                    : previewPage.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>Status: <strong>{previewPage.status}</strong></span>
                  <span>&bull;</span>
                  <span>Language: <strong>{previewLang === 'en' ? 'English' : 'Bangla'}</strong></span>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div
                className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed min-h-[120px]"
                dangerouslySetInnerHTML={{
                  __html: typeof previewPage.content === 'object'
                    ? previewPage.content[previewLang] || '<p class="text-slate-400 italic">No content recorded for this language variant yet.</p>'
                    : previewPage.content || '<p class="text-slate-400 italic">No content available.</p>',
                }}
              />
            </div>

            {/* SEO Metadata Simulation */}
            {previewPage.seo && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Search Engine Snippet Simulation
                </span>
                <div className="text-blue-700 font-medium truncate">
                  {typeof previewPage.seo.seo_title === 'object'
                    ? previewPage.seo.seo_title[previewLang] || previewPage.seo.seo_title.en || previewPage.title.en
                    : previewPage.seo.seo_title || previewPage.title}
                </div>
                <div className="text-emerald-700 text-[11px] font-mono truncate">
                  https://nijamuddin.com/pages/{previewPage.slug}
                </div>
                <div className="text-slate-600 text-[11px] line-clamp-2">
                  {typeof previewPage.seo.meta_description === 'object'
                    ? previewPage.seo.meta_description[previewLang] || previewPage.seo.meta_description.en || 'Institutional page from Advocate Nijam Uddin Chamber.'
                    : previewPage.seo.meta_description || 'Institutional page from Advocate Nijam Uddin Chamber.'}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingPage ? `Edit Page: ${formData.title_en || 'Brief'}` : 'Create New Static Page'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Page Title (English)"
              value={formData.title_en}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
            <Input
              label="Page Title (Bangla)"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="URL Slug (lowercase-with-hyphens)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <Select
              label="Publication Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
              options={[
                { value: 'draft', label: 'Draft (Admin Preview Only)' },
                { value: 'published', label: 'Published (Publicly Visible)' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          {/* Bilingual Content Editor Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Page Body Content
              </span>
              <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    contentLang === 'en'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('bn')}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    contentLang === 'bn'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাংলা (Bangla)
                </button>
              </div>
            </div>

            {contentLang === 'en' ? (
              <Textarea
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                rows={8}
                placeholder="Write page content in HTML or formatted text..."
                required
              />
            ) : (
              <Textarea
                value={formData.content_bn}
                onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
                rows={8}
                placeholder="বাংলা বিষয়বস্তু লিখুন..."
              />
            )}
          </div>

          {/* SEO Metadata Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>Search Engine Optimization (SEO) Metadata</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="SEO Meta Title (English)"
                value={formData.seo_title_en}
                onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
              />
              <Input
                label="SEO Meta Title (Bangla)"
                value={formData.seo_title_bn}
                onChange={(e) => setFormData({ ...formData, seo_title_bn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Textarea
                label="Meta Description (English)"
                value={formData.meta_description_en}
                onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                rows={2}
              />
              <Textarea
                label="Meta Description (Bangla)"
                value={formData.meta_description_bn}
                onChange={(e) => setFormData({ ...formData, meta_description_bn: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Canonical URL"
                value={formData.canonical_url}
                onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                placeholder="https://nijamuddin.com/pages/..."
              />
              <Input
                label="Robots Indexing Directive"
                value={formData.robots}
                onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsEditorOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSaving}
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-xs"
            >
              {editingPage ? 'Save Changes' : 'Create Page'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Deletion */}
      <AdminConfirmationDialog
        isOpen={Boolean(deletingPage)}
        title="Delete Institutional Page"
        message={`Are you sure you wish to delete the page '/${deletingPage?.slug}'? This action cannot be reversed.`}
        confirmLabel="Delete Page"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingPage(null)}
      />
    </div>
  );
};
