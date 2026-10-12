import React, { useState } from 'react';
import { Modal } from '@/components/modals/Modal';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Calendar, User } from 'lucide-react';
import type { FooterRevision } from '../types';

interface RevisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: FooterRevision[];
  currentVersion?: number;
  onRestore: (revisionId: number) => Promise<void>;
}

export const RevisionsModal: React.FC<RevisionsModalProps> = ({
  isOpen,
  onClose,
  revisions,
  currentVersion: _currentVersion,
  onRestore,
}) => {
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = async (revId: number) => {
    try {
      setRestoringId(revId);
      await onRestore(revId);
      onClose();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Footer Revisions History"
      description="Inspect version snapshots and restore any previous footer layout."
      size="lg"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {revisions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No past revisions recorded for this template yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="py-3.5 flex items-start justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      v{rev.version}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {rev.change_summary || `Revision version ${rev.version}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(rev.created_at).toLocaleString()}
                    </span>
                    {rev.creator && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {rev.creator.name}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={restoringId !== null}
                    isLoading={restoringId === rev.id}
                    onClick={() => handleRestore(rev.id)}
                    className="border-slate-700 hover:border-amber-500 text-slate-200 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1.5" />
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
