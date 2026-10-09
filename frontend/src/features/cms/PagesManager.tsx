import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import type { Page, ContentStatus } from '@/types';

export const PagesManager: React.FC = () => {
  const { showToast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');
  const [isSaving, setIsSaving] = useState(false);

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
  }, [searchQuery]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const res = await cmsApi.getAdminPages({ q: searchQuery });
      setPages(res.data);
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
    setIsEditorOpen(true);
  };

  const handleOpenEdit = async (page: Page) => {
    try {
      const full = await cmsApi.getAdminPage(page.id);
      setEditingPage(full);

      const titleEn = typeof full.title === 'object' ? (full.title as any)?.en || '' : full.title;
      const titleBn = typeof full.title === 'object' ? (full.title as any)?.bn || '' : '';
      const contentEn = typeof full.content === 'object' ? (full.content as any)?.en || '' : full.content;
      const contentBn = typeof full.content === 'object' ? (full.content as any)?.bn || '' : '';

      const seoTitleEn = typeof full.seo?.seo_title === 'object' ? (full.seo?.seo_title as any)?.en || '' : full.seo?.seo_title || '';
      const seoTitleBn = typeof full.seo?.seo_title === 'object' ? (full.seo?.seo_title as any)?.bn || '' : '';
      const metaDescEn = typeof full.seo?.meta_description === 'object' ? (full.seo?.meta_description as any)?.en || '' : full.seo?.meta_description || '';
      const metaDescBn = typeof full.seo?.meta_description === 'object' ? (full.seo?.meta_description as any)?.bn || '' : '';

      setFormData({
        title_en: titleEn,
        title_bn: titleBn,
        slug: full.slug,
        content_en: contentEn,
        content_bn: contentBn,
        status: full.status,
        seo_title_en: seoTitleEn,
        seo_title_bn: seoTitleBn,
        meta_description_en: metaDescEn,
        meta_description_bn: metaDescBn,
        canonical_url: full.seo?.canonical_url || '',
        robots: full.seo?.robots || 'index, follow',
      });
      setIsEditorOpen(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error loading page detail',
        message: err.message || 'Could not fetch page details for editing.',
      });
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title_en: val };
      if (!editingPage) {
        // Auto-generate slug for new pages
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload: any = {
        title: { en: formData.title_en, bn: formData.title_bn },
        slug: formData.slug.toLowerCase().trim(),
        content: { en: formData.content_en, bn: formData.content_bn },
        status: formData.status,
        seo: {
          seo_title: { en: formData.seo_title_en, bn: formData.seo_title_bn },
          meta_description: { en: formData.meta_description_en, bn: formData.meta_description_bn },
          canonical_url: formData.canonical_url,
          robots: formData.robots,
        },
      };

      if (editingPage) {
        await cmsApi.updateAdminPage(editingPage.id, payload);
        showToast({
          type: 'success',
          title: 'Page Updated',
          message: `CMS page '${formData.slug}' updated successfully.`,
        });
      } else {
        await cmsApi.createAdminPage(payload);
        showToast({
          type: 'success',
          title: 'Page Created',
          message: `CMS page '${formData.slug}' created successfully.`,
        });
      }

      setIsEditorOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || err.message || 'Could not save page.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (page: Page) => {
    if (!window.confirm(`Are you certain you want to remove the page '${page.slug}'?`)) {
      return;
    }

    try {
      await cmsApi.deleteAdminPage(page.id);
      showToast({
        type: 'success',
        title: 'Page Deleted',
        message: `CMS page '${page.slug}' removed.`,
      });
      fetchPages();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete page.',
      });
    }
  };

  const getStatusBadgeVariant = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'gold';
      case 'archived':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-legal-gold/20 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Static Page Management</h2>
          <p className="text-sm text-neutral-400 font-sans">
            Author and publish static legal pages, disclaimers, policy briefs, and regulatory notices.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Create New Page
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search pages by slug or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <span className="text-xs text-neutral-500 font-sans">{pages.length} Pages Configured</span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-legal-gold flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-legal-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-sans tracking-wide">Loading Pages...</span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-800 rounded-lg">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-xs text-legal-gold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title (English)</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {pages.map((p) => {
                const title = typeof p.title === 'object' ? (p.title as any)?.en || p.slug : p.title;
                return (
                  <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{title}</td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">/{p.slug}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(p.status)} size="sm">
                        {p.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-400">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(p)}>
                        Edit
                      </Button>
                      <Button variant="ghost" className="text-status-error hover:bg-status-error/10" size="sm" onClick={() => handleDeletePage(p)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    No pages matching the query were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Page Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingPage ? `Edit Page: /${editingPage.slug}` : 'Create New Static Page'}
        size="xl"
      >
        <form onSubmit={handleSavePage} className="space-y-5">
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
                { value: 'draft', label: 'Draft (Admin Only)' },
                { value: 'published', label: 'Published (Publicly Visible)' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          {/* Bilingual Content Editor Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Page Body Content
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    contentLang === 'en'
                      ? 'bg-legal-gold text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('bn')}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    contentLang === 'bn'
                      ? 'bg-legal-gold text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
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
          <Card className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="text-sm font-semibold text-legal-gold uppercase tracking-wider">
              Search Engine Optimization (SEO)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="SEO Title (English)"
                value={formData.seo_title_en}
                onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
              />
              <Input
                label="SEO Title (Bangla)"
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
                placeholder="https://nijamuddin.com/..."
              />
              <Input
                label="Robots Directive"
                value={formData.robots}
                onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
              />
            </div>
          </Card>

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-800">
            <Button variant="secondary" onClick={() => setIsEditorOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              {editingPage ? 'Save Changes' : 'Create Page'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
