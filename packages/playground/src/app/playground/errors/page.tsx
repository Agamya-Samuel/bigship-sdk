'use client';

import { useState } from 'react';
import { ResponseViewer } from '@/components/ResponseViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Play, AlertTriangle, ShieldAlert, WifiOff, FileWarning, Copy } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';
import { usePlayground } from '@/components/PlaygroundProvider';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';

interface ErrorType {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const ERROR_TYPES: ErrorType[] = [
  { key: 'validation', label: 'Validation Error', description: 'Invalid input fields that fail schema validation.', icon: FileWarning },
  { key: 'duplicateInvoice', label: 'Duplicate Invoice', description: 'An order with the same invoice ID already exists.', icon: Copy },
  { key: 'auth', label: 'Authentication Error', description: 'Invalid credentials or expired access token.', icon: ShieldAlert },
  { key: 'network', label: 'Network Error', description: 'Connection timeout or DNS resolution failure.', icon: WifiOff },
  { key: 'api', label: 'API Error', description: 'Generic BigShip API error with status code.', icon: AlertTriangle },
];

export default function ErrorsPage() {
  const { isLoading: globalLoading } = usePlayground();
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { response?: any; error?: any; codeSnippet?: string; duration?: number; hooks?: HookEvent[] }>>({});

  const simulate = async (errorType: string) => {
    setLoadingType(errorType);
    const start = Date.now();
    try {
      const res = await fetch('/api/sdk/simulate-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorType }),
      });
      const data = await res.json();
      setResults(prev => ({
        ...prev,
        [errorType]: { response: data, duration: Date.now() - start },
      }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [errorType]: { error: { message: (err as Error).message }, duration: Date.now() - start },
      }));
    } finally {
      setLoadingType(null);
    }
  };

  const isBusy = (key: string) => loadingType === key;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Error Types
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Simulate and inspect the different error classes returned by the BigShip SDK.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ERROR_TYPES.map(({ key, label, description, icon: Icon }) => {
          const result = results[key];
          return (
            <Card key={key} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">{description}</p>

                <Button
                  onClick={() => simulate(key)}
                  disabled={isBusy(key) || globalLoading}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isBusy(key) ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                  Simulate
                </Button>

                {result && !result.error && result.response && (
                  <div className="space-y-2 pt-2 border-t">
                    {result.response.className && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Class:</span>
                        <code className="text-xs font-mono">{result.response.className}</code>
                      </div>
                    )}
                    {result.response.name && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Name:</span>
                        <code className="text-xs font-mono">{result.response.name}</code>
                      </div>
                    )}
                    {result.response.message && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Message:</span>
                        <span className="text-xs">{result.response.message}</span>
                      </div>
                    )}
                    {result.response.statusCode !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-xs">{result.response.statusCode}</Badge>
                      </div>
                    )}
                    {result.response.code && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Code:</span>
                        <Badge variant="outline" className="text-xs">{result.response.code}</Badge>
                      </div>
                    )}
                    {result.response.validationErrors && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Validation Errors:</span>
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                          {JSON.stringify(result.response.validationErrors, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.response.invoiceId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Invoice ID:</span>
                        <code className="text-xs font-mono">{result.response.invoiceId}</code>
                      </div>
                    )}

                    {result.response.typeGuards && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Type Guards:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(result.response.typeGuards).map(([name, value]) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className={
                                value
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }
                            >
                              {name}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.response.helpers && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Helpers:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(result.response.helpers).map(([name, value]) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className={
                                value
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }
                            >
                              {name}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.duration && (
                      <p className="text-xs text-muted-foreground">{result.duration}ms</p>
                    )}
                  </div>
                )}

                {result?.error && (
                  <div className="pt-2 border-t">
                    <ResponseViewer data={result.error} success={false} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
