import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse, BigshipError } from '../core/types';
import { BigshipApiError } from '../errors';

/**
 * Logger interface for pluggable logging.
 * Implement this interface to integrate with Winston, pino, etc.
 */
export interface LoggerAdapter {
  debug?(message: string, data?: unknown): void;
  info?(message: string, data?: unknown): void;
  warn?(message: string, data?: unknown): void;
  error?(message: string, data?: unknown): void;
}

/**
 * Default console logger with sanitization.
 *
 * @example
 * ```ts
 * // Default console logging
 * const logger = new Logger(true);
 *
 * // Custom logger (e.g., Winston)
 * const logger = new Logger(true, {
 *   debug: (msg, data) => winston.debug(msg, data),
 *   info: (msg, data) => winston.info(msg, data),
 *   warn: (msg, data) => winston.warn(msg, data),
 *   error: (msg, data) => winston.error(msg, data),
 * });
 * ```
 */
class Logger {
  private adapter: Required<LoggerAdapter>;

  constructor(private enabled: boolean, customAdapter?: LoggerAdapter) {
    this.adapter = {
      debug: customAdapter?.debug ?? ((msg, data) => console.log(msg, data)),
      info: customAdapter?.info ?? ((msg, data) => console.log(msg, data)),
      warn: customAdapter?.warn ?? ((msg, data) => console.warn(msg, data)),
      error: customAdapter?.error ?? ((msg, data) => console.error(msg, data)),
    };
  }

  logRequest(config: AxiosRequestConfig): void {
    if (!this.enabled) return;

    this.adapter.debug('[Bigship SDK Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: this.sanitizeHeaders(config.headers),
      data: this.sanitizeData(config.data)
    });
  }

  logResponse(response: ApiResponse<unknown>): void {
    if (!this.enabled) return;

    this.adapter.debug('[Bigship SDK Response]', {
      success: response.success,
      message: response.message,
      responseCode: response.responseCode,
      hasData: response.data !== null
    });
  }

  logError(error: BigshipError): void {
    if (!this.enabled) return;

    const extra = error instanceof BigshipApiError
      ? { requestId: error.requestId, endpoint: error.endpoint }
      : {};

    this.adapter.error('[Bigship SDK Error]', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      ...extra
    });
  }

  warn(message: string, data?: unknown): void {
    if (!this.enabled) return;
    this.adapter.warn(message, data);
  }

  private sanitizeHeaders(headers: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
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

  private sanitizeData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!data) return data;

    const sensitiveKeys = new Set(['password', 'access_key', 'accessKey', 'token', 'secret']);
    const maxStringLength = 200;

    const sanitize = (obj: unknown, depth: number): unknown => {
      if (depth > 5) return '[depth limit]';
      if (typeof obj === 'string') {
        return obj.length > maxStringLength ? `${obj.slice(0, maxStringLength)}...[truncated ${obj.length} chars]` : obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item, depth + 1));
      }
      if (obj && typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          if (sensitiveKeys.has(key)) {
            result[key] = '***';
          } else {
            result[key] = sanitize(value, depth + 1);
          }
        }
        return result;
      }
      return obj;
    };

    return sanitize(data, 0) as Record<string, unknown>;
  }
}

export { Logger };
