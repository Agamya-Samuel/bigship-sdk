'use client';

import { useState } from 'react';
import { usePlayground, type BigshipCredentials } from '@/components/PlaygroundProvider';
import { usePrivacyGuard } from '@/components/PrivacyGuard';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { maskCredential } from '@/lib/privacy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Loader2, Lock, LogOut, ChevronDown } from 'lucide-react';

export function CredentialGate({ children }: { children: React.ReactNode }) {
  const { credentials, setCredentials, clearCredentials, hydrated } = usePlayground();
  const { privacyEnabled } = usePrivacyGuard();

  // During SSR and before useEffect hydrates sessionStorage, both server and
  // client render the same skeleton — no hydration mismatch.
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (credentials) {
    return (
      <div>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className={cn('truncate max-w-[200px]', privacyEnabled && 'blur-sm select-none')}>
              {maskCredential(credentials.userName, privacyEnabled)}
            </span>
            <span className="text-xs">· {credentials.baseURL}</span>
          </div>
          <div className="flex items-center gap-1">
            <PrivacyToggle />
            <Button variant="ghost" size="sm" onClick={clearCredentials} className="h-7 text-xs">
              <LogOut className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <CredentialForm setCredentials={setCredentials} />;
}

function CredentialForm({
  setCredentials,
}: {
  setCredentials: (creds: BigshipCredentials | null) => void;
}) {
  const [form, setForm] = useState<BigshipCredentials>({
    baseURL: 'https://api.bigship.direct',
    userName: '',
    password: '',
    accessKey: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const update = <K extends keyof BigshipCredentials>(key: K, value: BigshipCredentials[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const parseStatusCodes = (raw: string): number[] | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    return trimmed.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  };

  const formatStatusCodes = (codes?: number[]): string => {
    if (!codes || codes.length === 0) return '';
    return codes.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidating(true);

    try {
      // Validate credentials via direct fetch — bypasses context to avoid
      // the race condition where setCredentials unmounts this form mid-flight.
      const requestId = crypto.randomUUID();
      const response = await fetch('/api/sdk/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          credentials: form,
          method: 'getProfile',
          params: [],
        }),
      });

      if (response.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || `Server error (${response.status})`);
        return;
      }

      // Parse SSE stream to find result or error
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let validationError: string | null = null;
      let validated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        let eventType = '';
        let eventData = '';
        const processedLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6);
          } else if (line === '' && eventType) {
            try {
              const parsed = JSON.parse(eventData);
              if (eventType === 'error' || (eventType === 'result' && !parsed.status)) {
                validationError = parsed.error?.message || parsed.message || 'Authentication failed';
              }
              if (eventType === 'result' && parsed.status) {
                validated = true;
              }
            } catch {
              // ignore parse errors
            }
            eventType = '';
            eventData = '';
          }
          processedLines.push(line);
        }
        buffer = lines[lines.length - 1] || '';
      }

      if (validationError) {
        setError(validationError);
        return;
      }

      // Only set credentials AFTER successful validation
      setCredentials(form);
    } catch (err) {
      setError((err as Error).message || 'Connection failed');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Connect to BigShip
          </CardTitle>
          <CardDescription>
            Enter your BigShip API credentials to start testing. Credentials are stored in session storage only and never leave your browser except to the BigShip API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="baseURL">Base URL</Label>
              <Input
                id="baseURL"
                value={form.baseURL}
                onChange={(e) => update('baseURL', e.target.value)}
                placeholder="https://api.bigship.direct"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="userName">Username / Email</Label>
              <Input
                id="userName"
                value={form.userName}
                onChange={(e) => update('userName', e.target.value)}
                placeholder="your-email@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                value={form.accessKey}
                onChange={(e) => update('accessKey', e.target.value)}
                placeholder="your-access-key"
                required
              />
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <Button type="button" variant="outline" className="w-full" onClick={() => setAdvancedOpen(!advancedOpen)}>
                Advanced Configuration
                <ChevronDown className={cn('h-4 w-4 ml-auto transition-transform', advancedOpen && 'rotate-180')} />
              </Button>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min={1000}
                      step={1000}
                      value={form.timeout ?? ''}
                      onChange={(e) => update('timeout', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      min={0}
                      value={form.maxRetries ?? ''}
                      onChange={(e) => update('maxRetries', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                    <Input
                      id="retryDelay"
                      type="number"
                      min={0}
                      step={100}
                      value={form.retryDelay ?? ''}
                      onChange={(e) => update('retryDelay', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxRetryDelay">Max Retry Delay (ms)</Label>
                    <Input
                      id="maxRetryDelay"
                      type="number"
                      min={0}
                      step={1000}
                      value={form.maxRetryDelay ?? ''}
                      onChange={(e) => update('maxRetryDelay', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="30000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tokenTtlMs">Token TTL (ms)</Label>
                    <Input
                      id="tokenTtlMs"
                      type="number"
                      min={60000}
                      step={60000}
                      value={form.tokenTtlMs ?? ''}
                      onChange={(e) => update('tokenTtlMs', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="3300000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="retryOnStatusCodes">Retry Status Codes</Label>
                    <Input
                      id="retryOnStatusCodes"
                      value={formatStatusCodes(form.retryOnStatusCodes)}
                      onChange={(e) => update('retryOnStatusCodes', parseStatusCodes(e.target.value))}
                      placeholder="408, 429, 500, 502, 503, 504"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      id="enableDetailedLogging"
                      type="checkbox"
                      checked={form.enableDetailedLogging ?? false}
                      onChange={(e) => update('enableDetailedLogging', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="enableDetailedLogging" className="text-sm font-normal">
                      Enable detailed logging
                    </Label>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={validating}>
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating credentials...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
