# @agamya/bigship-sdk

[![CI](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@agamya/bigship-sdk)](https://www.npmjs.com/package/@agamya/bigship-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for the Bigship.in External Outbound API — shipping, orders, rates, tracking, and more.

> **Disclaimer:** Community project based on publicly available Bigship API documentation. Not officially affiliated with Bigship.in. Legal contact: [legal@agamya.dev](mailto:legal@agamya.dev).

## Features

- **Type-Safe** — Zod schemas for runtime validation, full TypeScript inference
- **Auto-Authentication** — Login once, token cached automatically
- **Retry with Backoff** — Exponential backoff with full jitter, configurable
- **Event Hooks** — `onBeforeRequest`, `onResponse`, `onError`, `onRetry`
- **Pluggable Logger** — Bring your own Winston, pino, or console logger
- **Full API Coverage** — All 16 Bigship API endpoints
- **Convenience Methods** — `manifestAndGetAWB`, `getShipmentDetails`, `createAndFinalizeShipment`
- **Workflow Builder** — Fluent `create → withCourier → manifest → finalize` API
- **Sub-path Exports** — Tree-shakeable imports for `./errors`, `./core`, `./utils`

## Installation

```bash
npm install @agamya/bigship-sdk
```

## Architecture

```
BigshipClient
  ├── executeApiCall<T>  (token → request → validate → dispatch → return)
  │     ├── TokenManager   (auto-login, token caching)
  │     ├── RetryManager   (exponential backoff with full jitter)
  │     ├── EventDispatcher (onBeforeRequest, onResponse, onError, onRetry hooks)
  │     └── Logger         (pluggable: console, Winston, pino)
  └── Axios HTTP Client → Bigship API
```

## Quick Start

```typescript
import { BigshipClient, isSuccessResponse, isFailedResponse } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// Check wallet balance
const balance = await client.getWalletBalance();
if (isSuccessResponse(balance)) {
  console.log('Balance:', balance.data);
}

// Create a B2C order
const order = await client.addSingleOrder({
  shipment_category: 'b2c',
  warehouse_detail: { pickup_location_id: 123456, return_location_id: 123456 },
  consignee_detail: {
    first_name: 'Rahul',
    last_name: 'Sharma',
    contact_number_primary: '9876543210',
    consignee_address: { address_line1: '42 MG Road Koramangala', pincode: '560034' },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: `INV-${Date.now()}`,
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 2500,
    box_details: [{
      each_box_dead_weight: 0.5, each_box_length: 20, each_box_width: 15, each_box_height: 10,
      each_box_invoice_amount: 2500, each_box_collectable_amount: 0, box_count: 1,
      product_details: [{ product_category: 'Electronics', product_name: 'Earbuds', product_quantity: 1, each_product_invoice_amount: 2500, each_product_collectable_amount: 0 }],
    }],
    document_detail: { invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...' },
  },
});

if (isFailedResponse(order)) {
  console.error('Failed:', order.message);
} else {
  console.log('Order ID:', order.data);

  // Manifest + get AWB in one call
  const { awb, courierName } = await client.manifestAndGetAWB(order.data, 5);
  console.log(`AWB: ${awb}, Courier: ${courierName}`);
}
```

For complete step-by-step guides, see [`examples/02-b2c-complete-flow.ts`](./examples/02-b2c-complete-flow.ts) (B2C) and [`examples/03-b2b-complete-flow.ts`](./examples/03-b2b-complete-flow.ts) (B2B).

## API Reference

| Method | Description | Endpoint |
|--------|-------------|----------|
| `getWalletBalance()` | Get wallet balance | `GET /api/Wallet/balance/get` |
| `getCourierList(category)` | List available couriers | `GET /api/courier/get/all` |
| `getCourierTransporterList(id)` | List transporters for a courier | `GET /api/courier/get/transport/list` |
| `getPaymentCategory(category)` | List payment modes | `GET /api/payment/category` |
| `addWarehouse(payload)` | Add a warehouse | `POST /api/warehouse/add` |
| `getWarehouseList(page, size)` | List warehouses (paginated) | `GET /api/warehouse/get/list` |
| `addSingleOrder(payload)` | Create B2C order | `POST /api/order/add/single` |
| `addHeavyOrder(payload)` | Create B2B order | `POST /api/order/add/heavy` |
| `manifestSingle(payload)` | Manifest B2C order | `POST /api/order/manifest/single` |
| `manifestHeavy(payload)` | Manifest B2B order | `POST /api/order/manifest/heavy` |
| `getShippingRates(orderId)` | Get shipping rates for order | `GET /api/order/shipping/rates` |
| `cancelShipments(awbs[])` | Cancel shipments | `PUT /api/order/cancel` |
| `calculateRate(payload)` | Calculate shipping rates | `POST /api/calculator` |
| `getShipmentData(id, orderId)` | Get AWB/Label/Manifest | `POST /api/shipment/data` |
| `trackShipment(id, type)` | Track by AWB or LRN | `GET /api/tracking` |
| `manifestAndGetAWB(orderId, courierId)` | Manifest + fetch AWB | *Helper* |
| `getShipmentDetails(orderId)` | Get AWB + label + manifest | *Helper* |
| `createAndFinalizeShipment(config)` | Create → Manifest → Get all | *Helper* |

## Convenience Methods

```typescript
// Manifest + get AWB in one call
const { awb, courierName } = await client.manifestAndGetAWB(orderId, 5);

// Get all shipment details at once
const details = await client.getShipmentDetails(orderId);

// All-in-one: create → manifest → get AWB + label + manifest
const result = await client.createAndFinalizeShipment({ order: payload, courierId: 5 });

// Fluent workflow builder
const result = await client.workflow().create(order).withCourier(5).manifest().finalize();
```

## ShipmentDataType Enum

```typescript
import { ShipmentDataType } from '@agamya/bigship-sdk';

client.getShipmentData(ShipmentDataType.AWB, orderId);      // 1 — AWB number
client.getShipmentData(ShipmentDataType.LABEL, orderId);     // 2 — Shipping label
client.getShipmentData(ShipmentDataType.MANIFEST, orderId);  // 3 — Manifest document
```

## Error Handling

```typescript
import {
  isBigshipDuplicateInvoiceError, isBigshipValidationError,
  isBigshipAuthError, isBigshipNetworkError, isBigshipApiError,
} from '@agamya/bigship-sdk';

try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (isBigshipDuplicateInvoiceError(error)) console.error('Duplicate invoice:', error.invoiceId);
  else if (isBigshipValidationError(error)) console.error('Validation errors:', error.validationErrors);
  else if (isBigshipAuthError(error)) console.error('Authentication failed');
  else if (isBigshipNetworkError(error)) console.error('Network error');
  else if (isBigshipApiError(error)) console.error('API error:', error.message, error.requestId);
}
```

See [`examples/06-error-handling.ts`](./examples/06-error-handling.ts) for all error classes and type guards.

## Configuration

```typescript
const client = new BigshipClient({
  // Required
  baseURL: 'https://api.bigship.in',
  userName: 'your-email@example.com',
  password: 'your-password',
  accessKey: 'your-access-key',

  // Optional
  timeout: 15000,                              // Request timeout (ms)
  maxRetries: 3,                               // Max retry attempts
  retryDelay: 1000,                            // Base retry delay (ms)
  maxRetryDelay: 30000,                        // Max retry delay cap (ms)
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
  tokenTtlMs: 55 * 60 * 1000,                  // Token cache TTL (ms)
  enableDetailedLogging: false,                // Log requests/responses

  // Event hooks (see examples/07-hooks-and-monitoring.ts)
  onBeforeRequest: (config) => config,         // Modifies request (re-throws on error)
  onResponse: (response, ctx) => {},           // Fire-and-forget
  onError: (error, ctx) => {},                 // Fire-and-forget
  onRetry: (attempt, error, ctx) => {},        // Fire-and-forget

  // Custom logger (see examples/07)
  loggerAdapter: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
});

// Per-request options
await client.addSingleOrder(order, { timeout: 60000 });

const controller = new AbortController();
await client.getWalletBalance({ signal: controller.signal });
```

## Sub-path Exports

```typescript
import { BigshipClient } from '@agamya/bigship-sdk';
import { BigshipApiError } from '@agamya/bigship-sdk/errors';
import type { AddSingleOrderRequest } from '@agamya/bigship-sdk/core';
import { BigshipUtils, SDK_VERSION } from '@agamya/bigship-sdk/utils';
```

## Examples

See [`examples/`](./examples) directory for comprehensive code examples:

| File | Description |
|------|-------------|
| `01-setup-and-config.ts` | Client initialization, all config options |
| `02-b2c-complete-flow.ts` | Full B2C lifecycle (10 steps) |
| `03-b2b-complete-flow.ts` | B2B heavy order flow |
| `04-rate-calculation.ts` | Rate comparison across couriers |
| `05-warehouse-management.ts` | Warehouse CRUD |
| `06-error-handling.ts` | All error types and type guards |
| `07-hooks-and-monitoring.ts` | Event hooks, metrics, custom logger |
| `08-nextjs-integration.ts` | Next.js App Router integration |
| `09-browser-file-upload.ts` | Browser file upload + base64 conversion |
| `10-all-workflows.ts` | Compare all 4 workflow approaches |

## Migration from v1

See [CHANGELOG.md](./CHANGELOG.md) for full details.

| v1 Pattern | v2 Replacement |
|------------|----------------|
| `client.getShipmentData(1, orderId)` | `client.getShipmentData(ShipmentDataType.AWB, orderId)` |
| `manifestSingle` + `getShipmentData` | `client.manifestAndGetAWB(orderId, courierId)` |
| `addSingleOrder` + `manifest` + 3x `getShipmentData` | `client.createAndFinalizeShipment({order, courierId})` |
| `response.data.toUpperCase()` | `if (isSuccessResponse(response)) response.data.toUpperCase()` |
| `{ data: T }` | `{ data: T \| null }` — use `isSuccessResponse` guard |

## License

MIT

## Support

[GitHub Issues](https://github.com/Agamya-Samuel/bigship-sdk/issues)

## Full Guide

For the complete step-by-step walkthrough (B2C lifecycle, B2B lifecycle, error handling details, configuration reference, utility functions, migration guide), see [docs/guide.md](./docs/guide.md).
