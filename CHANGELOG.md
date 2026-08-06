# Changelog

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

`BigshipError` and `BigshipErrorData` are now defined in `src/errors/BigshipError.ts` instead of `src/core/types.ts`. They are re-exported from `types.ts` for backward compatibility, but new code should import from `@agamya/bigship-sdk/errors`:

```ts
// Still works (re-exported):
import { BigshipError } from '@agamya/bigship-sdk/core';

// Preferred:
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

- **Sub-path exports**: Tree-shakeable imports for `./core`, `./errors`, `./http`, `./infrastructure`, `./auth`, `./utils`.

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
