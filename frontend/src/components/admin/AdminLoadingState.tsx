import React from 'react';
import { Loader2 } from 'lucide-react';

interface AdminLoadingStateProps {
  message?: string;
  className?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message = 'Loading judicial records...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4 border border-amber-200">
        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Retrieving synchronized database records</p>
    </div>
  );
};
