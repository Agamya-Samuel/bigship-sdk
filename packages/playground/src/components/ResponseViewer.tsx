'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ResponseViewerProps {
  data: unknown;
  success?: boolean;
  label?: string;
}

export function ResponseViewer({ data, success, label }: ResponseViewerProps) {
  const [expanded, setExpanded] = useState(true);

  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const preview = typeof data === 'string' ? data : JSON.stringify(data);

  return (
    <div className="rounded-lg border">
      <div
        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="text-sm font-medium">{label || 'Response'}</span>
        {success !== undefined && (
          <Badge variant={success ? 'default' : 'destructive'} className="ml-auto">
            {success ? 'Success' : 'Error'}
          </Badge>
        )}
      </div>
      {expanded && (
        <div className="border-t px-4 py-3">
          <pre className="overflow-x-auto text-sm leading-relaxed max-h-[500px] overflow-y-auto">
            <code>{json}</code>
          </pre>
        </div>
      )}
      {!expanded && preview.length > 100 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground truncate">{preview.substring(0, 120)}...</p>
        </div>
      )}
    </div>
  );
}
