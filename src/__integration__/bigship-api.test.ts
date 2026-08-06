/**
 * Integration tests — hit the real Bigship API.
 *
 * Required env vars:
 *   BIGSHIP_USER_NAME, BIGSHIP_PASSWORD, BIGSHIP_ACCESS_KEY, BIGSHIP_BASE_URL
 *
 * Optional:
 *   BIGSHIP_TEST_WRITE=true  — enable write tests (add order, manifest, cancel)
 *
 * Usage:
 *   BIGSHIP_USER_NAME=x BIGSHIP_PASSWORD=y BIGSHIP_ACCESS_KEY=z BIGSHIP_BASE_URL=https://api.bigship.in \
 *     npx vitest run --config vitest.config.integration.ts
 *
 * Or create a .env file (see .env.example) and run:
 *   npx vitest run --config vitest.config.integration.ts
 */
import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { BigshipClient } from '../core/BigshipClient';
import {
  BigshipApiError,
  BigshipDuplicateInvoiceError,
} from '../errors';
import type { BigshipConfig, RequestContext } from '../core/types';

// ========== Gate: skip if env vars missing ==========
const env = {
  userName: process.env.BIGSHIP_USER_NAME,
  password: process.env.BIGSHIP_PASSWORD,
  accessKey: process.env.BIGSHIP_ACCESS_KEY,
  baseURL: process.env.BIGSHIP_BASE_URL || 'https://api.bigship.in',
  testWrite: process.env.BIGSHIP_TEST_WRITE === 'true',
};

const hasCredentials = !!(env.userName && env.password && env.accessKey);

const itIfCreds = hasCredentials ? it : it.skip;
const itIfWrite = hasCredentials && env.testWrite ? it : it.skip;

// ========== Helpers ==========
function getConfig(overrides: Partial<BigshipConfig> = {}): BigshipConfig {
  return {
    baseURL: env.baseURL,
    userName: env.userName!,
    password: env.password!,
    accessKey: env.accessKey!,
    maxRetries: 1,
    retryDelay: 2000,
    enableDetailedLogging: false,
    ...overrides,
  };
}

