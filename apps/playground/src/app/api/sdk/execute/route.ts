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
  getWalletBalance:          (c) => c.getWalletBalance(),
  getCourierList:            (c, p) => c.getCourierList(p[0] as 'b2c' | 'b2b'),
  getCourierTransporterList: (c, p) => c.getCourierTransporterList(p[0] as number),
  getPaymentCategory:        (c, p) => c.getPaymentCategory(p[0] as 'b2c' | 'b2b'),
  addWarehouse:              (c, p) => c.addWarehouse(p[0] as any),
  getWarehouseList:          (c, p) => c.getWarehouseList(p[0] as number, p[1] as number),
  addSingleOrder:            (c, p) => c.addSingleOrder(p[0] as any),
  addHeavyOrder:             (c, p) => c.addHeavyOrder(p[0] as any),
  manifestSingle:            (c, p) => c.manifestSingle(p[0] as any),
  manifestHeavy:             (c, p) => c.manifestHeavy(p[0] as any),
  getShippingRates:          (c, p) => c.getShippingRates(p[0] as string, p[1] as any, p[2] as string),
  cancelShipments:           (c, p) => c.cancelShipments(p[0] as string[]),
  calculateRate:             (c, p) => c.calculateRate(p[0] as any),
  getAWB:                    (c, p) => c.getAWB(p[0] as string),
  getShipmentFile:           (c, p) => c.getShipmentFile(p[0] as 2 | 3, p[1] as string),
  getShipmentData:           (c, p) => c.getShipmentData(p[0] as any, p[1] as string),
  trackShipment:             (c, p) => c.trackShipment(p[0] as string, p[1] as 'awb' | 'lrn'),
  manifestAndGetAWB:         (c, p) => c.manifestAndGetAWB(p[0] as string, p[1] as number),
  getShipmentDetails:        (c, p) => c.getShipmentDetails(p[0] as string),
  createAndFinalizeShipment: (c, p) => c.createAndFinalizeShipment(p[0] as any),
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
    if (e.invoiceId !== undefined) obj.invoiceId = e.invoiceId;
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
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded', retryAfter: rateLimit.resetAt },
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
      { success: false, error: `Unknown method: ${method}` },
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
          success: true,
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
          success: false,
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
