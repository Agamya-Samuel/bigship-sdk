# @agamya/bigship-sdk

[![CI](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@agamya/bigship-sdk)](https://www.npmjs.com/package/@agamya/bigship-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org)

TypeScript SDK for the [Bigship.direct](https://bigship.direct) **Unified Outbound API** — warehouses, orders, rates, couriers, tracking, manifests, and documents, all behind one client.

> **Disclaimer:** Community project based on publicly available Bigship API documentation. Not officially affiliated with Bigship.direct. Legal contact: [legal@agamya.dev](mailto:legal@agamya.dev).

## Install

```bash
npm install @agamya/bigship-sdk
```

Requires Node.js ≥ 18.0.0 (CI-tested on Node 18, 20, 22). The published SDK targets ES2022 and has no runtime dependencies on Node 19+ features. If you're working inside the monorepo (e.g. running `apps/docs`), the repo root requires Node ≥ 22.12.0 because Astro 7 hard-requires it.

## Quick Start

```typescript
import { BigshipClient } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

const profile = await client.getProfile();
console.log('Wallet balance:', profile.data?.userWallet?.Balance);
```

Token caching, refresh, retry, and structured errors happen transparently — see the [repo README](https://github.com/Agamya-Samuel/bigship-sdk#readme) for the full configuration surface and error hierarchy.

## Features

- **Type-safe** — Zod schemas at every boundary, full TypeScript inference for requests and responses.
- **Auto-authentication** — login on first call, token cached in-memory with a configurable TTL, refreshed transparently on `401`/`403`.
- **Retry with backoff** — exponential backoff with full jitter for whitelisted status codes (`408`, `429`, `500`, `502`, `503`, `504` by default); all retry knobs are public client options.
- **Event hooks** — `onBeforeRequest`, `onResponse`, `onError`, `onRetry`. `onBeforeRequest` errors propagate; the others are fire-and-forget.
- **Pluggable logger** — bring your own `LoggerAdapter` (Winston, pino, custom, …); falls back to `console`.
- **15 client methods** covering every endpoint on the Unified Outbound API.
- **Sub-path exports** — tree-shakeable imports: `@agamya/bigship-sdk/core`, `./errors`, `./utils`, `./workflow`.
- **Workflow builder** — `ShipmentWorkflow` chains `create → withCourier → place → finalize` for the B2C lifecycle.

## API Reference

All methods return `Promise<ApiResponse<T>>` with `{ status, message, status_code, data }`. Each accepts an optional `RequestOptions = { timeout?, signal? }` for cancellation and per-call timeouts.

| Method | Description | Endpoint |
|---|---|---|
| `getProfile()` | Profile + wallet balance | `GET api/outbound/profile` |
| `saveWarehouse(payload)` | Create warehouse | `POST api/outbound/save-warehouse-data` |
| `getWarehouseList(params)` | List warehouses (paginated) | `GET api/outbound/get-warehouse-list` |
| `updateWarehouse(payload)` | Update warehouse | `POST api/outbound/edit-warehouse-data` |
| `getPackageTypes()` | List hyperlocal package types | `GET api/outbound/hyperlocal/get-packages-list` |
| `getPaymentModes(segmentType)` | List payment modes by segment | `GET api/outbound/get-payment-mode` |
| `getRiskTypes()` | List risk types | `GET api/outbound/domestic/risk-types` |
| `calculateRate(payload)` | Rate calculator | `POST api/outbound/user-rate-calculator` |
| `createOrder(payload)` | Create order (discriminated by `segment_type`) | `POST api/outbound/create-order` |
| `getServiceableCouriers(orderId)` | Serviceable couriers + prices for an order | `POST api/outbound/courier-wise-shipment-cost` |
| `placeOrder(payload)` | Manifest an order with a courier | `POST api/outbound/place-order` |
| `cancelOrder(orderId)` | Cancel an order | `POST api/outbound/cancel-order` |
| `trackOrder(orderId)` | Track by order id | `GET api/outbound/track-order` |
| `getOrderDetail(orderId)` | Full AWB / label / status detail | `GET api/outbound/order-shipment-details` |
| `downloadDocument(orderId, documentType)` | `invoice`, `label`, `ewaybill`, or `manifest` | `GET api/outbound/download-shipment-documents` |

## Documentation

The full guide (config, error hierarchy, hooks, workflow builder deep-dive, troubleshooting) lives in the repo:

- [**Repo README**](https://github.com/Agamya-Samuel/bigship-sdk#readme) — installation, configuration, API surface
- [**CHANGELOG**](./CHANGELOG.md) — release notes and migration guide (v1 → v2 → v3)
- **External docs sites** — see the repo README for the playground and docs-site URLs. Both are external deployments not under this repo's CI; if a link is unreachable, `cd apps/docs && npm run dev` runs the site locally.

## Workflow Builder

```typescript
import { BigshipClient, ShipmentWorkflow } from '@agamya/bigship-sdk';

const client = new BigshipClient({ /* ...config... */ });

const workflow = await new ShipmentWorkflow(client).create({
  segment_type: 'domestic_b2c',
  /* ...payload */
});

workflow.withServiceableCourier(0);   // sync; or .withCourier(courierId)
await workflow.place();              // default riskTypeId: '2' (Owner Risk)

const { orderId, orderDetail } = await workflow.finalize();
console.log('AWB:', orderDetail?.getOrderDetails.AwbNumber);
```

Or as a single call: `.execute(order, courierId?)`. The same flow without the builder is `createOrder` → `getServiceableCouriers` → `placeOrder` → `getOrderDetail`; the builder just stops you from forgetting which id goes where.

## Error Handling

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
    // err.validationErrors: Record<string, string[]>
  } else if (isBigshipAuthError(err)) { /* credentials rejected */ }
    else if (isBigshipNetworkError(err)) { /* offline / DNS / timeout */ }
      else if (err instanceof BigshipError) { /* err.code, err.statusCode */ }
        else throw err;
}
```

Hierarchy: `BigshipError` → `BigshipApiError` → `BigshipValidationError` (400), `BigshipAuthError` (401), `BigshipNetworkError` (statusCode -1), `BigshipDuplicateInvoiceError` (409).

## Versioning and Compatibility

Follows [Semantic Versioning](https://semver.org/). The current major is **v3** (Unified Outbound API). The 2.x line targeted the legacy External Outbound API (`addSingleOrder`/`addHeavyOrder`/etc.) and is no longer maintained; upgrade by replacing helper calls with `createOrder({ segment_type })` and the rate/manifest/cancel calls with `getServiceableCouriers`/`placeOrder`/`cancelOrder` respectively. See [`CHANGELOG.md`](./CHANGELOG.md) for the full migration notes.

## Support

[GitHub Issues](https://github.com/Agamya-Samuel/bigship-sdk/issues)

## License

[MIT](https://github.com/Agamya-Samuel/bigship-sdk/blob/main/LICENSE)
