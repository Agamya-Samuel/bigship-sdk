/**
 * 07 — Event Hooks & Monitoring
 *
 * Hook into the SDK lifecycle for logging, metrics, and custom behavior.
 * Hooks: onBeforeRequest, onResponse, onError, onRetry
 *
 * Run: npx tsx examples/07-hooks-and-monitoring.ts
 */

import {
  BigshipClient,
  type BigshipConfig,
  type LoggerAdapter,
  type RequestContext,
} from '@agamya/bigship-sdk';

// ──────────────────────────────────────────────
// 1. Request/Response logging
// ──────────────────────────────────────────────

const loggingConfig: BigshipConfig = {
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,

  // Called before every request — can modify config
  // IMPORTANT: re-throws on error (modifies request config)
  onBeforeRequest: (config) => {
    config.headers = config.headers ?? {};
    config.headers['X-Request-Source'] = 'my-app';
    config.headers['X-Request-Id'] = crypto.randomUUID();
    return config;
  },

  // Called after successful response — fire-and-forget (errors are swallowed)
  onResponse: (response, context: RequestContext) => {
    console.log(`[API] ${context.method} ${context.endpoint} → ${context.duration}ms`);
  },

  // Called on request failure — fire-and-forget
  onError: (error, context) => {
    console.error(`[API ERROR] ${context.endpoint}: ${error.message} (${error.statusCode})`);
  },

  // Called before each retry — fire-and-forget
  onRetry: (attempt, error, context) => {
    console.warn(`[RETRY ${attempt}] ${context.endpoint}: ${error.message}`);
  },
};

const loggingClient = new BigshipClient(loggingConfig);

// ──────────────────────────────────────────────
// 2. Metrics collection
// ──────────────────────────────────────────────

const metrics = {
  requests: 0,
  errors: 0,
  retries: 0,
  totalDuration: 0,
};

const metricsConfig: BigshipConfig = {
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,

  onResponse: (_response, context) => {
    metrics.requests++;
    metrics.totalDuration += context.duration ?? 0;
  },

  onError: () => {
    metrics.errors++;
  },

  onRetry: () => {
    metrics.retries++;
  },
};

const metricsClient = new BigshipClient(metricsConfig);

// Use the client...
await metricsClient.getWalletBalance();

console.log('Metrics:', {
  requests: metrics.requests,
  errors: metrics.errors,
  retries: metrics.retries,
  avgDuration: metrics.requests > 0
    ? Math.round(metrics.totalDuration / metrics.requests)
    : 0,
});

// ──────────────────────────────────────────────
// 3. Custom logger adapter (Winston-style)
// ──────────────────────────────────────────────

const winstonAdapter: LoggerAdapter = {
  debug: (msg, data) => {
    // Winston: logger.debug(msg, { meta: data });
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[bigship:debug] ${msg}`, data);
    }
  },
  info:  (msg, data) => console.info(`[bigship:info] ${msg}`, data),
  warn:  (msg, data) => console.warn(`[bigship:warn] ${msg}`, data),
  error: (msg, data) => console.error(`[bigship:error] ${msg}`, data),
};

const clientWithWinston = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
  enableDetailedLogging: true,     // Must be true for logger to output
  loggerAdapter: winstonAdapter,
});
