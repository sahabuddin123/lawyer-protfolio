import React, { useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';

export interface FileInputProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  helperText?: string;
  error?: string;
  onFileSelect?: (file: File | null) => void;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  helperText,
  error,
  onFileSelect,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFileError(`File size exceeds maximum ${maxSizeMB}MB limit`);
        setSelectedFile(null);
        onFileSelect?.(null);
        return;
      }
      setFileError(null);
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect?.(null);
  };

  const effectiveError = error || fileError;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary mb-2 select-none">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        id="legal-file-upload"
      />

      {!selectedFile ? (
        <label
          htmlFor="legal-file-upload"
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-surface transition-all cursor-pointer group text-center',
            effectiveError
              ? 'border-status-error/60 hover:border-status-error'
              : 'border-border-subtle hover:border-gold-border hover:bg-surface-elevated'
          )}
        >
          <UploadCloud className="w-8 h-8 text-gold-primary mb-2 transition-transform group-hover:-translate-y-0.5" />
          <span className="text-sm font-medium text-text-primary group-hover:text-gold-hover">
            Attach Case Document or Brief
          </span>
          <span className="text-xs text-text-subtle mt-1 font-mono">
            PDF, DOCX up to {maxSizeMB}MB
          </span>
        </label>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-surface-elevated border border-gold-border/40 rounded-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <File className="w-5 h-5 text-gold-primary shrink-0" />
            <div className="truncate">
              <span className="text-sm text-text-primary block truncate font-medium">
                {selectedFile.name}
              </span>
              <span className="text-xs text-text-subtle font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded text-text-subtle hover:text-status-error transition-colors"
            aria-label="Remove attached document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {effectiveError && (
        <p role="alert" className="mt-1.5 text-xs text-status-error flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{effectiveError}</span>
        </p>
      )}

      {!effectiveError && helperText && (
        <p className="mt-1.5 text-xs text-text-subtle">{helperText}</p>
      )}
    </div>
  );
};
