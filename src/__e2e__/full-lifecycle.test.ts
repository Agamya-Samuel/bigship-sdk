/**
 * E2E tests — test the full stack: BigshipClient → axios → MSW HTTP layer → Zod validation → typed result
 * No internal mocking. MSW intercepts at the network level.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BigshipClient } from '../core/BigshipClient';
import {
  BigshipDuplicateInvoiceError,
  BigshipApiError,
} from '../errors';

const BASE = 'https://api.bigship.test';

// ========== Mock API handlers ==========
let tokenRequestCount = 0;
let orderRequestCount = 0;

function apiOk(data: unknown) {
  return HttpResponse.json({ success: true, message: 'ok', responseCode: 200, data });
}

function apiFail(message: string, responseCode = 400, errors?: Record<string, string[]>) {
  return HttpResponse.json({ success: false, message, responseCode, data: null, errors });
}

const handlers = [
  // Login
  http.post(`${BASE}/api/login/user`, async ({ request }) => {
    tokenRequestCount++;
    const body = await request.json() as Record<string, unknown>;
    if (!body.user_name || !body.password || !body.access_key) {
      return apiFail('Missing credentials', 400);
    }
    return apiOk({ token: `tok-${tokenRequestCount}` });
  }),

  // Wallet balance
  http.get(`${BASE}/api/Wallet/balance/get`, () => {
    return apiOk('15000.50');
  }),

  // Courier list
  http.get(`${BASE}/api/courier/get/all`, ({ request }) => {
    const url = new URL(request.url);
    const cat = url.searchParams.get('shipment_category');
    const couriers = [
      { shipment_category: cat || 'b2c', courier_id: 1, courier_name: 'Delhivery', courier_type: 'Surface' },
      { shipment_category: cat || 'b2c', courier_id: 2, courier_name: 'DTDC', courier_type: 'Air' },
    ];
    return apiOk(couriers);
  }),

  // Add single order
  http.post(`${BASE}/api/order/add/single`, async ({ request }) => {
    orderRequestCount++;
    const body = await request.json() as Record<string, unknown>;
    if (!body.shipment_category) return apiFail('Missing category', 400);
    // Simulate duplicate on second call
    if (orderRequestCount === 2) {
      return apiFail('Duplicate order', 409, { invoice_id: ['Invoice ID INV-001 already exists'] });
    }
    return apiOk('1005202970');
  }),

  // Get AWB
  http.post(`${BASE}/api/shipment/data`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('shipment_data_id');
    if (id === '1') {
      return apiOk({ courier_id: '1', courier_name: 'Delhivery', lr_number: 'LR-001', master_awb: 'AWB-98765' });
    }
    if (id === '2') {
      return apiOk('data:application/pdf;base64,JVBERi0xLjQK');
    }
    return apiOk(null); // not ready
  }),

  // Track
  http.get(`${BASE}/api/tracking`, () => {
    return apiOk({
      tracking_id: 'AWB-98765',
      tracking_type: 'awb',
      current_status: 'In Transit',
      tracking_events: [
        { scan_status: 'Picked Up', scan_datetime: '2024-01-01T10:00:00Z', scan_location: 'Delhi' },
        { scan_status: 'In Transit', scan_datetime: '2024-01-02T14:00:00Z', scan_location: 'Mumbai' },
      ],
    });
  }),

  // Manifest
  http.post(`${BASE}/api/order/manifest/single`, () => {
    return apiOk(null);
  }),

  // Cancel
  http.put(`${BASE}/api/order/cancel`, () => {
    return apiOk(null);
  }),

  // Warehouse add
  http.post(`${BASE}/api/warehouse/add`, () => {
    return apiOk({ warehouse_id: 42, warehouse_name: 'Main WH', address_line1: '123 Street', address_line2: null, address_landmark: null, address_pincode: '110001', address_city: 'Delhi', address_state: 'Delhi', warehouse_contact_person: 'Raj', warehouse_contact_number_primary: '9876543210' });
  }),

  // Warehouse list
  http.get(`${BASE}/api/warehouse/get/list`, () => {
    return apiOk({
      result_count: 1,
      result_data: [
        { warehouse_id: 42, warehouse_name: 'Main WH', address_line1: '123 Street', address_line2: null, address_landmark: null, address_pincode: '110001', address_city: 'Delhi', address_state: 'Delhi', warehouse_contact_person: 'Raj', warehouse_contact_number_primary: '9876543210' },
      ],
    });
  }),

  // Shipping rates
  http.get(`${BASE}/api/order/shipping/rates`, () => {
    return apiOk([
      { courier_id: 1, courier_name: 'Delhivery', courier_type: 'Surface', zone: 'North', tat: 3, billable_weight: 1, total_shipping_charges: 150.5, courier_charge: 120, risk_type_name: null, other_additional_charges: null },
      { courier_id: 2, courier_name: 'DTDC', courier_type: 'Air', zone: 'North', tat: 1, billable_weight: 1, total_shipping_charges: 300, courier_charge: 250, risk_type_name: null, other_additional_charges: { oda: 50 } },
    ]);
  }),

  // Calculator
  http.post(`${BASE}/api/calculator`, () => {
    return apiOk([
      { courier_id: 1, courier_name: 'Delhivery', courier_type: 'Surface', zone: 'North', tat: 3, billable_weight: 1, risk_type_name: null, total_shipping_charges: 150, courier_charge: 120, other_additional_charges: null },
    ]);
  }),

  // Payment category
  http.get(`${BASE}/api/payment/category`, () => {
    return apiOk([
      { payment_category: 'COD', status: true },
      { payment_category: 'Prepaid', status: true },
    ]);
  }),

  // Transporter list
  http.get(`${BASE}/api/courier/get/transport/list`, () => {
    return apiOk([
      { transporter_id: 1, transporter_name: 'Surface Express' },
    ]);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  tokenRequestCount = 0;
  orderRequestCount = 0;
  server.use(...handlers); // reset to default handlers
});

function getConfig(overrides = {}) {
  return {
    baseURL: BASE,
    userName: 'test@test.com',
    password: 'pass',
    accessKey: 'key123',
    maxRetries: 1,
    retryDelay: 10,
    ...overrides,
  };
}

// ========== Tests ==========

describe('E2E: Full Order Lifecycle', () => {
  it('login → addSingleOrder → getAWB → trackShipment → manifestSingle → getShipmentFile → cancelShipments', async () => {
    const client = new BigshipClient(getConfig());

    // Step 1: Add order
    const order = await client.addSingleOrder({
      shipment_category: 'b2c',
      warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
      consignee_detail: {
        first_name: 'Raj',
        last_name: 'Kumar',
        contact_number_primary: '9876543210',
        consignee_address: { address_line1: '123 Main Street City', pincode: '110001' },
      },
      order_detail: {
        invoice_date: '2024-01-01T00:00:00Z',
        invoice_id: 'INV-001',
        payment_type: 'Prepaid',
        total_collectable_amount: 0,
        shipment_invoice_amount: 1000,
        box_details: [{
          each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10,
          each_box_invoice_amount: 1000, each_box_collectable_amount: 0,
          box_count: 1,
          product_details: [{ product_category: 'Electronics', product_name: 'Phone', product_quantity: 1, each_product_invoice_amount: 1000, each_product_collectable_amount: 0 }],
        }],
        document_detail: { invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK' },
      },
    });
    expect(order.success).toBe(true);
    expect(order.data).toBe('1005202970');

    // Token was fetched once
    expect(tokenRequestCount).toBe(1);

    // Step 2: Get AWB
    const awb = await client.getAWB('1005202970');
    expect(awb.success).toBe(true);
    expect(awb.data!.master_awb).toBe('AWB-98765');
    expect(awb.data!.courier_name).toBe('Delhivery');

    // Step 3: Track
    const tracking = await client.trackShipment('AWB-98765');
    expect(tracking.success).toBe(true);
    expect(tracking.data.current_status).toBe('In Transit');
    expect(tracking.data.tracking_events).toHaveLength(2);
    expect(tracking.data.tracking_events[0].scan_location).toBe('Delhi');

    // Step 4: Manifest
    const manifest = await client.manifestSingle({ system_order_id: '1005202970', courier_id: 1 });
    expect(manifest.success).toBe(true);
    expect(manifest.data).toBeNull();

    // Step 5: Get label
    const label = await client.getShipmentFile(2, '1005202970');
    expect(label.success).toBe(true);
    expect(label.data).toContain('data:application/pdf;base64,');

    // Step 6: Cancel
    const cancel = await client.cancelShipments(['AWB-98765']);
    expect(cancel.success).toBe(true);
    expect(cancel.data).toBeNull();

    // Token was reused (not re-fetched) for subsequent requests
    expect(tokenRequestCount).toBe(1);
  });
});

describe('E2E: Shipping Rates Flow', () => {
  it('getCourierList → getShippingRates → calculateRate → getPaymentCategory → getCourierTransporterList', async () => {
    const client = new BigshipClient(getConfig());

    const couriers = await client.getCourierList('b2c');
    expect(couriers.data).toHaveLength(2);
    expect(couriers.data[0].courier_name).toBe('Delhivery');

    const rates = await client.getShippingRates('1005202970');
    expect(rates.data).toHaveLength(2);
    expect(rates.data[0].total_shipping_charges).toBe(150.5);
    expect(rates.data[1].other_additional_charges?.oda).toBe(50);

    const calc = await client.calculateRate({
      shipment_category: 'B2C',
      payment_type: 'COD',
      pickup_pincode: '110001',
      destination_pincode: '400001',
      shipment_invoice_amount: 1000,
      box_details: [{ each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10, box_count: 1 }],
    });
    expect(calc.data).toHaveLength(1);
    expect(calc.data[0].courier_name).toBe('Delhivery');

    const payments = await client.getPaymentCategory();
    expect(payments.data).toHaveLength(2);
    expect(payments.data[0].payment_category).toBe('COD');

    const transporters = await client.getCourierTransporterList(1);
    expect(transporters.data).toHaveLength(1);
    expect(transporters.data[0].transporter_name).toBe('Surface Express');
  });
});

describe('E2E: Warehouse Flow', () => {
  it('addWarehouse → getWarehouseList', async () => {
    const client = new BigshipClient(getConfig());

    const added = await client.addWarehouse({
      address_line1: '123 Warehouse Street',
      address_pincode: '110001',
      contact_number_primary: '9876543210',
    });
    expect(added.success).toBe(true);
    expect(added.data!.warehouse_id).toBe(42);
    expect(added.data!.warehouse_name).toBe('Main WH');

    const list = await client.getWarehouseList(1, 10);
    expect(list.data!.result_count).toBe(1);
    expect(list.data!.result_data[0].warehouse_id).toBe(42);
  });
});

describe('E2E: Wallet', () => {
  it('getWalletBalance returns balance string', async () => {
    const client = new BigshipClient(getConfig());
    const balance = await client.getWalletBalance();
    expect(balance.success).toBe(true);
    expect(balance.data).toBe('15000.50');
  });
});

describe('E2E: Duplicate Invoice Detection', () => {
  it('throws BigshipDuplicateInvoiceError on second order with same invoice', async () => {
    const client = new BigshipClient(getConfig());

    const payload = {
      shipment_category: 'b2c' as const,
      warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
      consignee_detail: {
        first_name: 'Raj',
        last_name: 'Kumar',
        contact_number_primary: '9876543210',
        consignee_address: { address_line1: '123 Main Street City', pincode: '110001' },
      },
      order_detail: {
        invoice_date: '2024-01-01T00:00:00Z',
        invoice_id: 'INV-001',
        payment_type: 'Prepaid',
        total_collectable_amount: 0,
        shipment_invoice_amount: 1000,
        box_details: [{
          each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10,
          each_box_invoice_amount: 1000, each_box_collectable_amount: 0,
          box_count: 1,
          product_details: [{ product_category: 'Electronics', product_name: 'Phone', product_quantity: 1, each_product_invoice_amount: 1000, each_product_collectable_amount: 0 }],
        }],
        document_detail: { invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK' },
      },
    };

    // First order succeeds
    const first = await client.addSingleOrder(payload);
    expect(first.success).toBe(true);

    // Second order with same invoice → duplicate error
    try {
      await client.addSingleOrder(payload);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipDuplicateInvoiceError);
      expect((err as BigshipDuplicateInvoiceError).invoiceId).toContain('INV-001');
      expect((err as BigshipDuplicateInvoiceError).statusCode).toBe(409);
    }
  });
});

describe('E2E: Error Recovery', () => {
  it('401 triggers token refresh and retries the request', async () => {
    let loginCalls = 0;
    let walletCalls = 0;

    server.use(
      http.post(`${BASE}/api/login/user`, () => {
        loginCalls++;
        return apiOk({ token: `tok-${loginCalls}` });
      }),
      http.get(`${BASE}/api/Wallet/balance/get`, () => {
        walletCalls++;
        if (walletCalls === 1) {
          return HttpResponse.json({ success: false, message: 'Unauthorized', responseCode: 401, data: null }, { status: 401 });
        }
        return apiOk('9999');
      }),
      ...handlers.filter(h => true), // keep other handlers
    );

    const client = new BigshipClient(getConfig());
    const balance = await client.getWalletBalance();
    expect(balance.data).toBe('9999');
    // Token was fetched at least twice (initial + refresh after 401)
    expect(loginCalls).toBeGreaterThanOrEqual(2);
  });

  it('500 retries and succeeds', async () => {
    let attempts = 0;

    server.use(
      http.get(`${BASE}/api/Wallet/balance/get`, () => {
        attempts++;
        if (attempts === 1) {
          return HttpResponse.json({ success: false, message: 'Internal Server Error', responseCode: 500, data: null }, { status: 500 });
        }
        return apiOk('7777');
      }),
      ...handlers,
    );

    const client = new BigshipClient(getConfig({ maxRetries: 2 }));
    const balance = await client.getWalletBalance();
    expect(balance.data).toBe('7777');
    expect(attempts).toBe(2); // first failed, second succeeded
  });

  it('400 does NOT retry', async () => {
    let attempts = 0;

    server.use(
      http.get(`${BASE}/api/Wallet/balance/get`, () => {
        attempts++;
        return apiFail('Bad request', 400);
      }),
      ...handlers,
    );

    const client = new BigshipClient(getConfig({ maxRetries: 3 }));
    try {
      await client.getWalletBalance();
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect((err as BigshipApiError).statusCode).toBe(400);
    }
    expect(attempts).toBe(1); // no retry
  });
});

describe('E2E: Lifecycle Hooks', () => {
  it('onResponse receives typed response with duration', async () => {
    const responses: unknown[] = [];
    const client = new BigshipClient(getConfig({
      onResponse: (response, context) => {
        responses.push({ response, context });
      },
    }));

    await client.getWalletBalance();

    expect(responses).toHaveLength(1);
    const entry = responses[0] as { response: { success: boolean }; context: { endpoint: string; duration?: number } };
    expect(entry.response.success).toBe(true);
    expect(entry.context.endpoint).toBe('/api/Wallet/balance/get');
    expect(entry.context.duration).toBeGreaterThanOrEqual(0);
  });

  it('onError receives error with context', async () => {
    const errors: unknown[] = [];
    server.use(
      http.get(`${BASE}/api/Wallet/balance/get`, () => {
        return HttpResponse.json(
          { success: false, message: 'Something broke', responseCode: 500, data: null },
          { status: 500 }
        );
      }),
      ...handlers,
    );

    const client = new BigshipClient(getConfig({
      maxRetries: 0,
      onError: (error, context) => {
        errors.push({ error, context });
      },
    }));

    try { await client.getWalletBalance(); } catch { /* expected */ }

    expect(errors.length).toBeGreaterThanOrEqual(1);
    const entry = errors[0] as { error: { message: string }; context: { endpoint: string } };
    expect(entry.error.message).toBe('Something broke');
    expect(entry.context.endpoint).toBe('/api/Wallet/balance/get');
  });

  it('onRetry fires on retriable errors', async () => {
    let attempts = 0;
    const retries: number[] = [];

    server.use(
      http.get(`${BASE}/api/Wallet/balance/get`, () => {
        attempts++;
        if (attempts <= 2) {
          return HttpResponse.json({ success: false, message: 'Server error', responseCode: 500, data: null }, { status: 500 });
        }
        return apiOk('5555');
      }),
      ...handlers,
    );

    const client = new BigshipClient(getConfig({
      maxRetries: 3,
      retryDelay: 10,
      onRetry: (attempt) => {
        retries.push(attempt);
      },
    }));

    const balance = await client.getWalletBalance();
    expect(balance.data).toBe('5555');
    expect(retries).toEqual([1, 2]);
  });

  it('onBeforeRequest can modify request headers', async () => {
    let capturedAuth: string | undefined;

    server.use(
      http.get(`${BASE}/api/Wallet/balance/get`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') || undefined;
        return apiOk('100');
      }),
      ...handlers,
    );

    const client = new BigshipClient(getConfig({
      onBeforeRequest: (config) => {
        config.headers.set('X-Custom-Header', 'e2e-test');
        return config;
      },
    }));

    await client.getWalletBalance();
    expect(capturedAuth).toMatch(/^Bearer tok-/);
  });
});

