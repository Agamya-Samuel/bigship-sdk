import { describe, it, expect, vi } from 'vitest';
import { isValidBase64DataURI, calculateCollectableAmount, validateOrderDetail, fileToBase64DataURI, BigshipUtils } from '../index';

describe('fileToBase64DataURI', () => {
  it('throws when file is falsy', async () => {
    await expect(fileToBase64DataURI(null as any)).rejects.toThrow('File is required');
    await expect(fileToBase64DataURI(undefined as any)).rejects.toThrow('File is required');
  });

  it('throws for disallowed file type', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await expect(fileToBase64DataURI(file)).rejects.toThrow('Invalid file type');
  });

  it('throws TypeError when FileReader is unavailable (Node.js)', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const original = (globalThis as any).FileReader;
    try {
      delete (globalThis as any).FileReader;
      await expect(fileToBase64DataURI(file)).rejects.toThrow(TypeError);
      await expect(fileToBase64DataURI(file)).rejects.toThrow('browser environment');
    } finally {
      (globalThis as any).FileReader = original;
    }
  });
});

describe('BigshipUtils', () => {
  it('exports all utility functions', () => {
    expect(typeof BigshipUtils.fileToBase64DataURI).toBe('function');
    expect(typeof BigshipUtils.isValidBase64DataURI).toBe('function');
    expect(typeof BigshipUtils.calculateCollectableAmount).toBe('function');
    expect(typeof BigshipUtils.validateOrderDetail).toBe('function');
  });

  it('isValidBase64DataURI works through BigshipUtils', () => {
    expect(BigshipUtils.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x')).toBe(true);
  });
});

describe('isValidBase64DataURI', () => {
  it('accepts valid PDF base64 data URI', () => {
    expect(isValidBase64DataURI('data:application/pdf;base64,JVBERi0xLjQK')).toBe(true);
  });

  it('accepts valid JPEG base64 data URI', () => {
    expect(isValidBase64DataURI('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
  });

  it('accepts image/jpg variant', () => {
    expect(isValidBase64DataURI('data:image/jpg;base64,/9j/4AAQ')).toBe(true);
  });

  it('is case-insensitive on MIME type', () => {
    expect(isValidBase64DataURI('data:APPLICATION/PDF;base64,JVBERi0x')).toBe(true);
    expect(isValidBase64DataURI('data:Image/JPEG;base64,/9j/4AAQ')).toBe(true);
  });

  it('accepts URL-safe base64 characters (- and _)', () => {
    expect(isValidBase64DataURI('data:application/pdf;base64,abc-123_test')).toBe(true);
  });

  it('rejects PNG (not allowed)', () => {
    expect(isValidBase64DataURI('data:image/png;base64,iVBORw0KGgo')).toBe(false);
  });

  it('rejects non-data URIs', () => {
    expect(isValidBase64DataURI('https://example.com/file.pdf')).toBe(false);
  });

  it('rejects empty base64 content', () => {
    expect(isValidBase64DataURI('data:application/pdf;base64,')).toBe(false);
  });

  it('rejects missing data URI prefix', () => {
    expect(isValidBase64DataURI('JVBERi0xLjQK')).toBe(false);
  });

  it('rejects base64 with invalid characters', () => {
    expect(isValidBase64DataURI('data:application/pdf;base64,abc@123')).toBe(false);
  });

  it('accepts base64 with padding', () => {
    expect(isValidBase64DataURI('data:application/pdf;base64,YQ==')).toBe(true);
  });
});

describe('calculateCollectableAmount', () => {
  it('returns 0 for Prepaid', () => {
    expect(calculateCollectableAmount('Prepaid', 500)).toBe(0);
  });

  it('returns codAmount for COD', () => {
    expect(calculateCollectableAmount('COD', 500)).toBe(500);
  });

  it('clamps negative COD to 0', () => {
    expect(calculateCollectableAmount('COD', -100)).toBe(0);
  });

  it('returns 0 for COD with 0', () => {
    expect(calculateCollectableAmount('COD', 0)).toBe(0);
  });
});

describe('validateOrderDetail', () => {
  it('throws when invoice_document_file is missing', () => {
    expect(() => validateOrderDetail({}, 'b2c')).toThrow('invoice_document_file is required');
  });

  it('throws when document_detail is missing', () => {
    expect(() => validateOrderDetail({ payment_type: 'COD' }, 'b2c')).toThrow('invoice_document_file is required');
  });

  it('throws for B2B when ewaybill_number is missing', () => {
    expect(() =>
      validateOrderDetail({
        document_detail: { invoice_document_file: 'data:application/pdf;base64,abc' },
      }, 'b2b')
    ).toThrow('ewaybill_number is required');
  });

  it('throws for Prepaid with non-zero collectable', () => {
    expect(() =>
      validateOrderDetail({
        document_detail: { invoice_document_file: 'data:application/pdf;base64,abc' },
        payment_type: 'Prepaid',
        total_collectable_amount: 100,
      }, 'b2c')
    ).toThrow('total_collectable_amount must be 0');
  });

  it('does not throw for valid B2C Prepaid order', () => {
    expect(() =>
      validateOrderDetail({
        document_detail: { invoice_document_file: 'data:application/pdf;base64,abc' },
        payment_type: 'Prepaid',
        total_collectable_amount: 0,
      }, 'b2c')
    ).not.toThrow();
  });

  it('does not throw for valid B2B COD order', () => {
    expect(() =>
      validateOrderDetail({
        document_detail: { invoice_document_file: 'data:application/pdf;base64,abc' },
        ewaybill_number: 'EWB123',
        payment_type: 'COD',
        total_collectable_amount: 500,
      }, 'b2b')
    ).not.toThrow();
  });
});
