import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ResponseValidator, formatZodErrors } from '../ResponseValidator';
import { BigshipDuplicateInvoiceError, BigshipValidationError, BigshipApiError } from '../../errors';
import type { RequestContext } from '../../core/types';

const ctx: RequestContext = { endpoint: '/api/test', method: 'POST', startTime: Date.now() };

describe('ResponseValidator.validate', () => {
  it('returns data on success with non-null data', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: 'ORDER-123' };
    const result = ResponseValidator.validate(response, z.string(), ctx);
    expect(result).toBe('ORDER-123');
  });

  it('returns data on success with array data', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: [{ id: 1 }] };
    const schema = z.array(z.object({ id: z.number() }));
    const result = ResponseValidator.validate(response, schema, ctx);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('throws BigshipValidationError on invalid response structure', () => {
    const response = { not: 'a valid response' };
    expect(() => ResponseValidator.validate(response, z.string(), ctx)).toThrow(BigshipValidationError);
  });

  it('throws BigshipApiError when success is false', () => {
    const response = { success: false, message: 'Invalid pincode', responseCode: 400, data: null };
    try {
      ResponseValidator.validate(response, z.string(), ctx);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect((err as BigshipApiError).message).toBe('Invalid pincode');
      expect((err as BigshipApiError).statusCode).toBe(400);
    }
  });

  it('throws BigshipDuplicateInvoiceError when duplicate invoice detected', () => {
    const response = {
      success: false,
      message: 'Duplicate order',
      responseCode: 409,
      data: null,
      errors: { invoice_id: ['Invoice ID INV-001 already exists'] },
    };
    expect(() => ResponseValidator.validate(response, z.string(), ctx)).toThrow(BigshipDuplicateInvoiceError);
    try {
      ResponseValidator.validate(response, z.string(), ctx);
    } catch (err) {
      expect((err as BigshipDuplicateInvoiceError).invoiceId).toBe('Invoice ID INV-001 already exists');
    }
  });

  it('throws BigshipApiError when data is null on success', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: null };
    expect(() => ResponseValidator.validate(response, z.string(), ctx)).toThrow(BigshipApiError);
  });

  it('allows null data when allowNullData option is set', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: null };
    const result = ResponseValidator.validate(response, z.null(), ctx, { allowNullData: true });
    expect(result).toBeNull();
  });

  it('includes requestId and endpoint in error when available', () => {
    const ctxWithId: RequestContext = { endpoint: '/api/order', method: 'POST', startTime: Date.now(), requestId: 'req-123' };
    const response = { success: false, message: 'fail', responseCode: 500, data: null };
    try {
      ResponseValidator.validate(response, z.string(), ctxWithId);
    } catch (err) {
      expect((err as BigshipApiError).requestId).toBe('req-123');
      expect((err as BigshipApiError).endpoint).toBe('/api/order');
    }
  });

  it('detects duplicate invoice by "duplicate" in message with invoice_id errors', () => {
    const response = {
      success: false,
      message: 'duplicate entry found',
      responseCode: 409,
      data: null,
      errors: { invoice_id: ['some error'] },
    };
    expect(() => ResponseValidator.validate(response, z.string(), ctx)).toThrow(BigshipDuplicateInvoiceError);
  });

  it('does NOT trigger duplicate detection on "duplicate" in message without invoice_id errors', () => {
    const response = {
      success: false,
      message: 'duplicate entry found',
      responseCode: 400,
      data: null,
    };
    expect(() => ResponseValidator.validate(response, z.string(), ctx)).toThrow(BigshipApiError);
    try {
      ResponseValidator.validate(response, z.string(), ctx);
    } catch (err) {
      expect(err).not.toBeInstanceOf(BigshipDuplicateInvoiceError);
    }
  });
});

describe('formatZodErrors', () => {
  it('formats Zod issues into a Record<string, string[]>', () => {
    const schema = z.object({ name: z.string().min(3), age: z.number().positive() });
    const result = schema.safeParse({ name: 'ab', age: -1 });
    if (result.success) throw new Error('should have failed');
    const formatted = ResponseValidator.formatZodErrors(result.error.issues);
    expect(formatted).toHaveProperty('name');
    expect(formatted).toHaveProperty('age');
    expect(formatted['name'].length).toBeGreaterThan(0);
    expect(formatted['age'].length).toBeGreaterThan(0);
  });

  it('formats nested paths with dots', () => {
    const schema = z.object({ user: z.object({ email: z.string().email() }) });
    const result = schema.safeParse({ user: { email: 'bad' } });
    if (result.success) throw new Error('should have failed');
    const formatted = ResponseValidator.formatZodErrors(result.error.issues);
    expect(formatted).toHaveProperty('user.email');
  });

  it('standalone formatZodErrors helper works', () => {
    const schema = z.object({ x: z.literal('yes') });
    const result = schema.safeParse({ x: 'no' });
    if (result.success) throw new Error('should have failed');
    const formatted = formatZodErrors(result.error.issues);
    expect(formatted['x']).toBeDefined();
  });

  it('groups multiple errors under same path', () => {
    const issues = [
      { path: ['order', 'pincode'], message: 'Invalid' } as z.ZodIssue,
      { path: ['order', 'pincode'], message: 'Too short' } as z.ZodIssue,
      { path: ['order', 'name'], message: 'Required' } as z.ZodIssue,
    ];
    const formatted = formatZodErrors(issues);
    expect(formatted['order.pincode']).toEqual(['Invalid', 'Too short']);
    expect(formatted['order.name']).toEqual(['Required']);
  });

  it('handles empty path (root-level error)', () => {
    const issues = [{ path: [], message: 'Expected object' } as z.ZodIssue];
    const formatted = formatZodErrors(issues);
    expect(formatted['']).toEqual(['Expected object']);
  });

  it('validates response with array data', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: [1, 2, 3] };
    const result = ResponseValidator.validate(response, z.array(z.number()), ctx);
    expect(result).toEqual([1, 2, 3]);
  });

  it('validates response with null data and allowNullData', () => {
    const response = { success: true, message: 'ok', responseCode: 200, data: null };
    const result = ResponseValidator.validate(response, z.string(), ctx, { allowNullData: true });
    expect(result).toBeNull();
  });

  it('does NOT detect duplicate invoice when message says duplicate but no errors.invoice_id', () => {
    const response = {
      success: false,
      message: 'duplicate entry found',
      responseCode: 400,
      data: null,
      errors: { some_field: ['error'] },
    };
    try {
      ResponseValidator.validate(response, z.string(), ctx);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect(err).not.toBeInstanceOf(BigshipDuplicateInvoiceError);
    }
  });

  it('handles non-object response for duplicate check', () => {
    const response = {
      success: false,
      message: 'fail',
      responseCode: 400,
      data: null,
    };
    try {
      ResponseValidator.validate(response, z.string(), ctx);
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipApiError);
      expect((err as BigshipApiError).statusCode).toBe(400);
    }
  });
});
