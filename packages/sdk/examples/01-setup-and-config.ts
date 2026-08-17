/**
 * 01 — Setup & Configuration
 *
 * Every way to initialize BigshipClient and every config option.
 * Run: npx tsx examples/01-setup-and-config.ts
 */

import {
  BigshipClient,
  type BigshipConfig,
  type LoggerAdapter,
} from '@agamya/bigship-sdk';

// ──────────────────────────────────────────────
// 1. Minimal setup (4 required fields)
// ──────────────────────────────────────────────

const client = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

// ──────────────────────────────────────────────
// 2. Full config (every option shown)
// ──────────────────────────────────────────────

const fullConfig: BigshipConfig = {
  // ── Required ──
  baseURL: 'https://api.bigship.in',            // Use sandbox URL for testing
  userName: process.env.BIGSHIP_USERNAME!,       // Your Bigship account email
  password: process.env.BIGSHIP_PASSWORD!,       // Your Bigship account password
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,    // API access key from Bigship dashboard

  // ── Timeouts & retries ──
  timeout: 30000,                                // Request timeout in ms (default: 15000)
  maxRetries: 5,                                 // Max retry attempts (default: 3)
  retryDelay: 2000,                              // Base delay between retries in ms (default: 1000)
  maxRetryDelay: 60000,                          // Upper bound for exponential backoff (default: 30000)
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504], // HTTP codes that trigger retry

  // ── Token management ──
  tokenTtlMs: 15 * 60 * 1000,                   // Token cache TTL in ms (default: 55 min)

  // ── Logging ──
  enableDetailedLogging: true,                   // Log all requests/responses (default: false)
};

const clientFull = new BigshipClient(fullConfig);

// ──────────────────────────────────────────────
// 3. Custom logger (Winston, pino, etc.)
// ──────────────────────────────────────────────

const myLogger: LoggerAdapter = {
  debug: (msg, data) => console.debug(`[bigship] ${msg}`, data),
  info:  (msg, data) => console.info(`[bigship] ${msg}`, data),
  warn:  (msg, data) => console.warn(`[bigship] ${msg}`, data),
  error: (msg, data) => console.error(`[bigship] ${msg}`, data),
};

const clientWithLogger = new BigshipClient({
  baseURL: 'https://api.bigship.in',
  userName: process.env.BIGSHIP_USERNAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
  enableDetailedLogging: true,
  loggerAdapter: myLogger,
});

// ──────────────────────────────────────────────
// 4. AbortController — cancel a request
// ──────────────────────────────────────────────

const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // Cancel after 5 seconds

try {
  const balance = await client.getWalletBalance({ signal: controller.signal });
  console.log('Balance:', balance.data);
} catch (err) {
  if (err instanceof Error && err.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}

// ──────────────────────────────────────────────
// 5. Per-request timeout override
// ──────────────────────────────────────────────

const rates = await client.calculateRate(
  {
    shipment_category: 'B2C',
    payment_type: 'Prepaid',
    pickup_pincode: '110001',
    destination_pincode: '400001',
    shipment_invoice_amount: 1000,
    box_details: [{
      each_box_dead_weight: 1,
      each_box_length: 10,
      each_box_width: 10,
      each_box_height: 10,
      box_count: 1,
    }],
  },
  { timeout: 60000 }, // 60s for this specific call, overrides the 15s default
);

console.log('Rates:', rates.data);
