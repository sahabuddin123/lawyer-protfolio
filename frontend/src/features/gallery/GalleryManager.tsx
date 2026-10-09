import React, { useState, useEffect, useCallback } from 'react';
import { galleryApi } from '@/api/gallery';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import {
  AdminGalleryAlbumItem,
  AdminGalleryImageItem,
  GalleryAlbumFormData,
  AlbumStatus,
  AlbumVisibility,
  GalleryCategory,
} from '@/types/gallery';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Upload,
  Calendar,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const GalleryManager: React.FC = () => {
  const { showToast } = useToast();

  // List State
  const [albums, setAlbums] = useState<AdminGalleryAlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AdminGalleryAlbumItem | null>(null);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState<AdminGalleryAlbumItem | null>(null);
  const [previewAlbum, setPreviewAlbum] = useState<AdminGalleryAlbumItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'images' | 'publishing' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Image Management State inside Editor
  const [albumImages, setAlbumImages] = useState<AdminGalleryImageItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingImage, setEditingImage] = useState<AdminGalleryImageItem | null>(null);

  // Form State
  const initialForm: GalleryAlbumFormData = {
    title: { en: '', bn: '' },
    slug: '',
    description: { en: '', bn: '' },
    category_id: null,
    cover_image_id: null,
    event_date: '',
    status: 'draft',
    visibility: 'public',
    is_featured: false,
    sort_order: 0,
    seo: {
      meta_title: { en: '', bn: '' },
      meta_description: { en: '', bn: '' },
      canonical_url: '',
    },
  };

  const [form, setForm] = useState<GalleryAlbumFormData>(initialForm);

  // Fetch albums list
  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (visibilityFilter !== 'all') params.visibility = visibilityFilter;
      if (featuredFilter === 'featured') params.featured = 1;
      if (featuredFilter === 'standard') params.featured = 0;

      const response = await galleryApi.getAdminAlbumsList(params);
      if (response && response.data) {
        setAlbums(response.data);

        // Extract unique categories for filter
        const cats: GalleryCategory[] = [];
        response.data.forEach((item) => {
          if (item.category && !cats.some((c) => c.id === item.category.id)) {
            cats.push({
              id: item.category.id,
              name: typeof item.category.name === 'object' ? item.category.name.en || 'General' : item.category.name,
              slug: item.category.slug,
            });
          }
        });
        setCategories(cats);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Loading Albums',
        message: err?.response?.data?.message || 'Could not load gallery albums.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, visibilityFilter, featuredFilter, showToast]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAlbum(null);
    setAlbumImages([]);
    setForm(initialForm);
    setActiveTab('basic');
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (album: AdminGalleryAlbumItem) => {
    try {
      const response = await galleryApi.getAdminAlbum(album.id);
      const fullAlbum = response.data;
      setEditingAlbum(fullAlbum);
      setAlbumImages(fullAlbum.images || []);

      setForm({
        title: {
          en: fullAlbum.title?.en || '',
          bn: fullAlbum.title?.bn || '',
        },
        slug: fullAlbum.slug || '',
        description: {
          en: fullAlbum.description?.en || '',
          bn: fullAlbum.description?.bn || '',
        },
        category_id: fullAlbum.category_id || null,
        cover_image_id: fullAlbum.cover_image_id || null,
        event_date: fullAlbum.event_date || '',
        status: fullAlbum.status || 'draft',
        visibility: fullAlbum.visibility || 'public',
        is_featured: Boolean(fullAlbum.is_featured || fullAlbum.featured),
        sort_order: fullAlbum.sort_order || 0,
        seo: {
          meta_title: {
            en: fullAlbum.seo?.seo_title?.en || fullAlbum.seo?.meta_title?.en || '',
            bn: fullAlbum.seo?.seo_title?.bn || fullAlbum.seo?.meta_title?.bn || '',
          },
          meta_description: {
            en: fullAlbum.seo?.meta_description?.en || '',
            bn: fullAlbum.seo?.meta_description?.bn || '',
          },
          canonical_url: fullAlbum.seo?.canonical_url || '',
        },
      });

      setActiveTab('basic');
      setIsEditorOpen(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Opening Album',
        message: err?.response?.data?.message || 'Could not load album details.',
      });
    }
  };

  // Save Album (Create or Update)
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.en.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'English title is required.',
      });
      return;
    }

    try {
      setIsSaving(true);
      if (editingAlbum) {
        await galleryApi.updateAlbum(editingAlbum.id, form);
        showToast({
          type: 'success',
          title: 'Album Updated',
          message: 'Gallery album updated successfully.',
        });
      } else {
        const res = await galleryApi.createAlbum(form);
        showToast({
          type: 'success',
          title: 'Album Created',
          message: 'Gallery album created successfully.',
        });
        if (res.data) {
          setEditingAlbum(res.data);
          setActiveTab('images');
        }
      }
      fetchAlbums();
      if (editingAlbum) {
        setIsEditorOpen(false);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.response?.data?.message || 'Failed to save gallery album.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle direct file upload to album
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAlbum) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visibility', 'public');

      const res = await galleryApi.uploadImage(editingAlbum.id, formData);
      if (res.data) {
        setAlbumImages((prev) => [...prev, res.data]);
        showToast({
          type: 'success',
          title: 'Image Uploaded',
          message: 'Image added to album successfully.',
        });
        // Refresh album details to sync image count and cover
        const updated = await galleryApi.getAdminAlbum(editingAlbum.id);
        setEditingAlbum(updated.data);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: err?.response?.data?.message || 'Failed to upload image.',
      });
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Set Cover Image
  const handleSetCover = async (imageId: number) => {
    if (!editingAlbum) return;
    try {
      const res = await galleryApi.setCoverImage(editingAlbum.id, imageId);
      setEditingAlbum(res.data);
      showToast({
        type: 'success',
        title: 'Cover Updated',
        message: 'Album cover image updated successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Setting Cover',
        message: err?.response?.data?.message || 'Could not set cover image.',
      });
    }
  };

  // Detach Image
  const handleDetachImage = async (imageId: number) => {
    if (!editingAlbum) return;
    try {
      await galleryApi.detachImage(editingAlbum.id, imageId);
      setAlbumImages((prev) => prev.filter((img) => img.id !== imageId));
      showToast({
        type: 'success',
        title: 'Image Removed',
        message: 'Image removed from album.',
      });
      const updated = await galleryApi.getAdminAlbum(editingAlbum.id);
      setEditingAlbum(updated.data);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Removing Image',
        message: err?.response?.data?.message || 'Could not remove image.',
      });
    }
  };

  // Reorder Images (Move Up / Move Down)
  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    if (!editingAlbum) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= albumImages.length) return;

    const newImages = [...albumImages];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    const reorderPayload = newImages.map((img, i) => ({
      id: img.id,
      sort_order: i + 1,
    }));

    setAlbumImages(newImages);

    try {
      await galleryApi.reorderImages(editingAlbum.id, reorderPayload);
      showToast({
        type: 'success',
        title: 'Order Saved',
        message: 'Images reordered successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reorder Failed',
        message: 'Could not save new image ordering.',
      });
      fetchAlbums();
    }
  };

  // Save Image Caption / Alt Text Edit
  const handleSaveImageMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum || !editingImage) return;

    try {
      const res = await galleryApi.updateImage(editingAlbum.id, editingImage.id, {
        caption: editingImage.caption || undefined,
        alt_text: editingImage.alt_text || undefined,
        visibility: editingImage.visibility,
        is_featured: editingImage.is_featured,
      });

      setAlbumImages((prev) =>
        prev.map((img) => (img.id === editingImage.id ? res.data : img))
      );
      setEditingImage(null);
      showToast({
        type: 'success',
        title: 'Image Updated',
        message: 'Image metadata updated successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.response?.data?.message || 'Could not update image metadata.',
      });
    }
  };

  // Delete Album
  const handleDeleteAlbum = async () => {
    if (!isDeletingAlbum) return;
    try {
      await galleryApi.deleteAlbum(isDeletingAlbum.id);
      showToast({
        type: 'success',
        title: 'Album Deleted',
        message: `Gallery album "${isDeletingAlbum.slug}" was deleted.`,
      });
      setIsDeletingAlbum(null);
      fetchAlbums();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete album.',
      });
    }
  };

  // Open Preview Modal
  const handleOpenPreview = async (album: AdminGalleryAlbumItem) => {
    try {
      const res = await galleryApi.previewAlbum(album.id);
      setPreviewAlbum(res.data);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Preview Failed',
        message: err?.response?.data?.message || 'Could not load album preview.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            Gallery & Photo Albums Archive
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage photographic records, judicial conferences, chamber convocations, and event galleries.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Album
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search albums by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Visibilities</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Albums</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard Only</option>
          </select>
        </div>
      </div>

      {/* Albums Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading gallery albums...</div>
        ) : albums.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No gallery albums found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-xs uppercase font-medium text-slate-400">
                <tr>
                  <th className="py-3 px-4">Cover</th>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Status / Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {albums.map((album) => {
                  const titleEn = album.title?.en || 'Untitled';
                  const titleBn = album.title?.bn;
                  const coverUrl = album.cover_image_url || album.cover_image?.url;

                  return (
                    <tr key={album.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-16 h-12 bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center relative">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={titleEn}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-600" />
                          )}
                          {album.is_featured && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-0.5 rounded-full">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-100 truncate">{titleEn}</div>
                        {titleBn && <div className="text-xs text-slate-400 truncate">{titleBn}</div>}
                        <div className="text-xs text-slate-500 font-mono mt-0.5">/{album.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        {album.category ? (
                          <Badge variant="neutral">
                            {typeof album.category.name === 'object'
                              ? album.category.name.en || 'General'
                              : album.category.name}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {album.image_count ?? 0} photos
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {album.event_date ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {album.event_date}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              album.status === 'published'
                                ? 'success'
                                : album.status === 'draft'
                                ? 'neutral'
                                : 'outline'
                            }
                          >
                            {album.status}
                          </Badge>
                          <Badge
                            variant={album.visibility === 'public' ? 'gold' : 'neutral'}
                            className="text-[10px]"
                          >
                            {album.visibility}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPreview(album)}
                            title="Preview Draft"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(album)}
                            title="Edit Album"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeletingAlbum(album)}
                            title="Delete Album"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Create / Edit Album Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingAlbum ? `Edit Album: ${editingAlbum.title?.en || editingAlbum.slug}` : 'Create New Gallery Album'}
        size="xl"
      >
        <form onSubmit={handleSaveAlbum} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Content
            </button>
            {editingAlbum && (
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'images'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Photos ({albumImages.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('publishing')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'publishing'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Publishing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'seo'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              SEO
            </button>
          </div>

          {/* TAB 1: General */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Album Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title.en}
                    onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })}
                    placeholder="e.g. Supreme Court Bar Centenary Celebration"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Album Title (Bengali)
                  </label>
                  <input
                    type="text"
                    value={form.title.bn}
                    onChange={(e) => setForm({ ...form, title: { ...form.title, bn: e.target.value } })}
                    placeholder="বাংলা শিরোনাম..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                    placeholder="sc-bar-centenary"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category_id || ''}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={form.event_date || ''}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Content (Description) */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    contentLang === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  English Description
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('bn')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    contentLang === 'bn' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Bengali Description
                </button>
              </div>

              {contentLang === 'en' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Description (EN)
                  </label>
                  <textarea
                    rows={6}
                    value={form.description.en}
                    onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })}
                    placeholder="Context and details regarding the event, delegates, and proceedings..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Description (BN)
                  </label>
                  <textarea
                    rows={6}
                    value={form.description.bn}
                    onChange={(e) => setForm({ ...form, description: { ...form.description, bn: e.target.value } })}
                    placeholder="অনুষ্ঠান বা সমাবেশের বিবরণ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Images Management (Available when album is saved) */}
          {activeTab === 'images' && editingAlbum && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-sm font-semibold text-slate-200">Album Photographs</span>
                  <span className="text-xs text-slate-400 ml-2">({albumImages.length} attached)</span>
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={isUploadingImage}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {albumImages.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-lg border border-dashed border-slate-800">
                  No images attached yet. Click Upload Image above to add photographs.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                  {albumImages.map((img, index) => {
                    const isCover = editingAlbum.cover_image_id === img.media_id;
                    const caption = img.caption?.en || 'No caption';

                    return (
                      <div
                        key={img.id}
                        className={`bg-slate-950 border rounded-lg overflow-hidden p-2 relative group flex flex-col justify-between ${
                          isCover ? 'border-amber-500/80 shadow-md shadow-amber-500/10' : 'border-slate-800'
                        }`}
                      >
                        <div className="relative aspect-video rounded overflow-hidden bg-slate-900 mb-2">
                          <img src={img.url} alt={caption} className="w-full h-full object-cover" />
                          {isCover && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Cover
                            </span>
                          )}
                          <span className="absolute bottom-1 right-1 bg-slate-950/80 text-slate-300 text-[10px] px-1 py-0.5 rounded font-mono">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 truncate mb-2">{caption}</div>

                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-900">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveImage(index, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30"
                              title="Move Left/Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === albumImages.length - 1}
                              onClick={() => handleMoveImage(index, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30"
                              title="Move Right/Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(img.id)}
                                className="text-[11px] text-amber-500 hover:underline px-1"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingImage(img)}
                              className="p-1 text-slate-400 hover:text-slate-100"
                              title="Edit Caption / Alt"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDetachImage(img.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Remove from album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Publishing */}
          {activeTab === 'publishing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Editorial Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as AlbumStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="draft">Draft (Private, not publicly visible)</option>
                    <option value="published">Published (Visible publicly)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Visibility *
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value as AlbumVisibility })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private (Restricted)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-slate-200">
                    Feature this album on public gallery highlight
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Meta Title (EN)
                  </label>
                  <input
                    type="text"
                    value={form.seo?.meta_title?.en || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        seo: {
                          ...form.seo!,
                          meta_title: { ...form.seo!.meta_title, en: e.target.value },
                        },
                      })
                    }
                    placeholder="Meta title in English"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Meta Title (BN)
                  </label>
                  <input
                    type="text"
                    value={form.seo?.meta_title?.bn || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        seo: {
                          ...form.seo!,
                          meta_title: { ...form.seo!.meta_title, bn: e.target.value },
                        },
                      })
                    }
                    placeholder="মেটা শিরোনাম"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Meta Description (EN)
                </label>
                <textarea
                  rows={3}
                  value={form.seo?.meta_description?.en || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seo: {
                        ...form.seo!,
                        meta_description: { ...form.seo!.meta_description, en: e.target.value },
                      },
                    })
                  }
                  placeholder="Meta description for search engines"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={form.seo?.canonical_url || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seo: {
                        ...form.seo!,
                        canonical_url: e.target.value,
                      },
                    })
                  }
                  placeholder="https://nijamuddin.com/gallery/your-album"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingAlbum ? 'Update Album' : 'Create Album'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mini Modal for Editing Single Image Metadata */}
      {editingImage && (
        <Modal
          isOpen={true}
          onClose={() => setEditingImage(null)}
          title="Edit Image Caption & Alt Text"
          size="md"
        >
          <form onSubmit={handleSaveImageMeta} className="space-y-4">
            <div className="w-full aspect-video rounded overflow-hidden bg-slate-950 mb-3 border border-slate-800">
              <img src={editingImage.url} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Caption (English)</label>
              <input
                type="text"
                value={editingImage.caption?.en || ''}
                onChange={(e) =>
                  setEditingImage({
                    ...editingImage,
                    caption: { ...editingImage.caption, en: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Caption (Bengali)</label>
              <input
                type="text"
                value={editingImage.caption?.bn || ''}
                onChange={(e) =>
                  setEditingImage({
                    ...editingImage,
                    caption: { ...editingImage.caption, bn: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Alt Text (English) *</label>
              <input
                type="text"
                value={editingImage.alt_text?.en || ''}
                onChange={(e) =>
                  setEditingImage({
                    ...editingImage,
                    alt_text: { ...editingImage.alt_text, en: e.target.value },
                  })
                }
                placeholder="Descriptive text for accessibility"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Visibility</label>
                <select
                  value={editingImage.visibility}
                  onChange={(e) =>
                    setEditingImage({
                      ...editingImage,
                      visibility: e.target.value as AlbumVisibility,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="img_is_featured"
                  checked={editingImage.is_featured}
                  onChange={(e) => setEditingImage({ ...editingImage, is_featured: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500"
                />
                <label htmlFor="img_is_featured" className="text-xs text-slate-300">
                  Featured photo
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingAlbum && (
        <Modal
          isOpen={true}
          onClose={() => setIsDeletingAlbum(null)}
          title="Confirm Album Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete the gallery album{' '}
              <strong className="text-amber-400">"{isDeletingAlbum.title?.en}"</strong>?
            </p>
            <p className="text-xs text-slate-500">
              This action removes the album and its relationships. The underlying image files in the Media Library will remain safely intact.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => setIsDeletingAlbum(null)}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-red-600 hover:bg-red-500 text-white" onClick={handleDeleteAlbum}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewAlbum && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewAlbum(null)}
          title={`Draft Preview: ${previewAlbum.title?.en || previewAlbum.slug}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs text-amber-500 font-mono">
              <CheckCircle className="w-3.5 h-3.5" />
              Served with X-Robots-Tag: noindex, nofollow, noarchive (Safe preview)
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-lg font-serif font-bold text-slate-100">{previewAlbum.title?.en}</h3>
              {previewAlbum.description?.en && (
                <p className="text-sm text-slate-400">{previewAlbum.description.en}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {previewAlbum.images?.map((img) => (
                  <div key={img.id} className="aspect-video bg-slate-900 rounded overflow-hidden">
                    <img src={img.url} alt={img.caption?.en || 'Photo'} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setPreviewAlbum(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