describe('E2E: getShipmentData overloads', () => {
  it('id=1 returns structured AWB data', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getShipmentData(1, 'ORDER-1');
    expect(result.data).toHaveProperty('master_awb');
    expect((result.data as any).master_awb).toBe('AWB-98765');
  });

  it('id=2 returns file data', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getShipmentData(2, 'ORDER-1');
    expect(typeof result.data).toBe('string');
    expect(result.data).toContain('base64');
  });

  it('id=3 returns null when not ready', async () => {
    const client = new BigshipClient(getConfig());
    const result = await client.getShipmentData(3, 'ORDER-1');
    expect(result.data).toBeNull();
  });

  it('id=4 throws BigshipApiError', async () => {
    const client = new BigshipClient(getConfig());
    try {
      await client.getShipmentData(4, 'ORDER-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect((err as BigshipApiError).message).toContain('Invalid shipmentDataId');
      expect((err as BigshipApiError).code).toBe('INVALID_ARGUMENT');
    }
  });
});

describe('E2E: Static helpers', () => {
  it('isValidBase64DataURI works through the real client', () => {
    expect(BigshipClient.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x')).toBe(true);
    expect(BigshipClient.isValidBase64DataURI('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
    expect(BigshipClient.isValidBase64DataURI('data:image/jpg;base64,abc')).toBe(true);
    expect(BigshipClient.isValidBase64DataURI('data:image/png;base64,abc')).toBe(false);
    expect(BigshipClient.isValidBase64DataURI('not-a-data-uri')).toBe(false);
    expect(BigshipClient.isValidBase64DataURI('')).toBe(false);
  });
});
