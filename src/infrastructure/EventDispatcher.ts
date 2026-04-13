import type { InternalAxiosRequestConfig } from 'axios';
import type { BigshipConfig, ApiResponse, RequestContext } from './types';
import type { BigshipError } from './types';

/**
 * Event dispatcher for SDK lifecycle hooks
 * Allows users to hook into request/response/error events
 *
 * @example
 * ```ts
 * const client = new BigshipClient({
 *   ...config,
 *   onResponse: (response, context) => {
 *     console.log(`API call to ${context.endpoint} completed`);
 *   },
 *   onError: (error, context) => {
 *     console.error(`API call to ${context.endpoint} failed:`, error.message);
 *   },
 *   onRetry: (attempt, error, context) => {
 *     console.log(`Retry attempt ${attempt} for ${context.endpoint}`);
 *   }
 * });
 * ```
 */
export class EventDispatcher {
  private hooks: {
    onResponse?: (response: ApiResponse<unknown>, context: RequestContext) => void;
    onError?: (error: BigshipError, context: RequestContext) => void;
    onRetry?: (attempt: number, error: BigshipError, context: RequestContext) => void;
    onBeforeRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  };

  constructor(config: BigshipConfig) {
    this.hooks = {
      onResponse: config.onResponse,
      onError: config.onError,
      onRetry: config.onRetry,
      onBeforeRequest: config.onBeforeRequest
    };
  }

  /**
   * Dispatch the before request event
   * Allows modification of the request config before sending
   *
   * @param config - The axios request config
   * @returns The (potentially modified) request config
   *
   * @example
   * ```ts
   * // In client configuration
   * onBeforeRequest: (config) => {
   *   console.log('Making request to:', config.url);
   *   return config;
   * }
   * ```
   */
  async dispatchBeforeRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    if (this.hooks.onBeforeRequest) {
      return await this.hooks.onBeforeRequest(config);
    }
    return config;
  }

  /**
   * Dispatch the response event
   * Called after a successful API response
   *
   * @param response - The API response
   * @param context - The request context
   *
   * @example
   * ```ts
   * // In client configuration
   * onResponse: (response, context) => {
   *   console.log(`Response from ${context.endpoint}:`, response.message);
   * }
   * ```
   */
  dispatchResponse(response: ApiResponse<unknown>, context: RequestContext): void {
    if (this.hooks.onResponse) {
      this.hooks.onResponse(response, context);
    }
  }

  /**
   * Dispatch the error event
   * Called when an API request fails
   *
   * @param error - The error that occurred
   * @param context - The request context
   *
   * @example
   * ```ts
   * // In client configuration
   * onError: (error, context) => {
   *   console.error(`Error from ${context.endpoint}:`, error.message);
   * }
   * ```
   */
  dispatchError(error: BigshipError, context: RequestContext): void {
    if (this.hooks.onError) {
      this.hooks.onError(error, context);
    }
  }

  /**
   * Dispatch the retry event
   * Called before a retry attempt
   *
   * @param attempt - The retry attempt number (1-based)
   * @param error - The error that triggered the retry
   * @param context - The request context
   *
   * @example
   * ```ts
   * // In client configuration
   * onRetry: (attempt, error, context) => {
   *   console.log(`Retry attempt ${attempt} for ${context.endpoint}`);
   * }
   * ```
   */
  dispatchRetry(attempt: number, error: BigshipError, context: RequestContext): void {
    if (this.hooks.onRetry) {
      this.hooks.onRetry(attempt, error, context);
    }
  }
}
