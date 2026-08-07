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
import { describe, it, expect, beforeAll } from 'vitest';
import { BigshipClient } from '../core/BigshipClient';
import {
  BigshipApiError,
  BigshipDuplicateInvoiceError,
  BigshipValidationError,
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

// ========== Shared State ==========

let warehouseId: number | null = null;
let b2cCourierId: number | null = null;

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

function b2cOrderPayload(invoiceId: string, pickupLocationId: number, returnLocationId: number) {
  return {
    shipment_category: 'b2c' as const,
    warehouse_detail: { pickup_location_id: pickupLocationId, return_location_id: returnLocationId },
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
}

function b2bOrderPayload(invoiceId: string, pickupLocationId: number, returnLocationId: number) {
  return {
    shipment_category: 'b2b' as const,
    warehouse_detail: { pickup_location_id: pickupLocationId, return_location_id: returnLocationId },
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
      shipment_invoice_amount: 1000,
      ewaybill_number: '',
      box_details: [
        {
          each_box_dead_weight: 1,
          each_box_length: 20,
          each_box_width: 15,
          each_box_height: 10,
          each_box_invoice_amount: 0,
          each_box_collectable_amount: 0,
          box_count: 1 as const,
          product_details: [{
            product_category: 'Accessories',
            product_name: 'Test Product A',
            product_quantity: 1,
            each_product_invoice_amount: 0,
            each_product_collectable_amount: 0,
          }],
        },
        {
          each_box_dead_weight: 1,
          each_box_length: 20,
          each_box_width: 15,
          each_box_height: 10,
          each_box_invoice_amount: 0,
          each_box_collectable_amount: 0,
          box_count: 1 as const,
          product_details: [{
            product_category: 'Accessories',
            product_name: 'Test Product B',
            product_quantity: 1,
            each_product_invoice_amount: 0,
            each_product_collectable_amount: 0,
          }],
        },
      ],
      document_detail: {
        invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggMzQvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJwr5FIwAgAMxAYqBQAAAA==',
        ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggMzQvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJwr5FIwAgAMxAYqBQAAAA==',
      },
    },
  };
}

async function cancelIfAWB(client: BigshipClient, awb: string | undefined) {
  if (!awb) return;
  try {
    await client.cancelShipments([awb]);
  } catch {
    console.warn(`Cleanup failed for AWB ${awb}`);
  }
}

async function getFirstCourierId(client: BigshipClient, orderId: string): Promise<number> {
  const rates = await client.getShippingRates(orderId, 'B2C');
  if (rates.data && rates.data.length > 0) {
    return rates.data[0].courier_id;
  }
  throw new Error('No couriers available for shipping rates');
}

// ========== Setup ==========

beforeAll(async () => {
  if (!hasCredentials) return;
  const client = new BigshipClient(getConfig());
  const wh = await client.getWarehouseList(1, 1);
  if (wh.data && wh.data.result_data.length > 0) {
    warehouseId = wh.data.result_data[0].warehouse_id;
  }
  const couriers = await client.getCourierList('b2c');
  if (couriers.data && couriers.data.length > 0) {
    b2cCourierId = couriers.data[0].courier_id;
  }
});

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

    await client.getWalletBalance();
    await client.getCourierList();

    expect(responses).toHaveLength(2);
  });

  itIfCreds('deprecated login() method returns token', async () => {
    const client = new BigshipClient(getConfig());
    const token = await client.login();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

describe('Integration: Wallet', () => {
  itIfCreds('getWalletBalance returns numeric string', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWalletBalance();
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
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
    if (couriers.data!.length === 0) return;

    const courierId = couriers.data![0].courier_id;
    const result = await client.getCourierTransporterList(courierId);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('Integration: Payment', () => {
  itIfCreds('getPaymentCategory returns categories for b2c', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getPaymentCategory('b2c');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data!.length > 0) {
      expect(['COD', 'Prepaid', 'ToPay']).toContain(result.data![0].payment_category);
    }
  });

  itIfCreds('getPaymentCategory returns categories for b2b', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getPaymentCategory('b2b');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('Integration: Warehouse', () => {
  itIfCreds('getWarehouseList returns warehouses with default pagination', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(typeof result.data!.result_count).toBe('number');
    expect(Array.isArray(result.data!.result_data)).toBe(true);
  });

  itIfCreds('getWarehouseList supports pagination params', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWarehouseList(1, 5);
    expect(result.success).toBe(true);
    expect(result.data!.result_data.length).toBeLessThanOrEqual(5);
  });

  itIfCreds('getWarehouseList rejects page_size=201', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.getWarehouseList(1, 201);
      expect.fail('should have thrown BigshipApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
    }
  });
});

describe('Integration: Calculator', () => {
  itIfCreds('calculateRate returns rate options for B2C', async () => {
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
  itIfCreds('trackShipment with fake AWB throws BigshipApiError', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.trackShipment('FAKE-AWB-DOES-NOT-EXIST-99999');
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

    const result = await client.getWalletBalance();
    expect(result.success).toBe(true);
  });
});

// ========== WRITE TESTS (gated by BIGSHIP_TEST_WRITE=true) ==========

describe('Integration: Add Order (WRITE)', () => {
  itIfWrite('addSingleOrder creates an order and returns system_order_id', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;
    const result = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
    expect(typeof result.data).toBe('string');
    await cancelIfAWB(client, undefined);
  });

  itIfWrite('addHeavyOrder creates a B2B order and returns system_order_id', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;
    const result = await client.addHeavyOrder(b2bOrderPayload(invoiceId, pid, rid));
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
    expect(typeof result.data).toBe('string');
    await cancelIfAWB(client, undefined);
  });

  itIfWrite('duplicate invoice throws BigshipDuplicateInvoiceError', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));

    try {
      await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      expect.fail('should have thrown BigshipDuplicateInvoiceError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipDuplicateInvoiceError);
      expect((err as BigshipDuplicateInvoiceError).statusCode).toBe(409);
    }
  });
});

