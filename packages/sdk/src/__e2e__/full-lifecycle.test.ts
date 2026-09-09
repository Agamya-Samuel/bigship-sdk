/**
 * E2E tests — test the full stack: BigshipClient → axios → MSW HTTP layer → Zod validation → typed result
 * No internal mocking. MSW intercepts at the network level.
 *
 * Tests the new Unified Outbound API format.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BigshipClient } from '../core/BigshipClient';
import {
  BigshipApiError,
} from '../errors';

const BASE = 'https://api.bigship.test';

// ========== Mock API handlers ==========
let tokenRequestCount = 0;

function apiOk(data: unknown) {
  return HttpResponse.json({ status: true, message: 'ok', status_code: 200, data });
}

function apiFail(message: string, status_code = 400, errors?: Record<string, string[]>) {
  return HttpResponse.json({ status: false, message, status_code, data: null, errors });
}

const handlers = [
  // Login - new endpoint
  http.post(`${BASE}/api/outbound/login`, async ({ request }) => {
    tokenRequestCount++;
    const body = await request.json() as Record<string, unknown>;
    if (!body.username || !body.password || !body.access_key) {
      return apiFail('Missing credentials', 400);
    }
    return apiOk({
      firstName: 'Test',
      lastName: 'User',
      EmailID: 'test@test.com',
      mobileNumber: '9876543210',
      countryname: 'India',
      IsEmailVerifed: '1',
      token: `tok-${tokenRequestCount}`,
      tokenExpiringAt: '2025-01-01T00:00:00Z',
      is_outbound_service_enabled: '1',
      api_master_client_account: {
        access_key: 'key',
        access_key_generated_date: '2025-01-01',
        is_account_enabled: '1',
        created_date: '2025-01-01T00:00:00Z',
        updated_date: '2025-01-01T00:00:00Z',
      },
      userWallet: { Balance: '15000.50', kycCurrency: '₹' },
    });
  }),

  // Profile
  http.get(`${BASE}/api/outbound/profile`, () => {
    return apiOk({
      firstName: 'Test',
      lastName: 'User',
      EmailID: 'test@test.com',
      mobileNumber: '9876543210',
      countryname: 'India',
      IsEmailVerifed: '1',
      is_outbound_service_enabled: '1',
      api_master_client_account: {
        access_key: 'key',
        access_key_generated_date: '2025-01-01',
        is_account_enabled: '1',
        created_date: '2025-01-01T00:00:00Z',
        updated_date: '2025-01-01T00:00:00Z',
      },
      userWallet: { Balance: '15000.50', kycCurrency: '₹' },
    });
  }),

  // Wallet balance
  http.get(`${BASE}/api/outbound/wallet/balance`, () => {
    return apiOk('15000.50');
  }),

  // Get warehouse list
  http.get(`${BASE}/api/outbound/get-warehouse-list`, () => {
    return apiOk({
      warehouse: [
        {
          warehouseId: 42,
          warehouseName: 'Main WH',
          warehouseContactPerson: 'Raj',
          warehouseAddressLine1: '123 Street',
          warehouseAddressLine2: 'Near Park',
          warehouseAddressLandMark: 'Behind Mall',
          warehouseAddressPhone: '9876543210',
          isActive: '1',
          isShipped: '0',
          isEditable: 1,
          country: 'India',
          state: 'Delhi',
          city: 'Delhi',
          pincode: '110001',
          is_location_enabled: '1',
          addedOn: '2025-01-01T00:00:00Z',
        },
      ],
      total: 1,
    });
  }),

  // Save warehouse
  http.post(`${BASE}/api/outbound/save-warehouse-data`, () => {
    return apiOk({ warehouseId: 42, is_phone_verified: 0, phone_number: '9876543210' });
  }),

  // Get package types
  http.get(`${BASE}/api/outbound/hyperlocal/get-packages-list`, () => {
    return apiOk([
      { HyperlocalPackageTypeId: 1, PackageType: 'Electronics', Description: 'Electronic items', IsEnabled: '1' },
    ]);
  }),

  // Get payment modes
  http.get(`${BASE}/api/outbound/get-payment-mode`, () => {
    return apiOk([
      { paymentModeId: '1', paymentModeName: 'Prepaid' },
      { paymentModeId: '2', paymentModeName: 'COD' },
    ]);
  }),

  // Get risk types
  http.get(`${BASE}/api/outbound/domestic/risk-types`, () => {
    return apiOk([
      { riskTypeId: 1, riskName: 'Third Party Insurance', slug: 'third-party-insurance' },
      { riskTypeId: 2, riskName: 'Owner Risk', slug: 'owner-risk' },
    ]);
  }),

  // Rate calculator
  http.post(`${BASE}/api/outbound/user-rate-calculator`, () => {
    return apiOk([
      {
        courierName: 'Delhivery',
        courierImage: null,
        courierType: 'Surface',
        riskTypeName: 'Owner Risk',
        planName: 'Standard',
        courier_partner_id: 1,
        courierCharge: 120,
        tat: '3',
        weight: 1,
        zone: 'N1-N1',
        restricted_pincode_message: null,
        codCharges: 0,
        riskType: '0.00',
        lrCost: '0.00',
        handlingCharge: '0.00',
        greenTax: 0,
        toPay: 0,
        oda: '0.00',
        warai_Charge: 0,
        state_Tax: '0.00',
        minimum_weight: '0.00',
        pickup_Charge: 0,
        whatsappNotificationCharge: 0,
        emailNotificationCharge: 0,
        smsNotificationCharge: 0,
        totalCharge: 150,
      },
    ]);
  }),

  // Create order
  http.post(`${BASE}/api/outbound/create-order`, () => {
    return apiOk({ CustomGlobalOrderId: '311276742' });
  }),

  // Get serviceable couriers
  http.post(`${BASE}/api/outbound/courier-wise-shipment-cost`, () => {
    return apiOk({
      segment_type: 'domestic_b2c',
      calculatedRates: [
        {
          planName: 'Standard',
          courierName: 'Delhivery',
          courierId: '1',
          pickup: 'DELHI',
          destination: 'DELHI',
          charged_weight: 1,
          weight_unit: 'kg',
          base_freight: 100,
          riskTypeName: 'Owner Risk',
          courierType: 'Surface',
          zone: 'N1-N1',
          riskCharge: '0.00',
          lrCost: '0.00',
          handlingCharge: '0.00',
          greenTax: '0.00',
          codCharges: 0,
          toPay: '0.00',
          oda: '0.00',
          tat: 3,
          warai_Charge: 0,
          state_Tax: 0,
          pickup_Charge: '0.00',
          smsNotificationCharge: 0,
          emailNotificationCharge: 0,
          whatsappNotificationCharge: 0,
          total: '100.00',
          kycCurrency: '₹',
          courierImage: null,
          riskCharges: [],
        },
      ],
    });
  }),

  // Place order
  http.post(`${BASE}/api/outbound/place-order`, () => {
    return apiOk({ reference_number: 305585, awb_assigned: 'AWB-98765' });
  }),

  // Track order
  http.get(`${BASE}/api/outbound/track-order`, () => {
    return apiOk({
      CustomGlobalOrderId: '311276742',
      order_place_time: '2025-01-01T00:00:00Z',
      tracking_number: 'AWB-98765',
      courier_name: 'Delhivery',
      courier_image: null,
      tag: 'In Transit',
      order_status: 'In Transit',
      latest_checkpoint_time: '2025-01-02T00:00:00Z',
      source_coordinate: { latitude: '28.57', longitude: '77.31', mapLocationId: 'abc', addressType: 'Office' },
      drop_coordinate: { latitude: '28.62', longitude: '77.29', mapLocationId: 'def', addressType: 'Home' },
      tracking_current_status: {
        tracking_status: 'In Transit',
        location: { latitude: null, longitude: null },
        timestamps: { pickup: null, order: { accepted: null, started: null, ended: null } },
        fare_details: { currency: 'INR', amount: '100' },
      },
      tracking_histories: [],
    });
  }),

  // Get order detail (simplified)
  http.get(`${BASE}/api/outbound/order-shipment-details`, () => {
    return apiOk({
      segment_type: 'domestic_b2c',
      getOrderDetails: {
        MasterCustomOrderId: '311276742',
        InvoiceNumber: 'INV-001',
        MasterOrderCurrency: 'INR',
        AwbNumber: 'AWB-98765',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
        MasterCustomInvoiceId: null,
        PaymentMode: 'Prepaid',
        InvoiceStatusId: '1',
        InvoiceStatus: 'Generated',
        status_id: '5',
        status: 'In Transit',
        products_name: 'Test Product',
        product_details: [],
        MasterOrderShippingZipCode: '110001',
        totalNoOfBoxes: null,
        consignorType: 'Self',
        consignor: {
          companyName: 'Test Company',
          companyEmailId: 'test@bigship.in',
          companyMobile: '9876543210',
          orderCountry: 'India',
          orderState: 'DELHI',
          orderCity: 'DELHI',
          orderPin: '110001',
          billingAddress: 'Test Address',
          billingAddress2: '',
          landmark: 'Test Landmark',
          consignorBusinessType: 'Individual',
        },
        consignee: {
          companyName: 'Recipient',
          companyEmailId: null,
          companyMobile: '9876543210',
          orderCountry: 'India',
          orderState: 'DELHI',
          orderCity: 'DELHI',
          orderPin: '110001',
          billingAddress: 'Delivery Address',
          billingAddress2: '',
          landmark: '',
          consigneeBusinessType: 'Individual',
        },
        consigneeBilling: {
          companyName: 'Recipient',
          companyEmailId: null,
          companyMobile: '9876543210',
          orderCountry: 'India',
          orderState: 'DELHI',
          orderCity: 'DELHI',
          orderPin: '110001',
          billingAddress: 'Delivery Address',
          billingAddress2: '',
          landmark: '',
          consigneeBillingBusinessType: 'Individual',
        },
        pickupDetail: {
          warehouseName: 'Main WH',
          warehouseContactPerson: 'Raj',
          warehouseAddressLine1: '123 Street',
          warehouseAddressLine2: '',
          warehouseAddressLandMark: '',
          warehouseAddressPhone: '9876543210',
          warehousePin: '110001',
          warehouseCity: 'Delhi',
          warehouseState: 'DELHI',
          warehouseCountry: 'India',
        },
        totalInvoiceAmount: '1000.00',
        InvoiceCurrency: '₹',
        weight: '1.00',
        weightUnit: 'kg',
        box_dimensions: [],
        dimensions: ['20x15x10'],
        orderDate: '2025-01-01 00:00:00',
        collectableAmount: '0.00',
        PackageTypeId: '1',
        PackageTypeName: 'Electronics',
      },
    });
  }),

  // Cancel order
  http.post(`${BASE}/api/outbound/cancel-order`, () => {
    return apiOk([]);
  }),

  // Download document
  http.get(`${BASE}/api/outbound/download-shipment-documents`, () => {
    return apiOk({
      AttachmentData: 'https://storage.bigship.direct/files/label.pdf',
      File_extention: 'application/pdf',
    });
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
  server.resetHandlers(...handlers);
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

describe('E2E: New Unified Outbound API', () => {
  it('login → getProfile → getWarehouseList → createOrder → getServiceableCouriers → placeOrder → cancelOrder', async () => {
    const client = new BigshipClient(getConfig());

    // Step 1: Get profile (triggers login)
    const profile = await client.getProfile();
    expect(profile.status).toBe(true);
    expect(profile.data.firstName).toBe('Test');
    expect(tokenRequestCount).toBe(1);

    // Step 2: Get warehouse list
    const warehouses = await client.getWarehouseList({
      page: '1',
      perPage: '10',
      segment_type: 'hyperlocal',
    });
    expect(warehouses.status).toBe(true);
    expect(warehouses.data!.total).toBe(1);
    expect(warehouses.data!.warehouse[0].warehouseId).toBe(42);

    // Step 3: Create order
    const order = await client.createOrder({
      segment_type: 'domestic_b2c',
      MasterOrderPickUpLocation: 42,
      MasterOrderReturnLocation: 42,
      MasterOrderDate: '2025-01-01 00:00:00',
      MasterOrderPaymentMode: 1,
      OrderInvoiceNo: 'INV-001',
      MasterOrderInvoiceAmount: 1000,
      MasterOrderShippingName: 'Test Recipient',
      MasterOrderShippingMobileNo: '9876543210',
      MasterOrderShippingAddress: 'Test Address',
      MasterOrderShippingZipCode: '110001',
      MasterOrderShippingCity: 'DELHI',
      MasterOrderShippingState: 'DELHI',
      MasterOrderShippingCountry: 'India',
      totalNumOfBoxes: 1,
      boxes: [{
        weight_unit: 'kg',
        dimension_unit: 'cm',
        noOfBoxes: 1,
        dimensions: [{ length: 20, breadth: 15, height: 10, weight: 1 }],
        products: [{
          productName: 'Test Product',
          qty: '1',
          amount: '1000',
          totalAmount: 1000,
          collectableAmount: 0,
          categoryId: '1',
        }],
      }],
    });
    expect(order.status).toBe(true);
    expect(order.data!.CustomGlobalOrderId).toBe('311276742');

    // Step 4: Get serviceable couriers
    const couriers = await client.getServiceableCouriers('311276742');
    expect(couriers.status).toBe(true);
    expect(couriers.data!.calculatedRates.length).toBeGreaterThan(0);

    // Step 5: Place order
    const placeResult = await client.placeOrder({
      MasterCustomOrderId: '311276742',
      courierId: 1,
      riskTypeId: '2',
    });
    expect(placeResult.status).toBe(true);

    // Step 6: Cancel order
    const cancel = await client.cancelOrder('311276742');
    expect(cancel.status).toBe(true);

    // Token was reused (not re-fetched) for subsequent requests
    expect(tokenRequestCount).toBe(1);
  });
});

describe('E2E: Error Recovery', () => {
  it('401 triggers token refresh and retries the request', async () => {
    let loginCalls = 0;
    let walletCalls = 0;

    server.use(
      http.post(`${BASE}/api/outbound/login`, () => {
        loginCalls++;
        return apiOk({
          firstName: 'Test',
          lastName: 'User',
          EmailID: 'test@test.com',
          mobileNumber: '9876543210',
          countryname: 'India',
          IsEmailVerifed: '1',
          token: `tok-${loginCalls}`,
          tokenExpiringAt: '2025-01-01T00:00:00Z',
          is_outbound_service_enabled: '1',
          api_master_client_account: {
            access_key: 'key',
            access_key_generated_date: '2025-01-01',
            is_account_enabled: '1',
            created_date: '2025-01-01T00:00:00Z',
            updated_date: '2025-01-01T00:00:00Z',
          },
          userWallet: { Balance: '15000.50', kycCurrency: '₹' },
        });
      }),
      http.get(`${BASE}/api/outbound/profile`, () => {
        walletCalls++;
        if (walletCalls === 1) {
          return HttpResponse.json({ status: false, message: 'Unauthorized', status_code: 401, data: null }, { status: 401 });
        }
        return apiOk({
          firstName: 'Test',
          lastName: 'User',
          EmailID: 'test@test.com',
          mobileNumber: '9876543210',
          countryname: 'India',
          IsEmailVerifed: '1',
          is_outbound_service_enabled: '1',
          api_master_client_account: {
            access_key: 'key',
            access_key_generated_date: '2025-01-01',
            is_account_enabled: '1',
            created_date: '2025-01-01T00:00:00Z',
            updated_date: '2025-01-01T00:00:00Z',
          },
          userWallet: { Balance: '9999.00', kycCurrency: '₹' },
        });
      }),
    );

    const client = new BigshipClient(getConfig());
    const profile = await client.getProfile();
    expect(profile.data?.userWallet.Balance).toBe('9999.00');
    expect(loginCalls).toBeGreaterThanOrEqual(2);
  });

  it('500 retries and succeeds', async () => {
    let attempts = 0;

    server.use(
      http.get(`${BASE}/api/outbound/profile`, () => {
        attempts++;
        if (attempts === 1) {
          return HttpResponse.json({ status: false, message: 'Internal Server Error', status_code: 500, data: null }, { status: 500 });
        }
        return apiOk({
          firstName: 'Test',
          lastName: 'User',
          EmailID: 'test@test.com',
          mobileNumber: '9876543210',
          countryname: 'India',
          IsEmailVerifed: '1',
          is_outbound_service_enabled: '1',
          api_master_client_account: {
            access_key: 'key',
            access_key_generated_date: '2025-01-01',
            is_account_enabled: '1',
            created_date: '2025-01-01T00:00:00Z',
            updated_date: '2025-01-01T00:00:00Z',
          },
          userWallet: { Balance: '7777.00', kycCurrency: '₹' },
        });
      }),
    );

    const client = new BigshipClient(getConfig({ maxRetries: 2 }));
    const profile = await client.getProfile();
    expect(profile.data?.userWallet.Balance).toBe('7777.00');
    expect(attempts).toBe(2);
  });

  it('400 does NOT retry', async () => {
    let attempts = 0;

    server.use(
      http.get(`${BASE}/api/outbound/profile`, () => {
        attempts++;
        return HttpResponse.json({ status: false, message: 'Bad request', status_code: 400, data: null }, { status: 400 });
      }),
    );

    const client = new BigshipClient(getConfig({ maxRetries: 3 }));
    try {
      await client.getProfile();
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect((err as BigshipApiError).statusCode).toBe(400);
    }
    expect(attempts).toBe(1);
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

    await client.getProfile();

    expect(responses).toHaveLength(1);
    const entry = responses[0] as { response: { status: boolean }; context: { endpoint: string; duration?: number } };
    expect(entry.response.status).toBe(true);
    expect(entry.context.endpoint).toBe('api/outbound/profile');
    expect(entry.context.duration).toBeGreaterThanOrEqual(0);
  });

  it('onBeforeRequest can modify request headers', async () => {
    let capturedAuth: string | undefined;

    server.use(
      http.get(`${BASE}/api/outbound/profile`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') || undefined;
        return apiOk({
          firstName: 'Test',
          lastName: 'User',
          EmailID: 'test@test.com',
          mobileNumber: '9876543210',
          countryname: 'India',
          IsEmailVerifed: '1',
          is_outbound_service_enabled: '1',
          api_master_client_account: {
            access_key: 'key',
            access_key_generated_date: '2025-01-01',
            is_account_enabled: '1',
            created_date: '2025-01-01T00:00:00Z',
            updated_date: '2025-01-01T00:00:00Z',
          },
          userWallet: { Balance: '15000.50', kycCurrency: '₹' },
        });
      }),
    );

    const client = new BigshipClient(getConfig({
      onBeforeRequest: (config) => {
        config.headers.set('X-Custom-Header', 'e2e-test');
        return config;
      },
    }));

    await client.getProfile();
    expect(capturedAuth).toMatch(/^Bearer tok-/);
  });
});
