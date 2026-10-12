import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/feedback/Toast';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { BuilderToolbar } from './components/BuilderToolbar';
import { BuilderSidebar } from './components/BuilderSidebar';
import { BuilderCanvas } from './components/BuilderCanvas';
import { RevisionsModal } from './components/RevisionsModal';
import { TemplateModal } from './components/TemplateModal';
import { PublishModal } from './components/PublishModal';
import { footerBuilderApi } from './api';
import { AlertTriangle } from 'lucide-react';
import type {
  FooterTemplate,
  FooterRevision,
  FooterLayoutData,
  FooterRow,
  FooterColumn,
  FooterElement,
  ElementType,
  CanonicalData,
} from './types';

export const FooterBuilderPage: React.FC = () => {
  const { showToast } = useToast();

  // Primary data states
  const [templates, setTemplates] = useState<FooterTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<FooterTemplate | null>(null);
  const [canonicalData, setCanonicalData] = useState<CanonicalData | null>(null);
  const [revisions, setRevisions] = useState<FooterRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active builder states
  const [layout, setLayout] = useState<FooterLayoutData>({
    settings: {
      background_color: '#0F172A',
      text_color: '#94A3B8',
      border_top_color: '#1E293B',
      max_width: '7xl',
    },
    rows: [],
  });
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewLocale, setPreviewLocale] = useState<'en' | 'bn'>('en');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'element' | 'column' | 'row' | 'root' | null>(null);

  // Undo / Redo history stacks
  const historyRef = useRef<FooterLayoutData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Saving / Publishing flags
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [allTemplates, canonical] = await Promise.all([
        footerBuilderApi.getTemplates(),
        footerBuilderApi.getCanonicalData(),
      ]);

      setTemplates(allTemplates);
      setCanonicalData(canonical);

      // Select active template or first template
      const active = allTemplates.find((t) => t.is_active) || allTemplates[0] || null;
      if (active) {
        selectTemplate(active);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Loading Footer Builder',
        message: err.message || 'Could not retrieve footer templates.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectTemplate = (template: FooterTemplate) => {
    setCurrentTemplate(template);
    const initialLayout = template.layout_data || { settings: {}, rows: [] };
    setLayout(initialLayout);
    historyRef.current = [JSON.parse(JSON.stringify(initialLayout))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    setIsDirty(false);
    setSelectedId(null);
    setSelectedType(null);

    // Fetch revisions for this template
    footerBuilderApi
      .getRevisions(template.id)
      .then(setRevisions)
      .catch(() => {});
  };

  // Push new state to history for Undo/Redo
  const pushHistory = useCallback((newLayout: FooterLayoutData) => {
    const cloned = JSON.parse(JSON.stringify(newLayout));
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(cloned);
    if (nextHistory.length > 30) {
      nextHistory.shift();
    }
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
    setIsDirty(true);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setLayout(targetState);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      setIsDirty(true);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setLayout(targetState);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      setIsDirty(true);
    }
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Layout Mutations
  const handleUpdateLayout = (updater: (prev: FooterLayoutData) => FooterLayoutData) => {
    setLayout((prev) => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  };

  const handleAddRow = () => {
    const newRowId = `row_${Date.now()}`;
    const newColId = `col_${Date.now()}`;
    const newRow: FooterRow = {
      id: newRowId,
      settings: { gap: '2.5rem', margin_bottom: '2.5rem' },
      columns: [
        {
          id: newColId,
          span: 12,
          settings: {},
          elements: [],
        },
      ],
    };

    handleUpdateLayout((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));

    setSelectedId(newRowId);
    setSelectedType('row');
  };

  const handleDeleteRow = (rowId: string) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== rowId),
    }));
    if (selectedId === rowId) {
      setSelectedId(null);
      setSelectedType(null);
    }
  };

  const handleAddColumn = (rowId: string) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        if (row.id !== rowId) return row;
        const newColId = `col_${Date.now()}`;
        // Adjust spans
        const count = row.columns.length + 1;
        const newSpan = Math.max(1, Math.floor(12 / count));
        const updatedCols = row.columns.map((c) => ({ ...c, span: newSpan }));
        return {
          ...row,
          columns: [...updatedCols, { id: newColId, span: newSpan, settings: {}, elements: [] }],
        };
      }),
    }));
  };

  const handleDeleteColumn = (rowId: string, columnId: string) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.filter((c) => c.id !== columnId),
        };
      }),
    }));
  };

  const handleAddElement = (type: ElementType, targetColumnId?: string) => {
    const newElId = `el_${Date.now()}`;

    // Create element with rich default content
    let defaultContent: any = {};
    if (type === 'site_identity') {
      defaultContent = {
        lawyer_name: { en: 'Advocate Nijam Uddin (Haq)', bn: 'অ্যাডভোকেট নিজাম উদ্দিন (হক)' },
        designation: { en: 'Advocate, Supreme Court of Bangladesh', bn: 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট' },
        has_emblem: true,
      };
    } else if (type === 'heading') {
      defaultContent = {
        text: { en: 'SECTION HEADING', bn: 'শিরোনাম' },
      };
    } else if (type === 'paragraph') {
      defaultContent = {
        text: {
          en: 'Advocate Nijam Uddin (Haq) represents clients in high-stakes constitutional and appellate litigation before the Supreme Court of Bangladesh.',
          bn: 'অ্যাডভোকেট নিজাম উদ্দিন (হক) বাংলাদেশ সুপ্রিম কোর্টের আপিল ও রিট মোকদ্দমায় নির্ভরযোগ্য বিচারিক সহায়তা প্রদান করেন।',
        },
      };
    } else if (type === 'chambers_list') {
      defaultContent = {
        chambers: [
          {
            id: 'supreme_court',
            name: { en: 'Supreme Court Chamber', bn: 'সুপ্রিম কোর্ট চেম্বার' },
            address: {
              en: 'Room 312, Supreme Court Bar Association Building, Dhaka',
              bn: 'কক্ষ ৩১২, সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ভবন, ঢাকা',
            },
            map_url: 'https://maps.google.com/?q=Supreme+Court+Bar+Association+Building+Dhaka',
          },
          {
            id: 'chattogram',
            name: { en: 'Chattogram Chamber', bn: 'চট্টগ্রাম চেম্বার' },
            address: {
              en: 'Court Hill, Kotwali, Chattogram',
              bn: 'কোর্ট হিল, কোতোয়ালী, চট্টগ্রাম',
            },
            map_url: 'https://maps.google.com/?q=Court+Hill+Kotwali+Chattogram',
          },
        ],
      };
    } else if (type === 'contact_group') {
      defaultContent = {
        phone: '+880 1819-000000',
        email: 'chambers@nijamuddin.com',
        is_phone_placeholder: true,
      };
    } else if (type === 'social_group') {
      defaultContent = {
        profiles: [
          { platform: 'facebook', url: 'https://facebook.com', is_active: true },
          { platform: 'linkedin', url: 'https://linkedin.com', is_active: true },
          { platform: 'youtube', url: 'https://youtube.com', is_active: true },
        ],
      };
    } else if (type === 'custom_link_group') {
      defaultContent = {
        items: [
          { label: { en: 'Home', bn: 'হোম' }, url: '/' },
          { label: { en: 'About Advocate Nijam', bn: 'আইনজীবী পরিচিতি' }, url: '/about' },
          { label: { en: 'Constitutional Matters', bn: 'সাংবিধানিক মামলা' }, url: '/practice-areas' },
          { label: { en: 'Contact Chambers', bn: 'চেম্বার যোগাযোগ' }, url: '/contact' },
        ],
      };
    } else if (type === 'divider') {
      defaultContent = { with_emblem: true };
    } else if (type === 'legal_disclaimer') {
      defaultContent = {
        text: {
          en: 'Legal Disclaimer: The materials provided on this platform are for general informational purposes only and do not constitute formal legal counsel. Prior results do not guarantee a similar outcome.',
          bn: 'আইনি অস্বীকৃতি: এই প্ল্যাটফর্মে প্রদত্ত তথ্য শুধুমাত্র সাধারণ তথ্যের উদ্দেশ্যে এবং এটি কোনো আনুষ্ঠানিক আইনি পরামর্শ নয়।',
        },
      };
    } else if (type === 'legal_links') {
      defaultContent = {
        copyright_prefix: {
          en: '© {year} Advocate Nijam Uddin (Haq). All rights reserved.',
          bn: '© {year} অ্যাডভোকেট নিজাম উদ্দিন (হক)। সর্বস্বত্ব সংরক্ষিত।',
        },
        links: [
          { label: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' }, url: '#privacy' },
          { label: { en: 'Terms of Engagement', bn: 'শর্তাবলী ও নিয়মাবলী' }, url: '#terms' },
        ],
      };
    }

    const newElement: FooterElement = {
      id: newElId,
      type,
      content: defaultContent,
      settings: {},
    };

    handleUpdateLayout((prev) => {
      // Find target column or first column
      let added = false;
      const newRows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          if (!added && (!targetColumnId || col.id === targetColumnId)) {
            added = true;
            return {
              ...col,
              elements: [...col.elements, newElement],
            };
          }
          return col;
        }),
      }));

      // If no columns existed, create row & column first
      if (!added) {
        const rowId = `row_${Date.now()}`;
        const colId = `col_${Date.now()}`;
        return {
          ...prev,
          rows: [
            ...prev.rows,
            {
              id: rowId,
              settings: {},
              columns: [{ id: colId, span: 12, settings: {}, elements: [newElement] }],
            },
          ],
        };
      }

      return { ...prev, rows: newRows };
    });

    setSelectedId(newElId);
    setSelectedType('element');
  };

  const handleUpdateElement = (elementId: string, updates: Partial<FooterElement>) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          elements: col.elements.map((el) => {
            if (el.id !== elementId) return el;
            return {
              ...el,
              ...updates,
              content: updates.content ? { ...el.content, ...updates.content } : el.content,
              settings: updates.settings ? { ...el.settings, ...updates.settings } : el.settings,
            };
          }),
        })),
      })),
    }));
  };

  const handleDeleteElement = (elementId: string) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          elements: col.elements.filter((el) => el.id !== elementId),
        })),
      })),
    }));
    if (selectedId === elementId) {
      setSelectedId(null);
      setSelectedType(null);
    }
  };

  const handleDuplicateElement = (elementId: string) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          const idx = col.elements.findIndex((el) => el.id === elementId);
          if (idx === -1) return col;
          const cloned: FooterElement = {
            ...JSON.parse(JSON.stringify(col.elements[idx])),
            id: `el_${Date.now()}`,
          };
          const newElements = [...col.elements];
          newElements.splice(idx + 1, 0, cloned);
          return { ...col, elements: newElements };
        }),
      })),
    }));
  };

  const handleMoveElement = (elementId: string, direction: 'up' | 'down') => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          const idx = col.elements.findIndex((el) => el.id === elementId);
          if (idx === -1) return col;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= col.elements.length) return col;
          const newElements = [...col.elements];
          const [moved] = newElements.splice(idx, 1);
          newElements.splice(targetIdx, 0, moved);
          return { ...col, elements: newElements };
        }),
      })),
    }));
  };

  const handleReorderElements = (sourceId: string, targetColId: string, targetIndex: number) => {
    handleUpdateLayout((prev) => {
      let targetElement: FooterElement | null = null;

      // Extract source
      const cleanedRows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          const match = col.elements.find((el) => el.id === sourceId);
          if (match) targetElement = match;
          return {
            ...col,
            elements: col.elements.filter((el) => el.id !== sourceId),
          };
        }),
      }));

      if (!targetElement) return prev;

      // Insert at target column
      const insertedRows = cleanedRows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          if (col.id !== targetColId) return col;
          const newElements = [...col.elements];
          newElements.splice(targetIndex, 0, targetElement!);
          return { ...col, elements: newElements };
        }),
      }));

      return { ...prev, rows: insertedRows };
    });
  };

  const handleUpdateColumn = (columnId: string, updates: Partial<FooterColumn>) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          if (col.id !== columnId) return col;
          return { ...col, ...updates };
        }),
      })),
    }));
  };

  const handleUpdateRow = (rowId: string, updates: Partial<FooterRow>) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, ...updates };
      }),
    }));
  };

  const handleUpdateRootSettings = (settings: any) => {
    handleUpdateLayout((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!currentTemplate) return;
    try {
      setIsSaving(true);
      const updated = await footerBuilderApi.updateDraft(currentTemplate.id, {
        layout_data: layout,
      });
      setCurrentTemplate(updated);
      setIsDirty(false);
      showToast({
        type: 'success',
        title: 'Draft Saved',
        message: 'Footer draft changes successfully saved without modifying public site.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Save Draft',
        message: err.message || 'Error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Template
  const handlePublish = async (changeSummary: string) => {
    if (!currentTemplate) return;
    try {
      setIsPublishing(true);

      // Save draft first if dirty
      if (isDirty) {
        await footerBuilderApi.updateDraft(currentTemplate.id, {
          layout_data: layout,
        });
      }

      const published = await footerBuilderApi.publishTemplate(currentTemplate.id, changeSummary);
      setCurrentTemplate(published);
      setIsDirty(false);

      // Refresh templates and revisions
      const [allTemplates, updatedRevisions] = await Promise.all([
        footerBuilderApi.getTemplates(),
        footerBuilderApi.getRevisions(currentTemplate.id),
      ]);
      setTemplates(allTemplates);
      setRevisions(updatedRevisions);

      showToast({
        type: 'success',
        title: 'Footer Published Successfully',
        message: 'The new footer layout is now active globally across the public platform.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Publish Failed',
        message: err.message || 'Could not publish footer layout.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (revId: number) => {
    if (!currentTemplate) return;
    try {
      const restored = await footerBuilderApi.restoreRevision(currentTemplate.id, revId);
      selectTemplate(restored);
      showToast({
        type: 'success',
        title: 'Revision Restored',
        message: 'Previous version layout restored successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Restore Failed',
        message: err.message || 'Could not restore revision.',
      });
    }
  };

  // Create Template
  const handleCreateTemplate = async (name: string, preset: string) => {
    try {
      const created = await footerBuilderApi.createTemplate({ name, preset });
      const allTemplates = await footerBuilderApi.getTemplates();
      setTemplates(allTemplates);
      selectTemplate(created);
      showToast({
        type: 'success',
        title: 'Template Created',
        message: `Template "${created.name}" created.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Could not create template.',
      });
    }
  };

  // Duplicate Template
  const handleDuplicateTemplate = async (templateId: number) => {
    try {
      const cloned = await footerBuilderApi.duplicateTemplate(templateId);
      const allTemplates = await footerBuilderApi.getTemplates();
      setTemplates(allTemplates);
      selectTemplate(cloned);
      showToast({
        type: 'success',
        title: 'Template Duplicated',
        message: `Created draft copy: "${cloned.name}".`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Duplication Failed',
        message: err.message || 'Could not duplicate template.',
      });
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await footerBuilderApi.deleteTemplate(templateId);
      const allTemplates = await footerBuilderApi.getTemplates();
      setTemplates(allTemplates);
      if (currentTemplate?.id === templateId && allTemplates.length > 0) {
        selectTemplate(allTemplates[0]);
      }
      showToast({
        type: 'success',
        title: 'Template Deleted',
        message: 'Template removed successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete template.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" label="Loading Elementor Footer Studio..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* Verification Notice Banner if canonical contacts have placeholder */}
      {canonicalData?.contacts?.is_phone_placeholder && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium">
              Administrator Verification Flag: Current phone record ({canonicalData.contacts.phone}) is flagged for verification.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-400/80">
            Supreme Court Chamber Secretariat
          </span>
        </div>
      )}

      {/* Top Studio Toolbar */}
      <BuilderToolbar
        template={currentTemplate}
        viewport={viewport}
        onChangeViewport={setViewport}
        locale={previewLocale}
        onChangeLocale={setPreviewLocale}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenRevisionsModal={() => setIsRevisionsOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
      />

      {/* Center Studio Workspace: Left Sidebar + Center Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Elements, Layers, Bilingual Inspector) */}
        <BuilderSidebar
          layout={layout}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelect={(id, type) => {
            setSelectedId(id);
            setSelectedType(type);
          }}
          onAddElement={handleAddElement}
          onUpdateElement={handleUpdateElement}
          onUpdateColumn={handleUpdateColumn}
          onUpdateRow={handleUpdateRow}
          onUpdateRootSettings={handleUpdateRootSettings}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onMoveElement={handleMoveElement}
          onDeleteRow={handleDeleteRow}
          onAddRow={handleAddRow}
          canonicalData={canonicalData}
          activeLocale={previewLocale}
        />

        {/* Center Live Canvas */}
        <BuilderCanvas
          layout={layout}
          viewport={viewport}
          locale={previewLocale}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelect={(id, type) => {
            setSelectedId(id);
            setSelectedType(type);
          }}
          onAddRow={handleAddRow}
          onAddColumn={handleAddColumn}
          onAddElement={(colId) => handleAddElement('paragraph', colId)}
          onDeleteRow={handleDeleteRow}
          onDeleteColumn={handleDeleteColumn}
          onDeleteElement={handleDeleteElement}
          onMoveElement={handleMoveElement}
          onReorderElements={handleReorderElements}
        />
      </div>

      {/* Modals */}
      <RevisionsModal
        isOpen={isRevisionsOpen}
        onClose={() => setIsRevisionsOpen(false)}
        revisions={revisions}
        onRestore={handleRestoreRevision}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        currentTemplateId={currentTemplate?.id || null}
        onSelectTemplate={(id) => {
          const match = templates.find((t) => t.id === id);
          if (match) selectTemplate(match);
        }}
        onCreateTemplate={handleCreateTemplate}
        onDuplicateTemplate={handleDuplicateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        templateName={currentTemplate?.name || 'Footer Template'}
        isPublishing={isPublishing}
        onPublish={handlePublish}
      />
    </div>
  );
};
