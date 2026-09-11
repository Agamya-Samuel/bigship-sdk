# Changelog

## [4.0.0](https://github.com/agamya-samuel/bigship-sdk/compare/v3.0.0...v4.0.0) (2026-09-11)

### ⚠ BREAKING CHANGES

- **Minimum supported Node.js is now 20.12.0** (was 18.0.0). Node 18 reached end-of-life on 2025-04-30 and no longer receives security updates.
- The SDK's test runner (vitest 4) transitively depends on rolldown, which imports `node:util.styleText`. `styleText` was added in Node 20.12 / 21.7 and is unavailable on Node 18. Keeping the floor at 18 would require either pinning vitest to an EOL version or carrying a workaround override; both options were judged worse than bumping the floor.
- npm 10+ will refuse to install `@agamya/bigship-sdk@4.x` on Node 18. npm 9 will warn. Users on Node 18 should upgrade to Node 20 LTS or later.

### Changes

- `engines.node` in `packages/sdk/package.json`: `>=18.0.0` → `>=20.12.0`
- SDK CI matrix in `.github/workflows/ci.yml`: `[18, 20, 22]` → `[20, 22]`. The matrix now proves the floor instead of testing a runtime the SDK no longer supports.
- Test dependencies restored to current versions: `vitest@^4.1.10`, `@vitest/coverage-v8@^4.1.10`. (3.0.0 shipped these; a workaround had temporarily pinned them to `^3.2.7` to keep Node 18 alive.)
- Removed the `overrides` block from the root `package.json` that had been forcing `vite` to `^7` to avoid rolldown hoisting at the root.
- No API changes. No migration required for consumers on Node 20.12+ other than ensuring their Node version meets the new floor.

## [3.0.0](https://github.com/agamya-samuel/bigship-sdk/compare/v2.2.0...v3.0.0) (2026-09-09)

### ⚠ BREAKING CHANGES

This release migrates the SDK to the new **Bigship Unified Outbound API**. All endpoints, request/response formats, and authentication have changed.

#### 1. New API Base Path

All endpoints are now under `api/outbound/` prefix.

**Before:**
```
POST /api/login/user
GET  /api/courier/get/all
POST /api/order/add/single
```

**After:**
```
POST api/outbound/login
GET  api/outbound/profile
POST api/outbound/create-order
```

#### 2. Response Format Changed

**Before:**
```json
{ "success": true, "message": "ok", "responseCode": 200, "data": "..." }
```

**After:**
```json
{ "status": true, "message": "ok", "status_code": 200, "data": "..." }
```

#### 3. Authentication Field Changed

**Before:**
```ts
{ "user_name": "...", "password": "...", "access_key": "..." }
```

**After:**
```ts
{ "username": "...", "password": "...", "access_key": "..." }
```

#### 4. Order Lifecycle Completely Redesigned

**Before:**
```ts
const order = await client.addSingleOrder(payload);
const rates = await client.getShippingRates(order.data);
await client.manifestSingle({ system_order_id: order.data, courier_id: 5 });
```

**After:**
```ts
const order = await client.createOrder(payload); // Draft order
const couriers = await client.getServiceableCouriers(order.data.CustomGlobalOrderId);
await client.placeOrder({ MasterCustomOrderId: order.data.CustomGlobalOrderId, courierId: 25 });
```

#### 5. Removed Methods