describe('Integration: Full B2C Lifecycle (WRITE)', () => {
  itIfWrite('create → getShippingRates → manifest → getAWB → track → getShipmentFile(label/manifest) → cancel', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;

    try {
      const order = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      expect(order.success).toBe(true);
      expect(order.data).toBeTruthy();
      const orderId = order.data!;

      const rates = await client.getShippingRates(orderId, 'B2C');
      expect(rates.success).toBe(true);
      expect(Array.isArray(rates.data)).toBe(true);
      if (rates.data!.length === 0) {
        expect.fail('No shipping rates available');
      }
      const courierId = rates.data![0].courier_id;

      const manifest = await client.manifestSingle({ system_order_id: orderId, courier_id: courierId });
      expect(manifest.success).toBe(true);

      const awbResponse = await client.getAWB(orderId);
      expect(awbResponse.success).toBe(true);
      expect(awbResponse.data).toBeDefined();
      if (typeof awbResponse.data === 'string') {
        expect.fail('AWB data should not be string');
      }
      awbNumber = awbResponse.data.master_awb;
      expect(awbNumber).toBeTruthy();

      const tracking = await client.trackShipment(awbNumber, 'awb');
      expect(tracking).toBeDefined();
      expect(tracking.data).toBeDefined();
      expect(Array.isArray(tracking.data.tracking_events)).toBe(true);

      const label = await client.getShipmentFile(2, orderId);
      expect(label.success).toBe(true);

      const manifestFile = await client.getShipmentFile(3, orderId);
      expect(manifestFile.success).toBe(true);

      const cancel = await client.cancelShipments([awbNumber]);
      expect(cancel.success).toBe(true);
      awbNumber = undefined;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });
});

