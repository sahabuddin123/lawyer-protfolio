import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const AdminConfirmationDialog: React.FC<AdminConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}
            >
              {variant === 'danger' ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={variant === 'danger' ? 'primary' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className={
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm'
                : 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm'
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
