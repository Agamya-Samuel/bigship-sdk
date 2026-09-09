import { z } from 'zod';
import {
  ApiResponseSchema,
  type RequestContext,
} from '../core/types';
import { formatZodErrors } from '../utils';
import {
  BigshipApiError,
  BigshipValidationError,
} from '../errors';

/**
 * Response validation utilities
 * Validates API responses and throws appropriate errors
 *
 * @internal
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
   * @throws {BigshipApiError} When status: false
   * @throws {BigshipValidationError} When response structure is invalid
   *
   * @example
   * ```ts
   * const data = ResponseValidator.validate(
   *   res.data,
   *   z.string(),
   *   { endpoint: 'api/outbound/login', method: 'POST', startTime: Date.now() }
   * );
   * ```
   */
  static validate<T>(
    response: unknown,
    schema: z.ZodType<T>,
    context: RequestContext,
    options?: { allowNullData?: boolean }
  ): T {
    const apiResponse = ApiResponseSchema(schema).safeParse(response);

    if (!apiResponse.success) {
      throw new BigshipValidationError(
        'Invalid API response structure',
        ResponseValidator.formatZodErrors(apiResponse.error.issues),
        {
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: response
        }
      );
    }

    const validated = apiResponse.data;

    if (validated.status === false) {
      const rawResponse = (response && typeof response === 'object' && !Array.isArray(response)
        ? response
        : {}) as Record<string, unknown>;

      throw new BigshipApiError(
        validated.message || 'API request failed',
        validated.status_code,
        {
          code: 'API_ERROR',
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: validated,
          apiResponse: {
            message: validated.message,
            errors: rawResponse?.errors as Record<string, string[]> | undefined
          }
        }
      );
    }

    if (!options?.allowNullData && (validated.data === null || validated.data === undefined)) {
      throw new BigshipApiError(
        `API returned status=true but data is null for endpoint: ${context.endpoint}`,
        500,
        {
          code: 'NULL_DATA',
          requestId: context.requestId,
          endpoint: context.endpoint,
          responseBody: validated
        }
      );
    }

    return validated.data as T;
  }

  /**
   * Format Zod errors into a readable format
   */
  public static formatZodErrors(zodErrors: z.ZodIssue[]): Record<string, string[]> {
    return formatZodErrors(zodErrors);
  }
}

export { formatZodErrors } from '../utils';