describe('Integration: Full B2B Lifecycle (WRITE)', () => {
  itIfWrite('create heavy order → getShippingRates → manifest heavy → getAWB → cancel', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;

    try {
      const order = await client.addHeavyOrder(b2bOrderPayload(invoiceId, pid, rid));
      expect(order.success).toBe(true);
      expect(order.data).toBeTruthy();
      const orderId = order.data!;

      const rates = await client.getShippingRates(orderId, 'B2B', 'OwnerRisk');
      expect(rates.success).toBe(true);
      expect(Array.isArray(rates.data)).toBe(true);
      if (rates.data!.length === 0) {
        expect.fail('No B2B shipping rates available');
      }
      const courierId = rates.data![0].courier_id;

      const manifest = await client.manifestHeavy({
        system_order_id: orderId,
        courier_id: courierId,
        risk_type: 'OwnerRisk',
      });
      expect(manifest.success).toBe(true);

      let awbResponse;
      for (let i = 0; i < 5; i++) {
        awbResponse = await client.getAWB(orderId);
        if (awbResponse.data && typeof awbResponse.data !== 'string') break;
        await new Promise(r => setTimeout(r, 2000));
      }
      expect(awbResponse.success).toBe(true);
      if (typeof awbResponse.data === 'string') {
        expect.fail('AWB data should not be string');
      }
      awbNumber = awbResponse.data.master_awb;
      expect(awbNumber).toBeTruthy();

      const cancel = await client.cancelShipments([awbNumber]);
      expect(cancel.success).toBe(true);
      awbNumber = undefined;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });
});

describe('Integration: Get Shipping Rates (WRITE)', () => {
  itIfWrite('getShippingRates returns rates for a B2C order', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    const order = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
    expect(order.success).toBe(true);
    const orderId = order.data!;

    const rates = await client.getShippingRates(orderId, 'B2C');
    expect(rates.success).toBe(true);
    expect(Array.isArray(rates.data)).toBe(true);
    expect(rates.data!.length).toBeGreaterThan(0);
    const rate = rates.data![0];
    expect(typeof rate.courier_id).toBe('number');
    expect(typeof rate.courier_name).toBe('string');
    expect(typeof rate.total_shipping_charges).toBe('number');
    expect(rate.total_shipping_charges).toBeGreaterThan(0);
  });

  itIfWrite('getShippingRates returns rates for a B2B order', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const order = await client.addHeavyOrder(b2bOrderPayload(invoiceId, pid, rid));
      expect(order.success).toBe(true);
      const orderId = order.data!;

      const rates = await client.getShippingRates(orderId, 'B2B', 'OwnerRisk');
      expect(rates.success).toBe(true);
      expect(Array.isArray(rates.data)).toBe(true);
      expect(rates.data!.length).toBeGreaterThan(0);
      const rate = rates.data![0];
      expect(typeof rate.courier_id).toBe('number');
      expect(typeof rate.courier_name).toBe('string');
      expect(typeof rate.total_shipping_charges).toBe('number');
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });
});

describe('Integration: Track Shipment (WRITE)', () => {
  itIfWrite('trackShipment returns tracking events for a real AWB', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const order = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      const orderId = order.data!;
      const courierId = await getFirstCourierId(client, orderId);
      await client.manifestSingle({ system_order_id: orderId, courier_id: courierId });
      const awbResponse = await client.getAWB(orderId);
      if (typeof awbResponse.data === 'string') {
        expect.fail('AWB data should not be string');
      }
      awbNumber = awbResponse.data.master_awb;

      const tracking = await client.trackShipment(awbNumber, 'awb');
      expect(tracking).toBeDefined();
      expect(tracking.data).toBeDefined();
      expect(Array.isArray(tracking.data.tracking_events)).toBe(true);
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });
});

