import React from 'react';
import { cn } from '@/utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Encountered Transmission Issue',
  message = 'Unable to securely retrieve the requested judicial data records. Please verify connectivity.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'p-10 text-center rounded-lg border border-status-error/30 bg-surface flex flex-col items-center justify-center max-w-lg mx-auto my-8',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-status-error/10 border border-status-error/30 flex items-center justify-center text-status-error mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-serif-editorial font-bold text-text-primary mb-2">
        {title}
      </h3>

      <p className="text-sm text-text-muted leading-relaxed max-w-sm mb-6">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};
