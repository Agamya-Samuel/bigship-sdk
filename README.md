# @agamya/bigship-sdk

[![CI](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Agamya-Samuel/bigship-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@agamya/bigship-sdk)](https://www.npmjs.com/package/@agamya/bigship-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org)

TypeScript SDK for the [Bigship.direct](https://bigship.direct) External Outbound API — shipping, orders, rates, tracking, and more.

> **Disclaimer:** Community project based on publicly available Bigship API documentation. Not officially affiliated with Bigship.direct.

## Quick Start

```bash
npm install @agamya/bigship-sdk
```

```typescript
import { BigshipClient } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USER_NAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

const balance = await client.getWalletBalance();
console.log(balance.data);
```

## Features

- **Type-Safe** — Zod schemas for runtime validation, full TypeScript inference
- **Auto-Authentication** — Login once, token cached automatically
- **Retry with Backoff** — Exponential backoff with full jitter, configurable
- **Event Hooks** — `onBeforeRequest`, `onResponse`, `onError`, `onRetry`
- **Pluggable Logger** — Bring your own Winston, pino, or console logger
- **Full API Coverage** — All 16 Bigship API endpoints
- **Convenience Methods** — `manifestAndGetAWB`, `getShipmentDetails`, `createAndFinalizeShipment`
- **Workflow Builder** — Fluent `create → withCourier → manifest → finalize` API

## Repository Structure

```
bigship-sdk/
├── packages/sdk/          @agamya/bigship-sdk (npm package)
├── apps/playground/       Interactive playground (Next.js)
├── apps/docs/             Documentation site (Astro + Starlight)
├── docs/                  Vendor API reference
└── examples/              Runnable code examples
```

## Documentation

| Resource | Description |
|----------|-------------|
| [BigShip SDK Docs](https://bigship-sdk.pages.dev) | Documentation site |
| [BigShip SDK Playground](https://bigship-sdk.vercel.app) | Interactive playground |
| [Guide](https://bigship-sdk.agamya.dev) | Architecture, B2C/B2B walkthroughs, error handling, configuration |
| [Examples](./examples/) | 10 runnable code examples covering every SDK feature |
| [CHANGELOG](./packages/sdk/CHANGELOG.md) | Breaking changes, new features, migration checklist |

## Examples

| Category | Files |
|----------|-------|
| [Node.js](./examples/node/) | Setup, rate calculation, warehouse management, error handling, hooks |
| [Workflows](./examples/workflows/) | B2C flow, B2B flow, all workflows |
| [Frameworks](./examples/frameworks/) | Next.js integration, browser file upload |

## Development

```bash
git clone https://github.com/Agamya-Samuel/bigship-sdk.git
cd bigship-sdk
npm install

# Build SDK
npm run build:sdk

# Run tests
npm test

# Build playground
npm run build:playground
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

[MIT](./LICENSE)
