import React, { useState, useEffect, useCallback } from 'react';
import { videosApi } from '@/api/videos';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import {
  AdminVideoItem,
  VideoFormData,
  VideoPlatform,
  VideoStatus,
  VideoVisibility,
  VideoCategory,
} from '@/types/video';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Star,
  Video as VideoIcon,
  Play,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const VideosManager: React.FC = () => {
  const { showToast } = useToast();

  // List State
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AdminVideoItem | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState<AdminVideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<AdminVideoItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'publishing' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Form State
  const initialForm: VideoFormData = {
    title: { en: '', bn: '' },
    slug: '',
    platform: 'youtube',
    video_url: '',
    video_id: '',
    category_id: null,
    duration: '',
    description: { en: '', bn: '' },
    published_date: '',
    status: 'draft',
    visibility: 'public',
    is_featured: false,
    sort_order: 0,
    seo: {
      seo_title: { en: '', bn: '' },
      meta_description: { en: '', bn: '' },
      canonical_url: '',
    },
  };

  const [form, setForm] = useState<VideoFormData>(initialForm);

  // Auto-detect platform and extract ID from URL
  const handleUrlChange = (url: string) => {
    let detectedPlatform: VideoPlatform = form.platform;
    let extractedId = form.video_id || '';

    const clean = url.trim();

    if (/youtube\.com|youtu\.be/i.test(clean)) {
      detectedPlatform = 'youtube';
      const match = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i);
      if (match) {
        extractedId = match[1];
      }
    } else if (/vimeo\.com/i.test(clean)) {
      detectedPlatform = 'vimeo';
      const match = clean.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|))?(\d{6,12})/i);
      if (match) {
        extractedId = match[1];
      }
    }

    setForm((prev) => ({
      ...prev,
      video_url: url,
      platform: detectedPlatform,
      video_id: extractedId,
    }));
  };

  // Load Categories
  useEffect(() => {
    videosApi.getCategories().then((res) => {
      if (res.data) {
        setCategories(res.data);
      }
    }).catch(() => {});
  }, []);

  // Fetch Videos
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await videosApi.getAdminVideosList({
        search: search || undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
        featured: featuredFilter === 'featured' ? true : featuredFilter === 'standard' ? false : undefined,
        per_page: 50,
      });

      if (res.data) {
        setVideos(res.data);
      }
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load video library records' });
    } finally {
      setLoading(false);
    }
  }, [search, platformFilter, statusFilter, visibilityFilter, featuredFilter, showToast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingVideo(null);
    setForm(initialForm);
    setActiveTab('basic');
    setContentLang('en');
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (video: AdminVideoItem) => {
    setEditingVideo(video);
    setForm({
      title: {
        en: video.title?.en || '',
        bn: video.title?.bn || '',
      },
      slug: video.slug,
      platform: video.platform,
      video_url: video.video_url,
      video_id: video.video_id || '',
      category_id: video.category_id || null,
      duration: video.duration || '',
      description: {
        en: video.description?.en || '',
        bn: video.description?.bn || '',
      },
      published_date: video.published_date || '',
      status: video.status,
      visibility: video.visibility,
      is_featured: video.is_featured,
      sort_order: video.sort_order,
      seo: {
        seo_title: {
          en: video.seo?.seo_title?.en || '',
          bn: video.seo?.seo_title?.bn || '',
        },
        meta_description: {
          en: video.seo?.meta_description?.en || '',
          bn: video.seo?.meta_description?.bn || '',
        },
        canonical_url: video.seo?.canonical_url || '',
      },
    });
    setActiveTab('basic');
    setContentLang('en');
    setIsEditorOpen(true);
  };

  // Save Video
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.en.trim() || !form.title.bn.trim()) {
      showToast({ type: 'error', title: 'Validation', message: 'English and Bengali titles are required' });
      return;
    }
    if (!form.video_url.trim()) {
      showToast({ type: 'error', title: 'Validation', message: 'Video URL is required' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingVideo) {
        await videosApi.updateVideo(editingVideo.id, form);
        showToast({ type: 'success', title: 'Saved', message: 'Video updated successfully' });
      } else {
        await videosApi.createVideo(form);
        showToast({ type: 'success', title: 'Created', message: 'Video created successfully' });
      }
      setIsEditorOpen(false);
      fetchVideos();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save video record';
      showToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Video
  const handleDelete = async () => {
    if (!isDeletingVideo) return;
    try {
      await videosApi.deleteVideo(isDeletingVideo.id);
      showToast({ type: 'success', title: 'Deleted', message: 'Video deleted successfully' });
      setIsDeletingVideo(null);
      fetchVideos();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete video' });
    }
  };

  // Move Sort Order Up/Down
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const newVideos = [...videos];
    const [moved] = newVideos.splice(index, 1);
    newVideos.splice(targetIndex, 0, moved);

    setVideos(newVideos);

    const orderPayload = newVideos.map((v, idx) => ({
      id: v.id,
      sort_order: idx,
    }));

    try {
      await videosApi.reorderVideos(orderPayload);
      showToast({ type: 'success', title: 'Reordered', message: 'Sort order updated successfully' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update sort order' });
      fetchVideos();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono tracking-wider text-legal-gold uppercase">
              Phase 13 Module
            </span>
            <span className="text-xs text-neutral-600">•</span>
            <span className="text-xs font-mono text-neutral-400">Media Library & Broadcast</span>
          </div>
          <h2 className="text-2xl font-serif text-white tracking-wide mt-1">
            Video Archive Administration
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage television panel discussions, judicial roundtables, and academic video recordings.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          className="flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-neutral-900/60 p-4 rounded border border-neutral-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, ID..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-legal-gold"
          />
        </div>

        {/* Platform Filter */}
        <div>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            aria-label="Platform Filter"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="external">External Video</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Status Filter"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
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
            aria-label="Visibility Filter"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            aria-label="Featured Filter"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
          >
            <option value="all">Featured & Standard</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard Only</option>
          </select>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 font-mono text-xs">
            Loading video records...
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <VideoIcon className="w-12 h-12 mx-auto mb-3 opacity-20 text-legal-gold" />
            <p className="text-sm font-serif">No video records found matching the active criteria.</p>
            <p className="text-xs text-neutral-500 mt-1">Use the button above to add a new video entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Video & Title</th>
                  <th className="py-3 px-4">Platform & ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {videos.map((video, idx) => (
                  <tr key={video.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-neutral-500">
                      <div className="flex flex-col items-center space-y-1">
                        <button
                          type="button"
                          onClick={() => handleReorder(idx, 'up')}
                          disabled={idx === 0}
                          className="hover:text-legal-gold disabled:opacity-20 text-neutral-500"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span>{video.sort_order}</span>
                        <button
                          type="button"
                          onClick={() => handleReorder(idx, 'down')}
                          disabled={idx === videos.length - 1}
                          className="hover:text-legal-gold disabled:opacity-20 text-neutral-500"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-start space-x-3">
                        {/* Thumbnail / Placeholder */}
                        <div className="w-16 h-10 bg-neutral-950 rounded border border-neutral-800 overflow-hidden flex-shrink-0 relative group">
                          {video.thumbnail?.url ? (
                            <img
                              src={video.thumbnail.url}
                              alt={video.title?.en || 'Video thumbnail'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-700">
                              <Play className="w-4 h-4 fill-current" />
                            </div>
                          )}
                          {video.is_featured && (
                            <div className="absolute top-0.5 right-0.5 bg-legal-gold text-black p-0.5 rounded-bl">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-medium text-white line-clamp-1">
                            {video.title?.en || 'Untitled'}
                          </div>
                          <div className="text-[11px] text-neutral-500 line-clamp-1 font-serif">
                            {video.title?.bn || ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <Badge
                          variant={video.platform === 'youtube' ? 'gold' : 'outline'}
                          size="sm"
                        >
                          {video.platform}
                        </Badge>
                        {video.video_id && (
                          <span className="font-mono text-[10px] text-neutral-400">
                            {video.video_id}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-400">
                      {video.category?.name || '—'}
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {video.duration || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <Badge
                          variant={
                            video.status === 'published'
                              ? 'success'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {video.status}
                        </Badge>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {video.visibility}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {video.published_date || '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(video)}
                          className="p-1.5 hover:text-legal-gold text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                          title="Preview Video"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(video)}
                          className="p-1.5 hover:text-legal-gold text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                          title="Edit Video"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeletingVideo(video)}
                          className="p-1.5 hover:text-red-400 text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                          title="Delete Video"
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
      </div>

      {/* Editor Modal (Create / Edit) */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingVideo ? `Edit Video: ${editingVideo.title?.en || ''}` : 'Add Video Record'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-neutral-800 pb-2 text-xs">
            {(['basic', 'content', 'publishing', 'seo'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded transition-colors uppercase font-mono text-[11px] ${
                  activeTab === tab
                    ? 'bg-legal-gold text-black font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* BASIC TAB */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Language Switch for Title */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Video Title (Bilingual) *
                </label>
                <div className="flex space-x-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setContentLang('en')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      contentLang === 'en' ? 'bg-legal-gold text-black font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentLang('bn')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      contentLang === 'bn' ? 'bg-legal-gold text-black font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {contentLang === 'en' ? (
                <div>
                  <input
                    type="text"
                    value={form.title.en}
                    onChange={(e) => setForm((p) => ({ ...p, title: { en: e.target.value, bn: p.title.bn } }))}
                    placeholder="e.g. Constitutional Bench Arguments in Supreme Court"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold"
                    required
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={form.title.bn}
                    onChange={(e) => setForm((p) => ({ ...p, title: { en: p.title.en, bn: e.target.value } }))}
                    placeholder="যেমন: সুপ্রিম কোর্টের সাংবিধানিক বেঞ্চে যুক্তি উপস্থাপনা"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold font-serif"
                    required
                  />
                </div>
              )}

              {/* Slug */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="auto-generated-from-english-title"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-legal-gold"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Video URL (YouTube / Vimeo / External) *
                </label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold"
                  required
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Platform and Video ID are automatically detected from standard YouTube and Vimeo URLs.
                </p>
              </div>

              {/* Platform & Extracted ID Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950 p-3 rounded border border-neutral-800/80">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 uppercase mb-1">
                    Detected Platform
                  </label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value as VideoPlatform }))}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-200 focus:outline-none focus:border-legal-gold"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="external">External Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 uppercase mb-1">
                    Video ID
                  </label>
                  <input
                    type="text"
                    value={form.video_id || ''}
                    onChange={(e) => setForm((p) => ({ ...p, video_id: e.target.value }))}
                    placeholder="e.g. dQw4w9WgXcQ or 123456789"
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-legal-gold"
                  />
                </div>
              </div>

              {/* Category, Duration & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={form.category_id || ''}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {typeof c.name === 'string' ? c.name : (c.name as any)?.en || 'Category'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Duration (e.g. 35:20)
                  </label>
                  <input
                    type="text"
                    value={form.duration || ''}
                    onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                    placeholder="35:20"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-legal-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Published Date
                  </label>
                  <input
                    type="date"
                    value={form.published_date || ''}
                    onChange={(e) => setForm((p) => ({ ...p, published_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Description / Synopsis (Bilingual)
                </label>
                <div className="flex space-x-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setContentLang('en')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      contentLang === 'en' ? 'bg-legal-gold text-black font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentLang('bn')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      contentLang === 'bn' ? 'bg-legal-gold text-black font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {contentLang === 'en' ? (
                <textarea
                  rows={6}
                  value={form.description?.en || ''}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    description: { en: e.target.value, bn: p.description?.bn || '' },
                  }))}
                  placeholder="Detailed synopsis of the lecture, legal dialogue, or judicial commentary..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold"
                />
              ) : (
                <textarea
                  rows={6}
                  value={form.description?.bn || ''}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    description: { en: p.description?.en || '', bn: e.target.value },
                  }))}
                  placeholder="বক্তৃতা, আইনি সংলাপ বা বিচার বিভাগীয় মন্তব্যের বিশদ বিবরণ..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold font-serif"
                />
              )}
            </div>
          )}

          {/* PUBLISHING TAB */}
          {activeTab === 'publishing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as VideoStatus }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
                  >
                    <option value="draft">Draft (Private, Noindex)</option>
                    <option value="published">Published (Public)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Visibility
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as VideoVisibility }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-legal-gold"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private (Restricted)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="rounded border-neutral-800 text-legal-gold focus:ring-legal-gold bg-neutral-950"
                  />
                  <label htmlFor="is_featured" className="text-xs text-neutral-300 cursor-pointer">
                    Feature this video on homepage and top of library
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-legal-gold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Meta Title (EN)
                </label>
                <input
                  type="text"
                  value={form.seo?.seo_title?.en || ''}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    seo: {
                      ...p.seo,
                      seo_title: {
                        en: e.target.value,
                        bn: p.seo?.seo_title?.bn || '',
                      },
                    },
                  }))}
                  placeholder="Custom browser page title"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Meta Description (EN)
                </label>
                <textarea
                  rows={3}
                  value={form.seo?.meta_description?.en || ''}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    seo: {
                      ...p.seo,
                      meta_description: {
                        en: e.target.value,
                        bn: p.seo?.meta_description?.bn || '',
                      },
                    },
                  }))}
                  placeholder="Search engine synopsis..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-legal-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={form.seo?.canonical_url || ''}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    seo: { ...p.seo, canonical_url: e.target.value },
                  }))}
                  placeholder="https://nijamuddin.com/videos/..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-legal-gold"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditorOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingVideo ? 'Update Video' : 'Create Video'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title={`Video Preview: ${previewVideo?.title?.en || ''}`}
        size="lg"
      >
        {previewVideo && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-300 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Preview Mode: Search indexing is blocked (X-Robots-Tag: noindex).</span>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded overflow-hidden border border-neutral-800">
              {previewVideo.embed_url ? (
                <iframe
                  src={previewVideo.embed_url}
                  title={previewVideo.title?.en || 'Video Player'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 space-y-2 p-6 text-center">
                  <Play className="w-12 h-12 stroke-1 text-neutral-600" />
                  <p className="text-xs">External broadcast source requires direct viewing link.</p>
                  <a
                    href={previewVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-legal-gold underline inline-flex items-center space-x-1"
                  >
                    <span>Open Watch Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-serif text-white font-semibold">
                {previewVideo.title?.en}
              </h3>
              <p className="text-xs text-neutral-400 font-serif mt-0.5">
                {previewVideo.title?.bn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
              <Badge variant="outline">{previewVideo.platform}</Badge>
              {previewVideo.duration && <span>Duration: {previewVideo.duration}</span>}
              {previewVideo.published_date && <span>Date: {previewVideo.published_date}</span>}
              <span>Status: {previewVideo.status}</span>
            </div>

            {previewVideo.description?.en && (
              <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-neutral-800">
                {previewVideo.description.en}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeletingVideo}
        onClose={() => setIsDeletingVideo(null)}
        title="Confirm Video Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Are you sure you want to delete video{' '}
            <strong className="text-white">"{isDeletingVideo?.title?.en}"</strong>?
            This will soft-delete the record and remove it from public video lists.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
            <Button variant="secondary" onClick={() => setIsDeletingVideo(null)}>
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/40"
              onClick={handleDelete}
            >
              Delete Video
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