The following methods have been removed:
- `addSingleOrder()` → Use `createOrder()` with `segment_type: 'domestic_b2c'`
- `addHeavyOrder()` → Use `createOrder()` with `segment_type: 'domestic_b2b'`
- `manifestSingle()` → Use `placeOrder()`
- `manifestHeavy()` → Use `placeOrder()`
- `getShippingRates()` → Use `getServiceableCouriers()`
- `cancelShipments()` → Use `cancelOrder()`
- `getAWB()` → Use `getOrderDetail()`
- `getShipmentFile()` → Use `downloadDocument()`
- `getShipmentData()` → Use `getOrderDetail()` or `downloadDocument()`
- `trackShipment()` → Use `trackOrder()`
- `manifestAndGetAWB()` → Use `workflow()` or manual flow
- `getShipmentDetails()` → Use `getOrderDetail()`
- `createAndFinalizeShipment()` → Use `workflow()` or manual flow
- `login()` → Authentication is automatic
- `getCourierList()` → No longer available
- `getCourierTransporterList()` → No longer available
- `getPaymentCategory()` → Use `getPaymentCategory()` (unchanged name, new endpoint)
- `addWarehouse()` → Use `saveWarehouse()`
- `getWarehouseList()` → Updated parameters

#### 6. New Methods

- `getProfile()` - Get authenticated user's profile
- `saveWarehouse()` - Save warehouse with new schema
- `updateWarehouse()` - Update existing warehouse
- `getPackageTypes()` - Get package types for hyperlocal
- `getPaymentModes(segmentType)` - Get payment modes by segment type
- `getRiskTypes()` - Get risk types (insurance options)
- `createOrder()` - Unified order creation (supports hyperlocal, domestic_b2b, domestic_b2c)
- `getServiceableCouriers()` - Get couriers for a draft order
- `placeOrder()` - Place/manifest an order
- `cancelOrder()` - Cancel by CustomGlobalOrderId
- `trackOrder()` - Track by CustomGlobalOrderId
- `getOrderDetail()` - Get complete order details
- `downloadDocument()` - Download invoice, label, ewaybill, or manifest

#### 7. Order Types

Orders now use `segment_type` to specify the type:
- `'hyperlocal'` - Local delivery
- `'domestic_b2b'` - Domestic B2B shipments
- `'domestic_b2c'` - Domestic B2C shipments

#### 8. ShipmentWorkflow Updated

```ts
// New workflow API
import { BigshipClient, ShipmentWorkflow } from '@agamya/bigship-sdk';

const client = new BigshipClient({ /* config */ });

const result = await new ShipmentWorkflow(client)
  .create(order)           // Create draft order
  .withCourier(25)         // Select courier
  .place()                 // Place order
  .finalize();             // Get order details
```

---

### Migration Guide

#### Client Initialization (unchanged)
```ts
const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: 'your-email@example.com',
  password: 'your-password',
  accessKey: 'your-access-key',
});
```

#### Creating a B2C Order
```ts
// v2
const order = await client.addSingleOrder({
  shipment_category: 'b2c',
  warehouse_detail: { pickup_location_id: 123, return_location_id: 123 },
  consignee_detail: { first_name: 'John', last_name: 'Doe', ... },
  order_detail: { invoice_id: 'INV-001', ... },
});

// v3
const order = await client.createOrder({
  segment_type: 'domestic_b2c',
  MasterOrderPickUpLocation: 123,
  MasterOrderReturnLocation: 123,
  MasterOrderDate: '2025-01-01 00:00:00',
  MasterOrderPaymentMode: 1,
  OrderInvoiceNo: 'INV-001',
  MasterOrderInvoiceAmount: 1000,
  MasterOrderShippingName: 'John Doe',
  MasterOrderShippingMobileNo: '9876543210',
  MasterOrderShippingAddress: '123 Main St',
  MasterOrderShippingZipCode: '110001',
  MasterOrderShippingCity: 'DELHI',
  MasterOrderShippingState: 'DELHI',
  MasterOrderShippingCountry: 'India',
  totalNumOfBoxes: 1,
  boxes: [{
    weight_unit: 'kg',
    dimension_unit: 'cm',
    noOfBoxes: 1,
    dimensions: [{ length: 20, breadth: 15, height: 10, weight: 1 }],
    products: [{ productName: 'Widget', qty: '1', amount: '1000', totalAmount: 1000, collectableAmount: 0, categoryId: '1' }],
  }],
});
```

