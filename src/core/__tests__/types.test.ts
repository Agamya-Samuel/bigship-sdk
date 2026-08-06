import { describe, it, expect } from 'vitest';
import {
  LoginRequestSchema,
  AddSingleOrderRequestSchema,
  AddHeavyOrderRequestSchema,
  WarehouseAddRequestSchema,
  ConsigneeAddressSchema,
  ConsigneeDetailSchema,
  ProductDetailSchema,
  BoxDetailB2CSchema,
  BoxDetailB2BSchema,
  RateCalculatorRequestSchema,
  ManifestSingleRequestSchema,
  CancelRequestSchema,
  ApiResponseSchema,
  isSuccessResponse,
  isFailedResponse,
  BigshipError,
} from '../types';
import { z } from 'zod';

describe('LoginRequestSchema', () => {
  it('accepts valid login', () => {
    const result = LoginRequestSchema.safeParse({
      user_name: 'user@test.com',
      password: 'pass',
      access_key: 'key',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty user_name', () => {
    const result = LoginRequestSchema.safeParse({
      user_name: '',
      password: 'pass',
      access_key: 'key',
    });
    expect(result.success).toBe(false);
  });

  it('accepts non-email username', () => {
    const result = LoginRequestSchema.safeParse({
      user_name: 'admin',
      password: 'pass',
      access_key: 'key',
    });
    expect(result.success).toBe(true);
  });
});

describe('ConsigneeAddressSchema', () => {
  const validAddress = {
    address_line1: '123 Main Street',
    pincode: '110001',
  };

  it('accepts valid address', () => {
    expect(ConsigneeAddressSchema.safeParse(validAddress).success).toBe(true);
  });

  it('rejects short address_line1', () => {
    expect(ConsigneeAddressSchema.safeParse({ ...validAddress, address_line1: 'short' }).success).toBe(false);
  });

  it('rejects invalid pincode', () => {
    expect(ConsigneeAddressSchema.safeParse({ ...validAddress, pincode: '1234' }).success).toBe(false);
  });

  it('rejects empty optional address_line2 when provided', () => {
    expect(ConsigneeAddressSchema.safeParse({ ...validAddress, address_line2: '' }).success).toBe(false);
  });

  it('accepts absent optional address_line2', () => {
    expect(ConsigneeAddressSchema.safeParse(validAddress).success).toBe(true);
  });
});

describe('ConsigneeDetailSchema', () => {
  const validDetail = {
    first_name: 'Raj',
    last_name: 'Kumar',
    contact_number_primary: '9876543210',
    consignee_address: {
      address_line1: '123 Main Street',
      pincode: '110001',
    },
  };

  it('accepts valid consignee', () => {
    expect(ConsigneeDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it('rejects empty company_name when provided', () => {
    expect(ConsigneeDetailSchema.safeParse({ ...validDetail, company_name: '' }).success).toBe(false);
  });

  it('rejects short first_name', () => {
    expect(ConsigneeDetailSchema.safeParse({ ...validDetail, first_name: '' }).success).toBe(false);
  });

  it('accepts single-char names', () => {
    expect(ConsigneeDetailSchema.safeParse({ ...validDetail, first_name: 'A', last_name: 'B' }).success).toBe(true);
  });
});

describe('ProductDetailSchema', () => {
  const validProduct = {
    product_category: 'Electronics',
    product_name: 'Phone',
    product_quantity: 1,
    each_product_invoice_amount: 1000,
    each_product_collectable_amount: 500,
  };

  it('accepts valid product', () => {
    expect(ProductDetailSchema.safeParse(validProduct).success).toBe(true);
  });

  it('rejects empty product_category', () => {
    expect(ProductDetailSchema.safeParse({ ...validProduct, product_category: '' }).success).toBe(false);
  });

  it('rejects zero quantity', () => {
    expect(ProductDetailSchema.safeParse({ ...validProduct, product_quantity: 0 }).success).toBe(false);
  });

  it('accepts valid HSN', () => {
    expect(ProductDetailSchema.safeParse({ ...validProduct, hsn: '123456' }).success).toBe(true);
  });

  it('rejects too-short HSN', () => {
    expect(ProductDetailSchema.safeParse({ ...validProduct, hsn: '12345' }).success).toBe(false);
  });

  it('rejects empty optional sub_category when provided', () => {
    expect(ProductDetailSchema.safeParse({ ...validProduct, product_sub_category: '' }).success).toBe(false);
  });
});

describe('BoxDetailB2CSchema', () => {
  it('enforces box_count === 1', () => {
    expect(BoxDetailB2CSchema.safeParse({
      each_box_dead_weight: 1, each_box_length: 10, each_box_width: 10, each_box_height: 10,
      each_box_invoice_amount: 100, each_box_collectable_amount: 50,
      box_count: 1,
      product_details: [{ product_category: 'X', product_name: 'Y', product_quantity: 1, each_product_invoice_amount: 100, each_product_collectable_amount: 50 }],
    }).success).toBe(true);

    expect(BoxDetailB2CSchema.safeParse({
      each_box_dead_weight: 1, each_box_length: 10, each_box_width: 10, each_box_height: 10,
      each_box_invoice_amount: 100, each_box_collectable_amount: 50,
      box_count: 2,
      product_details: [{ product_category: 'X', product_name: 'Y', product_quantity: 1, each_product_invoice_amount: 100, each_product_collectable_amount: 50 }],
    }).success).toBe(false);
  });

  it('rejects empty product_details array', () => {
    expect(BoxDetailB2CSchema.safeParse({
      each_box_dead_weight: 1, each_box_length: 10, each_box_width: 10, each_box_height: 10,
      each_box_invoice_amount: 100, each_box_collectable_amount: 50,
      box_count: 1,
      product_details: [],
    }).success).toBe(false);
  });
});

describe('BoxDetailB2BSchema', () => {
  it('allows box_count > 1', () => {
    expect(BoxDetailB2BSchema.safeParse({
      each_box_dead_weight: 1, each_box_length: 10, each_box_width: 10, each_box_height: 10,
      each_box_invoice_amount: 100, each_box_collectable_amount: 50,
      box_count: 5,
      product_details: [{ product_category: 'X', product_name: 'Y', product_quantity: 1, each_product_invoice_amount: 100, each_product_collectable_amount: 50 }],
    }).success).toBe(true);
  });
});

describe('RateCalculatorRequestSchema', () => {
  const validRequest = {
    shipment_category: 'B2C' as const,
    payment_type: 'COD' as const,
    pickup_pincode: '110001',
    destination_pincode: '400001',
    shipment_invoice_amount: 5000,
    box_details: [{
      each_box_dead_weight: 1,
      each_box_length: 20,
      each_box_width: 15,
      each_box_height: 10,
      box_count: 1,
    }],
  };

  it('accepts valid request', () => {
    expect(RateCalculatorRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('rejects invalid pickup_pincode', () => {
    expect(RateCalculatorRequestSchema.safeParse({ ...validRequest, pickup_pincode: 'abc' }).success).toBe(false);
  });

  it('rejects invalid destination_pincode', () => {
    expect(RateCalculatorRequestSchema.safeParse({ ...validRequest, destination_pincode: '12345' }).success).toBe(false);
  });
});

describe('WarehouseAddRequestSchema', () => {
  const validWarehouse = {
    address_line1: '123 Warehouse Street',
    address_pincode: '110001',
    contact_number_primary: '9876543210',
  };

  it('accepts valid warehouse', () => {
    expect(WarehouseAddRequestSchema.safeParse(validWarehouse).success).toBe(true);
  });

  it('rejects empty address_line2 when provided', () => {
    expect(WarehouseAddRequestSchema.safeParse({ ...validWarehouse, address_line2: '' }).success).toBe(false);
  });

  it('rejects invalid pincode', () => {
    expect(WarehouseAddRequestSchema.safeParse({ ...validWarehouse, address_pincode: 'abc' }).success).toBe(false);
  });
});

describe('CancelRequestSchema', () => {
  it('accepts array of strings', () => {
    expect(CancelRequestSchema.safeParse(['AWB001', 'AWB002']).success).toBe(true);
  });

  it('rejects non-string elements', () => {
    expect(CancelRequestSchema.safeParse([123]).success).toBe(false);
  });
});

describe('ManifestSingleRequestSchema', () => {
  it('accepts valid manifest', () => {
    expect(ManifestSingleRequestSchema.safeParse({
      system_order_id: 'ORDER-123',
      courier_id: 1,
    }).success).toBe(true);
  });

  it('rejects zero courier_id', () => {
    expect(ManifestSingleRequestSchema.safeParse({
      system_order_id: 'ORDER-123',
      courier_id: 0,
    }).success).toBe(false);
  });
});

describe('ApiResponseSchema', () => {
  it('parses success response with string data', () => {
    const schema = ApiResponseSchema(z.string());
    const result = schema.safeParse({ success: true, message: 'ok', responseCode: 200, data: 'hello' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.data).toBe('hello');
  });

  it('parses success response with null data', () => {
    const schema = ApiResponseSchema(z.string());
    const result = schema.safeParse({ success: true, message: 'ok', responseCode: 200, data: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.data).toBeNull();
  });

  it('rejects missing success field', () => {
    const schema = ApiResponseSchema(z.string());
    expect(schema.safeParse({ message: 'ok', responseCode: 200, data: 'x' }).success).toBe(false);
  });
});

describe('Type guards', () => {
  it('isSuccessResponse narrows correctly', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: 'ORDER-123' };
    if (isSuccessResponse(response)) {
      expect(response.data).toBe('ORDER-123');
    } else {
      expect.fail('should be success');
    }
  });

  it('isSuccessResponse rejects null data', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: null };
    expect(isSuccessResponse(response)).toBe(false);
  });

  it('isFailedResponse narrows correctly', () => {
    const response = { success: false, message: 'fail', responseCode: 400, data: null };
    if (isFailedResponse(response)) {
      expect(response.data).toBeNull();
    } else {
      expect.fail('should be failed');
    }
  });

  it('isFailedResponse rejects success: false with non-null data', () => {
    const response = { success: false, message: 'fail', responseCode: 400, data: 'something' };
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