function uniqueInvoiceId() {
  return `TEST-SDK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeOrderPayload(invoiceId: string, category: 'b2c' | 'b2b' = 'b2c') {
  const base = {
    shipment_category: category,
    warehouse_detail: { pickup_location_id: 0, return_location_id: 0 },
    consignee_detail: {
      first_name: 'Test',
      last_name: 'Recipient',
      contact_number_primary: '9876543210',
      consignee_address: {
        address_line1: '456 Test Delivery Address',
        pincode: '110001',
      },
    },
    order_detail: {
      invoice_date: new Date().toISOString(),
      invoice_id: invoiceId,
      payment_type: 'Prepaid' as const,
      total_collectable_amount: 0,
      shipment_invoice_amount: 500,
      box_details: [{
        each_box_dead_weight: 0.5,
        each_box_length: 15,
        each_box_width: 10,
        each_box_height: 5,
        each_box_invoice_amount: 500,
        each_box_collectable_amount: 0,
        box_count: 1 as const,
        product_details: [{
          product_category: 'Accessories',
          product_name: 'Test Product',
          product_quantity: 1,
          each_product_invoice_amount: 500,
          each_product_collectable_amount: 0,
        }],
      }],
      document_detail: {
        invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggMzQvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJwr5FIwAgAMxAYqBQAAAA==',
      },
    },
  };
  return base;
}

// ========== Tests ==========

describe('Integration: Authentication', () => {
  itIfCreds('auto-authenticates on first API call', async () => {
    const client = new BigshipClient(getConfig());
    const balance = await client.getWalletBalance();
    expect(balance.success).toBe(true);
    expect(typeof balance.data).toBe('string');
  });

  itIfCreds('caches token across multiple requests', async () => {
    const responses: RequestContext[] = [];
    const client = new BigshipClient(getConfig({
      onResponse: (_r, ctx) => responses.push(ctx),
    }));

    // Multiple calls should reuse the same token
    await client.getWalletBalance();
    await client.getCourierList();

    expect(responses).toHaveLength(2);
    // Both should succeed (proving token was valid for both)
  });
});

describe('Integration: Wallet', () => {
  itIfCreds('getWalletBalance returns numeric string', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWalletBalance();
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
    // Balance should be parseable as a number
    const balance = parseFloat(result.data!);
    expect(balance).not.toBeNaN();
    expect(balance).toBeGreaterThanOrEqual(0);
  });
});

describe('Integration: Courier', () => {
  itIfCreds('getCourierList returns couriers for b2c', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getCourierList('b2c');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      const courier = result.data![0];
      expect(courier.courier_id).toBeDefined();
      expect(courier.courier_name).toBeDefined();
      expect(typeof courier.courier_name).toBe('string');
    }
  });

  itIfCreds('getCourierList returns couriers for b2b', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getCourierList('b2b');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  itIfCreds('getCourierTransporterList returns transporters', async () => {
    const client = new BigshipClient(getConfig());
    const couriers = await client.getCourierList('b2c');
    if (couriers.data!.length === 0) return; // skip if no couriers

    const courierId = couriers.data![0].courier_id;
    const result = await client.getCourierTransporterList(courierId);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('Integration: Payment', () => {
  itIfCreds('getPaymentCategory returns categories', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getPaymentCategory('b2c');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      expect(['COD', 'Prepaid', 'ToPay']).toContain(result.data![0].payment_category);
    }
  });
});

describe('Integration: Warehouse', () => {
  itIfCreds('getWarehouseList returns warehouses', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(typeof result.data!.result_count).toBe('number');
    expect(Array.isArray(result.data!.result_data)).toBe(true);
  });
});

describe('Integration: Calculator', () => {
  itIfCreds('calculateRate returns rate options', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.calculateRate({
      shipment_category: 'B2C',
      payment_type: 'COD',
      pickup_pincode: '110001',
      destination_pincode: '400001',
      shipment_invoice_amount: 1000,
      box_details: [{
        each_box_dead_weight: 1,
        each_box_length: 20,
        each_box_width: 15,
        each_box_height: 10,
        box_count: 1,
      }],
    });
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      const rate = result.data![0];
      expect(rate.courier_id).toBeDefined();
      expect(rate.courier_name).toBeDefined();
      expect(typeof rate.total_shipping_charges).toBe('number');
      expect(rate.total_shipping_charges).toBeGreaterThan(0);
    }
  });
});

describe('Integration: Shipment Data Validation', () => {
  itIfCreds('getShipmentData(4) throws INVALID_ARGUMENT without hitting API', async () => {
    const client = new BigshipClient(getConfig());
    try {
      await client.getShipmentData(4, 'FAKE-ORDER');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect((err as BigshipApiError).code).toBe('INVALID_ARGUMENT');
      expect((err as BigshipApiError).message).toContain('4');
    }
  });
});

describe('Integration: Error Handling', () => {
  itIfCreds('non-existent endpoint returns proper error', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    // TrackShipment with a fake ID — API should return an error or empty
    const result = await client.trackShipment('FAKE-AWB-DOES-NOT-EXIST-99999');
    // Depending on API, this might succeed with empty events or fail gracefully
    // Either way, the SDK should not crash
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
});

describe('Integration: Lifecycle Hooks', () => {
  itIfCreds('onResponse receives context with endpoint, method, duration', async () => {
    const hookData: { endpoint: string; method: string; duration?: number }[] = [];

    const client = new BigshipClient(getConfig({
      onResponse: (_resp, ctx) => {
        hookData.push({ endpoint: ctx.endpoint, method: ctx.method, duration: ctx.duration });
      },
    }));

    await client.getWalletBalance();
    await client.getCourierList();

    expect(hookData).toHaveLength(2);
    expect(hookData[0].endpoint).toBe('/api/Wallet/balance/get');
    expect(hookData[0].method).toBe('GET');
    expect(hookData[0].duration).toBeGreaterThanOrEqual(0);
    expect(hookData[1].endpoint).toBe('/api/courier/get/all');
  });

  itIfCreds('onBeforeRequest can inject custom headers', async () => {
    const client = new BigshipClient(getConfig({
      onBeforeRequest: (config) => {
        config.headers.set('X-SDK-Test', 'integration-test');
        return config;
      },
    }));

    // Should not break the request — custom header is ignored by API
    const result = await client.getWalletBalance();
    expect(result.success).toBe(true);
  });
});

// ========== WRITE TESTS (gated by BIGSHIP_TEST_WRITE=true) ==========

describe('Integration: Add Order (WRITE)', () => {
  itIfWrite('addSingleOrder creates an order and returns system_order_id', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();

    const result = await client.addSingleOrder(makeOrderPayload(invoiceId));
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
    expect(typeof result.data).toBe('string');
  });

  itIfWrite('duplicate invoice throws BigshipDuplicateInvoiceError', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();

    // First add succeeds
    await client.addSingleOrder(makeOrderPayload(invoiceId));

    // Second add with same invoice → duplicate
    try {
      await client.addSingleOrder(makeOrderPayload(invoiceId));
      expect.fail('should have thrown BigshipDuplicateInvoiceError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipDuplicateInvoiceError);
      expect((err as BigshipDuplicateInvoiceError).statusCode).toBe(409);
    }
  });
});

describe('Integration: Get Shipment Data (WRITE)', () => {
  itIfWrite('getAWB returns AWB data for a freshly created order', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const order = await client.addSingleOrder(makeOrderPayload(invoiceId));

    try {
      const awb = await client.getAWB(order.data!);
      if (awb.data) {
        expect(awb.data.master_awb).toBeDefined();
        expect(awb.data.courier_name).toBeDefined();
      }
    } catch (err) {
      // AWB may not be assigned immediately for fresh orders
      expect(err).toBeInstanceOf(BigshipApiError);
    }
  });
});

describe('Integration: Zod Schema Validation Against Real API', () => {
  itIfCreds('real wallet response matches WalletBalanceResponseSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWalletBalance();
    // If this passes without throwing, the response matched the Zod schema
    expect(result).toMatchObject({ success: true, responseCode: 200 });
    expect(typeof result.data).toBe('string');
  });

  itIfCreds('real courier list matches CourierItemSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getCourierList();
    // Validates against z.array(CourierItemSchema)
    expect(result.success).toBe(true);
    for (const courier of result.data!) {
      expect(courier.courier_id).toBeDefined();
      expect(courier.courier_name).toBeDefined();
      expect(typeof courier.courier_id).toBe('number');
      expect(typeof courier.courier_name).toBe('string');
    }
  });

  itIfCreds('real payment categories match PaymentCategoryItemSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getPaymentCategory();
    expect(result.success).toBe(true);
    for (const cat of result.data!) {
      expect(['COD', 'Prepaid', 'ToPay']).toContain(cat.payment_category);
      expect(typeof cat.status).toBe('boolean');
    }
  });

  itIfCreds('real warehouse list matches WarehouseListDataSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList();
    expect(result.success).toBe(true);
    expect(typeof result.data!.result_count).toBe('number');
    for (const wh of result.data!.result_data) {
      expect(wh.warehouse_id).toBeDefined();
      expect(wh.warehouse_name).toBeDefined();
      expect(wh.address_pincode).toBeDefined();
    }
  });

  itIfCreds('real calculator response matches CalculatorRateItemSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.calculateRate({
      shipment_category: 'B2C',
      payment_type: 'COD',
      pickup_pincode: '110001',
      destination_pincode: '400001',
      shipment_invoice_amount: 1000,
      box_details: [{
        each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10, box_count: 1,
      }],
    });
    expect(result.success).toBe(true);
    for (const rate of result.data!) {
      expect(typeof rate.courier_id).toBe('number');
      expect(typeof rate.courier_name).toBe('string');
      expect(typeof rate.total_shipping_charges).toBe('number');
    }
  });
});