#### Placing an Order
```ts
// v2
const rates = await client.getShippingRates(order.data, 'B2C');
await client.manifestSingle({ system_order_id: order.data, courier_id: rates.data[0].courier_id });

// v3
const couriers = await client.getServiceableCouriers(order.data.CustomGlobalOrderId);
await client.placeOrder({
  MasterCustomOrderId: order.data.CustomGlobalOrderId,
  courierId: couriers.data.calculatedRates[0].courierId,
  riskTypeId: '2', // Owner Risk
});
```

#### Tracking an Order
```ts
// v2
const tracking = await client.trackShipment('AWB123', 'awb');

// v3
const tracking = await client.trackOrder('311276742'); // CustomGlobalOrderId
```

#### Canceling an Order
```ts
// v2
await client.cancelShipments(['AWB123']);

// v3
await client.cancelOrder('311276742'); // CustomGlobalOrderId
```

---

## [2.2.0](https://github.com/agamya-samuel/bigship-sdk/compare/v2.1.1...v2.2.0) (2026-08-18)

### ⚠ Breaking Changes

- **Removed internal symbols from root entry point.** `EventDispatcher`, `Logger`, `ResponseValidator`, `RetryManager`, and `TokenManager` are no longer exported from `@agamya/bigship-sdk`. These were always `@internal` and not intended for direct consumer use.
- **Removed `./auth` subpath export.** `TokenManager` is internal — `BigshipClient` manages authentication automatically.
- **Removed `BigshipError` re-export from `./core`.** `BigshipError` and `BigshipErrorData` are now only available from `@agamya/bigship-sdk/errors` (or the root entry point).

### ✨ Additions

- **Added `./workflow` subpath export.** `ShipmentWorkflow` is now importable as `import { ShipmentWorkflow } from '@agamya/bigship-sdk/workflow'`.

### 🔧 Improvements

- **Moved `LoggerAdapter` type to `core/types.ts`.** It's a consumer-facing configuration type and belongs with `BigshipConfig`, not next to the `@internal` `Logger` class.
- **Moved `formatZodErrors` to `./utils`.** Pure utility function now accessible via `@agamya/bigship-sdk/utils`.

### Migration

If you were importing internal classes from the root:

```diff
- import { RetryManager, ResponseValidator, EventDispatcher, Logger, TokenManager } from '@agamya/bigship-sdk';
```

These classes were never part of the public API. If you depended on them, pin to `2.1.x` and open an issue describing your use case.

If you were importing `BigshipError` from `./core`:

```diff
- import { BigshipError } from '@agamya/bigship-sdk/core';
+ import { BigshipError } from '@agamya/bigship-sdk/errors';
```


## [2.1.1](https://github.com/agamya-samuel/bigship-sdk/compare/v2.1.0...v2.1.1) (2026-08-07)

### Bug Fixes

- **ci**: remove unsupported `cache: false` from release workflow (`actions/setup-node@v7` does not accept it)
- **ci**: make release notes extraction and GitHub Release creation conditional on tag push (fixes `workflow_dispatch` failures)

### Documentation

- Trimmed README from 586 to ~230 lines — removed duplicated step-by-step guides (now in `examples/` only)
- Quick Start now shows a complete order + manifestAndGetAWB example inline

## [2.1.0](https://github.com/agamya-samuel/bigship-sdk/compare/v2.0.0...v2.1.0) (2026-08-07)

### Documentation

- Added 10 comprehensive code examples covering every SDK feature
- `01-setup-and-config.ts` — client initialization, all config options, AbortController, custom logger
- `02-b2c-complete-flow.ts` — full B2C lifecycle (10 steps with inline comments)
- `03-b2b-complete-flow.ts` — B2B heavy order flow with ewaybill, multi-box, LRN tracking
- `04-rate-calculation.ts` — rate comparison across couriers (Prepaid, COD, B2B)
- `05-warehouse-management.ts` — warehouse CRUD with pagination
- `06-error-handling.ts` — all 5 error classes, type guards, helper methods
- `07-hooks-and-monitoring.ts` — event hooks, metrics collection, custom LoggerAdapter
- `08-nextjs-integration.ts` — Next.js App Router (Server Actions + Route Handlers)
- `09-browser-file-upload.ts` — browser file upload with base64 conversion
- `10-all-workflows.ts` — side-by-side comparison of all 4 workflow approaches
- Rewrote README with step-by-step B2C and B2B shipment guides
- Added architecture diagram, API reference table, error hierarchy, config docs

