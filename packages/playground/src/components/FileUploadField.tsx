'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function FileUploadField({ value, onChange, required }: FileUploadFieldProps) {
  const [mode, setMode] = useState<'file' | 'paste'>(value ? 'paste' : 'file');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError('File must be under 5MB');
      return;
    }

    if (!['application/pdf', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Only PDF and JPEG files are accepted');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      onChange(dataUri);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange('');
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('file')}
        >
          <Upload className="h-3.5 w-3.5 mr-1" />
          Upload File
        </Button>
        <Button
          type="button"
          variant={mode === 'paste' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('paste')}
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          Paste Data URI
        </Button>
      </div>

      {mode === 'file' ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="flex-1"
          />
          {fileName && (
            <Badge variant="secondary" className="gap-1">
              {fileName}
              <button onClick={handleClear} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="data:application/pdf;base64,JVBERi0xLjQKJ..."
            value={value}
            onChange={(e) => { onChange(e.target.value); setError(null); }}
            className="flex-1 font-mono text-xs"
          />
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && !error && (
        <p className="text-xs text-muted-foreground truncate">
          {value.substring(0, 60)}...
        </p>
      )}
    </div>
  );
}
