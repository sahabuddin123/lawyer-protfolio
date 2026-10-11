import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { AdminPageHeader, AdminConfirmationDialog } from '@/components/admin';
import { Layers, Plus, ArrowUp, ArrowDown, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { HomepageSection } from '@/types';

const APPROVED_SECTION_TYPES = [
  { key: 'hero', label: 'Hero Header Showcase' },
  { key: 'about_preview', label: 'Institutional About & Chamber Overview' },
  { key: 'credentials', label: 'Bar Credentials & High Court Pedigree' },
  { key: 'practice_areas', label: 'Practice Areas & Specialized Counsel' },
  { key: 'courtroom', label: 'Supreme Court Case Records & Precedents' },
  { key: 'judgment_reviews', label: 'Appellate Judgment Analyses' },
  { key: 'research', label: 'Legal Research & Jurisprudence Articles' },
  { key: 'publications', label: 'Scholarly Publications & Treatises' },
  { key: 'media', label: 'Media & Press Engagements' },
  { key: 'videos', label: 'Courtroom Arguments & Legal Interviews' },
  { key: 'gallery', label: 'Chamber & Court Photographic Archive' },
  { key: 'consultation_cta', label: 'Direct Consultation Booking CTA' },
];

export const HomepageManager: React.FC = () => {
  const { showToast } = useToast();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingSection, setDeletingSection] = useState<HomepageSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    section_key: 'custom_section',
    title_en: '',
    title_bn: '',
    subtitle_en: '',
    subtitle_bn: '',
    content_en: '',
    content_bn: '',
    cta_label_en: '',
    cta_label_bn: '',
    cta_url: '',
    is_enabled: true,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getAdminHomepageSections();
      const list = Array.isArray(data) ? data : [];
      setSections(list);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error loading sections',
        message: err.message || 'Could not fetch homepage sections.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const existingKeys = new Set(sections.map((s) => s.section_key));
    const firstAvailable = APPROVED_SECTION_TYPES.find((t) => !existingKeys.has(t.key))?.key || 'new_section';

    setFormData({
      section_key: firstAvailable,
      title_en: '',
      title_bn: '',
      subtitle_en: '',
      subtitle_bn: '',
      content_en: '',
      content_bn: '',
      cta_label_en: '',
      cta_label_bn: '',
      cta_url: '',
      is_enabled: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (section: HomepageSection) => {
    setEditingSection(section);
    const titleEn = typeof section.title === 'object' ? (section.title as any)?.en || '' : section.title;
    const titleBn = typeof section.title === 'object' ? (section.title as any)?.bn || '' : '';
    const subEn = typeof section.subtitle === 'object' ? (section.subtitle as any)?.en || '' : section.subtitle || '';
    const subBn = typeof section.subtitle === 'object' ? (section.subtitle as any)?.bn || '' : '';
    const cntEn = typeof section.content === 'object' ? (section.content as any)?.en || '' : section.content || '';
    const cntBn = typeof section.content === 'object' ? (section.content as any)?.bn || '' : '';

    const ctaLabelEn = typeof section.settings?.cta_label === 'object'
      ? section.settings?.cta_label?.en || ''
      : section.settings?.cta_label || '';
    const ctaLabelBn = typeof section.settings?.cta_label === 'object'
      ? section.settings?.cta_label?.bn || ''
      : '';

    setFormData({
      section_key: section.section_key,
      title_en: titleEn,
      title_bn: titleBn,
      subtitle_en: subEn,
      subtitle_bn: subBn,
      content_en: cntEn,
      content_bn: cntBn,
      cta_label_en: ctaLabelEn,
      cta_label_bn: ctaLabelBn,
      cta_url: section.settings?.cta_url || '',
      is_enabled: section.is_enabled,
    });
    setIsEditModalOpen(true);
  };

  const handleToggleVisibility = async (section: HomepageSection) => {
    try {
      await cmsApi.updateAdminHomepageSection(section.id, {
        is_enabled: !section.is_enabled,
      });
      showToast({
        type: 'success',
        title: 'Visibility Toggled',
        message: `Section '${section.section_key}' is now ${!section.is_enabled ? 'enabled' : 'hidden'}.`,
      });
      fetchSections();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update visibility.',
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const currentSec = sections[index];
    const targetSec = sections[targetIndex];

    const reorderPayload = [
      { id: currentSec.id, sort_order: targetSec.sort_order },
      { id: targetSec.id, sort_order: currentSec.sort_order },
    ];

    try {
      await cmsApi.reorderAdminHomepageSections(reorderPayload);
      fetchSections();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reorder Failed',
        message: err.message || 'Could not change section sequence.',
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en || !formData.section_key) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both an English title and section type key.',
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        section_key: formData.section_key,
        title: { en: formData.title_en, bn: formData.title_bn },
        subtitle: { en: formData.subtitle_en, bn: formData.subtitle_bn },
        content: { en: formData.content_en, bn: formData.content_bn },
        is_enabled: formData.is_enabled,
        settings: {
          cta_label: { en: formData.cta_label_en, bn: formData.cta_label_bn },
          cta_url: formData.cta_url,
        },
      };

      await cmsApi.createAdminHomepageSection(payload);
      showToast({
        type: 'success',
        title: 'Section Created',
        message: `Homepage section '${formData.section_key}' successfully added.`,
      });
      setIsCreateModalOpen(false);
      fetchSections();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Could not create homepage section.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      setIsSaving(true);
      const payload = {
        title: { en: formData.title_en, bn: formData.title_bn },
        subtitle: { en: formData.subtitle_en, bn: formData.subtitle_bn },
        content: { en: formData.content_en, bn: formData.content_bn },
        is_enabled: formData.is_enabled,
        settings: {
          ...editingSection.settings,
          cta_label: { en: formData.cta_label_en, bn: formData.cta_label_bn },
          cta_url: formData.cta_url,
        },
      };

      await cmsApi.updateAdminHomepageSection(editingSection.id, payload);
      showToast({
        type: 'success',
        title: 'Section Configured',
        message: `Homepage section '${editingSection.section_key}' updated.`,
      });
      setIsEditModalOpen(false);
      fetchSections();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save section configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteSection = async () => {
    if (!deletingSection) return;

    try {
      setIsDeleting(true);
      await cmsApi.deleteAdminHomepageSection(deletingSection.id);
      showToast({
        type: 'success',
        title: 'Section Deleted',
        message: `Homepage section '${deletingSection.section_key}' removed.`,
      });
      setDeletingSection(null);
      fetchSections();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete homepage section.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage Layout & Section Ordering"
        description="Control layout sequence, section toggles, visibility states, and bilingual hero headings across the public landing page."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Layers className="w-3 h-3 text-amber-600" />
            <span>{(Array.isArray(sections) ? sections.length : 0)} Sections</span>
          </span>
        }
        actions={
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading landing page sections...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="divide-y divide-slate-100">
            {(Array.isArray(sections) ? sections : []).map((sec, idx) => {
              const title = typeof sec.title === 'object' ? (sec.title as any)?.en || sec.section_key : sec.title;
              return (
                <div key={sec.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <span className="text-xs font-mono text-amber-700 font-bold w-6">#{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                          {title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {sec.section_key}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xl">
                        {typeof sec.content === 'object'
                          ? (sec.content as any)?.en || 'Custom landing section'
                          : sec.content || 'Custom landing section'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(sec)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        sec.is_enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {sec.is_enabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Move Up"
                      aria-label="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (Array.isArray(sections) ? sections.length : 0) - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Move Down"
                      aria-label="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sec)}
                      className="px-3 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Configure
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingSection(sec)}
                      className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Section"
                      aria-label="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Approved Homepage Section"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Approved Section Type Key
            </label>
            <select
              value={formData.section_key}
              onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            >
              {APPROVED_SECTION_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} ({t.key})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
            />
            <Input
              label="Title (Bangla)"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subtitle (English)"
              value={formData.subtitle_en}
              onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
            />
            <Input
              label="Subtitle (Bangla)"
              value={formData.subtitle_bn}
              onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Description (English)"
              value={formData.content_en}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Description (Bangla)"
              value={formData.content_bn}
              onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Input
              label="CTA Button Label (EN)"
              value={formData.cta_label_en}
              onChange={(e) => setFormData({ ...formData, cta_label_en: e.target.value })}
              placeholder="e.g. Learn More"
            />
            <Input
              label="CTA Button Label (BN)"
              value={formData.cta_label_bn}
              onChange={(e) => setFormData({ ...formData, cta_label_bn: e.target.value })}
              placeholder="যেমন: আরো জানুন"
            />
            <Input
              label="CTA Target Link"
              value={formData.cta_url}
              onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
              placeholder="e.g. /services"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
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
              Create Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* Section Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Configure Section: ${editingSection?.section_key || ''}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
            />
            <Input
              label="Title (Bangla)"
              value={formData.title_bn}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subtitle (English)"
              value={formData.subtitle_en}
              onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
            />
            <Input
              label="Subtitle (Bangla)"
              value={formData.subtitle_bn}
              onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Description (English)"
              value={formData.content_en}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Description (Bangla)"
              value={formData.content_bn}
              onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Input
              label="CTA Button Label (EN)"
              value={formData.cta_label_en}
              onChange={(e) => setFormData({ ...formData, cta_label_en: e.target.value })}
              placeholder="e.g. Schedule Conference"
            />
            <Input
              label="CTA Button Label (BN)"
              value={formData.cta_label_bn}
              onChange={(e) => setFormData({ ...formData, cta_label_bn: e.target.value })}
              placeholder="যেমন: পরামর্শ বুক করুন"
            />
            <Input
              label="CTA Target Link"
              value={formData.cta_url}
              onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
              placeholder="e.g. /contact"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
              Save Configuration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Section Deletion */}
      <AdminConfirmationDialog
        isOpen={Boolean(deletingSection)}
        title="Remove Homepage Section"
        message={`Are you sure you want to remove the section '${deletingSection?.section_key}'? This will remove its landing page configuration.`}
        confirmLabel="Remove Section"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteSection}
        onClose={() => setDeletingSection(null)}
      />
    </div>
  );
};
