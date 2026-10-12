import React, { useState } from 'react';
import { Modal } from '@/components/modals/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Plus, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import type { FooterTemplate } from '../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FooterTemplate[];
  currentTemplateId: number | null;
  onSelectTemplate: (templateId: number) => void;
  onCreateTemplate: (name: string, preset: string) => Promise<void>;
  onDuplicateTemplate: (templateId: number) => Promise<void>;
  onDeleteTemplate: (templateId: number) => Promise<void>;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  currentTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('institutional');
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    try {
      setActionLoading(true);
      await onCreateTemplate(newTemplateName.trim(), selectedPreset);
      setNewTemplateName('');
      setIsCreating(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      setActionLoading(true);
      await onDuplicateTemplate(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      setActionLoading(true);
      await onDeleteTemplate(id);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Footer Templates Manager"
      description="Select an active template, create a redesign draft, or duplicate an existing configuration."
      size="lg"
    >
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {/* Create Form Toggle */}
        {!isCreating ? (
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">
              Available Templates ({templates.length})
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Template
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
          >
            <span className="text-xs font-bold text-slate-100 block">
              Create New Footer Template
            </span>

            <Input
              label="Template Name"
              placeholder="e.g. Modern Supreme Court Redesign 2026"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium block">
                Starter Preset
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
              >
                <option value="institutional">
                  Supreme Court Institutional Legal (4 Columns + Chambers)
                </option>
                <option value="minimal">
                  Minimal Clean Legal (3 Columns + Bottom Bar)
                </option>
                <option value="corporate">
                  Corporate Advisory (Full Width 4 Columns)
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={actionLoading}
              >
                Create Template
              </Button>
            </div>
          </form>
        )}

        {/* Templates List */}
        <div className="divide-y divide-slate-800">
          {templates.map((tmpl) => {
            const isCurrent = tmpl.id === currentTemplateId;

            return (
              <div
                key={tmpl.id}
                className={`py-3.5 px-3 rounded-lg flex items-center justify-between gap-4 transition-all ${
                  isCurrent ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 truncate block">
                      {tmpl.name}
                    </span>
                    {tmpl.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        ACTIVE LIVE
                      </span>
                    )}
                    {!tmpl.is_active && tmpl.status === 'draft' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400 shrink-0">
                        DRAFT
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    Slug: {tmpl.slug} • Revisions: {tmpl.revisions_count || 0}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCurrent && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onSelectTemplate(tmpl.id);
                        onClose();
                      }}
                      className="border-slate-700 text-xs hover:border-amber-500"
                    >
                      Open in Builder
                    </Button>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-semibold text-amber-400 px-2 py-1">
                      Currently Editing
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(tmpl.id)}
                    title="Duplicate Template"
                    className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {!tmpl.is_active && (
                    <button
                      type="button"
                      onClick={() => handleDelete(tmpl.id)}
                      title="Delete Template"
                      className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
