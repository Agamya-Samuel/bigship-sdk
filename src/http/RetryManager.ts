import type { BigshipConfig, RequestContext } from '../core/types';
import type { BigshipError } from '../core/types';
import { BigshipNetworkError } from '../errors';
import { EventDispatcher } from '../infrastructure/EventDispatcher';

/**
 * Retry manager with configurable retry logic
 * Handles retry attempts with exponential backoff
 *
 * @example
 * ```ts
 * const retryManager = new RetryManager(config, eventDispatcher);
 * const result = await retryManager.executeWithRetry(
 *   async () => await apiCall(),
 *   { endpoint: '/api/order/add/single', method: 'POST', startTime: Date.now() }
 * );
 * ```
 */
export class RetryManager {
  constructor(
    private config: BigshipConfig,
    private eventDispatcher: EventDispatcher
  ) {}

  /**
   * Execute a function with retry logic
   * Retries on transient errors with exponential backoff
   *
   * @param fn - The function to execute
   * @param context - Request context for error reporting
   * @returns The result of the function
   * @throws {BigshipError} The last error if all retries fail
   *
   * @example
   * ```ts
   * const data = await retryManager.executeWithRetry(
   *   async () => {
   *     const res = await axios.post('/api/order/add/single', payload);
   *     return res.data;
   *   },
   *   { endpoint: '/api/order/add/single', method: 'POST', startTime: Date.now() }
   * );
   * ```
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: RequestContext
  ): Promise<T> {
    const maxRetries = this.config.maxRetries ?? 3;
    const retryDelay = this.config.retryDelay ?? 1000;
    const retryOnStatusCodes = this.config.retryOnStatusCodes ?? [408, 429, 500, 502, 503, 504];

    let lastError: BigshipError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.isBigshipError(error) ? error : this.wrapError(error);

        // Don't retry if this is the last attempt
        if (attempt >= maxRetries) {
          break;
        }

        // Check if we should retry this error
        if (!this.shouldRetry(lastError, retryOnStatusCodes)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);

        // Dispatch retry event
        this.eventDispatcher.dispatchRetry(attempt + 1, lastError, {
          ...context,
          attempt: attempt + 1
        });

        // Wait before retrying
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error should trigger a retry
   */
  private shouldRetry(error: BigshipError, retryOnStatusCodes: number[]): boolean {
    // Retry on network errors
    if (error instanceof BigshipNetworkError) {
      return true;
    }

    // Retry on specific status codes
    if (retryOnStatusCodes.includes(error.statusCode)) {
      return true;
    }

    // Retry on rate limit errors (existing BigshipError method)
    if (error.isRateLimitError()) {
      return true;
    }

    // Don't retry client errors (4xx except 429)
    if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
      return false;
    }

    return true; // Retry server errors
  }

  /**
   * Check if an error is a BigshipError
   */
  private isBigshipError(error: unknown): error is BigshipError {
    return error instanceof Error && 'statusCode' in error;
  }

  /**
   * Wrap a non-BigshipError in a BigshipNetworkError
   */
  private wrapError(error: unknown): BigshipError {
    if (error instanceof Error) {
      return new BigshipNetworkError(error.message);
    }
    return new BigshipNetworkError('Unknown error occurred');
  }

  /**
   * Delay execution for a specified time
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
