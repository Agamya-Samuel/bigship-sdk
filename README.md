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

## Documentation

| Document | Description |
|----------|-------------|
| [**Complete Guide**](./docs/guide.md) | Architecture, step-by-step B2C/B2B walkthroughs, error handling, configuration, utilities, migration |
| [**Examples**](./examples/) | 10 runnable code examples covering every SDK feature |
| [**CHANGELOG**](./CHANGELOG.md) | Breaking changes, new features, migration checklist |

### Quick Links

- **Quick Start** → [docs/guide.md#quick-start](./docs/guide.md)
- **B2C Flow** → [examples/02-b2c-complete-flow.ts](./examples/02-b2c-complete-flow.ts)
- **B2B Flow** → [examples/03-b2b-complete-flow.ts](./examples/03-b2b-complete-flow.ts)
- **Error Handling** → [examples/06-error-handling.ts](./examples/06-error-handling.ts)
- **Next.js Integration** → [examples/08-nextjs-integration.ts](./examples/08-nextjs-integration.ts)
- **Migration from v1** → [CHANGELOG.md](./CHANGELOG.md)

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

## Examples

| File | Description |
|------|-------------|
| `01-setup-and-config.ts` | Client initialization, all config options, AbortController, custom logger |
| `02-b2c-complete-flow.ts` | Full B2C lifecycle (10 steps with inline comments) |
| `03-b2b-complete-flow.ts` | B2B heavy order: ewaybill, multi-box, LRN tracking |
| `04-rate-calculation.ts` | Prepaid, COD, B2B rate comparison |
| `05-warehouse-management.ts` | Warehouse CRUD with pagination |
| `06-error-handling.ts` | All 5 error classes, type guards, helper methods |
| `07-hooks-and-monitoring.ts` | Event hooks, metrics collection, custom LoggerAdapter |
| `08-nextjs-integration.ts` | Next.js App Router (Server Actions + Route Handlers) |
| `09-browser-file-upload.ts` | Browser file upload with base64 conversion |
| `10-all-workflows.ts` | Side-by-side: manual vs helpers vs workflow builder |

## License

MIT

## Support

[GitHub Issues](https://github.com/Agamya-Samuel/bigship-sdk/issues)
