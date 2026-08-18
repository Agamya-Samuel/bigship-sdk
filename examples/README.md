# Bigship SDK Examples

Runnable examples demonstrating the `@agamya/bigship-sdk` API.

## Structure

### `node/`

Core SDK usage in Node.js:

| File | Description |
|------|-------------|
| `setup-and-config.ts` | Client setup, authentication, configuration |
| `rate-calculation.ts` | Calculate shipping rates |
| `warehouse-management.ts` | Add and list warehouses |
| `error-handling.ts` | Error classes, type guards, structured error handling |
| `hooks-and-monitoring.ts` | Request/response hooks, logging, retry monitoring |

### `workflows/`

End-to-end shipment workflows:

| File | Description |
|------|-------------|
| `b2c-complete-flow.ts` | Full B2C shipment: order → manifest → AWB → label → track |
| `b2b-complete-flow.ts` | Full B2B shipment with e-waybill |
| `all-workflows.ts` | Workflow builder API |

### `frameworks/`

Framework-specific integration:

| File | Description |
|------|-------------|
| `nextjs-integration.ts` | Next.js Route Handlers and Server Actions |
| `browser-file-upload.ts` | Browser file upload with base64 conversion |

## Running examples

```bash
# Build the SDK first
npm run build -w packages/sdk

# Run an example with tsx
npx tsx examples/node/setup-and-config.ts
```

Set Bigship credentials via environment variables:

```bash
export BIGSHIP_USER_NAME=your-email@example.com
export BIGSHIP_PASSWORD=your-password
export BIGSHIP_ACCESS_KEY=your-access-key
export BIGSHIP_BASE_URL=https://api.bigship.in
```

Or copy `packages/sdk/.env.example` to `packages/sdk/.env` and fill in values.
