import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';
import type { BigshipError } from './types';

/**
 * Logger for SDK request/response/error events
 * Provides detailed logging when enabled
 *
 * @example
 * ```ts
 * const logger = new Logger(true); // Enable logging
 * logger.logRequest(config);
 * logger.logResponse(response);
 * logger.logError(error);
 * ```
 */
class Logger {
  constructor(private enabled: boolean) {}

  /**
   * Log an API request
   * Sanitizes sensitive information before logging
   *
   * @param config - The axios request config
   *
   * @example
   * ```ts
   * logger.logRequest({
   *   method: 'POST',
   *   url: '/api/order/add/single',
   *   headers: { 'Authorization': 'Bearer ***' },
   *   data: { password: '***' }
   * });
   * ```
   */
  logRequest(config: AxiosRequestConfig): void {
    if (!this.enabled) return;

    console.log('[Bigship SDK Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: this.sanitizeHeaders(config.headers),
      data: this.sanitizeData(config.data)
    });
  }

  /**
   * Log an API response
   *
   * @param response - The API response
   *
   * @example
   * ```ts
   * logger.logResponse({
   *   success: true,
   *   message: 'Order added successfully',
   *   responseCode: 200,
   *   data: '12345'
   * });
   * ```
   */
  logResponse(response: ApiResponse<unknown>): void {
    if (!this.enabled) return;

    console.log('[Bigship SDK Response]', {
      success: response.success,
      message: response.message,
      responseCode: response.responseCode,
      hasData: response.data !== null
    });
  }

  /**
   * Log an error
   *
   * @param error - The error to log
   *
   * @example
   * ```ts
   * logger.logError(bigshipError);
   * // Outputs: [Bigship SDK Error] { name: 'BigshipApiError', message: '...', statusCode: 400 }
   * ```
   */
  logError(error: BigshipError): void {
    if (!this.enabled) return;

    console.error('[Bigship SDK Error]', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      requestId: (error as any).requestId,
      endpoint: (error as any).endpoint
    });
  }

  /**
   * Sanitize headers by removing sensitive information
   */
  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***';
    }
    if (sanitized.authorization) {
      sanitized.authorization = 'bearer ***';
    }
    return sanitized;
  }

  /**
   * Sanitize request data by removing sensitive fields
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.access_key) sanitized.access_key = '***';
    if (sanitized.accessKey) sanitized.accessKey = '***';

    return sanitized;
  }
}

export { Logger };
