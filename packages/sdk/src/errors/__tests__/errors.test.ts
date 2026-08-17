import { describe, it, expect } from 'vitest';
import {
  BigshipApiError,
  BigshipDuplicateInvoiceError,
  BigshipValidationError,
  BigshipAuthError,
  BigshipNetworkError,
  isBigshipDuplicateInvoiceError,
  isBigshipValidationError,
  isBigshipAuthError,
  isBigshipNetworkError,
  isBigshipApiError,
} from '../index';
import { BigshipError } from '../../core/types';

describe('BigshipError', () => {
  it('creates with default statusCode 0', () => {
    const err = new BigshipError('test');
    expect(err.message).toBe('test');
    expect(err.statusCode).toBe(0);
    expect(err.name).toBe('BigshipError');
    expect(err.code).toBeUndefined();
    expect(err.apiResponse).toBeUndefined();
  });

  it('stores apiResponse and extracts validationErrors and traceId', () => {
    const err = new BigshipError('test', 400, 'TEST', {
      status: 'error',
      message: 'fail',
      errors: { field: ['required'] },
      trace_id: 'abc-123',
    });
    expect(err.validationErrors).toEqual({ field: ['required'] });
    expect(err.traceId).toBe('abc-123');
  });

  it('supports cause via options', () => {
    const cause = new Error('root cause');
    const err = new BigshipError('test', 500, undefined, undefined, { cause });
    expect(err.cause).toBe(cause);
  });
});

describe('BigshipApiError', () => {
  it('stores requestId, endpoint, responseBody', () => {
    const err = new BigshipApiError('fail', 400, {
      requestId: 'req-1',
      endpoint: '/api/test',
      responseBody: { data: 'test' },
    });
    expect(err.requestId).toBe('req-1');
    expect(err.endpoint).toBe('/api/test');
    expect(err.responseBody).toEqual({ data: 'test' });
    expect(err.name).toBe('BigshipApiError');
  });

  it('propagates cause', () => {
    const cause = new Error('inner');
    const err = new BigshipApiError('fail', 500, { cause });
    expect(err.cause).toBe(cause);
  });
});

describe('BigshipDuplicateInvoiceError', () => {
  it('sets invoiceId and status 409', () => {
    const err = new BigshipDuplicateInvoiceError('INV-001');
    expect(err.invoiceId).toBe('INV-001');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('DUPLICATE_INVOICE');
    expect(err.name).toBe('BigshipDuplicateInvoiceError');
    expect(err.message).toContain('INV-001');
  });

  it('preserves caller options (requestId, endpoint)', () => {
    const err = new BigshipDuplicateInvoiceError('INV-001', {
      requestId: 'req-1',
      endpoint: '/api/order',
    });
    expect(err.requestId).toBe('req-1');
    expect(err.endpoint).toBe('/api/order');
  });
});

describe('BigshipValidationError', () => {
  it('stores validationErrors and status 400', () => {
    const errors = { pincode: ['Invalid pincode'], name: ['Too short'] };
    const err = new BigshipValidationError('Validation failed', errors);
    expect(err.validationErrors).toEqual(errors);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.name).toBe('BigshipValidationError');
  });
});

describe('BigshipAuthError', () => {
  it('defaults message and status 401', () => {
    const err = new BigshipAuthError();
    expect(err.message).toBe('Authentication failed');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTH_ERROR');
    expect(err.name).toBe('BigshipAuthError');
  });

  it('accepts custom message', () => {
    const err = new BigshipAuthError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

describe('BigshipNetworkError', () => {
  it('has statusCode -1 and NETWORK_ERROR code', () => {
    const err = new BigshipNetworkError('ECONNREFUSED');
    expect(err.statusCode).toBe(-1);
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.name).toBe('BigshipNetworkError');
  });

  it('propagates cause', () => {
    const cause = new Error('socket hang up');
    const err = new BigshipNetworkError('timeout', { cause });
    expect(err.cause).toBe(cause);
  });
});

describe('Type guard functions', () => {
  it('isBigshipDuplicateInvoiceError', () => {
    expect(isBigshipDuplicateInvoiceError(new BigshipDuplicateInvoiceError('INV'))).toBe(true);
    expect(isBigshipDuplicateInvoiceError(new BigshipApiError('x', 400))).toBe(false);
    expect(isBigshipDuplicateInvoiceError(new Error())).toBe(false);
    expect(isBigshipDuplicateInvoiceError(null)).toBe(false);
  });

  it('isBigshipValidationError', () => {
    expect(isBigshipValidationError(new BigshipValidationError('x', {}))).toBe(true);
    expect(isBigshipValidationError(new BigshipApiError('x', 400))).toBe(false);
  });

  it('isBigshipAuthError', () => {
    expect(isBigshipAuthError(new BigshipAuthError())).toBe(true);
    expect(isBigshipAuthError(new BigshipApiError('x', 401))).toBe(false);
  });

  it('isBigshipNetworkError', () => {
    expect(isBigshipNetworkError(new BigshipNetworkError('x'))).toBe(true);
    expect(isBigshipNetworkError(new BigshipApiError('x', 500))).toBe(false);
  });

  it('isBigshipApiError', () => {
    expect(isBigshipApiError(new BigshipApiError('x', 400))).toBe(true);
    expect(isBigshipApiError(new BigshipDuplicateInvoiceError('INV'))).toBe(true);
    expect(isBigshipApiError(new BigshipValidationError('x', {}))).toBe(true);
    expect(isBigshipApiError(new BigshipAuthError())).toBe(true);
    expect(isBigshipApiError(new BigshipNetworkError('x'))).toBe(true);
    expect(isBigshipApiError(new Error())).toBe(false);
  });
});
