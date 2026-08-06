# @agamya/bigship-sdk

[![CI](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@agamya/bigship-sdk)](https://www.npmjs.com/package/@agamya/bigship-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for the Bigship.in External Outbound API — shipping, orders, rates, tracking, and more.

> **Disclaimer:** This SDK is an unofficial community project based on publicly available Bigship API documentation. Not officially affiliated with Bigship.in. Legal contact: [legal@agamya.dev](mailto:legal@agamya.dev).

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
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     BigshipClient                        │
│                                                          │
│  Public API Methods (18 methods)                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ getWalletBalance, getCourierList, addSingleOrder,   │ │
│  │ manifestSingle, getShipmentData, trackShipment,     │ │
│  │ manifestAndGetAWB, createAndFinalizeShipment, ...   │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────────┐ │
│  │              executeApiCall<T>                       │ │
│  │  token → request → validate → dispatch → return     │ │
│  └──────────┬──────────┬──────────┬──────────┬─────────┘ │
│             │          │          │          │            │
│  ┌──────────▼──┐ ┌─────▼──────┐ ┌▼────────┐ ┌▼────────┐ │
│  │TokenManager │ │RetryManager│ │EventDisp│ │ Logger  │ │
│  │(auto-login) │ │(backoff)   │ │(hooks)  │ │(plugg.) │ │
│  └─────────────┘ └────────────┘ └─────────┘ └─────────┘ │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────────┐ │
│  │                  Axios HTTP Client                  │ │
│  └──────────────────────┬──────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────┘
                          │
                   Bigship API
```

## Step-by-Step: B2C Shipment

This is the complete lifecycle for a B2C (Business to Consumer) shipment — from checking your wallet to cancelling a shipment.

### Step 1: Check Wallet Balance

```typescript
const balance = await client.getWalletBalance();
console.log('Balance:', balance.data); // → "5000.00"
```

### Step 2: List Available Couriers

```typescript
import { isSuccessResponse } from '@agamya/bigship-sdk';

const couriers = await client.getCourierList('b2c');
if (isSuccessResponse(couriers)) {
  for (const c of couriers.data) {
    console.log(`ID: ${c.courier_id} — ${c.courier_name} (${c.courier_type})`);
  }
}
// → ID: 5  — Delhivery (Surface)
// → ID: 12 — DTDC      (Surface)
```

### Step 3: Calculate Shipping Rates

```typescript
const rates = await client.calculateRate({
  shipment_category: 'B2C',
  payment_type: 'Prepaid',
  pickup_pincode: '110001',
  destination_pincode: '400001',
  shipment_invoice_amount: 2500,
  box_details: [{
    each_box_dead_weight: 0.5,
    each_box_length: 20,
    each_box_width: 15,
    each_box_height: 10,
    box_count: 1,
  }],
});
```

### Step 4: Create B2C Order

```typescript
import { isFailedResponse } from '@agamya/bigship-sdk';

const order = await client.addSingleOrder({
  shipment_category: 'b2c',
  warehouse_detail: {
    pickup_location_id: 123456,
    return_location_id: 123456,
  },
  consignee_detail: {
    first_name: 'Rahul',
    last_name: 'Sharma',
    contact_number_primary: '9876543210',
    consignee_address: {
      address_line1: '42 MG Road Koramangala',
      address_line2: 'Near Forum Mall',
      address_landmark: 'Opposite HDFC Bank',
      pincode: '560034',
    },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: `INV-${Date.now()}`,
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 2500,
    box_details: [{
      each_box_dead_weight: 0.5,
      each_box_length: 20,
      each_box_width: 15,
      each_box_height: 10,
      each_box_invoice_amount: 2500,
      each_box_collectable_amount: 0,
      box_count: 1,  // B2C must be exactly 1
      product_details: [{
        product_category: 'Electronics',
        product_name: 'Wireless Earbuds',
        product_quantity: 1,
        each_product_invoice_amount: 2500,
        each_product_collectable_amount: 0,
      }],
    }],
    document_detail: {
      invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
    },
  },
});

if (isFailedResponse(order)) {
  console.error('Failed:', order.message);
  process.exit(1);
}

const orderId = order.data!;
console.log('Order created:', orderId);
```

### Step 5: Manifest (Assign Courier)

```typescript
await client.manifestSingle({
  system_order_id: orderId,
  courier_id: 5,  // Delhivery Surface
});
```

### Step 6: Get AWB Number

```typescript
import { ShipmentDataType } from '@agamya/bigship-sdk';

const awbResp = await client.getShipmentData(ShipmentDataType.AWB, orderId);
if (isSuccessResponse(awbResp) && awbResp.data && typeof awbResp.data !== 'string') {
  console.log('AWB:', awbResp.data.master_awb);     // "13090318586270"
  console.log('Courier:', awbResp.data.courier_name); // "Delhivery"
}
```

### Step 7: Get Shipping Label

```typescript
const label = await client.getShipmentData(ShipmentDataType.LABEL, orderId);
if (isSuccessResponse(label) && typeof label.data === 'string') {
  // label.data is a base64 Data URI or URL
  console.log('Label:', label.data.substring(0, 40) + '...');
}
```

### Step 8: Get Manifest Document

```typescript
const manifest = await client.getShipmentData(ShipmentDataType.MANIFEST, orderId);
if (isSuccessResponse(manifest) && typeof manifest.data === 'string') {
  console.log('Manifest document available');
}
```

### Step 9: Track Shipment

```typescript
// Track by AWB (default)
const tracking = await client.trackShipment('13090318586270', 'awb');
console.log('Status:', tracking.data);

// Track by LRN
const lrnTracking = await client.trackShipment('LR-6554921441', 'lrn');
```

### Step 10: Cancel if Needed

```typescript
await client.cancelShipments(['13090318586270']);
```

## Step-by-Step: B2B Shipment

B2B orders differ from B2C in these ways:

| | B2C | B2B |
|---|---|---|
| Method | `addSingleOrder` | `addHeavyOrder` |
| Manifest | `manifestSingle` | `manifestHeavy` |
| `shipment_category` | `'b2c'` | `'b2b'` |
| `ewaybill_number` | Optional | **Required** |
| `ewaybill_document_file` | Optional | **Required** |
| `box_count` | Must be `1` | Can be `> 1` |
| Track by | AWB | LRN (Lorry Receipt Number) |

```typescript
const order = await client.addHeavyOrder({
  shipment_category: 'b2b',
  warehouse_detail: { pickup_location_id: 123456, return_location_id: 123456 },
  consignee_detail: {
    first_name: 'Priya',
    last_name: 'Patel',
    company_name: 'TechCorp India Pvt Ltd',
    contact_number_primary: '9123456789',
    consignee_address: {
      address_line1: 'Tower B 5th Floor DLF Cyber City',
      pincode: '122002',
    },
  },
  order_detail: {
    invoice_date: new Date().toISOString(),
    invoice_id: `B2B-${Date.now()}`,
    payment_type: 'Prepaid',
    total_collectable_amount: 0,
    shipment_invoice_amount: 50000,
    ewaybill_number: '281012345678',  // REQUIRED for B2B
    box_details: [
      {
        each_box_dead_weight: 5,
        each_box_length: 40, each_box_width: 30, each_box_height: 25,
        each_box_invoice_amount: 25000,
        each_box_collectable_amount: 0,
        box_count: 1,
        product_details: [{
          product_category: 'Electronics',
          product_name: 'Server Motherboard',
          product_quantity: 1,
          each_product_invoice_amount: 25000,
          each_product_collectable_amount: 0,
          hsn: '84733099',
        }],
      },
      {
        each_box_dead_weight: 3,
        each_box_length: 30, each_box_width: 20, each_box_height: 15,
        each_box_invoice_amount: 25000,
        each_box_collectable_amount: 0,
        box_count: 1,
        product_details: [{
          product_category: 'Electronics',
          product_name: 'Network Switch',
          product_quantity: 2,
          each_product_invoice_amount: 12500,
          each_product_collectable_amount: 0,
        }],
      },
    ],
    document_detail: {
      invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJ...',  // REQUIRED
    },
  },
});

await client.manifestHeavy({ system_order_id: order.data!, courier_id: 25 });
```

## Convenience Methods

### manifestAndGetAWB — Manifest + AWB in One Call

```typescript
const { awb, courierName } = await client.manifestAndGetAWB(orderId, 5);
console.log(`AWB: ${awb}, Courier: ${courierName}`);
```

### getShipmentDetails — Get AWB + Label + Manifest at Once

```typescript
const details = await client.getShipmentDetails(orderId);
console.log(details.awb);          // "13090318586270"
console.log(details.courierName);  // "Delhivery"
console.log(details.labelData);    // "data:application/pdf;base64,..."
console.log(details.manifestData); // "data:application/pdf;base64,..."
```

### createAndFinalizeShipment — All-in-One with AWB Polling

```typescript
const result = await client.createAndFinalizeShipment({
  order: orderPayload,
  courierId: 5,
  awbPollMaxAttempts: 5,   // Poll up to 5 times (default: 5)
  awbPollDelay: 3000,      // Wait 3s between polls (default: 2000)
});

console.log(result.orderId);      // "1005202970"
console.log(result.awb);          // "13090318586270"
console.log(result.courierName);  // "Delhivery"
console.log(result.labelData);    // "data:application/pdf;base64,..."
console.log(result.manifestData); // "data:application/pdf;base64,..."
```

### Workflow Builder — Fluent API

```typescript
const result = await client.workflow()
  .create(orderPayload)    // Create order
  .withCourier(5)          // Select courier
  .manifest()              // Manifest
  .finalize();             // Get AWB + label + manifest

console.log(result.awb);
console.log(result.courierName);
```

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

## ShipmentDataType Enum

```typescript
import { ShipmentDataType } from '@agamya/bigship-sdk';

client.getShipmentData(ShipmentDataType.AWB, orderId);      // 1 — AWB number
client.getShipmentData(ShipmentDataType.LABEL, orderId);     // 2 — Shipping label
client.getShipmentData(ShipmentDataType.MANIFEST, orderId);  // 3 — Manifest document
```

## Error Handling

### Error Hierarchy

```
BigshipError
  └── BigshipApiError
        ├── BigshipDuplicateInvoiceError  (HTTP 409)
        ├── BigshipValidationError        (client-side Zod failure)
        ├── BigshipAuthError              (HTTP 401/403)
        └── BigshipNetworkError           (network/timeout)
```

### Type Guards

```typescript
import {
  isBigshipDuplicateInvoiceError,
  isBigshipValidationError,
  isBigshipAuthError,
  isBigshipNetworkError,
  isBigshipApiError,
  isSuccessResponse,
  isFailedResponse,
} from '@agamya/bigship-sdk';

try {
  await client.addSingleOrder(orderData);
} catch (error) {
  if (isBigshipDuplicateInvoiceError(error)) {
    console.error('Duplicate invoice:', error.invoiceId);
  } else if (isBigshipValidationError(error)) {
    console.error('Validation errors:', error.validationErrors);
  } else if (isBigshipAuthError(error)) {
    console.error('Authentication failed');
  } else if (isBigshipNetworkError(error)) {
    console.error('Network error');
  } else if (isBigshipApiError(error)) {
    console.error('API error:', error.message, error.requestId);
  }
}
```

### Error Properties

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number` | HTTP status code |
| `code` | `string?` | Error code (e.g. `'NULL_DATA'`) |
| `message` | `string` | Human-readable message |
| `requestId` | `string?` | API request trace ID |
| `endpoint` | `string?` | API endpoint that failed |
| `validationErrors` | `Record<string, string[]>?` | Field-level validation errors |
| `invoiceId` | `string?` | Duplicate invoice ID |

### Helper Methods

```typescript
const err = new BigshipError('test', 429, 'RATE_LIMIT_EXCEEDED');
err.isRateLimitError();   // true
err.isAuthError();        // false
err.isValidationError();  // false
```

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

  // Event hooks
  onBeforeRequest: (config) => config,         // Modifies request (re-throws on error)
  onResponse: (response, ctx) => {},           // Fire-and-forget
  onError: (error, ctx) => {},                 // Fire-and-forget
  onRetry: (attempt, error, ctx) => {},        // Fire-and-forget
});
```

### Per-Request Options

```typescript
// Override timeout for a single call
await client.addSingleOrder(order, { timeout: 60000 });

