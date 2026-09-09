import { describe, it, expect } from 'vitest';
import {
  LoginRequestSchema,
  SaveWarehouseRequestSchema,
  GetWarehouseListRequestSchema,
  UpdateWarehouseRequestSchema,
  RateCalculatorRequestSchema,
  CreateOrderRequestSchema,
  HyperlocalOrderRequestSchema,
  DomesticB2BOrderRequestSchema,
  DomesticB2COrderRequestSchema,
  ServiceableCouriersRequestSchema,
  PlaceOrderRequestSchema,
  CancelOrderRequestSchema,
  TrackOrderRequestSchema,
  OrderDetailRequestSchema,
  DownloadDocumentRequestSchema,
  ApiResponseSchema,
  isSuccessResponse,
  isFailedResponse,
} from '../types';
import { BigshipError } from '../../errors/BigshipError';
import { z } from 'zod';

describe('LoginRequestSchema', () => {
  it('accepts valid login', () => {
    const result = LoginRequestSchema.safeParse({
      username: 'user@test.com',
      password: 'pass',
      access_key: 'key',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty username', () => {
    const result = LoginRequestSchema.safeParse({
      username: '',
      password: 'pass',
      access_key: 'key',
    });
    expect(result.success).toBe(false);
  });

  it('accepts non-email username', () => {
    const result = LoginRequestSchema.safeParse({
      username: 'admin',
      password: 'pass',
      access_key: 'key',
    });
    expect(result.success).toBe(true);
  });
});

describe('SaveWarehouseRequestSchema', () => {
  const validWarehouse = {
    segment_type: 'hyperlocal' as const,
    warehouseContactPerson: 'Siddharth',
    warehouseAddressPhone: '7854693258',
    warehouseCountry: 'India',
    warehouseState: 'Karnataka',
    warehouseCity: 'BANGALORE',
    warehousePinCode: '560113',
    warehouseAddressLine1: 'Sector 29',
    warehouseAddressLandMark: 'Hudda City Centre',
    latitude: '12.947146336879577',
    longitude: '77.62102993895199',
    address_type: 'Home' as const,
  };

  it('accepts valid warehouse', () => {
    expect(SaveWarehouseRequestSchema.safeParse(validWarehouse).success).toBe(true);
  });

  it('rejects invalid phone number', () => {
    expect(SaveWarehouseRequestSchema.safeParse({ ...validWarehouse, warehouseAddressPhone: '123' }).success).toBe(false);
  });

  it('rejects invalid pincode', () => {
    expect(SaveWarehouseRequestSchema.safeParse({ ...validWarehouse, warehousePinCode: 'abc' }).success).toBe(false);
  });

  it('rejects short address_line1', () => {
    expect(SaveWarehouseRequestSchema.safeParse({ ...validWarehouse, warehouseAddressLine1: 'ab' }).success).toBe(false);
  });
});

describe('GetWarehouseListRequestSchema', () => {
  it('accepts valid request', () => {
    const result = GetWarehouseListRequestSchema.safeParse({
      page: '1',
      perPage: '10',
      segment_type: 'hyperlocal',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional filters', () => {
    const result = GetWarehouseListRequestSchema.safeParse({
      page: '1',
      perPage: '10',
      segment_type: 'local',
      status: '1',
      filter_type: 'warehouse_name',
      filter_value: 'Bigship',
    });
    expect(result.success).toBe(true);
  });
});

describe('RateCalculatorRequestSchema', () => {
  const validRequest = {
    segment_type: 'domestic_b2c' as const,
    sourcePincode: '110001',
    destPincode: '400001',
    invoiceValue: 5000,
    paymentModeId: 1,
    riskTypeId: 2,
    boxes: [{
      box_length: 20,
      box_width: 15,
      box_height: 10,
      box_dead_weight: 1,
      no_of_box: 1,
    }],
  };

  it('accepts valid request', () => {
    expect(RateCalculatorRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('rejects invalid sourcePincode', () => {
    expect(RateCalculatorRequestSchema.safeParse({ ...validRequest, sourcePincode: 'abc' }).success).toBe(false);
  });

  it('rejects invalid destPincode', () => {
    expect(RateCalculatorRequestSchema.safeParse({ ...validRequest, destPincode: '12345' }).success).toBe(false);
  });

  it('rejects hyperlocal segment type', () => {
    expect(RateCalculatorRequestSchema.safeParse({ ...validRequest, segment_type: 'hyperlocal' }).success).toBe(false);
  });
});

describe('CreateOrderRequestSchema', () => {
  const validB2COrder = {
    segment_type: 'domestic_b2c' as const,
    MasterOrderPickUpLocation: 258,
    MasterOrderReturnLocation: 258,
    MasterOrderDate: '2025-08-28 01:05:15',
    MasterOrderPaymentMode: 1,
    OrderInvoiceNo: '1234',
    MasterOrderInvoiceAmount: 1000,
    MasterOrderShippingEmail: 'test@gmail.com',
    MasterOrderShippingName: 'test company',
    MasterOrderShippingMobileNo: 8956231470,
    MasterOrderShippingAddress: 'test',
    MasterOrderShippingAddress2: '',
    MasterOrderShippingLandmark: 'test',
    MasterOrderShippingZipCode: '110011',
    MasterOrderShippingCountry: 'India',
    MasterOrderShippingState: 'DELHI',
    MasterOrderShippingCity: 'DELHI',
    totalNumOfBoxes: 1,
    boxes: [{
      weight_unit: 'kg' as const,
      dimension_unit: 'cm' as const,
      noOfBoxes: 1,
      dimensions: [{ length: 101, breadth: 40, height: 40, weight: 20 }],
      products: [{
        productName: 'soap',
        hsn: '1111',
        qty: '1',
        amount: '4000',
        totalAmount: 4000,
        collectableAmount: 4000,
        categoryId: '1',
      }],
    }],
  };

  it('accepts valid B2C order', () => {
    expect(CreateOrderRequestSchema.safeParse(validB2COrder).success).toBe(true);
  });

  it('rejects invalid segment type', () => {
    expect(CreateOrderRequestSchema.safeParse({ ...validB2COrder, segment_type: 'invalid' }).success).toBe(false);
  });

  it('rejects invalid pincode', () => {
    expect(CreateOrderRequestSchema.safeParse({ ...validB2COrder, MasterOrderShippingZipCode: 'abc' }).success).toBe(false);
  });
});

describe('ServiceableCouriersRequestSchema', () => {
  it('accepts valid request', () => {
    const result = ServiceableCouriersRequestSchema.safeParse({
      MasterCustomOrderId: '311276742',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty order ID', () => {
    const result = ServiceableCouriersRequestSchema.safeParse({
      MasterCustomOrderId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('PlaceOrderRequestSchema', () => {
  it('accepts valid request', () => {
    const result = PlaceOrderRequestSchema.safeParse({
      MasterCustomOrderId: '311276742',
      courierId: 25,
      riskTypeId: '2',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero courier ID', () => {
    const result = PlaceOrderRequestSchema.safeParse({
      MasterCustomOrderId: '311276742',
      courierId: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe('CancelOrderRequestSchema', () => {
  it('accepts valid request', () => {
    const result = CancelOrderRequestSchema.safeParse({
      CustomGlobalOrderId: '311276742',
    });
    expect(result.success).toBe(true);
  });
});

describe('TrackOrderRequestSchema', () => {
  it('accepts valid request', () => {
    const result = TrackOrderRequestSchema.safeParse({
      CustomGlobalOrderId: '311276742',
    });
    expect(result.success).toBe(true);
  });
});

describe('DownloadDocumentRequestSchema', () => {
  it('accepts valid request', () => {
    const result = DownloadDocumentRequestSchema.safeParse({
      CustomGlobalOrderId: '664736461',
      document_type: 'label',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid document type', () => {
    const result = DownloadDocumentRequestSchema.safeParse({
      CustomGlobalOrderId: '664736461',
      document_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('ApiResponseSchema', () => {
  it('parses success response with string data', () => {
    const schema = ApiResponseSchema(z.string());
    const result = schema.safeParse({ status: true, message: 'ok', status_code: 200, data: 'hello' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.data).toBe('hello');
  });

  it('parses success response with null data', () => {
    const schema = ApiResponseSchema(z.string());
    const result = schema.safeParse({ status: true, message: 'ok', status_code: 200, data: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.data).toBeNull();
  });

  it('rejects missing status field', () => {
    const schema = ApiResponseSchema(z.string());
    expect(schema.safeParse({ message: 'ok', status_code: 200, data: 'x' }).success).toBe(false);
  });
});

describe('Type guards', () => {
  it('isSuccessResponse narrows correctly', () => {
    const response = { status: true, message: 'ok', status_code: 200, data: 'ORDER-123' };
    if (isSuccessResponse(response)) {
      expect(response.data).toBe('ORDER-123');
    } else {
      expect.fail('should be success');
    }
  });

  it('isSuccessResponse rejects null data', () => {
    const response = { status: true, message: 'ok', status_code: 200, data: null };
    expect(isSuccessResponse(response)).toBe(false);
  });

  it('isFailedResponse narrows correctly', () => {
    const response = { status: false, message: 'fail', status_code: 400, data: null };
    if (isFailedResponse(response)) {
      expect(response.data).toBeNull();
    } else {
      expect.fail('should be failed');
    }
  });

  it('isFailedResponse rejects status: false with non-null data', () => {
    const response = { status: false, message: 'fail', status_code: 400, data: 'something' };
    expect(isFailedResponse(response)).toBe(false);
  });
});

describe('BigshipError', () => {
  it('isValidationError checks for non-empty validationErrors', () => {
    const err = new BigshipError('test', 400, 'TEST', {
      errors: { field: ['required'] },
    });
    expect(err.isValidationError()).toBe(true);
  });

  it('isRateLimitError checks statusCode 429', () => {
    const err = new BigshipError('rate limited', 429);
    expect(err.isRateLimitError()).toBe(true);
  });

  it('isAuthError checks statusCode 401', () => {
    const err = new BigshipError('auth', 401);
    expect(err.isAuthError()).toBe(true);
  });

  it('isAuthError checks statusCode 403', () => {
    const err = new BigshipError('forbidden', 403);
    expect(err.isAuthError()).toBe(true);
  });

  it('isRateLimitError checks code RATE_LIMIT_EXCEEDED (non-429 status)', () => {
    const err = new BigshipError('rate limited', 400, 'RATE_LIMIT_EXCEEDED');
    expect(err.isRateLimitError()).toBe(true);
  });
});
