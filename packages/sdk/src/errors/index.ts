import { BigshipError, type BigshipErrorData } from './BigshipError';

export { BigshipError, type BigshipErrorData } from './BigshipError';

export interface BigshipApiErrorOptions {
  code?: string;
  apiResponse?: BigshipErrorData;
  requestId?: string;
  endpoint?: string;
  responseBody?: unknown;
  cause?: Error;
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
      options.apiResponse,
      { cause: options.cause }
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
        ...options,
        code: 'DUPLICATE_INVOICE',
        apiResponse: {
          status: 'error',
          message: `Invoice ID ${invoiceId} already exists`,
          errors: {
            invoice_id: [`Invoice ID ${invoiceId} already exists`]
          }
        },
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
      ...options,
      code: 'VALIDATION_ERROR',
      apiResponse: {
        status: 'error',
        message,
        errors: validationErrors
      },
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
    options: Omit<BigshipApiErrorOptions, 'code' | 'apiResponse'> = {}
  ) {
    super(message, 401, {
      ...options,
      code: 'AUTH_ERROR',
      apiResponse: {
        status: 'error',
        message,
      },
    });
    this.name = 'BigshipAuthError';
  }
}

/**
 * Error thrown when network request fails
 * Uses statusCode -1 since this is not an HTTP error.
 * Check `error instanceof BigshipNetworkError` rather than comparing statusCode.
 */
export class BigshipNetworkError extends BigshipApiError {
  constructor(
    message: string,
    options: Omit<BigshipApiErrorOptions, 'code'> = {}
  ) {
    super(message, -1, {
      ...options,
      code: 'NETWORK_ERROR',
      apiResponse: options.apiResponse ?? { status: 'error', message },
    });
    this.name = 'BigshipNetworkError';
  }
}

export function isBigshipDuplicateInvoiceError(error: unknown): error is BigshipDuplicateInvoiceError {
  return error instanceof BigshipDuplicateInvoiceError;
}

export function isBigshipValidationError(error: unknown): error is BigshipValidationError {
  return error instanceof BigshipValidationError;
}

export function isBigshipAuthError(error: unknown): error is BigshipAuthError {
  return error instanceof BigshipAuthError;
}

export function isBigshipNetworkError(error: unknown): error is BigshipNetworkError {
  return error instanceof BigshipNetworkError;
}

export function isBigshipApiError(error: unknown): error is BigshipApiError {
  return error instanceof BigshipApiError;
}
