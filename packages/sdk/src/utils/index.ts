import type { ZodIssue } from 'zod';

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

export const BigshipUtils = {
  fileToBase64DataURI,
  isValidBase64DataURI,
  calculateCollectableAmount,
  formatZodErrors,
} as const;

export type BigshipUtilsType = typeof BigshipUtils;

/**
 * Helper function to format Zod errors into a readable format
 *
 * @example
 * ```ts
 * const errors = formatZodErrors(zodError.issues);
 * // { 'order_detail.invoice_id': ['Invalid format'] }
 * ```
 */
export function formatZodErrors(zodErrors: ZodIssue[]): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const error of zodErrors) {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  }
  return formatted;
}
