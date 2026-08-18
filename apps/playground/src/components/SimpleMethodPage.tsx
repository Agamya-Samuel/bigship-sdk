'use client';

import { useState } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export function SimpleMethodPage({
  title,
  description,
  methodName,
  children,
  riskLevel = 'safe',
}: {
  title: string;
  description: string;
  methodName: string;
  children?: React.ReactNode;
  riskLevel?: 'safe' | 'warning' | 'danger';
}) {
  const { executeMethod, isLoading } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold font-mono">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {children}

      <Button
        onClick={async () => {
          setResponse(null);
          setError(null);
          const { result, error: err, codeSnippet: code, duration: dur, hooks: h } = await executeMethod(methodName, []);
          setResponse(result);
          setError(err);
          setCodeSnippet(code);
          setDuration(dur);
          setHooks(h);
        }}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
        Execute {title}
      </Button>

      {(response || error) && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className={response ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {response ? 'Success' : 'Error'}
            </span>
            {duration > 0 && <span className="text-muted-foreground">{duration}ms</span>}
          </div>
          {response && <ResponseViewer data={response} success />}
          {error && <ResponseViewer data={error} success={false} />}
          {codeSnippet && <CodeSnippet code={codeSnippet} />}
          {hooks.length > 0 && <HooksLog hooks={hooks} />}
        </div>
      )}
    </div>
  );
}
