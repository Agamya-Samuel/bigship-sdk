import type { z } from 'zod';
import type { OrderDetailB2CSchema, OrderDetailB2BSchema } from '../core/types';

type OrderDetailB2C = z.infer<typeof OrderDetailB2CSchema>;
type OrderDetailB2B = z.infer<typeof OrderDetailB2BSchema>;

const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg'] as const;

export async function fileToBase64DataURI(file: File): Promise<string> {
  if (!file) {
    throw new Error('File is required');
  }

  if (!allowedFileTypes.includes(file.type as typeof allowedFileTypes[number])) {
    throw new Error(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
  }

  if (typeof FileReader === 'undefined') {
    throw new TypeError('fileToBase64DataURI requires a browser environment with FileReader support. Use a Buffer-based approach for Node.js.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function isValidBase64DataURI(value: string): boolean {
  return /^data:(application\/pdf|image\/(jpeg|jpg));base64,[A-Za-z0-9+/\-_]+=*$/i.test(value);
}

export function calculateCollectableAmount(
  paymentType: 'COD' | 'Prepaid',
  codAmount: number
): number {
  if (paymentType === 'Prepaid') {
    return 0;
  }
  return Math.max(0, codAmount);
}

export function validateOrderDetail(
  orderDetail: OrderDetailB2C | OrderDetailB2B,
  shipmentCategory: 'b2c' | 'b2b'
): void {
  if (!orderDetail.document_detail?.invoice_document_file) {
    throw new Error(
      `invoice_document_file is required in document_detail for ${shipmentCategory.toUpperCase()} orders`
    );
  }

  if (shipmentCategory === 'b2b' && !(orderDetail as OrderDetailB2B).ewaybill_number) {
    throw new Error('ewaybill_number is required for B2B orders');
  }

  if (orderDetail.payment_type === 'Prepaid' && orderDetail.total_collectable_amount !== 0) {
    throw new Error('total_collectable_amount must be 0 for Prepaid orders');
  }
}

export const BigshipUtils = {
  fileToBase64DataURI,
  isValidBase64DataURI,
  calculateCollectableAmount,
  validateOrderDetail,
} as const;

export type BigshipUtilsType = typeof BigshipUtils;
