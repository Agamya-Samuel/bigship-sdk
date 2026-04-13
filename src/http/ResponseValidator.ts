import { z } from 'zod';
import {
  ApiResponseSchema,
  type RequestContext,
} from '../core/types';
import {
  BigshipApiError,
  BigshipDuplicateInvoiceError,
  BigshipValidationError,
  type BigshipApiErrorOptions,
} from '../errors';

/**
 * Response validation utilities
 * Validates API responses and throws appropriate errors
 */
export class ResponseValidator {
  /**
   * Validates API response and returns the data
   * Throws appropriate errors based on the response state
   *
   * @param response - The raw response from the API
   * @param schema - Zod schema to validate the data against
   * @param context - Request context for error reporting
   * @returns The validated data from the response
   * @throws {BigshipDuplicateInvoiceError} When invoice already exists
   * @throws {BigshipApiError} When success: false
   * @throws {BigshipValidationError} When response structure is invalid
   *
   * @example
   * ```ts
   * const data = ResponseValidator.validate(
   *   res.data,
   *   z.string(),
   *   { endpoint: '/api/order/add/single', method: 'POST', startTime: Date.now() }
   * );
   * ```
   */
  static validate<T>(
    response: unknown,
    schema: z.ZodType<T>,
    context: RequestContext
  ): T {
    // Validate response structure with Zod
    const apiResponse = ApiResponseSchema(schema).safeParse(response);

    if (!apiResponse.success) {
      throw new BigshipValidationError(
        'Invalid API response structure',
        ResponseValidator.formatZodErrors(apiResponse.error.errors),
        {
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: response
        }
      );
    }

    const validated = apiResponse.data;

    // Check API-level success flag
    if (validated.success === false) {
      // Detect duplicate invoice errors
      if (ResponseValidator.isDuplicateInvoiceError(validated)) {
        const invoiceId = ResponseValidator.extractInvoiceId(validated);
        throw new BigshipDuplicateInvoiceError(invoiceId, {
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: validated
        });
      }

      // General API error
      throw new BigshipApiError(
        validated.message || 'API request failed',
        validated.responseCode,
        {
          code: 'API_ERROR',
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: validated,
          apiResponse: {
            message: validated.message,
            errors: (validated as any).errors
          }
        }
      );
    }

    // Ensure data is not null when success is true
    if (validated.data === null || validated.data === undefined) {
      throw new BigshipApiError(
        `API returned success=true but data is null for endpoint: ${context.endpoint}`,
        500,
        {
          code: 'NULL_DATA',
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: validated
        }
      );
    }

    return validated.data;
  }

  /**
   * Check if the response indicates a duplicate invoice error
   */
  private static isDuplicateInvoiceError(response: any): boolean {
    return (
      response.message?.toLowerCase().includes('duplicate') ||
      response.message?.toLowerCase().includes('already exists') ||
      response.errors?.invoice_id?.some((msg: string) =>
        msg.toLowerCase().includes('already exists')
      )
    );
  }

  /**
   * Extract invoice ID from error response
   */
  private static extractInvoiceId(response: any): string {
    return response.errors?.invoice_id?.[0] || 'unknown';
  }

  /**
   * Format Zod errors into a readable format
   */
  public static formatZodErrors(zodErrors: z.ZodError['errors']): Record<string, string[]> {
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
}

/**
 * Helper function to format Zod errors into a readable format
 *
 * @example
 * ```ts
 * const errors = formatZodErrors(zodError.errors);
 * // { 'order_detail.invoice_id': ['Invalid format'] }
 * ```
 */
export function formatZodErrors(zodErrors: z.ZodError['errors']): Record<string, string[]> {
  return ResponseValidator.formatZodErrors(zodErrors);
}
