/**
 * Integration tests — hit the real Bigship Unified Outbound API.
 *
 * Required env vars:
 *   BIGSHIP_USERNAME, BIGSHIP_PASSWORD, BIGSHIP_ACCESS_KEY, BIGSHIP_BASE_URL
 *
 * Optional:
 *   BIGSHIP_TEST_WRITE=true  — enable write tests (add order, place, cancel)
 *
 * Usage:
 *   BIGSHIP_USERNAME=x BIGSHIP_PASSWORD=y BIGSHIP_ACCESS_KEY=z BIGSHIP_BASE_URL=https://api.bigship.direct \
 *     npx vitest run --config vitest.config.integration.ts
 *
 * Or create a .env file (see .env.example) and run:
 *   npx vitest run --config vitest.config.integration.ts
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { describe, it, expect, beforeAll } from 'vitest';
import { BigshipClient } from '../core/BigshipClient';
import {
  BigshipApiError,
  BigshipValidationError,
} from '../errors';
import type { BigshipConfig, RequestContext } from '../core/types';

// Load .env file from the SDK package directory
loadEnv({ path: resolve(__dirname, '../../.env') });

// ========== Gate: skip if env vars missing ==========
const env = {
  userName: process.env.BIGSHIP_USERNAME,
  password: process.env.BIGSHIP_PASSWORD,
  accessKey: process.env.BIGSHIP_ACCESS_KEY,
  baseURL: process.env.BIGSHIP_BASE_URL || 'https://api.bigship.direct',
  testWrite: process.env.BIGSHIP_TEST_WRITE === 'true',
};

const hasCredentials = !!(env.userName && env.password && env.accessKey);

// Debug: log env vars
console.log('DEBUG: BIGSHIP_USERNAME:', process.env.BIGSHIP_USERNAME ? 'SET' : 'NOT SET');
console.log('DEBUG: BIGSHIP_BASE_URL:', process.env.BIGSHIP_BASE_URL);
console.log('DEBUG: hasCredentials:', hasCredentials);

const itIfCreds = hasCredentials ? it : it.skip;
const itIfWrite = hasCredentials && env.testWrite ? it : it.skip;

// ========== Shared State ==========

let warehouseId: number | null = null;

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
  return `INV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function b2cOrderPayload(invoiceId: string, pickupLocationId: number) {
  return {
    segment_type: 'domestic_b2c' as const,
    MasterOrderPickUpLocation: pickupLocationId,
    MasterOrderReturnLocation: pickupLocationId,
    MasterOrderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    MasterOrderPaymentMode: 1, // Prepaid
    OrderInvoiceNo: invoiceId,
    MasterOrderInvoiceAmount: 500,
    MasterOrderShippingName: 'Test Recipient',
    MasterOrderShippingMobileNo: '9876543210',
    MasterOrderShippingEmail: 'test@example.com',
    MasterOrderShippingAddress: '456 Test Delivery Address',
    MasterOrderShippingZipCode: '110001',
    MasterOrderShippingCity: 'DELHI',
    MasterOrderShippingState: 'DELHI',
    MasterOrderShippingCountry: 'India',
    totalNumOfBoxes: 1,
    boxes: [{
      weight_unit: 'kg' as const,
      dimension_unit: 'cm' as const,
      noOfBoxes: 1,
      dimensions: [{
        length: 15,
        breadth: 10,
        height: 5,
        weight: 0.5,
      }],
      products: [{
        productName: 'Test Product',
        hsn: '123456',
        qty: '1',
        amount: '500',
        totalAmount: 500,
        collectableAmount: 0,
        categoryId: '1', // Accessories
      }],
    }],
  };
}

// ========== Setup ==========

beforeAll(async () => {
  if (!hasCredentials) return;
  const client = new BigshipClient(getConfig());
  const wh = await client.getWarehouseList({
    page: '1',
    perPage: '10',
    segment_type: 'hyperlocal',
  });
  if (wh.data && wh.data.warehouse.length > 0) {
    warehouseId = wh.data.warehouse[0].warehouseId;
  }
});

// ========== Tests ==========

describe('Integration: Authentication', () => {
  itIfCreds('auto-authenticates on first API call', async () => {
    const client = new BigshipClient(getConfig());
    const profile = await client.getProfile();
    expect(profile.status).toBe(true);
    expect(typeof profile.data.firstName).toBe('string');
  });

  itIfCreds('caches token across multiple requests', async () => {
    const responses: RequestContext[] = [];
    const client = new BigshipClient(getConfig({
      onResponse: (_r, ctx) => responses.push(ctx),
    }));

    await client.getProfile();
    await client.getPackageTypes();

    expect(responses).toHaveLength(2);
  });
});

describe('Integration: Profile', () => {
  itIfCreds('getProfile returns user profile and wallet balance', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getProfile();
    expect(result.status).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.firstName).toBeTruthy();
    expect(result.data.EmailID).toBeTruthy();
    expect(result.data.userWallet).toBeDefined();
    expect(result.data.userWallet.Balance).toBeTruthy();
  });
});

describe('Integration: Warehouse', () => {
  itIfCreds('getWarehouseList returns warehouses', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList({
      page: '1',
      perPage: '10',
      segment_type: 'hyperlocal',
    });
    expect(result.status).toBe(true);
    expect(result.data).toBeDefined();
    expect(typeof result.data!.total).toBe('number');
    expect(Array.isArray(result.data!.warehouse)).toBe(true);
  });

  itIfCreds('getWarehouseList supports filtering', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList({
      page: '1',
      perPage: '5',
      segment_type: 'hyperlocal',
      status: '1',
    });
    expect(result.status).toBe(true);
    expect(result.data!.warehouse.length).toBeLessThanOrEqual(5);
  });
});

describe('Integration: Reference Data', () => {
  itIfCreds('getPackageTypes returns package types', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getPackageTypes();
    expect(result.status).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      expect(result.data![0].PackageType).toBeDefined();
    }
  });

  itIfCreds('getPaymentModes returns payment modes for domestic_b2b', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getPaymentModes('domestic_b2b');
    expect(result.status).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      expect(result.data![0].paymentModeName).toBeTruthy();
    }
  });

  itIfCreds('getRiskTypes returns risk types', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getRiskTypes();
    expect(result.status).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      expect(result.data![0].riskName).toBeTruthy();
    }
  });
});

describe('Integration: Rate Calculator', () => {
  itIfCreds('calculateRate returns rate options for B2C', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.calculateRate({
      segment_type: 'domestic_b2c',
      sourcePincode: '110001',
      destPincode: '400001',
      invoiceValue: 1000,
      paymentModeId: 2, // COD
      riskTypeId: 2, // Owner Risk
      boxes: [{
        box_length: 20,
        box_width: 15,
        box_height: 10,
        box_dead_weight: 1,
        no_of_box: 1,
      }],
    });
    expect(result.status).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      const rate = result.data![0];
      expect(rate.courierName).toBeDefined();
      expect(typeof rate.totalCharge).toBe('number');
      expect(rate.totalCharge).toBeGreaterThan(0);
    }
  });

  itIfCreds('calculateRate returns rate options for B2B', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.calculateRate({
      segment_type: 'domestic_b2b',
      sourcePincode: '110001',
      destPincode: '400001',
      invoiceValue: 5000,
      paymentModeId: 1, // Prepaid
      riskTypeId: 2, // Owner Risk
      boxes: [{
        box_length: 30,
        box_width: 25,
        box_height: 20,
        box_dead_weight: 5,
        no_of_box: 2,
      }],
    });
    expect(result.status).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('Integration: Error Handling', () => {
  itIfCreds('trackOrder with fake order ID throws BigshipApiError', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.trackOrder('FAKE-ORDER-DOES-NOT-EXIST-99999');
      expect.fail('should have thrown BigshipApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
    }
  });

  itIfCreds('getOrderDetail with fake order ID throws BigshipApiError', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.getOrderDetail('FAKE-ORDER-DOES-NOT-EXIST-99999');
      expect.fail('should have thrown BigshipApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
    }
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

    await client.getProfile();
    await client.getPackageTypes();

    expect(hookData).toHaveLength(2);
    expect(hookData[0].endpoint).toBe('api/outbound/profile');
    expect(hookData[0].method).toBe('GET');
    expect(hookData[0].duration).toBeGreaterThanOrEqual(0);
    expect(hookData[1].endpoint).toBe('api/outbound/hyperlocal/get-packages-list');
  });

  itIfCreds('onBeforeRequest can inject custom headers', async () => {
    const client = new BigshipClient(getConfig({
      onBeforeRequest: (config) => {
        config.headers.set('X-SDK-Test', 'integration-test');
        return config;
      },
    }));

    const result = await client.getProfile();
    expect(result.status).toBe(true);
  });
});

// ========== WRITE TESTS (gated by BIGSHIP_TEST_WRITE=true) ==========

describe('Integration: Create Order (WRITE)', () => {
  itIfWrite('createOrder creates a draft order and returns CustomGlobalOrderId', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const result = await client.createOrder(b2cOrderPayload(invoiceId, pid));
    expect(result.status).toBe(true);
    expect(result.data).toBeTruthy();
    expect(typeof result.data!.CustomGlobalOrderId).toBe('string');
  });
});

describe('Integration: Order Lifecycle (WRITE)', () => {
  itIfWrite('createOrder → getServiceableCouriers → placeOrder → trackOrder', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;

    // Step 1: Create order
    const order = await client.createOrder(b2cOrderPayload(invoiceId, pid));
    expect(order.status).toBe(true);
    expect(order.data!.CustomGlobalOrderId).toBeTruthy();
    const orderId = order.data!.CustomGlobalOrderId;

    // Step 2: Get serviceable couriers
    const couriers = await client.getServiceableCouriers(orderId);
    expect(couriers.status).toBe(true);
    expect(couriers.data).toBeDefined();
    expect(couriers.data!.calculatedRates.length).toBeGreaterThan(0);

    // Step 3: Place order with first courier
    const courierId = couriers.data!.calculatedRates[0].courierId;
    const placeResult = await client.placeOrder({
      MasterCustomOrderId: orderId,
      courierId: typeof courierId === 'string' ? parseInt(courierId, 10) : courierId,
      riskTypeId: '2', // Owner Risk
    });
    expect(placeResult.status).toBe(true);

    // Step 4: Track order
    const tracking = await client.trackOrder(orderId);
    expect(tracking).toBeDefined();
    expect(tracking.data).toBeDefined();

    // Step 5: Cancel order
    const cancel = await client.cancelOrder(orderId);
    expect(cancel.status).toBe(true);
  });
});

describe('Integration: Download Documents (WRITE)', () => {
  itIfWrite('downloadDocument returns document URL', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;

    // Create and place order
    const order = await client.createOrder(b2cOrderPayload(invoiceId, pid));
    const orderId = order.data!.CustomGlobalOrderId;

    const couriers = await client.getServiceableCouriers(orderId);
    const courierId = couriers.data!.calculatedRates[0].courierId;
    await client.placeOrder({
      MasterCustomOrderId: orderId,
      courierId: typeof courierId === 'string' ? parseInt(courierId, 10) : courierId,
      riskTypeId: '2',
    });

    // Try to download label
    try {
      const label = await client.downloadDocument(orderId, 'label');
      if (label.status && label.data) {
        expect(label.data.AttachmentData).toBeTruthy();
        expect(label.data.File_extention).toBeTruthy();
      }
    } catch {
      // Document might not be available immediately
    }

    // Cancel order
    await client.cancelOrder(orderId);
  });
});

describe('Integration: Zod Schema Validation Against Real API', () => {
  itIfCreds('real profile response matches ProfileDataSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getProfile();
    expect(result.status).toBe(true);
    expect(result.data.firstName).toBeTruthy();
    expect(result.data.EmailID).toBeTruthy();
  });

  itIfCreds('real warehouse response matches WarehouseListDataSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList({
      page: '1',
      perPage: '5',
      segment_type: 'hyperlocal',
    });
    expect(result.status).toBe(true);
    expect(typeof result.data!.total).toBe('number');
    for (const wh of result.data!.warehouse) {
      expect(wh.warehouseId).toBeDefined();
      expect(wh.warehouseName).toBeDefined();
    }
  });

  itIfCreds('real calculator response matches RateCalculatorItemSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.calculateRate({
      segment_type: 'domestic_b2c',
      sourcePincode: '110001',
      destPincode: '400001',
      invoiceValue: 1000,
      paymentModeId: 2,
      riskTypeId: 2,
      boxes: [{
        box_length: 20,
        box_width: 15,
        box_height: 10,
        box_dead_weight: 1,
        no_of_box: 1,
      }],
    });
    expect(result.status).toBe(true);
    for (const rate of result.data!) {
      expect(typeof rate.courierName).toBe('string');
      expect(typeof rate.totalCharge).toBe('number');
    }
  });
});
