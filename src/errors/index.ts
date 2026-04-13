import { z } from 'zod';
import { BigshipError, type BigshipErrorData } from './types';

/**
 * Extended error context options for API errors
 */
export interface BigshipApiErrorOptions {
  code?: string;
  apiResponse?: BigshipErrorData;
  requestId?: string;
  endpoint?: string;
  responseBody?: unknown;
}

/**
 * Base API error with additional context information
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipApiError) {
 *     console.log('Request ID:', error.requestId);
 *     console.log('Endpoint:', error.endpoint);
 *     console.log('Response:', error.responseBody);
 *   }
 * }
 * ```
 */
export class BigshipApiError extends BigshipError {
  readonly requestId?: string;
  readonly endpoint?: string;
  readonly responseBody?: unknown;

  constructor(
    message: string,
    statusCode: number,
    options: BigshipApiErrorOptions = {}
  ) {
    super(
      message,
      statusCode,
      options.code,
      options.apiResponse
    );
    this.name = 'BigshipApiError';
    this.requestId = options.requestId;
    this.endpoint = options.endpoint;
    this.responseBody = options.responseBody;
  }
}

/**
 * Error thrown when a duplicate invoice ID is detected
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipDuplicateInvoiceError) {
 *     console.log('Duplicate invoice ID:', error.invoiceId);
 *     console.log('Please use a different invoice number');
 *   }
 * }
 * ```
 */
export class BigshipDuplicateInvoiceError extends BigshipApiError {
  readonly invoiceId: string;

  constructor(
    invoiceId: string,
    options: Omit<BigshipApiErrorOptions, 'code'> = {}
  ) {
    super(
      `Duplicate invoice ID: ${invoiceId}. An order with this invoice already exists.`,
      409,
      {
        code: 'DUPLICATE_INVOICE',
        apiResponse: {
          status: 'error',
          message: `Invoice ID ${invoiceId} already exists`,
          errors: {
            invoice_id: [`Invoice ID ${invoiceId} already exists`]
          }
        },
        ...options
      }
    );
    this.name = 'BigshipDuplicateInvoiceError';
    this.invoiceId = invoiceId;
  }
}

/**
 * Error thrown when request validation fails
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipValidationError) {
 *     console.error('Validation errors:', error.validationErrors);
 *     // { invoice_id: ['Invalid format'], pincode: ['Invalid pincode'] }
 *   }
 * }
 * ```
 */
export class BigshipValidationError extends BigshipApiError {
  readonly validationErrors: Record<string, string[]>;

  constructor(
    message: string,
    validationErrors: Record<string, string[]>,
    options: Omit<BigshipApiErrorOptions, 'code' | 'apiResponse'> = {}
  ) {
    super(message, 400, {
      code: 'VALIDATION_ERROR',
      apiResponse: {
        status: 'error',
        message,
        errors: validationErrors
      },
      ...options
    });
    this.name = 'BigshipValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when authentication fails
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipAuthError) {
 *     console.error('Authentication failed - check credentials');
 *   }
 * }
 * ```
 */
export class BigshipAuthError extends BigshipApiError {
  constructor(
    message: string = 'Authentication failed',
    options: Omit<BigshipApiErrorOptions, 'code'> = {}
  ) {
    super(message, 401, {
      code: 'AUTH_ERROR',
      ...options
    });
    this.name = 'BigshipAuthError';
  }
}

/**
 * Error thrown when network request fails
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipNetworkError) {
 *     console.error('Network error - check your connection');
 *   }
 * }
 * ```
 */
export class BigshipNetworkError extends BigshipApiError {
  constructor(
    message: string,
    options: Omit<BigshipApiErrorOptions, 'code'> = {}
  ) {
    super(message, 0, {
      code: 'NETWORK_ERROR',
      ...options
    });
    this.name = 'BigshipNetworkError';
  }
}

/**
 * Type guard to check if an error is a BigshipDuplicateInvoiceError
 *
 * @example
 * ```ts
 * if (isBigshipDuplicateInvoiceError(error)) {
 *   console.log('Duplicate invoice:', error.invoiceId);
 * }
 * ```
 */
export function isBigshipDuplicateInvoiceError(error: unknown): error is BigshipDuplicateInvoiceError {
  return error instanceof BigshipDuplicateInvoiceError;
}

/**
 * Type guard to check if an error is a BigshipValidationError
 *
 * @example
 * ```ts
 * if (isBigshipValidationError(error)) {
 *   console.log('Validation errors:', error.validationErrors);
 * }
 * ```
 */
export function isBigshipValidationError(error: unknown): error is BigshipValidationError {
  return error instanceof BigshipValidationError;
}

/**
 * Type guard to check if an error is a BigshipAuthError
 *
 * @example
 * ```ts
 * if (isBigshipAuthError(error)) {
 *   console.log('Authentication failed');
 * }
 * ```
 */
export function isBigshipAuthError(error: unknown): error is BigshipAuthError {
  return error instanceof BigshipAuthError;
}

/**
 * Type guard to check if an error is a BigshipNetworkError
 *
 * @example
 * ```ts
 * if (isBigshipNetworkError(error)) {
 *   console.log('Network error occurred');
 * }
 * ```
 */
export function isBigshipNetworkError(error: unknown): error is BigshipNetworkError {
  return error instanceof BigshipNetworkError;
}

/**
 * Type guard to check if an error is a BigshipApiError
 *
 * @example
 * ```ts
 * if (isBigshipApiError(error)) {
 *   console.log('Request ID:', error.requestId);
 *   console.log('Endpoint:', error.endpoint);
 * }
 * ```
 */
export function isBigshipApiError(error: unknown): error is BigshipApiError {
  return error instanceof BigshipApiError;
}
