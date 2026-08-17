export interface BigshipErrorData {
  status?: string;
  message?: string;
  errors?: Record<string, string[]>;
  trace_id?: string;
}

/**
 * Custom error class for Bigship API errors
 * Provides structured access to error details and helper methods for error type checking
 *
 * @example
 * ```ts
 * try {
 *   await client.addSingleOrder(orderData);
 * } catch (error) {
 *   if (error instanceof BigshipError) {
 *     if (error.isValidationError()) {
 *       console.error('Validation failed:', error.validationErrors);
 *     }
 *     if (error.isRateLimitError()) {
 *       console.error('Rate limited, retry after 60s');
 *     }
 *     console.error('Status:', error.statusCode);
 *     console.error('Trace ID:', error.traceId);
 *   }
 * }
 * ```
 */
export class BigshipError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly apiResponse?: BigshipErrorData;
  readonly validationErrors?: Record<string, string[]>;
  readonly traceId?: string;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    apiResponse?: BigshipErrorData,
    options?: { cause?: Error }
  ) {
    super(message, { cause: options?.cause });
    this.name = 'BigshipError';
    this.statusCode = statusCode ?? 0;
    this.code = code;
    this.apiResponse = apiResponse;
    this.validationErrors = apiResponse?.errors;
    this.traceId = apiResponse?.trace_id;
  }

  isValidationError(): boolean {
    return !!this.validationErrors && Object.keys(this.validationErrors).length > 0;
  }

  isRateLimitError(): boolean {
    return this.statusCode === 429 || this.code === 'RATE_LIMIT_EXCEEDED';
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}
