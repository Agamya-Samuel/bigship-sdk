'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { usePrivacyGuard } from '@/components/PrivacyGuard';
import { maskText } from '@/lib/privacy';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export function CodeSnippet({ code, language = 'typescript' }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const { privacyEnabled } = usePrivacyGuard();

  const displayCode = maskText(code, privacyEnabled);

  const handleCopy = async () => {
    // Always copy the original code, not the masked version
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border bg-muted/50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="ml-1.5 text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{displayCode}</code>
      </pre>
    </div>
  );
}