## [2.0.0](https://github.com/agamya-samuel/bigship-sdk/compare/v1.0.1...v2.0.0) (2026-08-07)

### ⚠ BREAKING CHANGES

#### 1. `ApiResponse<T>.data` is now `T | null`

The `ApiResponse<T>` interface now correctly reflects that `data` can be `null` (matching the Zod schema).

**Before:**
```ts
interface ApiResponse<T = unknown> {
  data: T;
}
const balance: ApiResponse<string> = await client.getWalletBalance();
console.log(balance.data.toUpperCase()); // TS allowed this
```

**After:**
```ts
interface ApiResponse<T = unknown> {
  data: T | null;
}
const balance: ApiResponse<string> = await client.getWalletBalance();
console.log(balance.data?.toUpperCase()); // null-safe access required
```

Use the `isSuccessResponse` / `isFailedResponse` type guards for safe narrowing:
```ts
if (isSuccessResponse(balance)) {
  console.log(balance.data.toUpperCase()); // data is string (non-null)
}
```

#### 2. `isFailedResponse` no longer matches `data: undefined`

Previously, `isFailedResponse` returned `true` for both `data: null` and `data: undefined`. Now it only matches `data: null` to align with the Zod schema and `ApiResponse` interface.

```ts
// v1: matched both null and undefined
const response = { success: false, message: 'fail', responseCode: 400, data: undefined };
isFailedResponse(response); // v1: true → v2: false

// If you relied on undefined matching, add an explicit check:
if (response.success === false && (response.data === null || response.data === undefined)) { ... }
```

#### 3. `RetryManager` no longer auto-retries all 5xx errors

In v1, all 5xx errors were retried regardless of `retryOnStatusCodes`. In v2, only status codes explicitly listed in `retryOnStatusCodes` are retried.

**Default `retryOnStatusCodes`:** `[408, 429, 500, 502, 503, 504]`

If you relied on 5xx auto-retry without configuring `retryOnStatusCodes`, ensure your config includes the status codes you want:

```ts
const client = new BigshipClient({
  ...config,
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504], // explicit list
});
```

#### 4. `onBeforeRequest` hook now re-throws errors

In v1, errors thrown by the `onBeforeRequest` hook were silently swallowed. In v2, they propagate to the caller since `onBeforeRequest` modifies the request config (e.g., injecting auth headers). A silently failing hook would send requests without auth.

```ts
// v1: hook error was ignored, request sent without modification
// v2: hook error propagates, request fails immediately
const client = new BigshipClient({
  ...config,
  onBeforeRequest: async (config) => {
    config.headers.Authorization = await getDynamicToken(); // if this throws, request fails
    return config;
  },
});
```

#### 5. Response/error/retry hooks are fire-and-forget

Errors thrown by `onResponse`, `onError`, and `onRetry` hooks no longer break SDK operations. They are logged and ignored. This ensures user-provided hooks (e.g., analytics, logging) cannot interfere with API calls.

```ts
// v1: if onResponse threw, the API call result was lost
// v2: hook error is logged, API call result is returned normally
const client = new BigshipClient({
  ...config,
  onResponse: async (response) => {
    await sendToAnalytics(response); // if this throws, response is still returned
  },
});
```

#### 6. `BigshipError` moved to `errors/BigshipError.ts`

`BigshipError` and `BigshipErrorData` are now defined in `src/errors/BigshipError.ts` instead of `src/core/types.ts`. Import from `@agamya/bigship-sdk/errors`:

