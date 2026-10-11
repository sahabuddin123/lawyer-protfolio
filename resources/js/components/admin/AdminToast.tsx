import React from 'react';
import { useToast as useFeedbackToast, ToastType } from '@/components/feedback/Toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export { useFeedbackToast as useAdminToast };

interface AdminToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const AdminToast: React.FC<AdminToastProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    error: 'border-rose-200 bg-rose-50/90 text-rose-950',
    info: 'border-amber-200 bg-amber-50/90 text-amber-950',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xs transition-all pointer-events-auto ${borders[type]} ${className}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs font-bold leading-tight uppercase tracking-wider">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-1 leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 p-1 rounded-md hover:bg-black/5"
          aria-label="Dismiss Notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
