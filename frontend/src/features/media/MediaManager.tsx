import React, { useState, useEffect, useCallback } from 'react';
import { mediaApi } from '@/api/media';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { MediaPress, MediaAppearance, ContentStatus, VisibilityTier } from '@/types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  ExternalLink,
  Star,
  Newspaper,
  Tv,
} from 'lucide-react';

const PRESS_TYPES = [
  { value: 'newspaper', label: 'Newspaper Article' },
  { value: 'magazine', label: 'Magazine Feature' },
  { value: 'online_news', label: 'Online News Portal' },
  { value: 'press_release', label: 'Press Release' },
  { value: 'editorial', label: 'Editorial / Column' },
  { value: 'other', label: 'Other Print Media' },
];

const APPEARANCE_TYPES = [
  { value: 'tv', label: 'Television Broadcast' },
  { value: 'talk_show', label: 'TV Talk Show' },
  { value: 'roundtable', label: 'Panel Discussion / Roundtable' },
  { value: 'interview', label: 'Broadcast Interview' },
  { value: 'radio', label: 'Radio Broadcast' },
  { value: 'digital_broadcast', label: 'Digital / Webcast' },
  { value: 'other', label: 'Other Electronic Media' },
];

export const MediaManager: React.FC = () => {
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<'press' | 'appearances'>('press');

  // Press State
  const [pressList, setPressList] = useState<MediaPress[]>([]);
  const [pressLoading, setPressLoading] = useState(true);
  const [pressSearch, setPressSearch] = useState('');
  const [pressStatusFilter, setPressStatusFilter] = useState<string>('all');
  const [pressTypeFilter, setPressTypeFilter] = useState<string>('all');

  // Appearance State
  const [appearanceList, setAppearanceList] = useState<MediaAppearance[]>([]);
  const [appearanceLoading, setAppearanceLoading] = useState(true);
  const [appearanceSearch, setAppearanceSearch] = useState('');
  const [appearanceStatusFilter, setAppearanceStatusFilter] = useState<string>('all');
  const [appearanceTypeFilter, setAppearanceTypeFilter] = useState<string>('all');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPress, setEditingPress] = useState<MediaPress | null>(null);
  const [editingAppearance, setEditingAppearance] = useState<MediaAppearance | null>(null);
  const [isDeletingPress, setIsDeletingPress] = useState<MediaPress | null>(null);
  const [isDeletingAppearance, setIsDeletingAppearance] = useState<MediaAppearance | null>(null);
  const [previewPress, setPreviewPress] = useState<MediaPress | null>(null);
  const [previewAppearance, setPreviewAppearance] = useState<MediaAppearance | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'links' | 'assets' | 'publishing' | 'seo'>('basic');
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Press Form State
  const [pressForm, setPressForm] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    media_type: 'newspaper',
    media_name_en: '',
    media_name_bn: '',
    published_date: '',
    article_url: '',
    category_id: '' as string | number,
    tags: [] as number[],
    featured_image_id: '' as string | number,
    document_media_id: '' as string | number,
    description_en: '',
    description_bn: '',
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

  // Appearance Form State
  const [appearanceForm, setAppearanceForm] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    media_type: 'tv',
    channel_en: '',
    channel_bn: '',
    program_en: '',
    program_bn: '',
    broadcast_date: '',
    video_url: '',
    category_id: '' as string | number,
    tags: [] as number[],
    thumbnail_id: '' as string | number,
    document_media_id: '' as string | number,
    description_en: '',
    description_bn: '',
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

  // Fetch Press List
  const fetchPress = useCallback(async () => {
    try {
      setPressLoading(true);
      const res = await mediaApi.getAdminPressList({
        search: pressSearch || undefined,
        type: pressTypeFilter !== 'all' ? pressTypeFilter : undefined,
        status: pressStatusFilter !== 'all' ? (pressStatusFilter as ContentStatus) : undefined,
        per_page: 50,
      });
      setPressList(res.data || []);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to fetch press media records' });
    } finally {
      setPressLoading(false);
    }
  }, [pressSearch, pressTypeFilter, pressStatusFilter, showToast]);

  // Fetch Appearances List
  const fetchAppearances = useCallback(async () => {
    try {
      setAppearanceLoading(true);
      const res = await mediaApi.getAdminAppearancesList({
        search: appearanceSearch || undefined,
        type: appearanceTypeFilter !== 'all' ? appearanceTypeFilter : undefined,
        status: appearanceStatusFilter !== 'all' ? (appearanceStatusFilter as ContentStatus) : undefined,
        per_page: 50,
      });
      setAppearanceList(res.data || []);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to fetch electronic media appearances' });
    } finally {
      setAppearanceLoading(false);
    }
  }, [appearanceSearch, appearanceTypeFilter, appearanceStatusFilter, showToast]);

  useEffect(() => {
    if (activeSection === 'press') {
      fetchPress();
    } else {
      fetchAppearances();
    }
  }, [activeSection, fetchPress, fetchAppearances]);

  // Open Press Modal
  const handleOpenPressEditor = (item?: MediaPress) => {
    setEditingAppearance(null);
    setActiveTab('basic');
    setContentLang('en');

    if (item) {
      setEditingPress(item);
      const title = typeof item.title === 'object' ? item.title : { en: item.title, bn: '' };
      const mediaName = typeof item.media_name === 'object' ? item.media_name : { en: item.media_name || '', bn: '' };
      const desc = typeof item.description === 'object' && item.description ? item.description : { en: item.description || '', bn: '' };
      const seo = item.seo || item.seo_meta;
      const seoTitle = seo?.seo_title && typeof seo.seo_title === 'object' ? seo.seo_title : { en: '', bn: '' };
      const metaDesc = seo?.meta_description && typeof seo.meta_description === 'object' ? seo.meta_description : { en: '', bn: '' };

      setPressForm({
        title_en: title.en || '',
        title_bn: title.bn || '',
        slug: item.slug || '',
        media_type: item.media_type || 'newspaper',
        media_name_en: mediaName.en || '',
        media_name_bn: mediaName.bn || '',
        published_date: item.published_date || '',
        article_url: item.article_url || '',
        category_id: item.category_id || '',
        tags: item.tags?.map((t: any) => t.id) || [],
        featured_image_id: item.featured_image_id || (item.featured_image?.id ?? ''),
        document_media_id: item.document_media_id || (item.document_media?.id ?? ''),
        description_en: desc.en || '',
        description_bn: desc.bn || '',
        visibility: item.visibility || 'public',
        status: item.status || 'draft',
        is_featured: !!item.is_featured,
        sort_order: item.sort_order || 0,
        seo_title_en: seoTitle.en || '',
        seo_title_bn: seoTitle.bn || '',
        meta_desc_en: metaDesc.en || '',
        meta_desc_bn: metaDesc.bn || '',
        canonical_url: seo?.canonical_url || '',
      });
    } else {
      setEditingPress(null);
      setPressForm({
        title_en: '',
        title_bn: '',
        slug: '',
        media_type: 'newspaper',
        media_name_en: '',
        media_name_bn: '',
        published_date: new Date().toISOString().split('T')[0],
        article_url: '',
        category_id: '',
        tags: [],
        featured_image_id: '',
        document_media_id: '',
        description_en: '',
        description_bn: '',
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
    }
    setIsEditorOpen(true);
  };

  // Open Appearance Modal
  const handleOpenAppearanceEditor = (item?: MediaAppearance) => {
    setEditingPress(null);
    setActiveTab('basic');
    setContentLang('en');

    if (item) {
      setEditingAppearance(item);
      const title = typeof item.title === 'object' ? item.title : { en: item.title, bn: '' };
      const channel = typeof item.channel === 'object' ? item.channel : { en: item.channel || '', bn: '' };
      const program = typeof item.program === 'object' ? item.program : { en: item.program || '', bn: '' };
      const desc = typeof item.description === 'object' && item.description ? item.description : { en: item.description || '', bn: '' };
      const seo = item.seo || item.seo_meta;
      const seoTitle = seo?.seo_title && typeof seo.seo_title === 'object' ? seo.seo_title : { en: '', bn: '' };
      const metaDesc = seo?.meta_description && typeof seo.meta_description === 'object' ? seo.meta_description : { en: '', bn: '' };

      setAppearanceForm({
        title_en: title.en || '',
        title_bn: title.bn || '',
        slug: item.slug || '',
        media_type: item.media_type || 'tv',
        channel_en: channel.en || '',
        channel_bn: channel.bn || '',
        program_en: program.en || '',
        program_bn: program.bn || '',
        broadcast_date: item.broadcast_date || '',
        video_url: item.video_url || '',
        category_id: item.category_id || '',
        tags: item.tags?.map((t: any) => t.id) || [],
        thumbnail_id: item.thumbnail_id || (item.thumbnail?.id ?? ''),
        document_media_id: item.document_media_id || (item.document_media?.id ?? ''),
        description_en: desc.en || '',
        description_bn: desc.bn || '',
        visibility: item.visibility || 'public',
        status: item.status || 'draft',
        is_featured: !!item.is_featured,
        sort_order: item.sort_order || 0,
        seo_title_en: seoTitle.en || '',
        seo_title_bn: seoTitle.bn || '',
        meta_desc_en: metaDesc.en || '',
        meta_desc_bn: metaDesc.bn || '',
        canonical_url: seo?.canonical_url || '',
      });
    } else {
      setEditingAppearance(null);
      setAppearanceForm({
        title_en: '',
        title_bn: '',
        slug: '',
        media_type: 'tv',
        channel_en: '',
        channel_bn: '',
        program_en: '',
        program_bn: '',
        broadcast_date: new Date().toISOString().split('T')[0],
        video_url: '',
        category_id: '',
        tags: [],
        thumbnail_id: '',
        document_media_id: '',
        description_en: '',
        description_bn: '',
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
    }
    setIsEditorOpen(true);
  };

  // Helper for generating slug
  const handleGenerateSlug = (titleEn: string, setForm: (fn: any) => void) => {
    const slug = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm((prev: any) => ({ ...prev, slug }));
  };

  // Save Press
  const handleSavePress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pressForm.title_en || !pressForm.slug || !pressForm.media_name_en) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Please fill in Title, Slug, and Media Source Name.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: { en: pressForm.title_en, bn: pressForm.title_bn || undefined },
        slug: pressForm.slug,
        media_type: pressForm.media_type,
        media_name: { en: pressForm.media_name_en, bn: pressForm.media_name_bn || undefined },
        published_date: pressForm.published_date || null,
        article_url: pressForm.article_url || null,
        category_id: pressForm.category_id ? Number(pressForm.category_id) : null,
        tags: pressForm.tags,
        featured_image_id: pressForm.featured_image_id ? Number(pressForm.featured_image_id) : null,
        document_media_id: pressForm.document_media_id ? Number(pressForm.document_media_id) : null,
        description: (pressForm.description_en || pressForm.description_bn)
          ? { en: pressForm.description_en, bn: pressForm.description_bn || undefined }
          : null,
        visibility: pressForm.visibility,
        status: pressForm.status,
        is_featured: pressForm.is_featured,
        sort_order: Number(pressForm.sort_order),
      };

      if (pressForm.seo_title_en || pressForm.meta_desc_en || pressForm.canonical_url) {
        payload.seo = {
          seo_title: { en: pressForm.seo_title_en, bn: pressForm.seo_title_bn || undefined },
          meta_description: { en: pressForm.meta_desc_en, bn: pressForm.meta_desc_bn || undefined },
          canonical_url: pressForm.canonical_url || undefined,
        };
      }

      if (editingPress) {
        await mediaApi.updatePress(editingPress.id, payload);
        showToast({ type: 'success', title: 'Updated', message: 'Press article updated successfully.' });
      } else {
        await mediaApi.createPress(payload);
        showToast({ type: 'success', title: 'Created', message: 'Press article created successfully.' });
      }

      setIsEditorOpen(false);
      fetchPress();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save press article.';
      showToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Save Appearance
  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appearanceForm.title_en || !appearanceForm.slug || !appearanceForm.channel_en || !appearanceForm.program_en) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Please fill in Title, Slug, Channel, and Program Name.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: { en: appearanceForm.title_en, bn: appearanceForm.title_bn || undefined },
        slug: appearanceForm.slug,
        media_type: appearanceForm.media_type,
        channel: { en: appearanceForm.channel_en, bn: appearanceForm.channel_bn || undefined },
        program: { en: appearanceForm.program_en, bn: appearanceForm.program_bn || undefined },
        broadcast_date: appearanceForm.broadcast_date || null,
        video_url: appearanceForm.video_url || null,
        thumbnail_id: appearanceForm.thumbnail_id ? Number(appearanceForm.thumbnail_id) : null,
        document_media_id: appearanceForm.document_media_id ? Number(appearanceForm.document_media_id) : null,
        category_id: appearanceForm.category_id ? Number(appearanceForm.category_id) : null,
        tags: appearanceForm.tags,
        description: (appearanceForm.description_en || appearanceForm.description_bn)
          ? { en: appearanceForm.description_en, bn: appearanceForm.description_bn || undefined }
          : null,
        visibility: appearanceForm.visibility,
        status: appearanceForm.status,
        is_featured: appearanceForm.is_featured,
        sort_order: Number(appearanceForm.sort_order),
      };

      if (appearanceForm.seo_title_en || appearanceForm.meta_desc_en || appearanceForm.canonical_url) {
        payload.seo = {
          seo_title: { en: appearanceForm.seo_title_en, bn: appearanceForm.seo_title_bn || undefined },
          meta_description: { en: appearanceForm.meta_desc_en, bn: appearanceForm.meta_desc_bn || undefined },
          canonical_url: appearanceForm.canonical_url || undefined,
        };
      }

      if (editingAppearance) {
        await mediaApi.updateAppearance(editingAppearance.id, payload);
        showToast({ type: 'success', title: 'Updated', message: 'Media appearance updated successfully.' });
      } else {
        await mediaApi.createAppearance(payload);
        showToast({ type: 'success', title: 'Created', message: 'Media appearance created successfully.' });
      }

      setIsEditorOpen(false);
      fetchAppearances();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save media appearance.';
      showToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handlers
  const handleDeletePress = async () => {
    if (!isDeletingPress) return;
    try {
      await mediaApi.deletePress(isDeletingPress.id);
      showToast({ type: 'success', title: 'Deleted', message: 'Press article deleted successfully.' });
      setIsDeletingPress(null);
      fetchPress();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete press article.' });
    }
  };

  const handleDeleteAppearance = async () => {
    if (!isDeletingAppearance) return;
    try {
      await mediaApi.deleteAppearance(isDeletingAppearance.id);
      showToast({ type: 'success', title: 'Deleted', message: 'Media appearance deleted successfully.' });
      setIsDeletingAppearance(null);
      fetchAppearances();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete media appearance.' });
    }
  };

  // Preview Handlers
  const handlePreviewPress = async (item: MediaPress) => {
    try {
      const res = await mediaApi.previewPress(item.id);
      setPreviewPress(res.data);
    } catch {
      showToast({ type: 'error', title: 'Preview Error', message: 'Failed to retrieve preview.' });
    }
  };

  const handlePreviewAppearance = async (item: MediaAppearance) => {
    try {
      const res = await mediaApi.previewAppearance(item.id);
      setPreviewAppearance(res.data);
    } catch {
      showToast({ type: 'error', title: 'Preview Error', message: 'Failed to retrieve preview.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-serif text-neutral-100 flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-[#D4A017]" />
            Media & Public Appearances Control Center
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Authoritative curation of press mentions, print features, and broadcast talk-show commentaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSection === 'press' ? (
            <Button
              variant="primary"
              onClick={() => handleOpenPressEditor()}
              className="flex items-center gap-2 bg-[#D4A017] text-black hover:bg-[#C59B27]"
            >
              <Plus className="w-4 h-4" />
              New Press Article
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => handleOpenAppearanceEditor()}
              className="flex items-center gap-2 bg-[#D4A017] text-black hover:bg-[#C59B27]"
            >
              <Plus className="w-4 h-4" />
              New Broadcast Appearance
            </Button>
          )}
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex border-b border-neutral-800 gap-8">
        <button
          type="button"
          onClick={() => setActiveSection('press')}
          className={`pb-3 font-medium text-sm transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeSection === 'press'
              ? 'border-[#D4A017] text-[#D4A017]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Press & Print Media ({pressList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('appearances')}
          className={`pb-3 font-medium text-sm transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeSection === 'appearances'
              ? 'border-[#D4A017] text-[#D4A017]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          Electronic Media & Broadcasts ({appearanceList.length})
        </button>
      </div>

      {/* SECTION 1: PRESS & PRINT MEDIA */}
      {activeSection === 'press' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-1 min-w-[260px] relative items-center">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3" />
              <input
                type="text"
                placeholder="Search by title, source, or slug..."
                value={pressSearch}
                onChange={(e) => setPressSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={pressTypeFilter}
                onChange={(e) => setPressTypeFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-sm rounded px-3 py-2 text-neutral-300 focus:outline-none focus:border-[#D4A017]"
              >
                <option value="all">All Press Types</option>
                {PRESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <select
                value={pressStatusFilter}
                onChange={(e) => setPressStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-sm rounded px-3 py-2 text-neutral-300 focus:outline-none focus:border-[#D4A017]"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Press Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            {pressLoading ? (
              <div className="p-12 text-center text-neutral-400">Loading press articles...</div>
            ) : pressList.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <Newspaper className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
                <p>No press media records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 border-b border-neutral-800 text-xs text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Article / Source</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {pressList.map((item) => {
                      const title = typeof item.title === 'object' ? item.title.en : item.title;
                      const source = typeof item.media_name === 'object' ? item.media_name.en : item.media_name;

                      return (
                        <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-100 flex items-center gap-2">
                              {item.is_featured && (
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                              )}
                              <span>{title}</span>
                            </div>
                            <div className="text-xs text-neutral-400 mt-0.5">
                              Source: <span className="text-[#D4A017]">{source}</span> | /{item.slug}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize text-xs">
                              {item.media_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-neutral-400 whitespace-nowrap">
                            {item.published_date || item.date || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                              item.visibility === 'public'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {item.visibility === 'public' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {item.visibility}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
                              item.status === 'published'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : item.status === 'draft'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handlePreviewPress(item)}
                                className="p-1.5 hover:text-neutral-100 text-neutral-400 rounded hover:bg-neutral-800"
                                title="Administrative Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {item.article_url && (
                                <a
                                  href={item.article_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:text-[#D4A017] text-neutral-400 rounded hover:bg-neutral-800"
                                  title="External Article Link"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenPressEditor(item)}
                                className="p-1.5 hover:text-amber-400 text-neutral-400 rounded hover:bg-neutral-800"
                                title="Edit Article"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsDeletingPress(item)}
                                className="p-1.5 hover:text-red-400 text-neutral-400 rounded hover:bg-neutral-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* SECTION 2: ELECTRONIC MEDIA & BROADCASTS */}
      {activeSection === 'appearances' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-1 min-w-[260px] relative items-center">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3" />
              <input
                type="text"
                placeholder="Search by title, channel, program..."
                value={appearanceSearch}
                onChange={(e) => setAppearanceSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={appearanceTypeFilter}
                onChange={(e) => setAppearanceTypeFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-sm rounded px-3 py-2 text-neutral-300 focus:outline-none focus:border-[#D4A017]"
              >
                <option value="all">All Broadcast Types</option>
                {APPEARANCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <select
                value={appearanceStatusFilter}
                onChange={(e) => setAppearanceStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-sm rounded px-3 py-2 text-neutral-300 focus:outline-none focus:border-[#D4A017]"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Appearances Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            {appearanceLoading ? (
              <div className="p-12 text-center text-neutral-400">Loading appearances...</div>
            ) : appearanceList.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <Tv className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
                <p>No broadcast appearances found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 border-b border-neutral-800 text-xs text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Program / Channel</th>
                      <th className="py-3 px-4">Broadcast Type</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {appearanceList.map((item) => {
                      const title = typeof item.title === 'object' ? item.title.en : item.title;
                      const channel = typeof item.channel === 'object' ? item.channel.en : item.channel;
                      const program = typeof item.program === 'object' ? item.program.en : item.program;

                      return (
                        <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-100 flex items-center gap-2">
                              {item.is_featured && (
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                              )}
                              <span>{title}</span>
                            </div>
                            <div className="text-xs text-neutral-400 mt-0.5">
                              Program: <span className="text-[#D4A017]">{program}</span> | Channel: {channel}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize text-xs">
                              {item.media_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-neutral-400 whitespace-nowrap">
                            {item.broadcast_date || item.date || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                              item.visibility === 'public'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {item.visibility === 'public' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {item.visibility}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
                              item.status === 'published'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : item.status === 'draft'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handlePreviewAppearance(item)}
                                className="p-1.5 hover:text-neutral-100 text-neutral-400 rounded hover:bg-neutral-800"
                                title="Administrative Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {item.video_url && (
                                <a
                                  href={item.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:text-[#D4A017] text-neutral-400 rounded hover:bg-neutral-800"
                                  title="Broadcast Video / Link"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenAppearanceEditor(item)}
                                className="p-1.5 hover:text-amber-400 text-neutral-400 rounded hover:bg-neutral-800"
                                title="Edit Appearance"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsDeletingAppearance(item)}
                                className="p-1.5 hover:text-red-400 text-neutral-400 rounded hover:bg-neutral-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* MODAL: EDITOR (PRESS OR APPEARANCES) */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={
          activeSection === 'press'
            ? editingPress ? 'Edit Press Article' : 'New Press Article'
            : editingAppearance ? 'Edit Broadcast Appearance' : 'New Broadcast Appearance'
        }
        size="xl"
      >
        <div className="space-y-6">
          {/* Modal Tabs */}
          <div className="flex border-b border-neutral-800 gap-4 overflow-x-auto text-sm">
            {(['basic', 'content', 'links', 'assets', 'publishing', 'seo'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize whitespace-nowrap border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-[#D4A017] text-[#D4A017]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab === 'basic' ? 'Basic Info' : tab === 'content' ? 'Description' : tab === 'links' ? 'Links' : tab === 'assets' ? 'Media & Documents' : tab === 'publishing' ? 'Workflow' : 'SEO'}
              </button>
            ))}
          </div>

          {/* PRESS FORM CONTENT */}
          {activeSection === 'press' && (
            <form onSubmit={handleSavePress} className="space-y-6">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Article Title (EN) *</label>
                      <input
                        type="text"
                        required
                        value={pressForm.title_en}
                        onChange={(e) => setPressForm((p) => ({ ...p, title_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Article Title (BN)</label>
                      <input
                        type="text"
                        value={pressForm.title_bn}
                        onChange={(e) => setPressForm((p) => ({ ...p, title_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Slug *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={pressForm.slug}
                          onChange={(e) => setPressForm((p) => ({ ...p, slug: e.target.value }))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleGenerateSlug(pressForm.title_en, setPressForm)}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Media Type *</label>
                      <select
                        value={pressForm.media_type}
                        onChange={(e) => setPressForm((p) => ({ ...p, media_type: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      >
                        {PRESS_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Source / Publication Name (EN) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. The Daily Star"
                        value={pressForm.media_name_en}
                        onChange={(e) => setPressForm((p) => ({ ...p, media_name_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Source / Publication Name (BN)</label>
                      <input
                        type="text"
                        placeholder="e.g. দ্য ডেইলি স্টার"
                        value={pressForm.media_name_bn}
                        onChange={(e) => setPressForm((p) => ({ ...p, media_name_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Publication Date</label>
                    <input
                      type="date"
                      value={pressForm.published_date}
                      onChange={(e) => setPressForm((p) => ({ ...p, published_date: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="flex gap-4 border-b border-neutral-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setContentLang('en')}
                      className={`text-xs font-medium ${contentLang === 'en' ? 'text-[#D4A017]' : 'text-neutral-500'}`}
                    >
                      English Description
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentLang('bn')}
                      className={`text-xs font-medium ${contentLang === 'bn' ? 'text-[#D4A017]' : 'text-neutral-500'}`}
                    >
                      Bengali Description
                    </button>
                  </div>

                  {contentLang === 'en' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Description / Summary (EN)</label>
                      <textarea
                        rows={6}
                        value={pressForm.description_en}
                        onChange={(e) => setPressForm((p) => ({ ...p, description_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                        placeholder="Summary of press coverage or excerpt..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Description / Summary (BN)</label>
                      <textarea
                        rows={6}
                        value={pressForm.description_bn}
                        onChange={(e) => setPressForm((p) => ({ ...p, description_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                        placeholder="সংবাদ প্রতিবেদন বা সাক্ষাৎকারের সারাংশ..."
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">External Article URL (HTTP/HTTPS)</label>
                    <input
                      type="url"
                      placeholder="https://www.thedailystar.net/news/example"
                      value={pressForm.article_url}
                      onChange={(e) => setPressForm((p) => ({ ...p, article_url: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Direct link to original publication or online newspaper entry.</p>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Featured Image Media ID</label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={pressForm.featured_image_id}
                        onChange={(e) => setPressForm((p) => ({ ...p, featured_image_id: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Attached Document / Clipping Media ID</label>
                      <input
                        type="number"
                        placeholder="e.g. 2"
                        value={pressForm.document_media_id}
                        onChange={(e) => setPressForm((p) => ({ ...p, document_media_id: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'publishing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Status</label>
                      <select
                        value={pressForm.status}
                        onChange={(e) => setPressForm((p) => ({ ...p, status: e.target.value as ContentStatus }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Visibility</label>
                      <select
                        value={pressForm.visibility}
                        onChange={(e) => setPressForm((p) => ({ ...p, visibility: e.target.value as VisibilityTier }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pressForm.is_featured}
                        onChange={(e) => setPressForm((p) => ({ ...p, is_featured: e.target.checked }))}
                        className="rounded border-neutral-800 text-[#D4A017] focus:ring-0"
                      />
                      <span className="text-sm text-neutral-300">Feature this article</span>
                    </label>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={pressForm.sort_order}
                        onChange={(e) => setPressForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">SEO Title (EN)</label>
                      <input
                        type="text"
                        value={pressForm.seo_title_en}
                        onChange={(e) => setPressForm((p) => ({ ...p, seo_title_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Meta Description (EN)</label>
                      <input
                        type="text"
                        value={pressForm.meta_desc_en}
                        onChange={(e) => setPressForm((p) => ({ ...p, meta_desc_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Canonical URL</label>
                    <input
                      type="url"
                      value={pressForm.canonical_url}
                      onChange={(e) => setPressForm((p) => ({ ...p, canonical_url: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button type="button" variant="secondary" onClick={() => setIsEditorOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingPress ? 'Update Article' : 'Create Article'}
                </Button>
              </div>
            </form>
          )}

          {/* APPEARANCE FORM CONTENT */}
          {activeSection === 'appearances' && (
            <form onSubmit={handleSaveAppearance} className="space-y-6">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Appearance Title (EN) *</label>
                      <input
                        type="text"
                        required
                        value={appearanceForm.title_en}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, title_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Appearance Title (BN)</label>
                      <input
                        type="text"
                        value={appearanceForm.title_bn}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, title_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Slug *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={appearanceForm.slug}
                          onChange={(e) => setAppearanceForm((p) => ({ ...p, slug: e.target.value }))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleGenerateSlug(appearanceForm.title_en, setAppearanceForm)}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Broadcast Type *</label>
                      <select
                        value={appearanceForm.media_type}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, media_type: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      >
                        {APPEARANCE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Channel / Broadcaster (EN) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Channel 24"
                        value={appearanceForm.channel_en}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, channel_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Channel / Broadcaster (BN)</label>
                      <input
                        type="text"
                        placeholder="e.g. চ্যানেল ২৪"
                        value={appearanceForm.channel_bn}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, channel_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Program Name (EN) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mukhomukhi"
                        value={appearanceForm.program_en}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, program_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Program Name (BN)</label>
                      <input
                        type="text"
                        placeholder="e.g. মুখোমুখি"
                        value={appearanceForm.program_bn}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, program_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Broadcast Date</label>
                    <input
                      type="date"
                      value={appearanceForm.broadcast_date}
                      onChange={(e) => setAppearanceForm((p) => ({ ...p, broadcast_date: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="flex gap-4 border-b border-neutral-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setContentLang('en')}
                      className={`text-xs font-medium ${contentLang === 'en' ? 'text-[#D4A017]' : 'text-neutral-500'}`}
                    >
                      English Description
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentLang('bn')}
                      className={`text-xs font-medium ${contentLang === 'bn' ? 'text-[#D4A017]' : 'text-neutral-500'}`}
                    >
                      Bengali Description
                    </button>
                  </div>

                  {contentLang === 'en' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Program Overview (EN)</label>
                      <textarea
                        rows={6}
                        value={appearanceForm.description_en}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, description_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                        placeholder="Discussion topic, constitutional issues analyzed, dialogue overview..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Program Overview (BN)</label>
                      <textarea
                        rows={6}
                        value={appearanceForm.description_bn}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, description_bn: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                        placeholder="টকশো বা আলোচনার মূল বিষয়বস্তু..."
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Broadcast Video / Web URL (HTTP/HTTPS)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=example or broadcaster url"
                      value={appearanceForm.video_url}
                      onChange={(e) => setAppearanceForm((p) => ({ ...p, video_url: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                    />
                    <p className="text-xs text-neutral-500 mt-1">External broadcast footage reference.</p>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Thumbnail Media ID</label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={appearanceForm.thumbnail_id}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, thumbnail_id: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Attached Document / Transcript Media ID</label>
                      <input
                        type="number"
                        placeholder="e.g. 2"
                        value={appearanceForm.document_media_id}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, document_media_id: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'publishing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Status</label>
                      <select
                        value={appearanceForm.status}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, status: e.target.value as ContentStatus }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Visibility</label>
                      <select
                        value={appearanceForm.visibility}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, visibility: e.target.value as VisibilityTier }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appearanceForm.is_featured}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, is_featured: e.target.checked }))}
                        className="rounded border-neutral-800 text-[#D4A017] focus:ring-0"
                      />
                      <span className="text-sm text-neutral-300">Feature this appearance</span>
                    </label>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={appearanceForm.sort_order}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">SEO Title (EN)</label>
                      <input
                        type="text"
                        value={appearanceForm.seo_title_en}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, seo_title_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Meta Description (EN)</label>
                      <input
                        type="text"
                        value={appearanceForm.meta_desc_en}
                        onChange={(e) => setAppearanceForm((p) => ({ ...p, meta_desc_en: e.target.value }))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Canonical URL</label>
                    <input
                      type="url"
                      value={appearanceForm.canonical_url}
                      onChange={(e) => setAppearanceForm((p) => ({ ...p, canonical_url: e.target.value }))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button type="button" variant="secondary" onClick={() => setIsEditorOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingAppearance ? 'Update Appearance' : 'Create Appearance'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODALS */}
      <Modal
        isOpen={!!isDeletingPress}
        onClose={() => setIsDeletingPress(null)}
        title="Delete Press Article"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Are you sure you want to delete this press article? The entry will be archived and removed from public search.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeletingPress(null)}>Cancel</Button>
            <Button
              variant="secondary"
              className="border-red-800 text-red-400 hover:bg-red-950"
              onClick={handleDeletePress}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!isDeletingAppearance}
        onClose={() => setIsDeletingAppearance(null)}
        title="Delete Broadcast Appearance"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Are you sure you want to delete this appearance? The entry will be archived and removed from public listings.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeletingAppearance(null)}>Cancel</Button>
            <Button
              variant="secondary"
              className="border-red-800 text-red-400 hover:bg-red-950"
              onClick={handleDeleteAppearance}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* PREVIEW MODALS */}
      {previewPress && (
        <Modal
          isOpen={!!previewPress}
          onClose={() => setPreviewPress(null)}
          title="Administrative Draft Preview — Press Media"
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-300 flex items-center justify-between">
              <span>ADMINISTRATIVE PREVIEW MODE — (X-Robots-Tag: noindex, nofollow)</span>
              <Badge variant="outline">{previewPress.status}</Badge>
            </div>

            <div>
              <div className="text-xs text-[#D4A017] uppercase tracking-wider font-semibold">
                {typeof previewPress.media_name === 'object' ? previewPress.media_name.en : previewPress.media_name}
              </div>
              <h2 className="text-xl font-serif text-neutral-100 mt-1">
                {typeof previewPress.title === 'object' ? previewPress.title.en : previewPress.title}
              </h2>
              <div className="text-xs text-neutral-400 mt-2 flex items-center gap-4">
                <span>Date: {previewPress.published_date || previewPress.date || 'Undated'}</span>
                <span>Type: {previewPress.media_type}</span>
                <span>Visibility: {previewPress.visibility}</span>
              </div>
            </div>

            {previewPress.description && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {typeof previewPress.description === 'object' ? previewPress.description.en : previewPress.description}
              </div>
            )}

            {previewPress.article_url && (
              <div className="pt-2">
                <a
                  href={previewPress.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#D4A017] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Original Article
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {previewAppearance && (
        <Modal
          isOpen={!!previewAppearance}
          onClose={() => setPreviewAppearance(null)}
          title="Administrative Draft Preview — Broadcast Appearance"
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-300 flex items-center justify-between">
              <span>ADMINISTRATIVE PREVIEW MODE — (X-Robots-Tag: noindex, nofollow)</span>
              <Badge variant="outline">{previewAppearance.status}</Badge>
            </div>

            <div>
              <div className="text-xs text-[#D4A017] uppercase tracking-wider font-semibold">
                {typeof previewAppearance.channel === 'object' ? previewAppearance.channel.en : previewAppearance.channel} — {typeof previewAppearance.program === 'object' ? previewAppearance.program.en : previewAppearance.program}
              </div>
              <h2 className="text-xl font-serif text-neutral-100 mt-1">
                {typeof previewAppearance.title === 'object' ? previewAppearance.title.en : previewAppearance.title}
              </h2>
              <div className="text-xs text-neutral-400 mt-2 flex items-center gap-4">
                <span>Broadcast Date: {previewAppearance.broadcast_date || previewAppearance.date || 'Undated'}</span>
                <span>Type: {previewAppearance.media_type}</span>
                <span>Visibility: {previewAppearance.visibility}</span>
              </div>
            </div>

            {previewAppearance.description && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {typeof previewAppearance.description === 'object' ? previewAppearance.description.en : previewAppearance.description}
              </div>
            )}

            {previewAppearance.video_url && (
              <div className="pt-2">
                <a
                  href={previewAppearance.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#D4A017] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch Broadcast Recording
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
