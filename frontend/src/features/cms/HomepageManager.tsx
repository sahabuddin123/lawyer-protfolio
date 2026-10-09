import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import type { HomepageSection } from '@/types';

export const HomepageManager: React.FC = () => {
  const { showToast } = useToast();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
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
      setSections(data);
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

  const handleOpenEdit = (section: HomepageSection) => {
    setEditingSection(section);
    const titleEn = typeof section.title === 'object' ? (section.title as any)?.en || '' : section.title;
    const titleBn = typeof section.title === 'object' ? (section.title as any)?.bn || '' : '';
    const subEn = typeof section.subtitle === 'object' ? (section.subtitle as any)?.en || '' : section.subtitle || '';
    const subBn = typeof section.subtitle === 'object' ? (section.subtitle as any)?.bn || '' : '';
    const cntEn = typeof section.content === 'object' ? (section.content as any)?.en || '' : section.content || '';
    const cntBn = typeof section.content === 'object' ? (section.content as any)?.bn || '' : '';

    const ctaLabel = section.settings?.cta_label;
    const ctaEn = typeof ctaLabel === 'object' ? (ctaLabel as any)?.en || '' : ctaLabel || '';
    const ctaBn = typeof ctaLabel === 'object' ? (ctaLabel as any)?.bn || '' : '';

    setFormData({
      title_en: titleEn,
      title_bn: titleBn,
      subtitle_en: subEn,
      subtitle_bn: subBn,
      content_en: cntEn,
      content_bn: cntBn,
      cta_label_en: ctaEn,
      cta_label_bn: ctaBn,
      cta_url: section.settings?.cta_url || '',
      is_enabled: section.is_enabled,
    });
    setIsModalOpen(true);
  };

  const handleToggleEnable = async (section: HomepageSection) => {
    try {
      const updated = !section.is_enabled;
      await cmsApi.updateAdminHomepageSection(section.id, {
        is_enabled: updated,
      });
      showToast({
        type: 'success',
        title: 'Visibility Updated',
        message: `Section '${section.section_key}' is now ${updated ? 'Visible' : 'Hidden'}.`,
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

    const list = [...sections];
    const current = list[index];
    const target = list[targetIndex];

    const payload = [
      { id: current.id, sort_order: target.sort_order },
      { id: target.id, sort_order: current.sort_order },
    ];

    try {
      await cmsApi.reorderAdminHomepageSections(payload);
      fetchSections();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reorder Failed',
        message: err.message || 'Could not reorder homepage sections.',
      });
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      setIsSaving(true);
      const payload: any = {
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
      setIsModalOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-legal-gold/20 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Homepage Section Management</h2>
          <p className="text-sm text-neutral-400 font-sans">
            Control the layout hierarchy, section ordering, visibility, and bilingual titles across the judicial landing page.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-legal-gold flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-legal-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-sans tracking-wide">Loading Sections...</span>
        </div>
      ) : (
        <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="divide-y divide-neutral-800">
            {sections.map((sec, idx) => {
              const title = typeof sec.title === 'object' ? (sec.title as any)?.en || sec.section_key : sec.title;
              return (
                <div key={sec.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-legal-gold w-6">#{idx + 1}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{title}</span>
                        <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded font-mono">
                          {sec.section_key}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {typeof sec.subtitle === 'object' ? (sec.subtitle as any)?.en : sec.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={sec.is_enabled ? 'success' : 'neutral'} size="sm">
                      {sec.is_enabled ? 'VISIBLE' : 'HIDDEN'}
                    </Badge>
                    <Button
                      variant={sec.is_enabled ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleEnable(sec)}
                    >
                      {sec.is_enabled ? 'Hide' : 'Show'}
                    </Button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-xs"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-xs"
                      title="Move Down"
                    >
                      ▼
                    </button>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(sec)}>
                      Configure
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Edit Section Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? `Configure Section: ${editingSection.section_key}` : 'Configure Section'}
        size="lg"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Section Title (English)"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
            />
            <Input
              label="Section Title (Bangla)"
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
              label="Summary Content (English)"
              value={formData.content_en}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Summary Content (Bangla)"
              value={formData.content_bn}
              onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
              rows={3}
            />
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded space-y-3">
            <span className="text-xs font-semibold text-legal-gold uppercase tracking-wider">
              Call to Action (CTA) Button
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="CTA Label (EN)"
                value={formData.cta_label_en}
                onChange={(e) => setFormData({ ...formData, cta_label_en: e.target.value })}
                placeholder="Explore More"
              />
              <Input
                label="CTA Label (BN)"
                value={formData.cta_label_bn}
                onChange={(e) => setFormData({ ...formData, cta_label_bn: e.target.value })}
                placeholder="আরও দেখুন"
              />
              <Input
                label="CTA Destination URL"
                value={formData.cta_url}
                onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                placeholder="/consultation"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              Save Configuration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
