import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  History,
  Save,
  Send,
  Languages,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import type { FooterTemplate } from '../types';

interface BuilderToolbarProps {
  template: FooterTemplate | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  locale: 'en' | 'bn';
  onChangeLocale: (loc: 'en' | 'bn') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  onSaveDraft: () => void;
  onOpenPublishModal: () => void;
  onOpenRevisionsModal: () => void;
  onOpenTemplateModal: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  template,
  viewport,
  onChangeViewport,
  locale,
  onChangeLocale,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isDirty,
  isSaving,
  isPublishing,
  onSaveDraft,
  onOpenPublishModal,
  onOpenRevisionsModal,
  onOpenTemplateModal,
}) => {
  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30">
      {/* Left: Template Info & Switcher */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenTemplateModal}
          className="flex items-center gap-2 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-all cursor-pointer group"
        >
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 max-w-[200px] sm:max-w-[260px] truncate block">
                {template?.name || 'Loading Template...'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
            </div>
          </div>
        </button>

        {/* Status Badge */}
        {template && (
          <div className="hidden sm:flex items-center gap-1">
            {template.is_active ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                ACTIVE LIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                DRAFT
              </span>
            )}
          </div>
        )}

        {/* Unsaved changes marker */}
        {isDirty && (
          <span className="hidden md:flex items-center gap-1 text-[11px] font-medium text-amber-400 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Center: Viewport & Language Mode Switchers */}
      <div className="flex items-center gap-3">
        {/* Device Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onChangeViewport('desktop')}
            title="Desktop Viewport (100%)"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport('tablet')}
            title="Tablet Viewport (768px)"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport('mobile')}
            title="Mobile Viewport (375px)"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Language Preview Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          <button
            type="button"
            onClick={() => onChangeLocale('en')}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
              locale === 'en'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onChangeLocale('bn')}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
              locale === 'bn'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Right: History, Save Draft, Publish */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="hidden lg:flex items-center gap-1 border-r border-slate-800 pr-2">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Revisions History Button */}
        <button
          type="button"
          onClick={onOpenRevisionsModal}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Revisions</span>
          {template?.revisions_count !== undefined && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-400 font-mono font-bold">
              {template.revisions_count}
            </span>
          )}
        </button>

        {/* Save Draft Button */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
        </button>

        {/* Publish Button */}
        <button
          type="button"
          onClick={onOpenPublishModal}
          disabled={isPublishing}
          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
        </button>
      </div>
    </div>
  );
};
