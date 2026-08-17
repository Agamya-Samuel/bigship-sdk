'use client';

import { useState } from 'react';
import { usePlayground, type BigshipCredentials } from '@/components/PlaygroundProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, LogOut } from 'lucide-react';

export function CredentialGate({ children }: { children: React.ReactNode }) {
  const { credentials, setCredentials, clearCredentials, hydrated } = usePlayground();

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
            <span className="truncate max-w-[200px]">{credentials.userName}</span>
            <span className="text-xs">· {credentials.baseURL}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCredentials} className="h-7 text-xs">
            <LogOut className="h-3 w-3 mr-1" />
            Disconnect
          </Button>
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
    baseURL: 'https://api.bigship.in',
    userName: '',
    password: '',
    accessKey: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

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
          method: 'getWalletBalance',
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
              if (eventType === 'error' || (eventType === 'result' && !parsed.success)) {
                validationError = parsed.error?.message || parsed.message || 'Authentication failed';
              }
              if (eventType === 'result' && parsed.success) {
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

  const update = (key: keyof BigshipCredentials, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
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
                placeholder="https://api.bigship.in"
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
