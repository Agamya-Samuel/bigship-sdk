import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { BigshipClient } from '../BigshipClient';
import { BigshipApiError, BigshipAuthError, BigshipDuplicateInvoiceError } from '../../errors';
import type { BigshipConfig } from '../types';

vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
  };
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    request: vi.fn(),
    defaults: { headers: { common: {} as Record<string, string> } },
    interceptors,
  };
  return {
    default: {
      create: vi.fn(() => instance),
      ...instance,
    },
    __esModule: true,
    interceptors,
    _instance: instance,
  };
});

function getConfig(): BigshipConfig {
  return {
    baseURL: 'https://api.bigship.in',
    userName: 'test@test.com',
    password: 'pass',
    accessKey: 'key',
    maxRetries: 0, // no retries in tests
    enableDetailedLogging: false,
  };
}

function apiSuccess(data: unknown) {
  return { data: { success: true, message: 'ok', responseCode: 200, data } };
}

function apiFail(message: string, responseCode = 400) {
  return { data: { success: false, message, responseCode, data: null } };
}

const LOGIN_TOKEN = { token: 'test-token' };
const LOGIN_RESPONSE = apiSuccess(LOGIN_TOKEN);

describe('BigshipClient', () => {
  let mockAxios: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios = (axios.create as ReturnType<typeof vi.fn>)();
    // Default: all post calls return login success
    mockAxios.post.mockResolvedValue(LOGIN_RESPONSE);
    mockAxios.get.mockResolvedValue(apiSuccess(null));
    mockAxios.put.mockResolvedValue(apiSuccess(null));
  });

  /** Set up post mock to handle login + one API response */
  function mockPostForApi(apiResponse: unknown) {
    mockAxios.post.mockReset();
    mockAxios.post.mockImplementation((url: string) => {
      if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
      return Promise.resolve(apiResponse);
    });
  }

  describe('constructor', () => {
    it('creates axios instance with correct baseURL', () => {
      new BigshipClient(getConfig());
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.bigship.in/',
        })
      );
    });

    it('appends trailing slash to baseURL if missing', () => {
      new BigshipClient({ ...getConfig(), baseURL: 'https://api.bigship.in' });
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({ baseURL: 'https://api.bigship.in/' })
      );
    });

    it('does not double-slash baseURL', () => {
      new BigshipClient({ ...getConfig(), baseURL: 'https://api.bigship.in/' });
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({ baseURL: 'https://api.bigship.in/' })
      );
    });
  });

  describe('getWalletBalance', () => {
    it('returns wallet balance string', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess('5000.00'));
      const client = new BigshipClient(getConfig());
      const result = await client.getWalletBalance();
      expect(result.success).toBe(true);
      expect(result.data).toBe('5000.00');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/Wallet/balance/get', undefined);
    });
  });

  describe('getCourierList', () => {
    it('returns courier list', async () => {
      const couriers = [
        { shipment_category: 'b2c', courier_id: 1, courier_name: 'Delhivery' },
        { shipment_category: 'b2c', courier_id: 2, courier_name: 'DTDC' },
      ];
      mockAxios.get.mockResolvedValueOnce(apiSuccess(couriers));
      const client = new BigshipClient(getConfig());
      const result = await client.getCourierList();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].courier_name).toBe('Delhivery');
    });

    it('passes shipment_category param', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess([]));
      const client = new BigshipClient(getConfig());
      await client.getCourierList('b2b');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/courier/get/all', { params: { shipment_category: 'b2b' } });
    });
  });

  describe('addSingleOrder', () => {
    const validPayload = {
      shipment_category: 'b2c' as const,
      warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
      consignee_detail: {
        first_name: 'Raj',
        last_name: 'Kumar',
        contact_number_primary: '9876543210',
        consignee_address: {
          address_line1: '123 Main Street City',
          pincode: '110001',
        },
      },
      order_detail: {
        invoice_date: '2024-01-01T00:00:00Z',
        invoice_id: 'INV-001',
        payment_type: 'Prepaid' as const,
        total_collectable_amount: 0,
        shipment_invoice_amount: 1000,
        box_details: [{
          each_box_dead_weight: 1,
          each_box_length: 20,
          each_box_width: 15,
          each_box_height: 10,
          each_box_invoice_amount: 1000,
          each_box_collectable_amount: 0,
          box_count: 1 as const,
          product_details: [{
            product_category: 'Electronics',
            product_name: 'Phone',
            product_quantity: 1,
            each_product_invoice_amount: 1000,
            each_product_collectable_amount: 0,
          }],
        }],
        document_detail: {
          invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK',
        },
      },
    };

    it('returns system_order_id on success', async () => {
      mockPostForApi(apiSuccess('1005202970'));
      const client = new BigshipClient(getConfig());
      const result = await client.addSingleOrder(validPayload);
      expect(result.success).toBe(true);
      expect(result.data).toBe('1005202970');
    });

    it('throws BigshipDuplicateInvoiceError on duplicate invoice', async () => {
      mockPostForApi({
        data: {
          success: false,
          message: 'Duplicate order',
          responseCode: 409,
          data: null,
          errors: { invoice_id: ['Invoice ID INV-001 already exists'] },
        },
      });
      const client = new BigshipClient(getConfig());
      await expect(client.addSingleOrder(validPayload)).rejects.toThrow(BigshipDuplicateInvoiceError);
    });

    it('throws BigshipApiError on API failure', async () => {
      mockPostForApi(apiFail('Invalid pincode', 400));
      const client = new BigshipClient(getConfig());
      try {
        await client.addSingleOrder(validPayload);
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BigshipApiError);
        expect((err as BigshipApiError).message).toBe('Invalid pincode');
      }
    });
  });

  describe('addHeavyOrder', () => {
    const validHeavyPayload = {
      shipment_category: 'b2b' as const,
      warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
      consignee_detail: {
        first_name: 'Raj',
        last_name: 'Kumar',
        contact_number_primary: '9876543210',
        consignee_address: {
          address_line1: '123 Main Street City',
          pincode: '110001',
        },
      },
      order_detail: {
        invoice_date: '2024-01-01T00:00:00Z',
        invoice_id: 'INV-B2B-001',
        payment_type: 'Prepaid' as const,
        total_collectable_amount: 0,
        shipment_invoice_amount: 5000,
        ewaybill_number: 'EWB123456',
        box_details: [{
          each_box_dead_weight: 5,
          each_box_length: 30,
          each_box_width: 25,
          each_box_height: 20,
          each_box_invoice_amount: 5000,
          each_box_collectable_amount: 0,
          box_count: 1,
          product_details: [{
            product_category: 'Electronics',
            product_name: 'Laptop',
            product_quantity: 1,
            each_product_invoice_amount: 5000,
            each_product_collectable_amount: 0,
          }],
        }],
        document_detail: {
          invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK',
          ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQK',
        },
      },
    };

    it('returns system_order_id on success', async () => {
      mockPostForApi(apiSuccess('1005202971'));
      const client = new BigshipClient(getConfig());
      const result = await client.addHeavyOrder(validHeavyPayload);
      expect(result.success).toBe(true);
      expect(result.data).toBe('1005202971');
    });
  });

  describe('manifestSingle', () => {
    it('returns success with null data', async () => {
      mockPostForApi(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      const result = await client.manifestSingle({ system_order_id: 'ORDER-123', courier_id: 1 });
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('cancelShipments', () => {
    it('returns success with null data', async () => {
      mockAxios.put.mockResolvedValueOnce(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      const result = await client.cancelShipments(['AWB001', 'AWB002']);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('trackShipment', () => {
    it('returns tracking data', async () => {
      const trackingData = {
        tracking_id: 'AWB123',
        tracking_type: 'awb',
        current_status: 'Delivered',
        tracking_events: [
          { scan_status: 'Delivered', scan_datetime: '2024-01-02T10:00:00Z' },
        ],
      };
      mockAxios.get.mockResolvedValueOnce(apiSuccess(trackingData));
      const client = new BigshipClient(getConfig());
      const result = await client.trackShipment('AWB123');
      expect(result.data.tracking_id).toBe('AWB123');
      expect(result.data.tracking_events).toHaveLength(1);
    });
  });

  describe('getShipmentData', () => {
    it('throws for invalid shipmentDataId', async () => {
      const client = new BigshipClient(getConfig());
      await expect(client.getShipmentData(4 as any, 'ORDER')).rejects.toThrow(BigshipApiError);
      await expect(client.getShipmentData(0 as any, 'ORDER')).rejects.toThrow(BigshipApiError);
    });

    it('dispatches to getAWB for id=1', async () => {
      const awbData = { courier_id: '1', courier_name: 'Delhivery', lr_number: null, master_awb: '12345' };
      mockPostForApi(apiSuccess(awbData));
      const client = new BigshipClient(getConfig());
      const result = await client.getShipmentData(1, 'ORDER-123');
      expect(result.data).toEqual(awbData);
    });

    it('dispatches to getShipmentFile for id=2', async () => {
      mockPostForApi(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      const result = await client.getShipmentFile(2, 'ORDER-123');
      expect(result.data).toBeNull();
    });
  });

  describe('calculateRate', () => {
    it('returns rate list', async () => {
      const rates = [
        { courier_id: 1, courier_name: 'Delhivery', courier_type: 'Surface', zone: 'North', tat: 3, billable_weight: 1, total_shipping_charges: 150, courier_charge: 120, risk_type_name: null, other_additional_charges: null },
      ];
      mockPostForApi(apiSuccess(rates));
      const client = new BigshipClient(getConfig());
      const result = await client.calculateRate({
        shipment_category: 'B2C',
        payment_type: 'COD',
        pickup_pincode: '110001',
        destination_pincode: '400001',
        shipment_invoice_amount: 1000,
        box_details: [{ each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10, box_count: 1 }],
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].total_shipping_charges).toBe(150);
    });
  });

  describe('static helpers', () => {
    it('isValidBase64DataURI validates correctly', () => {
      expect(BigshipClient.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x')).toBe(true);
      expect(BigshipClient.isValidBase64DataURI('not-a-uri')).toBe(false);
    });
  });

  describe('request context duration', () => {
    it('hooks receive duration in context', async () => {
      const onResponse = vi.fn();
      mockAxios.get.mockResolvedValueOnce(apiSuccess('100'));
      const client = new BigshipClient({
        ...getConfig(),
        onResponse,
      });
      await client.getWalletBalance();
      expect(onResponse).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ duration: expect.any(Number) })
      );
      const context = onResponse.mock.calls[0][1];
      expect(context.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('RequestOptions', () => {
    it('passes timeout to axios when provided', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess('100'));
      const client = new BigshipClient(getConfig());
      await client.getWalletBalance({ timeout: 5000 });
      expect(mockAxios.get).toHaveBeenCalledWith('/api/Wallet/balance/get', { timeout: 5000 });
    });

    it('passes signal to axios when provided', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess('100'));
      const controller = new AbortController();
      const client = new BigshipClient(getConfig());
      await client.getWalletBalance({ signal: controller.signal });
      expect(mockAxios.get).toHaveBeenCalledWith('/api/Wallet/balance/get', { signal: controller.signal });
    });

    it('passes undefined config when no options given', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess('100'));
      const client = new BigshipClient(getConfig());
      await client.getWalletBalance();
      expect(mockAxios.get).toHaveBeenCalledWith('/api/Wallet/balance/get', undefined);
    });
  });

  describe('manifestAndGetAWB', () => {
    it('manifests and returns AWB data', async () => {
      const awbData = { courier_id: '1', courier_name: 'Delhivery', lr_number: null, master_awb: '12345' };
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') return Promise.resolve(apiSuccess(awbData));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.manifestAndGetAWB('ORDER-123', 5);
      expect(result.awb).toBe('12345');
      expect(result.courierName).toBe('Delhivery');
    });

    it('throws when AWB data not available after manifest', async () => {
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') return Promise.resolve(apiSuccess(null));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      await expect(client.manifestAndGetAWB('ORDER-123', 5)).rejects.toThrow(BigshipApiError);
    });
  });

  describe('createAndFinalizeShipment', () => {
    const validPayload = {
      shipment_category: 'b2c' as const,
      warehouse_detail: { pickup_location_id: 1, return_location_id: 1 },
      consignee_detail: {
        first_name: 'Raj',
        last_name: 'Kumar',
        contact_number_primary: '9876543210',
        consignee_address: {
          address_line1: '123 Main Street City',
          pincode: '110001',
        },
      },
      order_detail: {
        invoice_date: '2024-01-01T00:00:00Z',
        invoice_id: 'INV-WS-001',
        payment_type: 'Prepaid' as const,
        total_collectable_amount: 0,
        shipment_invoice_amount: 1000,
        box_details: [{
          each_box_dead_weight: 1, each_box_length: 20, each_box_width: 15, each_box_height: 10,
          each_box_invoice_amount: 1000, each_box_collectable_amount: 0, box_count: 1 as const,
          product_details: [{
            product_category: 'Electronics', product_name: 'Phone', product_quantity: 1,
            each_product_invoice_amount: 1000, each_product_collectable_amount: 0,
          }],
        }],
        document_detail: { invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK' },
      },
    };

    it('creates order, manifests, and returns full details', async () => {
      const awbData = { courier_id: '1', courier_name: 'Delhivery', lr_number: null, master_awb: '12345' };
      const labelData = 'data:application/pdf;base64,AAAA';
      const manifestData = 'data:application/pdf;base64,BBBB';
      let shipmentCallCount = 0;
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/add/single') return Promise.resolve(apiSuccess('ORDER-123'));
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') {
          shipmentCallCount++;
          if (shipmentCallCount === 1) return Promise.resolve(apiSuccess(awbData));    // getAWB
          if (shipmentCallCount === 2) return Promise.resolve(apiSuccess(labelData));   // getShipmentFile(2)
          return Promise.resolve(apiSuccess(manifestData));                             // getShipmentFile(3)
        }
        return Promise.resolve(apiSuccess(null));
      });
      mockAxios.get.mockReset();
      mockAxios.get.mockResolvedValue(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      const result = await client.createAndFinalizeShipment({
        order: validPayload,
        courierId: 5,
        awbPollMaxAttempts: 1,
        awbPollDelay: 1,
      });
      expect(result.orderId).toBe('ORDER-123');
      expect(result.awb).toBe('12345');
      expect(result.courierName).toBe('Delhivery');
      expect(result.labelData).toBe('data:application/pdf;base64,AAAA');
      expect(result.manifestData).toBe('data:application/pdf;base64,BBBB');
    });

    it('polls for AWB and retries on NULL_DATA', async () => {
      const awbData = { courier_id: '1', courier_name: 'Delhivery', lr_number: null, master_awb: '12345' };
      // Track all /api/shipment/data calls: first 2 return null (NULL_DATA), 3rd AWB, 4th+5th label/manifest
      let shipmentCallCount = 0;
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/add/single') return Promise.resolve(apiSuccess('ORDER-123'));
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') {
          shipmentCallCount++;
          if (shipmentCallCount <= 2) return Promise.resolve({ data: { success: true, message: 'ok', responseCode: 200, data: null } });
          if (shipmentCallCount === 3) return Promise.resolve(apiSuccess(awbData));
          return Promise.resolve(apiSuccess('data:application/pdf;base64,AAAA'));
        }
        return Promise.resolve(apiSuccess(null));
      });
      mockAxios.get.mockReset();
      mockAxios.get.mockResolvedValue(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      const result = await client.createAndFinalizeShipment({
        order: validPayload,
        courierId: 5,
        awbPollMaxAttempts: 3,
        awbPollDelay: 1,
      });
      expect(result.awb).toBe('12345');
      expect(shipmentCallCount).toBe(5); // 2 null + 1 AWB + 2 label/manifest
    });

    it('re-throws non-NULL_DATA errors during polling', async () => {
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/add/single') return Promise.resolve(apiSuccess('ORDER-123'));
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') return Promise.reject(new Error('network down'));
        return Promise.resolve(apiSuccess(null));
      });
      mockAxios.get.mockReset();
      mockAxios.get.mockResolvedValue(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      await expect(client.createAndFinalizeShipment({
        order: validPayload,
        courierId: 5,
        awbPollMaxAttempts: 2,
        awbPollDelay: 1,
      })).rejects.toThrow();
    });

    it('throws when order data is null', async () => {
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        // success=true but data=null → ResponseValidator throws NULL_DATA BigshipApiError
        if (url === '/api/order/add/single') return Promise.resolve({ data: { success: true, message: 'ok', responseCode: 200, data: null } });
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      await expect(client.createAndFinalizeShipment({
        order: validPayload,
        courierId: 5,
        awbPollMaxAttempts: 1,
        awbPollDelay: 1,
      })).rejects.toThrow(BigshipApiError);
    });

    it('uses addHeavyOrder for b2b orders', async () => {
      const awbData = { courier_id: '1', courier_name: 'Delhivery', lr_number: null, master_awb: 'AWB-B2B' };
      let shipmentCallCount = 0;
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/add/heavy') return Promise.resolve(apiSuccess('HEAVY-123'));
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') {
          shipmentCallCount++;
          if (shipmentCallCount === 1) return Promise.resolve(apiSuccess(awbData));     // AWB
          return Promise.resolve(apiSuccess('data:application/pdf;base64,AAAA'));        // label/manifest
        }
        return Promise.resolve(apiSuccess(null));
      });
      mockAxios.get.mockReset();
      mockAxios.get.mockResolvedValue(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      const b2bPayload = {
        shipment_category: 'b2b' as const,
        warehouse_detail: validPayload.warehouse_detail,
        consignee_detail: validPayload.consignee_detail,
        order_detail: {
          ...validPayload.order_detail,
          ewaybill_number: 'EWB123',
          box_details: validPayload.order_detail.box_details,
          document_detail: {
            invoice_document_file: 'data:application/pdf;base64,JVBERi0xLjQK',
            ewaybill_document_file: 'data:application/pdf;base64,JVBERi0xLjQK',
          },
        },
      };
      const result = await client.createAndFinalizeShipment({
        order: b2bPayload,
        courierId: 5,
        awbPollMaxAttempts: 1,
        awbPollDelay: 1,
      });
      expect(result.orderId).toBe('HEAVY-123');
      expect(result.awb).toBe('AWB-B2B');
    });

    it('throws when all polling attempts return null', async () => {
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/add/single') return Promise.resolve(apiSuccess('ORDER-123'));
        if (url === '/api/order/manifest/single') return Promise.resolve(apiSuccess(null));
        if (url === '/api/shipment/data') return Promise.resolve({ data: { success: true, message: 'ok', responseCode: 200, data: null } });
        return Promise.resolve(apiSuccess(null));
      });
      mockAxios.get.mockReset();
      mockAxios.get.mockResolvedValue(apiSuccess(null));
      const client = new BigshipClient(getConfig());
      await expect(client.createAndFinalizeShipment({
        order: validPayload,
        courierId: 5,
        awbPollMaxAttempts: 2,
        awbPollDelay: 1,
      })).rejects.toThrow('AWB data not available after manifest (polling exhausted)');
    });
  });

  describe('login', () => {
    it('delegates to tokenManager.getToken', async () => {
      const client = new BigshipClient(getConfig());
      const token = await client.login();
      expect(token).toBe('test-token');
    });
  });

  describe('workflow', () => {
    it('returns a ShipmentWorkflow instance', () => {
      const client = new BigshipClient(getConfig());
      const wf = client.workflow();
      expect(wf).toBeDefined();
      expect(typeof wf.create).toBe('function');
      expect(typeof wf.withCourier).toBe('function');
      expect(typeof wf.manifest).toBe('function');
      expect(typeof wf.finalize).toBe('function');
      expect(typeof wf.execute).toBe('function');
    });
  });

  describe('getShipmentDetails', () => {
    it('returns awb, courierName, courierId, labelData, manifestData', async () => {
      const awbData = { courier_id: '1', courier_name: 'Delhivery', lr_number: null, master_awb: 'AWB-999' };
      let callCount = 0;
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/shipment/data') {
          callCount++;
          if (callCount === 1) return Promise.resolve(apiSuccess(awbData));
          return Promise.resolve(apiSuccess('data:application/pdf;base64,AAAA'));
        }
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.getShipmentDetails('ORDER-1');
      expect(result.awb).toBe('AWB-999');
      expect(result.courierName).toBe('Delhivery');
      expect(result.courierId).toBe('1');
      expect(result.labelData).toBe('data:application/pdf;base64,AAAA');
      expect(result.manifestData).toBe('data:application/pdf;base64,AAAA');
    });

    it('throws when AWB data is null', async () => {
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/shipment/data') return Promise.resolve({ data: { success: true, message: 'ok', responseCode: 200, data: null } });
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      await expect(client.getShipmentDetails('ORDER-1')).rejects.toThrow(BigshipApiError);
    });
  });

  describe('getShipmentData overloads', () => {
    it('dispatches to getShipmentFile for id=3 (manifest)', async () => {
      const manifestData = 'data:application/pdf;base64,MANIFEST';
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/shipment/data') return Promise.resolve(apiSuccess(manifestData));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.getShipmentData(3, 'ORDER-123');
      expect(result.data).toBe(manifestData);
    });
  });

  describe('manifestHeavy', () => {
    it('returns success with null data', async () => {
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/order/manifest/heavy') return Promise.resolve(apiSuccess(null));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.manifestHeavy({ system_order_id: 'ORDER-123', courier_id: 1 });
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('getShippingRates', () => {
    it('passes params correctly', async () => {
      const rates = [{ courier_id: 1, courier_name: 'D', total_shipping_charges: 100, courier_charge: 80, risk_type_name: null, other_additional_charges: null }];
      mockAxios.get.mockResolvedValueOnce(apiSuccess(rates));
      const client = new BigshipClient(getConfig());
      const result = await client.getShippingRates('ORDER-1', 'B2B', 'risk1');
      expect(result.data).toHaveLength(1);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/order/shipping/rates', {
        params: { shipment_category: 'B2B', system_order_id: 'ORDER-1', risk_type: 'risk1' },
      });
    });
  });

  describe('getAWB', () => {
    it('returns AWB data', async () => {
      const awbData = { courier_id: '1', courier_name: 'Test', lr_number: null, master_awb: 'AWB1' };
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/shipment/data') return Promise.resolve(apiSuccess(awbData));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.getAWB('ORDER-1');
      expect(result.data).toEqual(awbData);
    });
  });

  describe('getShipmentFile', () => {
    it('returns file data', async () => {
      const fileData = 'data:application/pdf;base64,AAAA';
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/shipment/data') return Promise.resolve(apiSuccess(fileData));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.getShipmentFile(2, 'ORDER-1');
      expect(result.data).toBe(fileData);
    });
  });

  describe('addWarehouse', () => {
    it('returns warehouse data', async () => {
      const warehouse = { warehouse_id: 1, warehouse_name: 'Main WH', address_line1: 'Addr', address_line2: null, address_landmark: null, address_pincode: '110001', address_city: 'Delhi', address_state: 'DL', warehouse_contact_person: 'A', warehouse_contact_number_primary: '9876543210' };
      mockAxios.post.mockReset();
      mockAxios.post.mockImplementation((url: string) => {
        if (url === '/api/login/user') return Promise.resolve(LOGIN_RESPONSE);
        if (url === '/api/warehouse/add') return Promise.resolve(apiSuccess(warehouse));
        return Promise.resolve(apiSuccess(null));
      });
      const client = new BigshipClient(getConfig());
      const result = await client.addWarehouse({
        address_line1: '123 Warehouse Street',
        address_pincode: '110001',
        contact_number_primary: '9876543210',
      });
      expect(result.data.warehouse_id).toBe(1);
    });
  });

  describe('getWarehouseList', () => {
    it('passes pagination params', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess({ result_count: 0, result_data: [] }));
      const client = new BigshipClient(getConfig());
      await client.getWarehouseList(2, 5);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/warehouse/get/list', {
        params: { page_index: 2, page_size: 5 },
      });
    });
  });

  describe('getCourierTransporterList', () => {
    it('passes courier_id param', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess([]));
      const client = new BigshipClient(getConfig());
      await client.getCourierTransporterList(42);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/courier/get/transport/list', {
        params: { courier_id: 42 },
      });
    });
  });

  describe('getPaymentCategory', () => {
    it('passes shipment_category param', async () => {
      mockAxios.get.mockResolvedValueOnce(apiSuccess([]));
      const client = new BigshipClient(getConfig());
      await client.getPaymentCategory('b2b');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/payment/category', {
        params: { shipment_category: 'b2b' },
      });
    });
  });
});
