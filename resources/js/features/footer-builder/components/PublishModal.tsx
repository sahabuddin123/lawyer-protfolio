import React, { useState } from 'react';
import { Modal } from '@/components/modals/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Send, AlertCircle } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  isPublishing: boolean;
  onPublish: (changeSummary: string) => Promise<void>;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  templateName,
  isPublishing,
  onPublish,
}) => {
  const [changeSummary, setChangeSummary] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPublish(changeSummary.trim() || 'Published updated layout');
    setChangeSummary('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Footer Template"
      description={`Activate "${templateName}" as the published global footer.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Production Activation</span>
            <p className="text-slate-300 leading-relaxed">
              Publishing will update the live public website atomically. A permanent revision snapshot will be created with your audit attribution.
            </p>
          </div>
        </div>

        <Input
          label="Change Summary / Audit Note"
          placeholder="e.g. Updated chamber contact hours and Supreme Court bar office"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isPublishing}
            className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Publish Now
          </Button>
        </div>
      </form>
    </Modal>
  );
};
