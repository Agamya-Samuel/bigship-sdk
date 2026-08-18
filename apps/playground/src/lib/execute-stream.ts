export interface HookEvent {
  type: 'beforeRequest' | 'response' | 'error' | 'retry';
  endpoint?: string;
  method?: string;
  duration?: number;
  attempt?: number;
  error?: string;
  statusCode?: number;
  timestamp: number;
}

export interface ExecuteResult {
  success: true;
  result: unknown;
  codeSnippet: string;
  duration: number;
}

export interface ExecuteError {
  success: false;
  error: {
    name: string;
    message: string;
    statusCode?: number;
    code?: string;
    validationErrors?: Record<string, string[]>;
    invoiceId?: string;
    requestId?: string;
    endpoint?: string;
  };
  codeSnippet: string;
  duration: number;
}

export interface StreamCallbacks {
  onHook?: (event: HookEvent) => void;
  onResult?: (data: ExecuteResult) => void;
  onError?: (data: ExecuteError) => void;
  onDone?: () => void;
  onRateLimit?: (retryAfter: number) => void;
}

interface ParsedEvents {
  parsed: Array<{ type: string; data: unknown }>;
  remaining: string;
}

function parseSSEBuffer(buffer: string): ParsedEvents {
  const events: Array<{ type: string; data: unknown }> = [];
  const lines = buffer.split('\n');
  let i = 0;
  let currentEvent = '';
  let currentData = '';

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('event: ')) {
      currentEvent = line.slice(7).trim();
    } else if (line.startsWith('data: ')) {
      currentData = line.slice(6);
    } else if (line === '' && currentEvent) {
      try {
        events.push({ type: currentEvent, data: JSON.parse(currentData) });
      } catch {
        events.push({ type: currentEvent, data: currentData });
      }
      currentEvent = '';
      currentData = '';
    }
    i++;
  }

  const lastNewline = buffer.lastIndexOf('\n');
  const remaining = lastNewline >= 0 ? buffer.slice(lastNewline + 1) : '';

  return { parsed: events, remaining };
}

export interface ExecuteRequest {
  requestId: string;
  credentials: {
    baseURL: string;
    userName: string;
    password: string;
    accessKey: string;
  };
  method: string;
  params: unknown[];
}

export async function executeStream(
  body: ExecuteRequest,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch('/api/sdk/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    const data = await response.json();
    callbacks.onRateLimit?.(data.retryAfter || 60);
    throw new Error('Rate limit exceeded');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null — streaming not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = parseSSEBuffer(buffer);
      buffer = events.remaining;

      for (const event of events.parsed) {
        switch (event.type) {
          case 'hook':
            callbacks.onHook?.(event.data as HookEvent);
            break;
          case 'result':
            callbacks.onResult?.(event.data as ExecuteResult);
            break;
          case 'error':
            callbacks.onError?.(event.data as ExecuteError);
            break;
          case 'done':
            callbacks.onDone?.();
            return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
