import { NextRequest, NextResponse } from 'next/server';
import { BigshipClient, type BigshipConfig } from '@agamya/bigship-sdk';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateCode } from '@/lib/code-gen';
import type { HookEvent } from '@/lib/execute-stream';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ExecuteRequestSchema = z.object({
  requestId: z.string(),
  credentials: z.object({
    baseURL: z.string().url(),
    userName: z.string().min(1),
    password: z.string().min(1),
    accessKey: z.string().min(1),
  }),
  method: z.string().min(1),
  params: z.array(z.unknown()).default([]),
});

const METHOD_MAP: Record<string, (c: BigshipClient, p: unknown[]) => Promise<unknown>> = {
  // Profile
  getProfile:                  (c) => c.getProfile(),

  // Wallet
  getWalletBalance:           (c) => c.getWalletBalance(),

  // Warehouse
  saveWarehouse:              (c, p) => c.saveWarehouse(p[0] as any),
  getWarehouseList:           (c, p) => c.getWarehouseList(p[0] as any),
  updateWarehouse:            (c, p) => c.updateWarehouse(p[0] as any),

  // Reference Data
  getPackageTypes:            (c) => c.getPackageTypes(),
  getPaymentModes:            (c, p) => c.getPaymentModes(p[0] as 'hyperlocal' | 'domestic_b2c' | 'domestic_b2b'),
  getRiskTypes:               (c) => c.getRiskTypes(),

  // Rate Calculator
  calculateRate:              (c, p) => c.calculateRate(p[0] as any),

  // Order Lifecycle
  createOrder:                (c, p) => c.createOrder(p[0] as any),
  getServiceableCouriers:     (c, p) => c.getServiceableCouriers(p[0] as string),
  placeOrder:                 (c, p) => c.placeOrder(p[0] as any),
  cancelOrder:                (c, p) => c.cancelOrder(p[0] as string),

  // Tracking & Details
  trackOrder:                 (c, p) => c.trackOrder(p[0] as string),
  getOrderDetail:             (c, p) => c.getOrderDetail(p[0] as string),
  downloadDocument:           (c, p) => c.downloadDocument(p[0] as string, p[1] as any),
};

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    const obj: Record<string, unknown> = {
      name: err.name,
      message: err.message,
    };
    const e = err as any;
    if (e.statusCode !== undefined) obj.statusCode = e.statusCode;
    if (e.code !== undefined) obj.code = e.code;
    if (e.validationErrors !== undefined) obj.validationErrors = e.validationErrors;
    if (e.requestId !== undefined) obj.requestId = e.requestId;
    if (e.endpoint !== undefined) obj.endpoint = e.endpoint;
    if (e.responseBody !== undefined) obj.responseBody = e.responseBody;
    return obj;
  }
  return { name: 'UnknownError', message: String(err) };
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof ExecuteRequestSchema>;
  try {
    const raw = await req.json();
    body = ExecuteRequestSchema.parse(raw);
  } catch (err) {
    return NextResponse.json(
      { status: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { status: false, error: 'Rate limit exceeded', retryAfter: rateLimit.resetAt },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  }

  const { credentials, method, params } = body;

  if (!(method in METHOD_MAP)) {
    return NextResponse.json(
      { status: false, error: `Unknown method: ${method}` },
      { status: 400 }
    );
  }

  const hooks: HookEvent[] = [];

  const client = new BigshipClient({
    ...credentials,
    enableDetailedLogging: false,
    onBeforeRequest: (config) => {
      hooks.push({
        type: 'beforeRequest',
        endpoint: config.url,
        method: config.method?.toUpperCase(),
        timestamp: Date.now(),
      });
      return config;
    },
    onResponse: (_response, ctx) => {
      hooks.push({
        type: 'response',
        endpoint: ctx.endpoint,
        duration: ctx.duration,
        timestamp: Date.now(),
      });
    },
    onError: (error, ctx) => {
      hooks.push({
        type: 'error',
        endpoint: ctx.endpoint,
        error: error.message,
        statusCode: error.statusCode,
        timestamp: Date.now(),
      });
    },
    onRetry: (attempt, error, ctx) => {
      hooks.push({
        type: 'retry',
        attempt,
        endpoint: ctx.endpoint,
        error: error.message,
        timestamp: Date.now(),
      });
    },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const startTime = Date.now();

      try {
        const handler = METHOD_MAP[method];
        const result = await handler(client, params);
        const duration = Date.now() - startTime;

        // Flush any remaining hooks
        send('hook', { type: 'flush', hooks, timestamp: Date.now() });

        send('result', {
          status: true,
          result,
          codeSnippet: generateCode(method, params),
          duration,
          hooks,
        });
      } catch (err) {
        const duration = Date.now() - startTime;
        const errorData = serializeError(err);

        send('hook', { type: 'flush', hooks, timestamp: Date.now() });

        send('error', {
          status: false,
          error: errorData,
          codeSnippet: generateCode(method, params),
          duration,
          hooks,
        });
      }

      send('done', {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'X-RateLimit-Limit': '30',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.resetAt),
    },
  });
}
