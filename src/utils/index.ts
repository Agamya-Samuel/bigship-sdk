/**
 * Helper utilities for Bigship SDK
 */

/**
 * Convert a File object to base64 Data URI format
 * @param file - The File object to convert
 * @returns Promise resolving to base64 Data URI string
 * @throws Error if file is invalid or conversion fails
 *
 * @example
 * ```ts
 * const file = document.querySelector('input[type="file"]').files[0];
 * const base64 = await BigshipUtils.fileToBase64DataURI(file);
 * // Returns: "data:application/pdf;base64,JVBERi0xLjQKJ..."
 * ```
 */
export async function fileToBase64DataURI(file: File): Promise<string> {
  if (!file) {
    throw new Error('File is required');
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate if a string is a properly formatted base64 Data URI
 * @param value - The string to validate
 * @returns true if valid base64 Data URI
 *
 * @example
 * ```ts
 * BigshipUtils.isValidBase64DataURI('data:application/pdf;base64,JVBERi0x...'); // true
 * BigshipUtils.isValidBase64DataURI('not-a-data-uri'); // false
 * ```
 */
export function isValidBase64DataURI(value: string): boolean {
  return /^data:(application\/pdf|image\/(jpeg|jpg));base64,[A-Za-z0-9+/]+=*$/i.test(value);
}

/**
 * Calculate total_collectable_amount based on payment type
 * For COD orders: use the package value
 * For Prepaid orders: must be 0
 * @param paymentType - Payment type (COD or Prepaid)
 * @param codAmount - Amount to collect for COD orders
 * @returns The correct total_collectable_amount value
 *
 * @example
 * ```ts
 * // For COD order
 * const codAmount = BigshipUtils.calculateCollectableAmount('COD', 1000);
 * console.log(codAmount); // 1000
 *
 * // For Prepaid order
 * const prepaidAmount = BigshipUtils.calculateCollectableAmount('Prepaid', 1000);
 * console.log(prepaidAmount); // 0
 * ```
 */
export function calculateCollectableAmount(
  paymentType: 'COD' | 'Prepaid',
  codAmount: number
): number {
  if (paymentType === 'Prepaid') {
    return 0;
  }
  return Math.max(0, codAmount);
}

/**
 * Validation helper for required fields in order_detail
 * @param orderDetail - The order detail object to validate
 * @param shipmentCategory - The shipment category ('b2c' or 'b2b')
 * @throws Error with detailed message if validation fails
 *
 * @example
 * ```ts
 * import { BigshipUtils } from '@agamya/bigship-sdk';
 *
 * try {
 *   BigshipUtils.validateOrderDetail(orderData.order_detail, 'b2c');
 * } catch (error) {
 *   console.error(error.message);
 *   // "invoice_document_file is required in document_detail for B2C orders"
 * }
 * ```
 */
export function validateOrderDetail(
  orderDetail: any,
  shipmentCategory: 'b2c' | 'b2b'
): void {
  // Check document_detail
  if (!orderDetail.document_detail?.invoice_document_file) {
    throw new Error(
      `invoice_document_file is required in document_detail for ${shipmentCategory.toUpperCase()} orders`
    );
  }

  // For B2B, check ewaybill
  if (shipmentCategory === 'b2b' && !orderDetail.ewaybill_number) {
    throw new Error('ewaybill_number is required for B2B orders');
  }

  // Validate COD amount logic
  if (orderDetail.payment_type === 'Prepaid' && orderDetail.total_collectable_amount !== 0) {
    throw new Error('total_collectable_amount must be 0 for Prepaid orders');
  }
}

/**
 * Namespace for all Bigship SDK utility functions
 */
export const BigshipUtils = {
  fileToBase64DataURI,
  isValidBase64DataURI,
  calculateCollectableAmount,
  validateOrderDetail,
} as const;

export type BigshipUtils = typeof BigshipUtils;