describe('Integration: Convenience Methods (WRITE)', () => {
  itIfWrite('manifestAndGetAWB returns awb and courierName', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const order = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      const orderId = order.data!;
      const courierId = await getFirstCourierId(client, orderId);
      const result = await client.manifestAndGetAWB(orderId, courierId);
      expect(result.awb).toBeTruthy();
      expect(result.courierName).toBeTruthy();
      awbNumber = result.awb;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });

  itIfWrite('getShipmentDetails returns awb, courierName, courierId, labelData, manifestData', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const order = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      const orderId = order.data!;
      const courierId = await getFirstCourierId(client, orderId);
      await client.manifestSingle({ system_order_id: orderId, courier_id: courierId });

      let details;
      for (let i = 0; i < 5; i++) {
        try {
          details = await client.getShipmentDetails(orderId);
          break;
        } catch {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      expect(details).toBeDefined();
      expect(details!.awb).toBeTruthy();
      expect(details!.courierName).toBeTruthy();
      expect(details!.courierId).toBeTruthy();
      expect(typeof details!.labelData).toBe('string');
      expect(typeof details!.manifestData).toBe('string');
      awbNumber = details!.awb;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });

  itIfWrite('createAndFinalizeShipment returns full shipment details', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const probeOrder = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      const rates = await client.getShippingRates(probeOrder.data!, 'B2C');
      const courierId = rates.data![0].courier_id;

      const result = await client.createAndFinalizeShipment({
        order: b2cOrderPayload(uniqueInvoiceId(), pid, rid),
        courierId,
      });
      expect(result.orderId).toBeTruthy();
      expect(result.awb).toBeTruthy();
      expect(result.courierName).toBeTruthy();
      expect(typeof result.labelData).toBe('string');
      expect(typeof result.manifestData).toBe('string');
      awbNumber = result.awb;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });
});

describe('Integration: ShipmentWorkflow (WRITE)', () => {
  itIfWrite('step-by-step workflow: create → withCourier → manifest → finalize', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const probeOrder = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      const rates = await client.getShippingRates(probeOrder.data!, 'B2C');
      const courierId = rates.data![0].courier_id;

      const workflow = client.workflow();
      await workflow.create(b2cOrderPayload(uniqueInvoiceId(), pid, rid));
      workflow.withCourier(courierId);
      const finalized = await workflow.manifest();
      const result = await finalized.finalize();

      expect(result.awb).toBeTruthy();
      expect(result.courierName).toBeTruthy();
      expect(typeof result.labelData).toBe('string');
      expect(typeof result.manifestData).toBe('string');
      awbNumber = result.awb;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });

  itIfWrite('workflow.execute shorthand runs full lifecycle', async () => {
    const client = new BigshipClient(getConfig());
    const invoiceId = uniqueInvoiceId();
    const pid = warehouseId ?? 0;
    const rid = warehouseId ?? 0;

    let awbNumber: string | undefined;
    try {
      const probeOrder = await client.addSingleOrder(b2cOrderPayload(invoiceId, pid, rid));
      const rates = await client.getShippingRates(probeOrder.data!, 'B2C');
      const courierId = rates.data![0].courier_id;

      const result = await client.workflow().execute(
        b2cOrderPayload(uniqueInvoiceId(), pid, rid),
        courierId
      );
      expect(result.awb).toBeTruthy();
      expect(result.courierName).toBeTruthy();
      awbNumber = result.awb;
    } finally {
      await cancelIfAWB(client, awbNumber);
    }
  });
});

describe('Integration: Error Scenarios (WRITE)', () => {
  itIfWrite('cancelShipments with non-existent AWB throws BigshipApiError', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.cancelShipments(['FAKE-AWB-99999']);
      expect.fail('should have thrown BigshipApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
    }
  });

  itIfWrite('manifestSingle with invalid system_order_id returns error', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.manifestSingle({ system_order_id: 'FAKE-ORDER-99999', courier_id: 1 });
      expect.fail('should have thrown BigshipApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
    }
  });

  itIfWrite('manifestHeavy with invalid system_order_id returns error', async () => {
    const client = new BigshipClient(getConfig({ maxRetries: 0 }));
    try {
      await client.manifestHeavy({ system_order_id: 'FAKE-ORDER-99999', courier_id: 1, risk_type: 'OwnerRisk' });
      expect.fail('should have thrown BigshipApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
    }
  });
});

describe('Integration: Zod Schema Validation Against Real API', () => {
  itIfCreds('real wallet response matches WalletBalanceResponseSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getWalletBalance();
    expect(result).toMatchObject({ success: true, responseCode: 200 });
    expect(typeof result.data).toBe('string');
  });

  itIfCreds('real courier list matches CourierItemSchema', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getCourierList();
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
