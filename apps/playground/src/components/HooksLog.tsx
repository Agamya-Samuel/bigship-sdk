'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { HookEvent } from '@/lib/execute-stream';
import { usePrivacyGuard } from '@/components/PrivacyGuard';
import { maskText } from '@/lib/privacy';
import { Activity } from 'lucide-react';

interface HooksLogProps {
  hooks: HookEvent[];
}

const typeColors: Record<string, string> = {
  beforeRequest: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  response: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  retry: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

export function HooksLog({ hooks }: HooksLogProps) {
  const { privacyEnabled } = usePrivacyGuard();

  if (hooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <Activity className="h-4 w-4 mr-2" />
          No hooks fired yet. Execute an SDK method to see events.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Event Hooks Log
          <Badge variant="secondary">{hooks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {hooks.map((hook, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-md border text-sm">
                <Badge className={typeColors[hook.type] || 'bg-muted'} variant="secondary">
                  {hook.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  {hook.endpoint && (
                    <p className="font-mono text-xs truncate">
                      {hook.method && <span className="text-muted-foreground">{hook.method} </span>}
                      {maskText(hook.endpoint, privacyEnabled)}
                    </p>
                  )}
                  {hook.duration !== undefined && (
                    <p className="text-xs text-muted-foreground">{hook.duration}ms</p>
                  )}
                  {hook.error && (
                    <p className="text-xs text-destructive">{maskText(hook.error, privacyEnabled)}</p>
                  )}
                  {hook.attempt !== undefined && (
                    <p className="text-xs text-muted-foreground">Attempt {hook.attempt}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(hook.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
