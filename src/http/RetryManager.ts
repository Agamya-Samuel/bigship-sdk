import { BigshipError, type BigshipConfig, type RequestContext } from '../core/types';
import { BigshipNetworkError } from '../errors';
import { EventDispatcher } from '../infrastructure/EventDispatcher';

/**
 * Retry manager with configurable retry logic
 * Handles retry attempts with exponential backoff and jitter
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

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: RequestContext
  ): Promise<T> {
    const maxRetries = this.config.maxRetries ?? 3;
    const retryDelay = this.config.retryDelay ?? 1000;
    const maxRetryDelay = this.config.maxRetryDelay ?? 30000;
    const retryOnStatusCodes = this.config.retryOnStatusCodes ?? [408, 429, 500, 502, 503, 504];

    let lastError: BigshipError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.isBigshipError(error) ? error : this.wrapError(error);

        if (attempt >= maxRetries) {
          break;
        }

        if (!this.shouldRetry(lastError, retryOnStatusCodes)) {
          break;
        }

        const exponentialDelay = retryDelay * Math.pow(2, attempt);
        // "Full Jitter" per AWS recommendation: uniform random in [0, exponentialDelay]
        const jitter = Math.random() * exponentialDelay;
        const delay = Math.min(jitter, maxRetryDelay);

        await this.eventDispatcher.dispatchRetry(attempt + 1, lastError, {
          ...context,
          attempt: attempt + 1
        });

        await this.delay(delay);
      }
    }

    throw lastError ?? new BigshipNetworkError('Unexpected: no error captured during retry');
  }

  private shouldRetry(error: BigshipError, retryOnStatusCodes: number[]): boolean {
    if (error instanceof BigshipNetworkError) {
      return true;
    }

    return retryOnStatusCodes.includes(error.statusCode);
  }

  private isBigshipError(error: unknown): error is BigshipError {
    return error instanceof BigshipError;
  }

  private wrapError(error: unknown): BigshipError {
    if (error instanceof Error) {
      return new BigshipNetworkError(error.message, { cause: error });
    }
    return new BigshipNetworkError('Unknown error occurred');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
