# @agamya/bigship-sdk

[![CI](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@agamya/bigship-sdk)](https://www.npmjs.com/package/@agamya/bigship-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org)

A typed, batteries-included TypeScript SDK for the [Bigship.direct](https://bigship.direct) Unified Outbound API — warehouses, orders, rates, couriers, tracking, manifests, documents, and wallet, all behind one client.

> **Disclaimer:** Community project based on publicly available Bigship API documentation. Not officially affiliated with Bigship.direct.

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Why this SDK](#why-this-sdk)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [The Workflow Builder](#the-workflow-builder)
- [Error Handling](#error-handling)
- [Hooks and Logging](#hooks-and-logging)
- [Repository Structure](#repository-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Versioning and Compatibility](#versioning-and-compatibility)
- [License](#license)

## Install

```bash
npm install @agamya/bigship-sdk
```

Requires Node.js for two different audiences, depending on how you use the repo:

**Published package** (`@agamya/bigship-sdk` on npm) — **Node ≥ 18.0.0**
The SDK source targets ES2022 and has no runtime dependencies on Node 19+ features. CI matrix is `[18, 20, 22]` and proves the floor + forward compatibility.

**Monorepo** (this repo, including `apps/docs` and `apps/playground`) — **Node ≥ 22.12.0**
Astro 7 hard-requires Node 22.12+, so running `npm install` at the repo root requires it. Per-app floors are declared explicitly in each `apps/*/package.json` (`>=22.12.0` for docs, `>=20.9.0` for playground), matching Astro 7 and Next 16's minimums respectively.

## Quick Start

```typescript
import { BigshipClient } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// Any call triggers an automatic login on the first request; the token is
// cached for ~55 minutes and refreshed transparently.
const profile = await client.getProfile();
console.log('Wallet balance:', profile.data?.userWallet?.Balance);
```

That's the whole hook — pass credentials once, the SDK handles token lifecycle, schema validation, retries, and structured errors on every subsequent call.

## Why this SDK

- **Type-safe end to end** — every request and response is described by a [Zod](https://zod.dev) schema and exported as a TS type, so a malformed payload fails at compile-time or at the network edge rather than deep in a callback.
- **Auto-authentication** — login runs lazily on the first request, the access token is cached in-memory with a configurable TTL (default 55 min; the real token lifetime is shorter, so the SDK refreshes well before expiry).
- **Retry with backoff** — exponential backoff with full jitter for transient failures (`408`, `429`, `500`, `502`, `503`, `504` by default). Bounded by `maxRetries`/`retryDelay`/`maxRetryDelay`. Note: only the status codes you whitelist are retried — `4xx` like `400` and `404` are not, by design.
- **Event hooks** — `onBeforeRequest`, `onResponse`, `onError`, and `onRetry` for tracing, metrics, and audit logging. `onBeforeRequest` errors propagate; the other three are fire-and-forget.
- **Pluggable logger** — bring your own Winston, pino, or any `LoggerAdapter`-shaped object; falls back to `console` if you don't.
- **15 client methods** covering every endpoint on the Unified Outbound API — no helper methods that hide what the API actually does.
- **Workflow builder** — `ShipmentWorkflow` chains `create → withCourier → place → finalize` when you want a single awaited call instead of five.

## Configuration

```typescript
import { BigshipClient } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  // Required
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,

  // Optional — every option has a default
  timeout: 15_000,                      // ms per request
  enableDetailedLogging: false,         // verbose SDK-internal logs

  maxRetries: 3,                        // total retries per request
  retryDelay: 1_000,                    // ms base delay
  maxRetryDelay: 30_000,                // ms cap (full-jitter formula)
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],

  tokenTtlMs: 55 * 60 * 1000,            // cached token lifetime (server-side expiry is < this)

  onBeforeRequest, onResponse, onError, onRetry, // hooks — see below
  loggerAdapter,                        // custom logger
});
```

Every public method also accepts a per-call `RequestOptions` to override `timeout` and `signal` (for cancellation):

```typescript
const ac = new AbortController();
ac.abort(); // cancels mid-flight

const rate = await client.calculateRate(payload, { timeout: 5_000, signal: ac.signal });
```

## Authentication

There is no `login()` method. The first call triggers `POST api/outbound/login` with your credentials, the response's access token is cached in-memory, and every subsequent request attaches it. When the cached token is within 30 seconds of expiry, the SDK refreshes it transparently and retries the in-flight request once if it returns `401` or `403`. Credentials are never logged.

Keep your credentials out of source — load them from environment variables or a secrets manager:

```bash
# .env (never commit)
BIGSHIP_USERNAME=...
BIGSHIP_PASSWORD=...
BIGSHIP_ACCESS_KEY=...
```

## API Reference

All methods return `Promise<ApiResponse<T>>` where `ApiResponse<T> = { status: boolean; message: string, status_code: number, data: T | null }`. Use the `isSuccessResponse` / `isFailedResponse` type guards or check `status === true` directly.

| Method | HTTP | Endpoint |
|---|---|---|
| `getProfile(options?)` | GET | `api/outbound/profile` |
| `saveWarehouse(payload, options?)` | POST | `api/outbound/save-warehouse-data` |
| `getWarehouseList(params, options?)` | GET | `api/outbound/get-warehouse-list` |
| `updateWarehouse(payload, options?)` | POST | `api/outbound/edit-warehouse-data` |
| `getPackageTypes(options?)` | GET | `api/outbound/hyperlocal/get-packages-list` |
| `getPaymentModes(segmentType, options?)` | GET | `api/outbound/get-payment-mode` |
| `getRiskTypes(options?)` | GET | `api/outbound/domestic/risk-types` |
| `calculateRate(payload, options?)` | POST | `api/outbound/user-rate-calculator` |
| `createOrder(payload, options?)` | POST | `api/outbound/create-order` |
| `getServiceableCouriers(orderId, options?)` | POST | `api/outbound/courier-wise-shipment-cost` |
| `placeOrder(payload, options?)` | POST | `api/outbound/place-order` |
| `cancelOrder(orderId, options?)` | POST | `api/outbound/cancel-order` |
| `trackOrder(orderId, options?)` | GET | `api/outbound/track-order` |
| `getOrderDetail(orderId, options?)` | GET | `api/outbound/order-shipment-details` |
| `downloadDocument(orderId, documentType, options?)` | GET | `api/outbound/download-shipment-documents` |

`createOrder` is a discriminated union on `segment_type` (`'domestic_b2c' | 'domestic_b2b' | 'hyperlocal'`) — TypeScript narrows the payload type for you. `documentType` accepts `'invoice' | 'label' | 'ewaybill' | 'manifest'`.

Three utilities ship alongside the client (from `@agamya/bigship-sdk/utils`, or as the `BigshipUtils` namespace):

- `fileToBase64DataURI(file: File): Promise<string>` — browser-only, requires `FileReader`. PDF/JPEG only.
- `isValidBase64DataURI(value: string): boolean`
- `calculateCollectableAmount(paymentType, codAmount): number`
- `formatZodErrors(zodErrors): Record<string, string[]>` — for surfacing validation failures.

## The Workflow Builder

For the B2C lifecycle — create a draft order, pick a courier (or let the SDK pick the cheapest available), place it, and fetch the AWB — the manual version of `createOrder`/`getServiceableCouriers`/`placeOrder`/`getOrderDetail` is a four-call song. `ShipmentWorkflow` condenses it:

```typescript
import { BigshipClient, ShipmentWorkflow } from '@agamya/bigship-sdk';

const client = new BigshipClient({ /* ...config... */ });

const workflow = await new ShipmentWorkflow(client).create({
  segment_type: 'domestic_b2c',
  // ...order payload
});

workflow.withServiceableCourier(0);  // sync; or `.withCourier(courierId)`
await workflow.place();

const { orderId, orderDetail } = await workflow.finalize();
console.log('AWB:', orderDetail?.getOrderDetails.AwbNumber);
```

The chain steps are: `create(order)` → `.withCourier(id)` *or* `.withServiceableCourier(index)` → `.place({ riskTypeId? })` → `.finalize()`. If you'd rather not chain, `.execute(order, courierId?)` runs the full pipeline in one awaited call. `place()` defaults `riskTypeId` to `'2'` (Owner Risk).

## Error Handling

Every thrown error is a `BigshipError` (or one of its subclasses) carrying the HTTP `statusCode`, an internal `code`, the original `apiResponse`, and any `validationErrors`. Catch them with `try/catch` or narrow them with the exported type guards:

```typescript
import {
  BigshipError,
  isBigshipValidationError,
  isBigshipAuthError,
  isBigshipNetworkError,
  isFailedResponse,
} from '@agamya/bigship-sdk';

try {
  const res = await client.createOrder(payload);
  if (isFailedResponse(res)) throw new Error(res.message);
} catch (err) {
  if (isBigshipValidationError(err)) {
    console.error('Bad input:', err.validationErrors);   // Record<string, string[]>
  } else if (isBigshipAuthError(err)) {
    console.error('Credentials rejected');
  } else if (isBigshipNetworkError(err)) {
    console.error('Network down:', err.message);
  } else if (err instanceof BigshipError) {
    console.error('Bigship API error:', err.code, err.statusCode);
  } else {
    throw err;
  }
}
```

Error hierarchy:

- **`BigshipError`** — base; has `statusCode` (default `0`), `code?`, `apiResponse?`, `validationErrors?`, `traceId?`. Methods: `isValidationError()`, `isRateLimitError()`, `isAuthError()`.
- **`BigshipApiError`** — adds `requestId?`, `endpoint?`, `responseBody?`.
- **`BigshipValidationError`** — `statusCode: 400`, `code: 'VALIDATION_ERROR'`, adds `validationErrors`.
- **`BigshipAuthError`** — `statusCode: 401`, `code: 'AUTH_ERROR'`.
- **`BigshipNetworkError`** — `statusCode: -1`, `code: 'NETWORK_ERROR'`.
- **`BigshipDuplicateInvoiceError`** — `statusCode: 409`, `code: 'DUPLICATE_INVOICE'`, adds `invoiceId`. (Reserved for future use.)

## Hooks and Logging

```typescript
import type { BeforeRequestHook, ResponseHook, ErrorHook, RetryHook, LoggerAdapter } from '@agamya/bigship-sdk';

const onBeforeRequest: BeforeRequestHook = (config) => {
  console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
  // returning the config (or a transformed version) is required;
  // throwing here will fail the request — unlike the other hooks.
  return config;
};

const onResponse: ResponseHook = (response, ctx) => {
  metrics.histogram('bigship.latency', ctx.duration ?? 0);
};

const onError: ErrorHook = (error, ctx) => {
  sentry.captureException(error, { extra: { endpoint: ctx.endpoint, requestId: ctx.requestId } });
};

const onRetry: RetryHook = (attempt, error, ctx) => {
  console.warn(`retry #${attempt} on ${ctx.endpoint} after ${error.code}`);
};

const loggerAdapter: LoggerAdapter = winstonLogger; // any object with optional debug/info/warn/error methods

const client = new BigshipClient({
  // ...base config...
  loggerAdapter,
  onBeforeRequest,
  onResponse,
  onError,
  onRetry,
});
```

`RequestContext = { endpoint, method, requestId?, attempt?, startTime, duration? }` is passed to every hook so you can correlate without string parsing.

## Repository Structure

```
bigship-sdk/
├── packages/sdk/        @agamya/bigship-sdk (npm package)
├── apps/playground/     Interactive playground (Next.js)
├── apps/docs/           Documentation site (Astro + Starlight)
└── tooling/             Build tooling (TypeDoc config, etc.)
```

## Documentation

| Resource | Description |
|---|---|
| [BigShip SDK Playground](https://bigship-sdk.vercel.app) | Interactive playground — try the SDK against real credentials in your browser. |
| [BigShip SDK Docs](https://bigship-sdk.pages.dev) | Full API docs, guides, troubleshooting. |
| `apps/docs/` (local) | `npm run docs:dev` — runs the docs site locally for offline reading. |
| `apps/playground/` (local) | `npm run dev:playground` — runs the playground locally. |

> Both hosted URLs above are external deployments managed outside this repo; if either link is unreachable, run the equivalent `apps/*` workspace locally. The repo itself does not include the deploy workflows.

## Development

```bash
git clone https://github.com/Agamya-Samuel/bigship-sdk.git
cd bigship-sdk
npm install

# Build the SDK into packages/sdk/dist
npm run build:sdk

# Type-check everything
npm run typecheck

# Unit tests
npm test

# Integration tests (requires Bigship credentials in env)
BIGSHIP_USERNAME=... BIGSHIP_PASSWORD=... BIGSHIP_ACCESS_KEY=... npm run test:integration

# Build everything (SDK + playground + docs)
npm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow (conventional commits, PR conventions, workspace layout).

## Versioning and Compatibility

This package follows [Semantic Versioning](https://semver.org/). The current major is **v3** and targets the Bigship *Unified Outbound API*. The 2.x line targeted the legacy *External Outbound API* and is no longer maintained; upgrading requires migrating request payloads (notably `createOrder` with `segment_type: 'domestic_b2c' | 'domestic_b2b' | 'hyperlocal'` replacing the old `addSingleOrder`/`addHeavyOrder` helpers) — see [`packages/sdk/CHANGELOG.md`](./packages/sdk/CHANGELOG.md) for the full migration notes.

## License

[MIT](./LICENSE) — Copyright (c) Agamya Samuel.