```ts
import { BigshipError } from '@agamya/bigship-sdk/errors';
```

---

### ✨ New Features

- **Request-level options**: All public methods accept an optional `RequestOptions` parameter with `timeout` and `signal` (AbortController) support.
  ```ts
  const controller = new AbortController();
  const result = await client.addSingleOrder(order, { timeout: 30000, signal: controller.signal });
  ```

- **Pluggable logger**: Custom logging via `LoggerAdapter` interface.
  ```ts
  const client = new BigshipClient({
    ...config,
    enableDetailedLogging: true,
    loggerAdapter: {
      debug: (msg, data) => winston.debug(msg, data),
      info: (msg, data) => winston.info(msg, data),
      warn: (msg, data) => winston.warn(msg, data),
      error: (msg, data) => winston.error(msg, data),
    },
  });
  ```

- **Configurable token TTL**: `tokenTtlMs` option to override the default 55-minute token cache.
  ```ts
  const client = new BigshipClient({ ...config, tokenTtlMs: 15 * 60 * 1000 }); // 15 min
  ```

- **Configurable max retry delay**: `maxRetryDelay` caps exponential backoff (default: 30s).
  ```ts
  const client = new BigshipClient({ ...config, maxRetryDelay: 10000 }); // 10s cap
  ```

- **ShipmentWorkflow state machine**: Fluent API for order creation flow.
  ```ts
  const result = await client.workflow()
    .create(order)
    .withCourier(5)
    .manifest()
    .finalize();
  ```

- **`createAndFinalizeShipment`**: One-call convenience method with AWB polling.
  ```ts
  const result = await client.createAndFinalizeShipment({
    order: payload,
    courierId: 5,
    awbPollMaxAttempts: 5,
    awbPollDelay: 3000,
  });
  ```

- **`manifestAndGetAWB`**: Manifest and retrieve AWB in one call.

- **`getShipmentDetails`**: Retrieve AWB, label, and manifest data in parallel.

- **Sub-path exports**: Tree-shakeable imports for `./core`, `./errors`, `./utils`.

- **`SDK_VERSION`**: Exported version constant, auto-synced from `package.json` via `npm run sync-version`.

- **Comprehensive test suite**: 237 tests, 95%+ statement/function/line coverage.

---

### 🔧 Improvements

- Retry jitter uses "Full Jitter" formula (AWS-recommended) instead of 50-100% of exponential delay.
- Error subclasses (`BigshipAuthError`, `BigshipNetworkError`, `BigshipDuplicateInvoiceError`) hardcode `code` and `apiResponse` after user options, preventing accidental overrides.
- `BigshipAuthError` infinite 401 retry loop prevented via `_authRetried` flag.
- `createAndFinalizeShipment` polls only `getAWB` (1 request/attempt) instead of `getShipmentDetails` (3 parallel requests/attempt). Worst-case: 7 requests instead of 18.
- Client-side validation uses `safeParse` instead of `parse`, throwing `BigshipValidationError` instead of raw `ZodError`.
- `BigshipClient` boilerplate reduced via `executeApiCall` helper.
- `@throws` JSDoc on all public methods documenting possible error types.

---

### Migration Checklist

- [ ] Update `@agamya/bigship-sdk` to `^2.0.0`
- [ ] Add null checks for `ApiResponse.data` or use `isSuccessResponse` / `isFailedResponse` type guards
- [ ] Replace any `isFailedResponse` calls that relied on `undefined` matching
- [ ] Verify `retryOnStatusCodes` config if you relied on 5xx auto-retry without explicit config
- [ ] Ensure `onBeforeRequest` hook errors are handled (they now propagate)
- [ ] Review `onResponse`/`onError`/`onRetry` hooks (errors are now fire-and-forget)
- [ ] Consider using new sub-path exports for tree-shaking: `import { BigshipError } from '@agamya/bigship-sdk/errors'`