// Cancel a request with AbortController
const controller = new AbortController();
await client.getWalletBalance({ signal: controller.signal });
controller.abort(); // Cancel
```

### Custom Logger

```typescript
import type { LoggerAdapter } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  // ...config
  enableDetailedLogging: true,
  loggerAdapter: {
    debug: (msg, data) => winston.debug(msg, data),
    info:  (msg, data) => winston.info(msg, data),
    warn:  (msg, data) => winston.warn(msg, data),
    error: (msg, data) => winston.error(msg, data),
  },
});
```

## Sub-path Exports

```typescript
// Main entry (all exports)
import { BigshipClient } from '@agamya/bigship-sdk';

// Errors only
import { BigshipApiError, isBigshipDuplicateInvoiceError } from '@agamya/bigship-sdk/errors';

// Core types only
import type { AddSingleOrderRequest, BigshipConfig } from '@agamya/bigship-sdk/core';

// Utilities
import { BigshipUtils, SDK_VERSION } from '@agamya/bigship-sdk/utils';
```

## Utility Functions

```typescript
import { BigshipUtils, BigshipClient } from '@agamya/bigship-sdk';

// Convert browser File to base64 Data URI
const base64 = await BigshipUtils.fileToBase64DataURI(fileInput.files[0]);

// Validate base64 Data URI
BigshipUtils.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x'); // true
BigshipUtils.isValidBase64DataURI('not-a-uri');                             // false

// Calculate collectable amount
BigshipUtils.calculateCollectableAmount('COD', 1000);    // 1000
BigshipUtils.calculateCollectableAmount('Prepaid', 1000); // 0
```

## Examples

See the [`examples/`](./examples) directory:

| File | Description |
|------|-------------|
| `01-setup-and-config.ts` | Client initialization, all config options |
| `02-b2c-complete-flow.ts` | Full B2C lifecycle (10 steps) |
| `03-b2b-complete-flow.ts` | B2B heavy order flow |
| `04-rate-calculation.ts` | Rate comparison across couriers |
| `05-warehouse-management.ts` | Warehouse CRUD |
| `06-error-handling.ts` | All error types and type guards |
| `07-hooks-and-monitoring.ts` | Event hooks, metrics, custom logger |
| `08-nextjs-integration.ts` | Next.js App Router (Server Actions + Route Handlers) |
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
